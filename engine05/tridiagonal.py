"""Shared tridiagonal algebra.

This module does not discretize a differential equation. A small residual
means the vector solves the matrix that was handed in. It does not mean
that matrix is the 2021 Numerov system.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import isfinite, log


class TridiagonalError(ValueError):
    """Raised when a tridiagonal system or a mesh scale is not usable."""


@dataclass(frozen=True)
class TridiagonalSystem:
    """A u = rhs for N interior unknowns. Off-diagonals have length N-1."""

    lower: tuple[float, ...]
    diag: tuple[float, ...]
    upper: tuple[float, ...]
    rhs: tuple[float, ...]

    def validate(self) -> None:
        n = len(self.diag)
        if n == 0:
            raise TridiagonalError("System must contain at least one unknown")
        if len(self.lower) != n - 1 or len(self.upper) != n - 1 or len(self.rhs) != n:
            raise TridiagonalError("Off-diagonals must have length N-1 and the right-hand side length N")
        values = self.lower + self.diag + self.upper + self.rhs
        if not all(isfinite(value) for value in values):
            raise TridiagonalError("System contains a non-finite value")


def matvec(system: TridiagonalSystem, solution: tuple[float, ...] | list[float]) -> list[float]:
    system.validate()
    n = len(system.diag)
    if len(solution) != n:
        raise TridiagonalError("Solution length does not match the system")
    out = [system.diag[i] * solution[i] for i in range(n)]
    for i in range(n - 1):
        out[i + 1] += system.lower[i] * solution[i]
        out[i] += system.upper[i] * solution[i + 1]
    return out


def residual_inf(system: TridiagonalSystem, solution: tuple[float, ...] | list[float]) -> float:
    """Infinity norm of A u - rhs."""
    residual = matvec(system, solution)
    return max(abs(residual[i] - system.rhs[i]) for i in range(len(residual)))


def thomas_solve(system: TridiagonalSystem, pivot_tol: float = 1e-14) -> list[float]:
    """Thomas algorithm. A small pivot is an error, not a regularized zero."""
    system.validate()
    n = len(system.diag)
    upper = list(system.upper)
    rhs = list(system.rhs)
    diag = list(system.diag)
    lower = list(system.lower)
    scale = max(1.0, *(abs(value) for value in lower + diag + upper))
    tolerance = pivot_tol * scale
    if abs(diag[0]) <= tolerance:
        raise ArithmeticError("Near-zero first pivot")
    for i in range(1, n):
        factor = lower[i - 1] / diag[i - 1]
        diag[i] -= factor * upper[i - 1]
        rhs[i] -= factor * rhs[i - 1]
        if abs(diag[i]) <= tolerance:
            raise ArithmeticError(f"Near-zero pivot at row {i}")
    solution = [0.0] * n
    solution[-1] = rhs[-1] / diag[-1]
    for i in range(n - 2, -1, -1):
        solution[i] = (rhs[i] - upper[i] * solution[i + 1]) / diag[i]
    return solution


def observed_order(coarse_error: float, fine_error: float, coarse_h: float, fine_h: float) -> float:
    """Measured ratio of two errors. Not a proof of the method's formal order."""
    if min(coarse_error, fine_error, coarse_h, fine_h) <= 0.0:
        raise TridiagonalError("Errors and mesh scales must be positive")
    if fine_h >= coarse_h:
        raise TridiagonalError("The fine mesh scale must be smaller than the coarse one")
    return log(coarse_error / fine_error) / log(coarse_h / fine_h)
