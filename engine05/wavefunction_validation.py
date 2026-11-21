"""Checks on a computed radial function. These checks are not measurements."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from engine05.gaussian_matrix import MatrixGroundState
from engine05.numerov_solver import BoundStateResult, GaussianModel, energy_scales, solve_bound_state, wavefunction


@dataclass(frozen=True)
class WavefunctionReport:
    solver: str
    nodes: int
    ground_state_nodes_ok: bool
    norm: float
    norm_ok: bool
    matching_residual: float
    matching_ok: bool
    differential_residual_inf: float | None
    tail_probability: float | None
    tail_ok: bool | None
    overlap: float | None
    density_discrepancy: float | None
    tolerances: dict[str, float]


def _differential_residual(model: GaussianModel, energy_eV: float, x: np.ndarray, u: np.ndarray) -> float:
    """Second-order residual of -u'' - g exp(-x^2) u - epsilon u. Independent of Numerov."""
    scale, depth = energy_scales(model)
    epsilon = energy_eV / scale
    h = float(x[1] - x[0])
    if not np.allclose(np.diff(x), h, rtol=0, atol=1e-12):
        raise ValueError("Differential residual expects a uniform grid")
    second = (u[:-2] - 2.0 * u[1:-1] + u[2:]) / h**2
    interior_x = x[1:-1]
    interior_u = u[1:-1]
    operator = -second - (epsilon + depth * np.exp(-interior_x * interior_x)) * interior_u
    scale = max(1.0, float(np.max(np.abs((epsilon + depth * np.exp(-interior_x * interior_x)) * interior_u))))
    return float(np.max(np.abs(operator)) / scale)


def validate_numerov(
    solved: BoundStateResult,
    model: GaussianModel | None = None,
    *,
    norm_atol: float = 1e-8,
    residual_atol: float = 1e-8,
    tail_atol: float = 1e-3,
) -> WavefunctionReport:
    model = model or GaussianModel()
    sampled = wavefunction(model, solved.h_over_a, solved.rmax_over_a, solved.match_over_a, solved.energy_eV)
    x = np.asarray(sampled["x_over_a"], dtype=float)
    u = np.asarray(sampled["u"], dtype=float)
    differential = _differential_residual(model, solved.energy_eV, x, u)
    return WavefunctionReport(
        solver="numerov-fixed-step",
        nodes=solved.nodes,
        ground_state_nodes_ok=solved.nodes == 0,
        norm=solved.norm,
        norm_ok=abs(solved.norm - 1.0) <= norm_atol,
        matching_residual=solved.matching_residual,
        matching_ok=abs(solved.matching_residual) <= residual_atol,
        differential_residual_inf=differential,
        tail_probability=solved.tail_probability,
        tail_ok=solved.truncated_tail_probability <= tail_atol,
        overlap=None,
        density_discrepancy=None,
        tolerances={"norm_atol": norm_atol, "residual_atol": residual_atol, "tail_atol": tail_atol},
    )


def overlap_and_density(reference_x: np.ndarray, reference_u: np.ndarray, other: MatrixGroundState) -> tuple[float, float]:
    """Sign-invariant overlap on the matrix nodes. Both functions must be normalized in x."""
    sampled = np.interp(other.x, reference_x, reference_u, left=0.0, right=0.0)
    left = float(np.trapezoid(sampled * sampled, other.x))
    if left <= 0.0:
        raise ValueError("Interpolated reference has no norm")
    sampled = sampled / np.sqrt(left)
    product = float(np.trapezoid(sampled * other.u, other.x))
    aligned = sampled if product >= 0.0 else -sampled
    overlap = abs(float(np.trapezoid(aligned * other.u, other.x)))
    density = float(np.trapezoid(np.abs(aligned * aligned - other.u * other.u), other.x))
    return overlap, density


def validate_pair(model: GaussianModel, solved: BoundStateResult, matrix: MatrixGroundState) -> WavefunctionReport:
    report = validate_numerov(solved, model)
    sampled = wavefunction(model, solved.h_over_a, solved.rmax_over_a, solved.match_over_a, solved.energy_eV)
    overlap, density = overlap_and_density(
        np.asarray(sampled["x_over_a"], dtype=float),
        np.asarray(sampled["u"], dtype=float),
        matrix,
    )
    return WavefunctionReport(
        solver=report.solver,
        nodes=report.nodes,
        ground_state_nodes_ok=report.ground_state_nodes_ok,
        norm=report.norm,
        norm_ok=report.norm_ok,
        matching_residual=report.matching_residual,
        matching_ok=report.matching_ok,
        differential_residual_inf=report.differential_residual_inf,
        tail_probability=report.tail_probability,
        tail_ok=report.tail_ok,
        overlap=overlap,
        density_discrepancy=density,
        tolerances=report.tolerances,
    )
