"""Fixed-step Numerov bound states for a Gaussian two-body well.

The recurrence is the constant-step reference. Adaptive code must call this
solver; it must not replace it. Eigenvalues are computations, not measurements.
"""

from __future__ import annotations

import hashlib
import json
import math
import platform
from dataclasses import dataclass
from pathlib import Path

import numpy as np

HBAR_J_S = 1.054571817e-34
U_KG = 1.66053906660e-27
EV = 1.602176634e-19

# Archived computational prototypes. Do not replace these with a new run.
ARCHIVED_REFERENCE_EV = -4.5741727208
ARCHIVED_GRID_EV = {
    0.01: -4.57417280742503,
    0.005: -4.574172726218435,
    0.0025: -4.574172721145481,
    0.00125: -4.574172720828307,
    0.000625: -4.574172720808557,
}
ARCHIVED_VARIATIONAL_EV = -4.574143873272
ARCHIVED_VARIATIONAL_WIDTH_PM = 17.32126735
SOLVER_ID = "numerov-fixed-step-v1"


class NumerovError(RuntimeError):
    """Raised when the fixed-step eigenvalue problem cannot be solved."""


@dataclass(frozen=True)
class GaussianModel:
    mu_u: float = 0.5
    V0_eV: float = 5.0
    a_pm: float = 100.0
    ell: int = 0

    def __post_init__(self) -> None:
        if self.mu_u <= 0:
            raise ValueError("mu_u must be positive")
        if self.V0_eV <= 0:
            raise ValueError("V0_eV must be positive")
        if self.a_pm <= 0:
            raise ValueError("a_pm must be positive")
        if self.ell < 0:
            raise ValueError("ell must be non-negative")


@dataclass
class BoundStateResult:
    energy_eV: float
    epsilon: float
    g: float
    Es_eV: float
    norm: float
    mean_radius_pm: float
    tail_probability: float
    truncated_tail_probability: float
    turning_point_over_a: float
    nodes: int
    matching_residual: float
    h_over_a: float
    rmax_over_a: float
    rmax_actual_over_a: float
    match_over_a: float
    match_actual_over_a: float
    n_points: int
    potential_evaluations: int
    residual_evaluations: int
    root_bracket: tuple[float, float]
    converged: bool
    solver: str = SOLVER_ID


def energy_scales(model: GaussianModel) -> tuple[float, float]:
    """Return (Es in eV, dimensionless depth g = V0/Es)."""
    mu = model.mu_u * U_KG
    a_m = model.a_pm * 1e-12
    es_j = HBAR_J_S**2 / (2.0 * mu * a_m**2)
    es_eV = es_j / EV
    return es_eV, model.V0_eV / es_eV


def variational_gaussian(
    model: GaussianModel | None = None,
    sigma_pm: float | None = None,
) -> dict[str, float]:
    """Analytic Gaussian trial ψ ∝ exp(-r² / 2σ²). Upper bound, not an eigenvalue."""
    model = model or GaussianModel()
    a_m = model.a_pm * 1e-12

    def energy_at(width_pm: float) -> float:
        sigma = width_pm * 1e-12
        mu = model.mu_u * U_KG
        kinetic = (3.0 * HBAR_J_S**2 / (4.0 * mu * sigma * sigma)) / EV
        potential = -model.V0_eV * (1.0 + (sigma / a_m) ** 2) ** (-1.5)
        return kinetic + potential

    if sigma_pm is None:
        lo, hi = 10.0, 40.0
        phi = (1.0 + math.sqrt(5.0)) / 2.0
        for _ in range(80):
            left = hi - (hi - lo) / phi
            right = lo + (hi - lo) / phi
            if energy_at(left) < energy_at(right):
                hi = right
            else:
                lo = left
        sigma_pm = 0.5 * (lo + hi)
    energy = energy_at(sigma_pm)
    return {
        "sigma_pm": sigma_pm,
        "energy_eV": energy,
        "archived_energy_eV": ARCHIVED_VARIATIONAL_EV,
        "archived_sigma_pm": ARCHIVED_VARIATIONAL_WIDTH_PM,
        "is_upper_bound": True,
    }


