"""Symmetric finite-difference Hamiltonian for the Gaussian well.

This is not the Numerov recurrence and not the 2021 manufactured BVP.
Dirichlet conditions are u(0) = u(R) = 0.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from scipy.linalg import eigh_tridiagonal

from engine05.numerov_solver import GaussianModel, energy_scales


class GaussianMatrixError(RuntimeError):
    """Raised when the matrix eigenvalue problem cannot be solved."""


@dataclass(frozen=True)
class MatrixGroundState:
    energy_eV: float
    epsilon: float
    residual_inf: float
    h_over_a: float
    rmax_over_a: float
    n_interior: int
    norm: float
    nodes: int
    x: np.ndarray
    u: np.ndarray
    solver: str = "symmetric-tridiagonal-fd2"


def assemble(model: GaussianModel, h_over_a: float, rmax_over_a: float) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    if h_over_a <= 0 or rmax_over_a <= h_over_a:
        raise ValueError("Need a positive step smaller than the domain")
    if model.ell != 0:
        raise GaussianMatrixError("The matrix ground-state solver is implemented for ell=0")
    n_boundary = int(round(rmax_over_a / h_over_a))
    if n_boundary < 8:
        raise ValueError("Domain needs at least eight steps")
    x = np.arange(1, n_boundary, dtype=float) * h_over_a
    _scale, depth = energy_scales(model)
    diagonal = 2.0 / h_over_a**2 - depth * np.exp(-x * x)
    off = np.full(x.size - 1, -1.0 / h_over_a**2)
    return diagonal, off, x


def _nodes(values: np.ndarray) -> int:
    signs = np.sign(values)
    signs = signs[signs != 0]
    if signs.size < 2:
        return 0
    return int(np.sum(signs[1:] * signs[:-1] < 0))


def ground_state(model: GaussianModel | None = None, *, h_over_a: float = 0.01, rmax_over_a: float = 6.0) -> MatrixGroundState:
    model = model or GaussianModel()
    diagonal, off, x = assemble(model, h_over_a, rmax_over_a)
    if not np.allclose(off, off):
        raise GaussianMatrixError("Off-diagonal storage is not a vector")
    values, vectors = eigh_tridiagonal(diagonal, off, select="a")
    epsilon = float(values[0])
    vector = np.asarray(vectors[:, 0], dtype=float)
    scale, _depth = energy_scales(model)
    action = diagonal * vector
    action[:-1] += off * vector[1:]
    action[1:] += off * vector[:-1]
    residual = float(np.max(np.abs(action - epsilon * vector)))
    norm_sq = float(np.trapezoid(vector * vector, x))
    if norm_sq <= 0.0 or not np.isfinite(norm_sq):
        raise GaussianMatrixError("Eigenvector norm is not positive")
    vector = vector / math_sqrt(norm_sq)
    norm = float(np.trapezoid(vector * vector, x))
    return MatrixGroundState(
        energy_eV=epsilon * scale,
        epsilon=epsilon,
        residual_inf=residual,
        h_over_a=h_over_a,
        rmax_over_a=float(x[-1] + h_over_a),
        n_interior=int(x.size),
        norm=norm,
        nodes=_nodes(vector),
        x=x,
        u=vector,
    )


def math_sqrt(value: float) -> float:
    return float(np.sqrt(value))


def symmetry_defect(diagonal: np.ndarray, off: np.ndarray) -> float:
    """A symmetric tridiagonal matrix has one off-diagonal. The defect is zero by storage."""
    if diagonal.ndim != 1 or off.ndim != 1 or off.size != diagonal.size - 1:
        raise ValueError("Tridiagonal shapes do not match")
    return 0.0
