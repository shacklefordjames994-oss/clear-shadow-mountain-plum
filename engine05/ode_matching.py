"""Two-sided DOP853 eigenvalue match for the Gaussian well.

The propagation uses scipy.integrate.solve_ivp. It does not call the
Numerov recurrence and it does not read a Numerov eigenvalue.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np
from scipy.integrate import solve_ivp

from engine05.numerov_solver import GaussianModel, energy_scales
from engine05.root_integrity import refine_root, contiguous_sign_bracket


class OdeMatchError(RuntimeError):
    """Raised when the ODE match cannot be completed."""


@dataclass(frozen=True)
class OdeMatchResult:
    energy_eV: float
    residual: float
    rmax_over_a: float
    match_over_a: float
    rtol: float
    atol: float
    max_step: float | None
    outward_status: str
    inward_status: str
    n_evaluations: int
    termination_reason: str
    solver: str = "dop853-two-sided"


def coefficient(model: GaussianModel, energy_eV: float, x: float) -> float:
    """k(x) in u'' + k u = 0. Energy is in eV. x is r/a."""
    scale, depth = energy_scales(model)
    epsilon = energy_eV / scale
    centrifugal = 0.0
    if model.ell != 0 and x != 0.0:
        centrifugal = model.ell * (model.ell + 1) / (x * x)
    return epsilon + depth * math.exp(-x * x) - centrifugal


def _propagate(
    model: GaussianModel,
    energy_eV: float,
    start: float,
    stop: float,
    value: float,
    slope: float,
    *,
    rtol: float,
    atol: float,
    max_step: float | None,
):
    def rhs(_x, state):
        return (state[1], -coefficient(model, energy_eV, float(_x)) * state[0])

    options = {"method": "DOP853", "rtol": rtol, "atol": atol}
    if max_step is not None:
        options["max_step"] = max_step
    return solve_ivp(rhs, (start, stop), (value, slope), **options)


def mismatch(
    model: GaussianModel,
    energy_eV: float,
    *,
    rmax_over_a: float,
    match_over_a: float,
    rtol: float,
    atol: float,
    max_step: float | None,
) -> tuple[float, bool, str, str]:
    if not 0.0 < match_over_a < rmax_over_a:
        return math.nan, False, "MATCH_OUTSIDE_DOMAIN", "NOT_RUN"
    if energy_eV >= 0.0:
        return math.nan, False, "ENERGY_NOT_BOUND", "ENERGY_NOT_BOUND"
    scale, _depth = energy_scales(model)
    kappa = math.sqrt(-energy_eV / scale)
    outward = _propagate(
        model, energy_eV, 0.0, match_over_a, 0.0, 1.0, rtol=rtol, atol=atol, max_step=max_step
    )
    if not outward.success or not np.all(np.isfinite(outward.y)):
        return math.nan, False, "OUTWARD_FAILED", "NOT_RUN"
    inward = _propagate(
        model, energy_eV, rmax_over_a, match_over_a, 1.0, -kappa, rtol=rtol, atol=atol, max_step=max_step
    )
    if not inward.success or not np.all(np.isfinite(inward.y)):
        return math.nan, False, outward.message, "INWARD_FAILED"
    u_out, up_out = float(outward.y[0, -1]), float(outward.y[1, -1])
    u_in, up_in = float(inward.y[0, -1]), float(inward.y[1, -1])
    if abs(u_out) < 1e-14 or abs(u_in) < 1e-14:
        return math.nan, False, "NODE_AT_MATCH", "NODE_AT_MATCH"
    return up_out / u_out - up_in / u_in, True, "OK", "OK"


def _outward_nodes(
    model: GaussianModel,
    energy_eV: float,
    *,
    match_over_a: float,
    rtol: float,
    atol: float,
    max_step: float | None,
) -> int:
    grid = np.linspace(0.0, match_over_a, 400)
    def rhs(_x, state):
        return (state[1], -coefficient(model, energy_eV, float(_x)) * state[0])

    options = {"method": "DOP853", "rtol": rtol, "atol": atol, "t_eval": grid}
    if max_step is not None:
        options["max_step"] = max_step
    sampled = solve_ivp(rhs, (0.0, match_over_a), (0.0, 1.0), **options)
    if not sampled.success:
        return -1
    signs = np.sign(sampled.y[0, 1:])
    signs = signs[signs != 0]
    if signs.size < 2:
        return 0
    return int(np.sum(signs[1:] * signs[:-1] < 0))


def match_eigenvalue(
    model: GaussianModel | None = None,
    *,
    rmax_over_a: float = 6.0,
    match_over_a: float = 1.5,
    rtol: float = 1e-10,
    atol: float = 1e-12,
    max_step: float | None = 0.05,
    residual_atol: float = 1e-8,
    n_samples: int = 40,
) -> OdeMatchResult:
    model = model or GaussianModel()
    if model.ell != 0:
        raise OdeMatchError("The DOP853 match is implemented for ell=0 in this release")
    calls = {"n": 0}

    def producer(energy: float) -> tuple[float, bool]:
        calls["n"] += 1
        value, ok, _out, _in = mismatch(
            model,
            energy,
            rmax_over_a=rmax_over_a,
            match_over_a=match_over_a,
            rtol=rtol,
            atol=atol,
            max_step=max_step,
        )
        return value, ok

    lower = -model.V0_eV + 1e-3
    upper = -1e-3
    accepted = None
    for _attempt in range(6):
        samples = np.linspace(lower, upper, n_samples)
        bracket, reason = contiguous_sign_bracket([float(sample) for sample in samples], producer)
        if bracket is None:
            break
        acceptance = refine_root(
            bracket[0],
            bracket[1],
            producer,
            xtol=1e-12,
            rtol=1e-10,
            maxiter=80,
            residual_atol=residual_atol,
        )
        if not acceptance.converged or acceptance.energy is None or acceptance.residual is None:
            raise OdeMatchError(acceptance.termination_reason)
        nodes = _outward_nodes(
            model,
            acceptance.energy,
            match_over_a=match_over_a,
            rtol=rtol,
            atol=atol,
            max_step=max_step,
        )
        if nodes == 0:
            accepted = acceptance
            break
        lower = min(upper, acceptance.energy + max(1e-4, 0.25 * (bracket[1] - bracket[0])))
        if lower >= upper:
            break
    if accepted is None or accepted.energy is None or accepted.residual is None:
        raise OdeMatchError("NO_ZERO_NODE_ROOT")
    return OdeMatchResult(
        energy_eV=accepted.energy,
        residual=accepted.residual,
        rmax_over_a=rmax_over_a,
        match_over_a=match_over_a,
        rtol=rtol,
        atol=atol,
        max_step=max_step,
        outward_status="OK",
        inward_status="OK",
        n_evaluations=calls["n"],
        termination_reason=accepted.termination_reason,
    )