class _GridProblem:
    def __init__(self, model: GaussianModel, h: float, rmax: float, match: float) -> None:
        if h <= 0:
            raise ValueError("h_over_a must be positive")
        if rmax <= match:
            raise ValueError("rmax_over_a must exceed match_over_a")
        self.model = model
        self.h = h
        self.es_eV, self.g = energy_scales(model)
        self.n = int(round(rmax / h))
        self.m = int(round(match / h))
        if self.n < 8 or not 2 <= self.m <= self.n - 2:
            raise NumerovError(
                "Grid cannot host the matching point. Increase rmax/h or reduce h."
            )
        self.x = np.arange(self.n + 1, dtype=float) * h
        self.evals = 0
        self.residual_calls = 0

    def _k(self, eps: float) -> np.ndarray:
        k = np.empty(self.n + 1, dtype=float)
        ell = self.model.ell
        g = self.g
        for i, x in enumerate(self.x):
            self.evals += 1
            cent = 0.0
            if ell != 0 and x != 0.0:
                cent = ell * (ell + 1) / (x * x)
            k[i] = eps + g * math.exp(-x * x) - cent
        return k

    def integrate(self, energy_eV: float) -> tuple[float, bool]:
        """Log-derivative mismatch. The second flag is false at a node or a failure."""
        self.residual_calls += 1
        eps = energy_eV / self.es_eV
        if eps >= 0.0:
            return math.nan, False
        k = self._k(eps)
        f = 1.0 + (self.h * self.h) * k / 12.0
        u_left = np.zeros(self.n + 1, dtype=float)
        u_right = np.zeros(self.n + 1, dtype=float)
        ell = self.model.ell
        u_left[1] = self.h ** (ell + 1)
        start = 1
        if ell > 0:
            u_left[2] = (2.0 * self.h) ** (ell + 1)
            start = 2
        for i in range(start, self.m + 1):
            nxt = numerov_forward(f[i - 1], f[i], f[i + 1], u_left[i - 1], u_left[i])
            if nxt is None:
                return math.nan, False
            u_left[i + 1] = nxt

        kappa = math.sqrt(-eps)
        u_right[self.n] = 1.0
        u_right[self.n - 1] = math.exp(kappa * self.h)
        for i in range(self.n - 1, self.m - 1, -1):
            nxt = numerov_backward(f[i - 1], f[i], f[i + 1], u_right[i], u_right[i + 1])
            if nxt is None:
                return math.nan, False
            u_right[i - 1] = nxt
            if abs(nxt) > 1e8:
                u_right[i - 1 :] *= 1e-8

        left = _log_derivative(u_left, k, self.m, self.h)
        right = _log_derivative(u_right, k, self.m, self.h)
        if left is None or right is None:
            return math.nan, False
        peak = max(float(np.max(np.abs(u_left[1 : self.m + 2]))), 1e-30)
        if abs(u_left[self.m]) < 1e-12 * peak:
            return math.nan, False
        self._last = (u_left, u_right, k, energy_eV)
        return left - right, True


def numerov_forward(
    f_prev: float,
    f_curr: float,
    f_next: float,
    u_prev: float,
    u_curr: float,
) -> float | None:
    """One constant-step Numerov advance. None means the step is not usable."""
    if abs(f_next) < 1e-14:
        return None
    nxt = ((12.0 - 10.0 * f_curr) * u_curr - f_prev * u_prev) / f_next
    if not math.isfinite(nxt):
        return None
    return nxt


def numerov_backward(
    f_prev: float,
    f_curr: float,
    f_next: float,
    u_curr: float,
    u_next: float,
) -> float | None:
    """One constant-step Numerov step toward smaller radius."""
    if abs(f_prev) < 1e-14:
        return None
    nxt = ((12.0 - 10.0 * f_curr) * u_curr - f_next * u_next) / f_prev
    if not math.isfinite(nxt):
        return None
    return nxt


def _log_derivative(u: np.ndarray, k: np.ndarray, i: int, h: float) -> float | None:
    """O(h^4) logarithmic derivative from the local Taylor identity u'' = -k u."""
    if abs(u[i]) < 1e-30:
        return None
    k_prime = (k[i + 1] - k[i - 1]) / (2.0 * h)
    slope = (u[i + 1] - u[i - 1]) / (2.0 * h * u[i])
    numer = slope + (h * h) * k_prime / 6.0
    denom = 1.0 - (h * h) * k[i] / 6.0
    if abs(denom) < 1e-14:
        return None
    value = numer / denom
    if not math.isfinite(value):
        return None
    return value


