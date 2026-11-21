"""Independent outward and inward uniform legs for Engine 05-D.

Each root search freezes its two step counts. The integrator is the
constant-step Numerov recurrence. This is not a variable-step method.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

from engine05.numerov_solver import (
    GaussianModel,
    NumerovError,
    energy_scales,
    numerov_backward,
    numerov_forward,
    _log_derivative,
)


class LegMeshError(RuntimeError):
    """Raised when independent-leg refinement cannot certify an eigenvalue."""


@dataclass(frozen=True)
class LegEigenResult:
    energy_eV: float
    estimated_error_eV: float
    relative_error: float
    n_out: int
    n_in: int
    h_out: float
    h_in: float
    iterations: int
    converged: bool
    potential_evaluations: int
    mesh_frozen_during_root_search: bool
    history: tuple[dict, ...]


def _leg_lengths(match: float, rmax: float, n_out: int, n_in: int) -> tuple[float, float]:
    if n_out < 8 or n_in < 8:
        raise LegMeshError("Each leg needs at least 8 steps")
    if not 0.0 < match < rmax:
        raise LegMeshError("Match radius must lie inside the domain")
    return match / n_out, (rmax - match) / n_in


def mismatch_on_legs(
    model: GaussianModel,
    energy_eV: float,
    *,
    n_out: int,
    n_in: int,
    rmax_over_a: float = 6.0,
    match_over_a: float = 0.17,
    evaluations: list[int] | None = None,
) -> tuple[float, bool]:
    """Log-derivative mismatch on one frozen pair of uniform legs."""
    if model.ell != 0:
        raise NumerovError("Independent-leg benchmark certifies ell = 0 only")
    h_out, h_in = _leg_lengths(match_over_a, rmax_over_a, n_out, n_in)
    es_eV, g = energy_scales(model)
    eps = energy_eV / es_eV
    if eps >= 0.0:
        return math.nan, False
    kappa = math.sqrt(-eps)
    count = 0

    def k_at(x: float) -> float:
        nonlocal count
        count += 1
        return eps + g * math.exp(-x * x)

    # Outward: one step past the match so the derivative stencil stays on this leg.
    x_out = np.arange(n_out + 2, dtype=float) * h_out
    k_out = np.array([k_at(float(x)) for x in x_out])
    f_out = 1.0 + (h_out * h_out) * k_out / 12.0
    u_out = np.zeros(n_out + 2, dtype=float)
    u_out[1] = h_out
    for i in range(1, n_out + 1):
        nxt = numerov_forward(f_out[i - 1], f_out[i], f_out[i + 1], u_out[i - 1], u_out[i])
        if nxt is None:
            return math.nan, False
        u_out[i + 1] = nxt

    # Inward index 0 is the match. Index -1 is one inward step below the match.
    x_in = match_over_a + np.arange(-1, n_in + 1, dtype=float) * h_in
    k_in = np.array([k_at(float(x)) for x in x_in])
    f_in = 1.0 + (h_in * h_in) * k_in / 12.0
    u_in = np.zeros(n_in + 2, dtype=float)
    u_in[-1] = 1.0
    u_in[-2] = math.exp(kappa * h_in)
    # Array layout: position 0 is x = match - h_in. Match is index 1.
    for array_i in range(n_in, 0, -1):
        nxt = numerov_backward(
            f_in[array_i - 1],
            f_in[array_i],
            f_in[array_i + 1],
            u_in[array_i],
            u_in[array_i + 1],
        )
        if nxt is None:
            return math.nan, False
        u_in[array_i - 1] = nxt
        if abs(nxt) > 1e8:
            u_in[array_i - 1 :] *= 1e-8

    left = _log_derivative(u_out, k_out, n_out, h_out)
    right = _log_derivative(u_in, k_in, 1, h_in)
    if evaluations is not None:
        evaluations.append(count)
    if left is None or right is None:
        return math.nan, False
    peak = max(float(np.max(np.abs(u_out[1:]))), 1e-30)
    if abs(u_out[n_out]) < 1e-12 * peak:
        return math.nan, False
    return left - right, True


def eigenvalue_on_legs(
    model: GaussianModel,
    *,
    n_out: int,
    n_in: int,
    rmax_over_a: float = 6.0,
    match_over_a: float = 0.17,
    evaluations: list[int] | None = None,
) -> float:
    """Bracketed root on a mesh that does not change during the search."""
    frozen = (n_out, n_in)
    lo = -model.V0_eV + 1e-4
    hi = -1e-3
    samples = np.linspace(lo, hi, 80)
    previous_e = None
    previous_f = None
    bracket = None
    for energy in samples:
        if frozen != (n_out, n_in):
            raise LegMeshError("Mesh changed during the root search")
        mismatch, ok = mismatch_on_legs(
            model,
            float(energy),
            n_out=n_out,
            n_in=n_in,
            rmax_over_a=rmax_over_a,
            match_over_a=match_over_a,
            evaluations=evaluations,
        )
        if not ok or not math.isfinite(mismatch):
            previous_e = None
            previous_f = None
            continue
        if previous_f is not None and previous_e is not None and previous_f * mismatch < 0.0:
            bracket = (float(previous_e), float(energy))
            break
        previous_e = float(energy)
        previous_f = mismatch
    if bracket is None:
        raise LegMeshError("No bracketed sign change on the frozen leg mesh")

    from engine05.root_integrity import refine_root

    def producer(energy: float) -> tuple[float, bool]:
        if frozen != (n_out, n_in):
            raise LegMeshError("Mesh changed during the root search")
        return mismatch_on_legs(
            model,
            float(energy),
            n_out=n_out,
            n_in=n_in,
            rmax_over_a=rmax_over_a,
            match_over_a=match_over_a,
            evaluations=evaluations,
        )

    acceptance = refine_root(
        bracket[0],
        bracket[1],
        producer,
        xtol=1e-12,
        rtol=1e-10,
        maxiter=80,
        residual_atol=1e-6,
    )
    if not acceptance.converged or acceptance.energy is None:
        raise LegMeshError(acceptance.termination_reason)
    return acceptance.energy


def independent_leg_eigenvalue(
    model: GaussianModel | None = None,
    *,
    initial_step: float = 0.02,
    relative_tolerance: float = 1e-6,
    energy_scale: float = 1.0,
    min_step: float = 1e-3,
    max_iterations: int = 6,
    rmax_over_a: float = 6.0,
    match_over_a: float = 0.17,
) -> LegEigenResult:
    """Refine the outward and inward legs separately, freezing each root search."""
    model = model or GaussianModel()
    if initial_step <= min_step:
        raise ValueError("initial_step must be coarser than min_step")
    n_out = max(8, int(round(match_over_a / initial_step)))
    n_in = max(8, int(round((rmax_over_a - match_over_a) / initial_step)))
    evaluations: list[int] = []
    history: list[dict] = []

    for iteration in range(1, max_iterations + 1):
        h_out, h_in = _leg_lengths(match_over_a, rmax_over_a, n_out, n_in)
        coarse = eigenvalue_on_legs(
            model,
            n_out=n_out,
            n_in=n_in,
            rmax_over_a=rmax_over_a,
            match_over_a=match_over_a,
            evaluations=evaluations,
        )
        outward_fine = eigenvalue_on_legs(
            model,
            n_out=n_out * 2,
            n_in=n_in,
            rmax_over_a=rmax_over_a,
            match_over_a=match_over_a,
            evaluations=evaluations,
        )
        inward_fine = eigenvalue_on_legs(
            model,
            n_out=n_out,
            n_in=n_in * 2,
            rmax_over_a=rmax_over_a,
            match_over_a=match_over_a,
            evaluations=evaluations,
        )
        report = outward_fine + inward_fine - coarse
        estimated = abs(coarse - outward_fine) / 15.0 + abs(coarse - inward_fine) / 15.0
        relative = estimated / max(abs(report), energy_scale)
        history.append(
            {
                "iteration": iteration,
                "n_out": n_out,
                "n_in": n_in,
                "h_out": h_out,
                "h_in": h_in,
                "coarse_energy_eV": coarse,
                "outward_refined_energy_eV": outward_fine,
                "inward_refined_energy_eV": inward_fine,
                "combined_energy_eV": report,
                "estimated_error_eV": estimated,
                "relative_error": relative,
                "mesh_frozen_during_root_search": True,
            }
        )
        if relative <= relative_tolerance:
            return LegEigenResult(
                energy_eV=report,
                estimated_error_eV=estimated,
                relative_error=relative,
                n_out=n_out * 2,
                n_in=n_in * 2,
                h_out=h_out / 2.0,
                h_in=h_in / 2.0,
                iterations=iteration,
                converged=True,
                potential_evaluations=int(sum(evaluations)),
                mesh_frozen_during_root_search=True,
                history=tuple(history),
            )
        outward_error = abs(coarse - outward_fine)
        inward_error = abs(coarse - inward_fine)
        if outward_error >= inward_error:
            n_out *= 2
        else:
            n_in *= 2
        if match_over_a / n_out < min_step and (rmax_over_a - match_over_a) / n_in < min_step:
            raise LegMeshError("Minimum leg spacing reached before convergence")

    raise LegMeshError(f"Independent legs did not converge within {max_iterations} refinements")
