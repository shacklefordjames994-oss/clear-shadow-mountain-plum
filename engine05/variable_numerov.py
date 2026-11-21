"""Published variable-step Numerov step, kept separate from the fixed-step solver.

Source: J. Vigo-Aguiar and H. Ramos, Journal of Mathematical Chemistry 37,
255–262 (2005), equation (8). The prefactor is h_n^2/12, where h_n is the
step already taken. A draft that used h_{n+1}^2/12 fails the Taylor test
and is not implemented here.

When the step ratio is not 1, the y^(5) term does not cancel. The local
error then drops from O(h^6) to O(h^5). This module does not restore that
term, and it does not claim the 2005 Woods–Saxon table.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np
from scipy.optimize import brentq

SOURCE_CHECK = {
    "doi": "10.1007/s10910-004-1467-3",
    "equation": "8",
    "prefactor": "h_n^2/12",
    "full_text_checked": True,
    "h_next_prefactor_rejected": True,
    "woods_saxon_table_reproduced": False,
}

from engine05.numerov_solver import (
    GaussianModel,
    NumerovError,
    energy_scales,
    numerov_backward,
    numerov_forward,
    solve_bound_state,
    _log_derivative,
)


class VariableStepError(RuntimeError):
    """Raised when the variable-step step or its controller cannot be used."""


def _coefficients(c: float) -> tuple[float, float, float]:
    c2 = c * c
    c3 = c2 * c
    a = -1.0 + c + c2
    b = 1.0 + 4.0 * c + 4.0 * c2 + c3
    c_coeff = c + c2 - c3
    return a, b, c_coeff


def numerov_variable_step(
    u_prev: float,
    u_curr: float,
    k_prev: float,
    k_curr: float,
    k_next: float,
    h_prev: float,
    h_next: float,
) -> float:
    """One step of equation (8), solved for u_{n+1} because f_{n+1} = -k_{n+1} u_{n+1}."""
    if h_prev <= 0.0 or h_next <= 0.0:
        raise ValueError("Step sizes must be positive")
    c = h_next / h_prev
    a, b, c_coeff = _coefficients(c)
    h2 = h_prev * h_prev
    f_prev = -k_prev * u_prev
    f_curr = -k_curr * u_curr
    numerator = (1.0 + c) * u_curr - c * u_prev + (h2 / 12.0) * (b * f_curr + c_coeff * f_prev)
    denominator = 1.0 + (h2 / 12.0) * a * k_next
    if abs(denominator) < 1e-14:
        raise FloatingPointError("Variable Numerov denominator near zero")
    value = numerator / denominator
    if not math.isfinite(value):
        raise FloatingPointError("Variable Numerov step is not finite")
    return value


def numerov_variable_back(
    u_curr: float,
    u_next: float,
    k_prev: float,
    k_curr: float,
    k_next: float,
    h_prev: float,
    h_next: float,
) -> float:
    """Equation (8) solved for the earlier value. Same recurrence, opposite direction."""
    if h_prev <= 0.0 or h_next <= 0.0:
        raise ValueError("Step sizes must be positive")
    c = h_next / h_prev
    a, b, c_coeff = _coefficients(c)
    h2 = h_prev * h_prev
    f_curr = -k_curr * u_curr
    f_next = -k_next * u_next
    known = u_next - (1.0 + c) * u_curr - (h2 / 12.0) * (a * f_next + b * f_curr)
    denominator = c + (h2 / 12.0) * c_coeff * k_prev
    if abs(denominator) < 1e-14:
        raise FloatingPointError("Backward variable Numerov denominator near zero")
    value = -known / denominator
    if not math.isfinite(value):
        raise FloatingPointError("Backward variable Numerov step is not finite")
    return value


def gamma_star_3(h_prev: float, h_next: float) -> float:
    """Printed γ*_3 from Vigo-Aguiar and Ramos, section 3. Zero when the steps are equal."""
    if h_prev <= 0.0 or h_next <= 0.0:
        raise ValueError("Step sizes must be positive")
    return (
        2.0 * h_prev**3
        + 3.0 * h_prev**2 * h_next
        - 3.0 * h_prev * h_next**2
        - 2.0 * h_next**3
    ) / 60.0


def newton_divided_difference(abscissae: list[float], values: list[float]) -> float:
    if len(abscissae) != len(values) or len(values) < 2:
        raise ValueError("Need matching abscissae and at least two values")
    column = list(values)
    width = len(column)
    for level in range(1, width):
        nxt = []
        for i in range(width - level):
            span = abscissae[i + level] - abscissae[i]
            if span == 0.0:
                raise VariableStepError("Divided difference needs distinct nodes")
            nxt.append((column[i + 1] - column[i]) / span)
        column = nxt
    return column[0]


def proposed_step(
    h_prev: float,
    divided_difference: float,
    tolerance: float,
    rho: float = 1.0,
) -> float:
    """Positive root of the printed 2005 step equation, below the previous step.

    The left-hand side is negative for a larger step, so this equation cannot
    propose an increase. That limit is reported; it is not patched.
    """
    if h_prev <= 0.0 or tolerance <= 0.0 or rho <= 0.0:
        raise ValueError("Step, tolerance, and safety factor must be positive")
    if divided_difference == 0.0 or not math.isfinite(divided_difference):
        raise VariableStepError("Published estimator needs a finite nonzero divided difference")
    target = rho * tolerance / abs(divided_difference)

    def residual(step: float) -> float:
        return step * (step + h_prev) * gamma_star_3(h_prev, step) - target

    # The residual is negative at both ends. A root exists only if it rises above zero.
    samples = np.linspace(h_prev / 200.0, h_prev * 0.999, 40)
    values = [residual(float(step)) for step in samples]
    bracket = None
    for left, right, left_value, right_value in zip(samples, samples[1:], values, values[1:]):
        if left_value == 0.0:
            return float(left)
        if left_value * right_value < 0.0:
            bracket = (float(left), float(right))
            break
    if bracket is None:
        raise VariableStepError(
            "Published step equation has no positive root below the previous step"
        )
    return float(brentq(residual, bracket[0], bracket[1], xtol=1e-14, rtol=1e-12))


def limit_step_ratio(h_prev: float, h_next: float, low: float = 0.5, high: float = 2.0) -> float:
    """Reject extreme ratios. This bound is an implementation safeguard, not a 2005 theorem."""
    if h_prev <= 0.0 or h_next <= 0.0 or not 0.0 < low <= high:
        raise ValueError("Invalid step-ratio arguments")
    ratio = h_next / h_prev
    if ratio < low or ratio > high:
        raise VariableStepError(f"Step ratio {ratio:.6g} is outside [{low:g}, {high:g}]")
    return ratio


def _two_zone_nodes(h_inner: float, h_outer: float, switch: float = 0.5, rmax: float = 6.0) -> np.ndarray:
    if min(h_inner, h_outer) <= 0.0 or not 0.0 < switch < rmax:
        raise ValueError("Invalid two-zone mesh")
    nodes = [0.0]
    while nodes[-1] + h_inner <= switch + 1e-12:
        nodes.append(nodes[-1] + h_inner)
    if abs(nodes[-1] - switch) > 1e-9:
        raise VariableStepError("Inner step does not land on the zone boundary")
    while nodes[-1] + h_outer <= rmax + 1e-12:
        nodes.append(nodes[-1] + h_outer)
    if abs(nodes[-1] - rmax) > 1e-8:
        raise VariableStepError("Outer step does not land on the outer boundary")
    return np.asarray(nodes, dtype=float)


@dataclass(frozen=True)
class VariableEigenResult:
    energy_eV: float
    reference_difference_eV: float
    h_inner: float
    h_outer: float
    step_ratio: float
    n_points: int
    potential_evaluations: int
    mesh_frozen_during_root_search: bool


def eigenvalue_on_variable_mesh(
    model: GaussianModel | None = None,
    *,
    h_inner: float = 0.01,
    h_outer: float = 0.02,
    switch: float = 0.5,
    rmax: float = 6.0,
    match: float = 0.17,
    evaluations: list[int] | None = None,
) -> float:
    """Ground-state root on one frozen two-zone mesh. The recurrence changes only at the zone boundary."""
    model = model or GaussianModel()
    if model.ell != 0:
        raise NumerovError("Variable-step benchmark certifies ell = 0 only")
    nodes = _two_zone_nodes(h_inner, h_outer, switch, rmax)
    match_index = int(np.argmin(np.abs(nodes - match)))
    if abs(nodes[match_index] - match) > 1e-10:
        raise VariableStepError("Match radius is not a node")
    if match_index < 2 or match_index > len(nodes) - 3:
        raise VariableStepError("Match radius needs a uniform local stencil")
    es_eV, g = energy_scales(model)
    count = 0

    def k_values(eps: float) -> np.ndarray:
        nonlocal count
        count += len(nodes)
        return eps + g * np.exp(-nodes * nodes)

    def mismatch(energy: float) -> tuple[float, bool]:
        eps = energy / es_eV
        if eps >= 0.0:
            return math.nan, False
        k = k_values(eps)
        h_match = float(nodes[match_index] - nodes[match_index - 1])
        if abs(h_match - float(nodes[match_index + 1] - nodes[match_index])) > 1e-12:
            return math.nan, False
        u_left = np.zeros(match_index + 2, dtype=float)
        u_left[1] = float(nodes[1])
        for n in range(1, match_index + 1):
            try:
                u_left[n + 1] = numerov_variable_step(
                    u_left[n - 1],
                    u_left[n],
                    float(k[n - 1]),
                    float(k[n]),
                    float(k[n + 1]),
                    float(nodes[n] - nodes[n - 1]),
                    float(nodes[n + 1] - nodes[n]),
                )
            except (FloatingPointError, ValueError):
                return math.nan, False
        kappa = math.sqrt(-eps)
        u_right = np.zeros(len(nodes) - match_index + 1, dtype=float)
        # Local index 0 is one node before the match. The physical match is index 1.
        offset = match_index - 1
        h_outer_last = float(nodes[-1] - nodes[-2])
        u_right[-1] = 1.0
        u_right[-2] = math.exp(kappa * h_outer_last)
        for physical in range(len(nodes) - 3, offset - 1, -1):
            local = physical - offset
            try:
                u_right[local] = numerov_variable_back(
                    u_right[local + 1],
                    u_right[local + 2],
                    float(k[physical]),
                    float(k[physical + 1]),
                    float(k[physical + 2]),
                    float(nodes[physical + 1] - nodes[physical]),
                    float(nodes[physical + 2] - nodes[physical + 1]),
                )
            except (FloatingPointError, ValueError):
                return math.nan, False
            if abs(u_right[local]) > 1e8:
                u_right[local:] *= 1e-8
        left = _log_derivative(u_left, k[: match_index + 2], match_index, h_match)
        right = _log_derivative(u_right, k[offset:], 1, h_match)
        if left is None or right is None:
            return math.nan, False
        peak = max(float(np.max(np.abs(u_left[1:]))), 1e-30)
        if abs(u_left[match_index]) < 1e-12 * peak:
            return math.nan, False
        return left - right, True

    lo = -model.V0_eV + 1e-4
    hi = -1e-3
    previous_e = None
    previous_f = None
    bracket = None
    for energy in np.linspace(lo, hi, 80):
        value, ok = mismatch(float(energy))
        if not ok or not math.isfinite(value):
            previous_e = None
            previous_f = None
            continue
        if previous_f is not None and previous_e is not None and previous_f * value < 0.0:
            bracket = (float(previous_e), float(energy))
            break
        previous_e = float(energy)
        previous_f = value
    if bracket is None:
        raise VariableStepError("No bracketed sign change on the frozen variable mesh")

    from engine05.root_integrity import refine_root

    acceptance = refine_root(
        bracket[0],
        bracket[1],
        mismatch,
        xtol=1e-12,
        rtol=1e-10,
        maxiter=80,
        residual_atol=1e-6,
    )
    if not acceptance.converged or acceptance.energy is None:
        raise VariableStepError(acceptance.termination_reason)
    energy = acceptance.energy
    if evaluations is not None:
        evaluations.append(count)
    return energy


def variable_gaussian_benchmark(model: GaussianModel | None = None) -> VariableEigenResult:
    model = model or GaussianModel()
    counts: list[int] = []
    energy = eigenvalue_on_variable_mesh(model, evaluations=counts)
    reference = solve_bound_state(model, h_over_a=0.0025).energy_eV
    return VariableEigenResult(
        energy_eV=energy,
        reference_difference_eV=energy - reference,
        h_inner=0.01,
        h_outer=0.02,
        step_ratio=2.0,
        n_points=len(_two_zone_nodes(0.01, 0.02)),
        potential_evaluations=int(sum(counts)),
        mesh_frozen_during_root_search=True,
    )