def _bracket(problem: _GridProblem, lo: float, hi: float) -> tuple[float, float]:
    samples = np.linspace(lo, hi, 160)
    previous_e = None
    previous_f = None
    for energy in samples:
        mismatch, ok = problem.integrate(float(energy))
        if not ok or not math.isfinite(mismatch):
            previous_e = None
            previous_f = None
            continue
        if previous_f is not None and previous_e is not None and previous_f * mismatch < 0.0:
            return float(previous_e), float(energy)
        previous_e = float(energy)
        previous_f = mismatch
    raise NumerovError("No bracketed ground-state sign change in the search window")


def _probability_beyond(x: np.ndarray, radial: np.ndarray, radius: np.ndarray, turning: float) -> float:
    """Probability for x greater than the classical turning point, with the boundary interpolated."""
    if turning <= float(x[0]):
        return float(np.trapezoid(radial * radial, radius))
    if turning >= float(x[-1]):
        return 0.0
    index = int(np.searchsorted(x, turning))
    left = index - 1
    span = float(x[index] - x[left])
    weight = 0.0 if span == 0.0 else (turning - float(x[left])) / span
    u_turn = float(radial[left] + weight * (radial[index] - radial[left]))
    r_turn = float(radius[left] + weight * (radius[index] - radius[left]))
    sample_u = np.concatenate((np.array([u_turn]), radial[index:]))
    sample_r = np.concatenate((np.array([r_turn]), radius[index:]))
    return float(np.trapezoid(sample_u * sample_u, sample_r))


def _nodes(values: np.ndarray) -> int:
    signs = np.sign(values[1:])
    signs = signs[signs != 0]
    if signs.size < 2:
        return 0
    return int(np.sum(signs[1:] * signs[:-1] < 0))


def solve_bound_state(
    model: GaussianModel,
    h_over_a: float,
    rmax_over_a: float = 6.0,
    match_over_a: float = 0.17,
    e_min_eV: float | None = None,
    e_max_eV: float | None = None,
) -> BoundStateResult:
    """Ground-state eigenvalue of V(r) = -V0 exp(-(r/a)^2) by fixed-step Numerov."""
    problem = _GridProblem(model, h_over_a, rmax_over_a, match_over_a)
    lo = -model.V0_eV + 1e-4 if e_min_eV is None else e_min_eV
    hi = -1e-4 if e_max_eV is None else e_max_eV
    if not lo < hi < 0.0:
        raise NumerovError("Bound-state search window must lie below threshold")
    bracket = _bracket(problem, lo, hi)
    from engine05.root_integrity import refine_root

    acceptance = refine_root(
        bracket[0],
        bracket[1],
        lambda energy: problem.integrate(float(energy)),
        xtol=1e-14,
        rtol=1e-12,
        maxiter=200,
        residual_atol=1e-8,
    )
    if not acceptance.converged or acceptance.energy is None:
        raise NumerovError(acceptance.termination_reason)
    energy = acceptance.energy
    mismatch, ok = problem.integrate(energy)
    if not ok:
        raise NumerovError("Eigenvalue root landed on an invalid matching point")

    u_left, u_right, _k, _energy = problem._last
    if abs(u_right[problem.m]) < 1e-30:
        raise NumerovError("Inward solution vanished at the matching point")
    scale = u_left[problem.m] / u_right[problem.m]
    radial = np.concatenate([u_left[: problem.m], u_right[problem.m :] * scale])
    a_m = model.a_pm * 1e-12
    radius = problem.x * a_m
    norm_sq = float(np.trapezoid(radial * radial, radius))
    if not math.isfinite(norm_sq) or norm_sq <= 0.0:
        raise NumerovError("Wavefunction norm is not positive")
    radial = radial / math.sqrt(norm_sq)
    norm = float(np.trapezoid(radial * radial, radius))
    mean_m = float(np.trapezoid(radius * radial * radial, radius))
    ratio = -energy / model.V0_eV
    if 0.0 < ratio < 1.0:
        turning = math.sqrt(-math.log(ratio))
    else:
        turning = rmax_over_a
    tail = _probability_beyond(problem.x, radial, radius, turning)
    eps = energy / problem.es_eV
    kappa = math.sqrt(-eps) / a_m
    truncated = float(radial[-1] ** 2 / (2.0 * kappa))
    return BoundStateResult(
        energy_eV=energy,
        epsilon=eps,
        g=problem.g,
        Es_eV=problem.es_eV,
        norm=norm,
        mean_radius_pm=mean_m * 1e12,
        tail_probability=tail + truncated,
        truncated_tail_probability=truncated,
        turning_point_over_a=turning,
        nodes=_nodes(radial),
        matching_residual=float(mismatch),
        h_over_a=h_over_a,
        rmax_over_a=rmax_over_a,
        rmax_actual_over_a=float(problem.x[-1]),
        match_over_a=match_over_a,
        match_actual_over_a=float(problem.x[problem.m]),
        n_points=problem.n + 1,
        potential_evaluations=problem.evals,
        residual_evaluations=problem.residual_calls,
        root_bracket=bracket,
        converged=True,
    )


def wavefunction(
    model: GaussianModel,
    h_over_a: float,
    rmax_over_a: float = 6.0,
    match_over_a: float = 0.17,
    energy_eV: float | None = None,
) -> dict[str, list[float] | float]:
    """Normalized u(r) on the dimensionless grid. Used by the benchmark sampler."""
    solved = solve_bound_state(model, h_over_a, rmax_over_a, match_over_a)
    energy = solved.energy_eV if energy_eV is None else energy_eV
    problem = _GridProblem(model, h_over_a, rmax_over_a, match_over_a)
    _mismatch, ok = problem.integrate(energy)
    if not ok:
        raise NumerovError("Cannot reconstruct the wavefunction")
    u_left, u_right, _k, _energy = problem._last
    scale = u_left[problem.m] / u_right[problem.m]
    radial = np.concatenate([u_left[: problem.m], u_right[problem.m :] * scale])
    a_m = model.a_pm * 1e-12
    radius = problem.x * a_m
    norm_sq = float(np.trapezoid(radial * radial, radius))
    radial = radial / math.sqrt(norm_sq)
    step = max(1, len(problem.x) // 240)
    return {
        "x_over_a": problem.x[::step].tolist(),
        "u": radial[::step].tolist(),
        "energy_eV": energy,
        "potential_eV": (-model.V0_eV * np.exp(-problem.x[::step] ** 2)).tolist(),
    }


def run_benchmark() -> dict:
    """Execute the archived Gaussian benchmark and the 05-B refinement wrapper."""
    from engine05.adaptive_refinement import adaptive_eigenvalue

    model = GaussianModel()
    es_eV, g = energy_scales(model)
    grids = []
    for h, archived in ARCHIVED_GRID_EV.items():
        solved = solve_bound_state(model, h_over_a=h, rmax_over_a=6.0, match_over_a=0.17)
        grids.append(
            {
                "h_over_a": h,
                "energy_eV": solved.energy_eV,
                "archived_energy_eV": archived,
                "absolute_difference_eV": solved.energy_eV - archived,
                "norm": solved.norm,
                "nodes": solved.nodes,
                "mean_radius_pm": solved.mean_radius_pm,
                "tail_probability": solved.tail_probability,
                "truncated_tail_probability": solved.truncated_tail_probability,
                "matching_residual": solved.matching_residual,
                "potential_evaluations": solved.potential_evaluations,
                "residual_evaluations": solved.residual_evaluations,
                "n_points": solved.n_points,
                "root_bracket_eV": list(solved.root_bracket),
            }
        )
    domains = []
    for rmax in (4.0, 5.0, 6.0, 8.0, 10.0):
        solved = solve_bound_state(model, h_over_a=0.0025, rmax_over_a=rmax, match_over_a=0.17)
        domains.append(
            {
                "rmax_over_a": rmax,
                "energy_eV": solved.energy_eV,
                "matching_residual": solved.matching_residual,
                "truncated_tail_probability": solved.truncated_tail_probability,
            }
        )
    reference = next(row for row in grids if row["h_over_a"] == 0.0025)
    counts: list[dict[str, float]] = []

    def solve_gaussian_energy(h: float) -> float:
        solved = solve_bound_state(model, h_over_a=h, rmax_over_a=6.0, match_over_a=0.17)
        counts.append(
            {
                "h_over_a": h,
                "energy_eV": solved.energy_eV,
                "potential_evaluations": solved.potential_evaluations,
            }
        )
        return solved.energy_eV

    adaptive = adaptive_eigenvalue(
        solve_gaussian_energy,
        initial_step=0.02,
        relative_tolerance=1e-8,
        energy_scale=1.0,
        min_step=1e-4,
        max_iterations=12,
    )
    fine = next(row for row in grids if row["h_over_a"] == 0.000625)
    adaptive_evals = int(sum(row["potential_evaluations"] for row in counts))
    variational = variational_gaussian(model)
    variational_at_archive = variational_gaussian(model, ARCHIVED_VARIATIONAL_WIDTH_PM)
    from engine05.leg_mesh import independent_leg_eigenvalue
    from engine05.variable_numerov import variable_gaussian_benchmark
    from engine05.nonuniform_numerov import manufactured_convergence

    legs = independent_leg_eigenvalue(
        model,
        initial_step=0.02,
        relative_tolerance=1e-6,
        energy_scale=1.0,
        min_step=1e-3,
        max_iterations=4,
    )
    variable = variable_gaussian_benchmark(model)
    nonuniform = manufactured_convergence((160, 320, 640))
    payload: dict = {
        "record_id": "SQRT-D02-GAUSS-001",
        "engine": "SQRT-01-ENGINE-05",
        "solver": SOLVER_ID,
        "adaptive_solver": "richardson-global-fourth-order-v1",
        "method_order_global": 4,
        "error_estimator": "global-richardson",
        "controller_exponent": 0.25,
        "mesh_frozen_during_root_search": True,
        "independent_leg_adaptation": "uniform-legs-frozen-root-search",
        "local_step_doubling_implemented": False,
        "variable_step_recurrence_implemented": False,
        "experimental_validation": False,
        "repository_publication": False,
        "epistemic_status": {
            "fixed_step_numerov": "EXECUTED",
            "global_richardson_refinement": "EXECUTED",
            "independent_leg_adaptation": "EXECUTED",
            "variable_step_numerov": "EXECUTED",
            "nonuniform_grid_numerov": "EXECUTED",
            "pytest": "NOT_RECORDED_IN_THIS_OBJECT",
            "experimental_measurement": "NOT_VALIDATED",
        },
        "constants": {
            "hbar_J_s": HBAR_J_S,
            "u_kg": U_KG,
            "eV_J": EV,
            "Es_eV": es_eV,
            "g": g,
        },
        "potential": {
            "form": "V(r)=-V0*exp(-(r/a)^2)",
            "mu_u": model.mu_u,
            "V0_eV": model.V0_eV,
            "a_pm": model.a_pm,
            "ell": model.ell,
        },
        "boundary_conditions": {
            "origin": "u(0)=0 with u(h)=h for ell=0",
            "outer": "inward decaying exp(-sqrt(-epsilon)*x), constant kappa",
            "match": "corrected logarithmic derivatives at match/a=0.17",
            "rmax_over_a": 6.0,
        },
        "archived_reference_energy_eV": ARCHIVED_REFERENCE_EV,
        "grid_convergence": grids,
        "domain_convergence_h_over_a_0_0025": domains,
        "reference_h_over_a_0_0025": reference,
        "adaptive": {
            "energy_eV": adaptive.energy,
            "estimated_error_eV": adaptive.estimated_error,
            "relative_error": adaptive.relative_error,
            "step_size": adaptive.step_size,
            "iterations": adaptive.iterations,
            "converged": adaptive.converged,
            "history": list(adaptive.history),
            "potential_evaluations": adaptive_evals,
            "calls": counts,
            "comparison": {
                "fixed_h_0_000625_potential_evaluations": fine["potential_evaluations"],
                "adaptive_potential_evaluations": adaptive_evals,
                "ratio_adaptive_over_fine_fixed": adaptive_evals / fine["potential_evaluations"],
                "note": (
                    "Measured on this benchmark only. "
                    "ratio_adaptive_over_fine_fixed compares one adaptive run "
                    "(relative tolerance 1e-8, initial step 0.02) with one fixed-step "
                    "solve at h/a=0.000625. It is not a general 3-5x guarantee. "
                    "Global refinement still performs several complete eigenvalue solves."
                ),
            },
        },
        "legs": {
            "solver": "independent-uniform-legs",
            "energy_eV": legs.energy_eV,
            "estimated_error_eV": legs.estimated_error_eV,
            "relative_error": legs.relative_error,
            "n_out": legs.n_out,
            "n_in": legs.n_in,
            "h_out": legs.h_out,
            "h_in": legs.h_in,
            "iterations": legs.iterations,
            "converged": legs.converged,
            "potential_evaluations": legs.potential_evaluations,
            "mesh_frozen_during_root_search": legs.mesh_frozen_during_root_search,
            "history": list(legs.history),
            "reference_difference_eV": legs.energy_eV - reference["energy_eV"],
            "note": (
                "Each eigenvalue search uses one frozen (n_out, n_in) pair. "
                "The reported energy combines a doubled outward leg and a doubled inward leg. "
                "This is not a variable-step Numerov recurrence and not a measurement."
            ),
        },
        "variable_step": {
            "solver": "vigo-aguiar-ramos-2005-eq8",
            "prefactor": "h_n^2/12",
            "rejected_prefactor": "h_{n+1}^2/12",
            "energy_eV": variable.energy_eV,
            "reference_difference_eV": variable.reference_difference_eV,
            "h_inner": variable.h_inner,
            "h_outer": variable.h_outer,
            "step_ratio": variable.step_ratio,
            "n_points": variable.n_points,
            "potential_evaluations": variable.potential_evaluations,
            "mesh_frozen_during_root_search": variable.mesh_frozen_during_root_search,
            "local_order_when_ratio_is_one": 6,
            "local_order_when_ratio_changes": 5,
            "note": (
                "Equation (8) on one frozen two-zone mesh. "
                "The printed step-size equation cannot increase the step, so it is not used to build this mesh. "
                "This is not the 2005 Woods-Saxon eigenvalue table and not a measurement."
            ),
        },
        "nonuniform_grid": {
            "solver": "brunetti-speciale-rudan-2021",
            "doi": "10.1007/s10825-021-01699-3",
            "problem": "manufactured solution (20), reconstructed c and s",
            "source_identity": "EXACT_SYMBOLIC",
            "formal_order": "NOT_ASSIGNED",
            "runs": [
                {
                    "n_internal": run.n_internal,
                    "max_error": run.max_error,
                    "finite_difference_max_error": run.finite_difference_max_error,
                    "grid": run.grid,
                    "characteristic_spacing": run.characteristic_spacing,
                    "reduction_ratio": run.reduction_ratio,
                    "observed_order": run.observed_order,
                    "formal_order": run.formal_order,
                }
                for run in nonuniform
            ],
            "coefficient_source": "preprint-10.21203/rs.3.rs-229482/v1 equations 16-19, text extraction",
            "springer_page_images_checked": False,
            "note": (
                "Separate tridiagonal boundary-value method. "
                "Not a variable-step call and not a Gaussian eigenvalue. "
                "Observed order is measured on uniform meshes with spacing 1/(N+1). "
                "Formal order is not assigned. Not a measurement."
            ),
        },
        "spec_record": {
            "engine": "SQRT-01-ENGINE-05",
            "solver": "fixed-step-numerov+global-richardson",
            "method_order_global": 4,
            "error_estimator": "global-richardson",
            "controller_exponent": 0.25,
            "mesh_frozen_during_root_search": True,
            "potential_parameters": {
                "V0_eV": model.V0_eV,
                "a_pm": model.a_pm,
                "mu_u": model.mu_u,
                "ell": model.ell,
            },
            "potential_evaluations": adaptive_evals,
            "accepted_steps": adaptive.iterations,
            "rejected_steps": 0,
            "eigenvalue_eV": adaptive.energy,
            "estimated_error_eV": adaptive.estimated_error,
            "matching_residual": reference["matching_residual"],
            "normalization": reference["norm"],
            "convergence_verified": bool(adaptive.converged),
            "experimental_validation": False,
            "name_note": (
                "The template name adaptive-numerov is not used. "
                "This run is global Richardson refinement around the fixed-step solver, "
                "not a variable-step Numerov recurrence. "
                "rejected_steps is 0 because this controller does not reject local intervals."
            ),
        },
        "variational": {
            "recomputed": variational,
            "at_archived_width": variational_at_archive,
            "formula": "T=3*hbar^2/(4*mu*s^2); V=-V0*(1+s^2/a^2)^(-3/2)",
            "note": "Variational energy is an upper bound on the computation, not an exact eigenvalue and not a measurement.",
        },
        "runtime": {
            "python": platform.python_version(),
            "numpy": np.__version__,
        },
        "limitations": [
            "Synthetic Gaussian well, not a QCD or experimental spectrum.",
            "Fixed-step Numerov is the reference recurrence.",
            "05-B refines the global spacing; it is not a variable-step Numerov.",
            "05-D freezes separate outward and inward uniform meshes during each root search. It is not a variable-step Numerov.",
            "05-E uses Vigo-Aguiar and Ramos 2005 equation (8), with prefactor h_n^2/12. A draft prefactor h_{n+1}^2/12 was rejected.",
            "When the step ratio is not 1, the local error of equation (8) drops from O(h^6) to O(h^5).",
            "The printed 2005 step-size equation has no root larger than the previous step, so it cannot increase the step.",
            "The Gaussian two-zone run is not a reproduction of the 2005 Woods-Saxon table.",
            "05-F is the 2021 Brunetti-Speciale-Rudan tridiagonal system. It is not the 2005 recurrence.",
            "05-F coefficients were checked against a text extraction of preprint 10.21203/rs.3.rs-229482/v1 equations (16)-(19). The Springer page images were not photographed.",
            "On uniform meshes the measured error ratio gives an observed order near 4. Formal order stays NOT_ASSIGNED.",
            "The 2021 manufactured coefficients were reconstructed from solution (20); the extracted text of (21) did not satisfy the ODE.",
            "Elliptic centrifugal start for ell>0 is implemented but not part of this certified benchmark.",
            "Excited-state brackets are not certified.",
            "No experimental validation. A code upload is not an experimental publication.",
        ],
    }
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    payload["content_sha256"] = hashlib.sha256(encoded).hexdigest()
    return payload


def write_evidence(payload: dict | None = None, pytest_exit: int | None = None, pytest_summary: str = "") -> Path:
    payload = payload or run_benchmark()
    if pytest_exit is not None:
        passed = pytest_exit == 0
        payload["pytest"] = {
            "exit_code": pytest_exit,
            "passed": passed,
            "summary": pytest_summary.strip(),
        }
        payload["epistemic_status"]["pytest"] = "TESTED" if passed else "FAILED"
        payload["epistemic_status"]["fixed_step_numerov"] = "TESTED" if passed else "EXECUTED"
        payload["epistemic_status"]["global_richardson_refinement"] = "TESTED" if passed else "EXECUTED"
        payload["epistemic_status"]["independent_leg_adaptation"] = "TESTED" if passed else "EXECUTED"
        payload["epistemic_status"]["variable_step_numerov"] = "TESTED" if passed else "EXECUTED"
        payload["epistemic_status"]["nonuniform_grid_numerov"] = "TESTED" if passed else "EXECUTED"
        payload.pop("content_sha256", None)
        encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        payload["content_sha256"] = hashlib.sha256(encoded).hexdigest()
    path = Path(__file__).resolve().parents[1] / "evidence" / "SQRT-D02-GAUSS-001.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    ledger = (
        Path(__file__).resolve().parents[1]
        / "src"
        / "lib"
        / "omega"
        / "engine05"
        / "ledger.json"
    )
    ledger.parent.mkdir(parents=True, exist_ok=True)
    ledger.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return path


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Run the SQRT-01 Engine 05 Gaussian benchmark")
    parser.add_argument(
        "--pytest-exit",
        type=int,
        default=None,
        help="Record a pytest exit code that was actually observed. Omit to leave pytest unmarked.",
    )
    parser.add_argument("--pytest-summary", default="", help="Last pytest summary line from that same run")
    args = parser.parse_args()
    payload = run_benchmark()
    path = write_evidence(payload, pytest_exit=args.pytest_exit, pytest_summary=args.pytest_summary)
    ref = payload["reference_h_over_a_0_0025"]
    adaptive = payload["adaptive"]
    print(f"evidence {path}")
    print(f"sha256 {payload['content_sha256']}")
    print(f"E(h=0.0025) {ref['energy_eV']:.12f} eV")
    print(f"archived    {ref['archived_energy_eV']:.12f} eV")
    print(f"difference  {ref['absolute_difference_eV']:.3e} eV")
    print(f"adaptive    {adaptive['energy_eV']:.12f} eV  converged={adaptive['converged']}")
    print(
        "potential evaluations adaptive/fine "
        f"{adaptive['comparison']['ratio_adaptive_over_fine_fixed']:.3f}"
    )
    print("experimental_validation false")


if __name__ == "__main__":
    main()
