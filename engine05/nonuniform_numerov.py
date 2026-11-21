"""Brunetti, Speciale and Rudan nonuniform-grid Numerov, 2021.

Journal of Computational Electronics 20, 1105–1113.
DOI 10.1007/s10825-021-01699-3.

Coefficient check used the CC-BY preprint 10.21203/rs.3.rs-229482/v1.
Text extraction of that preprint, not a photograph of the Springer pages.
Preprint equations (16)–(19) are the row used here.

This is a boundary-value system. It is not the 2005 variable-step
recurrence, and it is not a call to numerov_variable_step.
Equation solved: -u'' = c(x) u + s(x), with u known at the endpoints.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np


class NonuniformNumerovError(RuntimeError):
    """Raised when the nonuniform-grid system cannot be solved."""


def assemble_brunetti_speciale_rudan_2021(
    x,
    c_nodes,
    c_mid,
    s_nodes,
    s_mid,
    u_left: float,
    u_right: float,
    denominator_atol: float = 1e-12,
) -> dict[str, list[float]]:
    """Band form of preprint equations (16)–(19).

    Storage, after the endpoint values move to the right-hand side:

        lower[i] * u[i] + diag[i] * u[i] + upper[i] * u[i+1] = rhs[i]

    which is -beta u_{i-1} + alpha u_i - gamma u_{i+1} = sigma + eta.
    This function does not call the 2005 recurrence.
    """
    nodes = [float(value) for value in x]
    c_at_nodes = [float(value) for value in c_nodes]
    c_at_mid = [float(value) for value in c_mid]
    s_at_nodes = [float(value) for value in s_nodes]
    s_at_mid = [float(value) for value in s_mid]
    n_nodes = len(nodes)
    if n_nodes < 3:
        raise ValueError("At least one interior node is required")
    n_internal = n_nodes - 2
    if not (
        len(c_at_nodes) == len(s_at_nodes) == n_nodes and len(c_at_mid) == len(s_at_mid) == n_internal + 1
    ):
        raise ValueError("Coefficient array dimensions do not match the grid")
    if not all(math.isfinite(value) for value in nodes + c_at_nodes + c_at_mid + s_at_nodes + s_at_mid):
        raise ValueError("Grid or coefficient value is not finite")
    if not all(math.isfinite(float(value)) for value in (u_left, u_right)):
        raise ValueError("Boundary values must be finite")
    if any(nodes[j + 1] <= nodes[j] for j in range(n_nodes - 1)):
        raise ValueError("Grid must be strictly increasing")

    widths = [nodes[j + 1] - nodes[j] for j in range(n_internal + 1)]
    a_minus = [0.0] * (n_internal + 1)
    a_plus = [0.0] * (n_internal + 1)
    b_mid = [0.0] * (n_internal + 1)
    for element, width in enumerate(widths):
        width2 = width * width
        denominator = 96.0 - 10.0 * width2 * c_at_mid[element]
        if abs(denominator) <= denominator_atol:
            raise NonuniformNumerovError(f"Near-singular midpoint interpolation on element {element}")
        a_minus[element] = (48.0 + width2 * c_at_nodes[element]) / denominator
        a_plus[element] = (48.0 + width2 * c_at_nodes[element + 1]) / denominator
        b_mid[element] = (s_at_nodes[element] + 10.0 * s_at_mid[element] + s_at_nodes[element + 1]) / denominator

    lower = [0.0] * max(n_internal - 1, 0)
    diag = [0.0] * n_internal
    upper = [0.0] * max(n_internal - 1, 0)
    rhs = [0.0] * n_internal
    for row in range(n_internal):
        h_left = widths[row]
        h_right = widths[row + 1]
        c_left_mid = c_at_mid[row]
        c_right_mid = c_at_mid[row + 1]
        beta = 1.0 / h_left + a_minus[row] * h_left * c_left_mid / 3.0
        gamma = 1.0 / h_right + a_plus[row + 1] * h_right * c_right_mid / 3.0
        alpha = (
            1.0 / h_left
            + 1.0 / h_right
            - a_plus[row] * h_left * c_left_mid / 3.0
            - (h_left + h_right) * c_at_nodes[row + 1] / 6.0
            - a_minus[row + 1] * h_right * c_right_mid / 3.0
        )
        sigma = (
            h_left * s_at_mid[row] / 3.0
            + (h_left + h_right) * s_at_nodes[row + 1] / 6.0
            + h_right * s_at_mid[row + 1] / 3.0
        )
        eta = b_mid[row] * h_left**3 * c_left_mid / 3.0 + b_mid[row + 1] * h_right**3 * c_right_mid / 3.0
        diag[row] = alpha
        rhs[row] = sigma + eta
        if row == 0:
            rhs[row] += beta * float(u_left)
        else:
            lower[row - 1] = -beta
        if row == n_internal - 1:
            rhs[row] += gamma * float(u_right)
        else:
            upper[row] = -gamma
    if not all(math.isfinite(value) for value in lower + diag + upper + rhs):
        raise NonuniformNumerovError("Non-finite assembled system")
    return {"lower": lower, "diag": diag, "upper": upper, "rhs": rhs}


def _sample_coefficients(nodes: np.ndarray, c_at, s_at) -> tuple[list[float], list[float], list[float], list[float]]:
    c_nodes = [float(c_at(float(node))) for node in nodes]
    s_nodes = [float(s_at(float(node))) for node in nodes]
    c_mid = [float(c_at(0.5 * (float(nodes[j]) + float(nodes[j + 1])))) for j in range(len(nodes) - 1)]
    s_mid = [float(s_at(0.5 * (float(nodes[j]) + float(nodes[j + 1])))) for j in range(len(nodes) - 1)]
    return c_nodes, c_mid, s_nodes, s_mid


def assemble_nonuniform_system(nodes: np.ndarray, c_at, s_at, u_left: float, u_right: float) -> tuple[np.ndarray, np.ndarray]:
    """Dense form of the same band system. The matrix is not forced to be symmetric."""
    x = np.asarray(nodes, dtype=float)
    if x.ndim != 1 or len(x) < 4 or np.any(np.diff(x) <= 0.0):
        raise ValueError("Need at least four strictly increasing nodes")
    c_nodes, c_mid, s_nodes, s_mid = _sample_coefficients(x, c_at, s_at)
    bands = assemble_brunetti_speciale_rudan_2021(x, c_nodes, c_mid, s_nodes, s_mid, u_left, u_right)
    n_internal = len(x) - 2
    matrix = np.zeros((n_internal, n_internal), dtype=float)
    rhs = np.asarray(bands["rhs"], dtype=float)
    matrix[np.arange(n_internal), np.arange(n_internal)] = np.asarray(bands["diag"], dtype=float)
    if n_internal > 1:
        matrix[np.arange(1, n_internal), np.arange(n_internal - 1)] = np.asarray(bands["lower"], dtype=float)
        matrix[np.arange(n_internal - 1), np.arange(1, n_internal)] = np.asarray(bands["upper"], dtype=float)
    return matrix, rhs


def solve_nonuniform_bvp(nodes: np.ndarray, c_at, s_at, u_left: float, u_right: float) -> np.ndarray:
    """Nodal solution of -u'' = c u + s on a strictly increasing mesh."""
    x = np.asarray(nodes, dtype=float)
    matrix, rhs = assemble_nonuniform_system(x, c_at, s_at, u_left, u_right)
    try:
        internal = np.linalg.solve(matrix, rhs)
    except np.linalg.LinAlgError as exc:
        raise NonuniformNumerovError("Nonuniform-grid matrix is singular") from exc
    if not np.all(np.isfinite(internal)):
        raise NonuniformNumerovError("Non-finite nodal solution")
    solution = np.empty(len(x), dtype=float)
    solution[0] = u_left
    solution[-1] = u_right
    solution[1:-1] = internal
    return solution


def brunetti_model(k: int = 2, p: int = 5):
    """Manufactured solution (20). c and s are the closed form of that solution.

    The extracted text of their (21) did not satisfy -u'' = c u + s, so those
    printed factors are not used.
    """
    if k <= 0 or p <= 0:
        raise ValueError("k and p must be positive")
    amplitude = k * math.pi * (1.0 + p)
    mu = p / amplitude

    def lam(x: float) -> float:
        return amplitude / (1.0 + p * x)

    def exact(x: float) -> float:
        value = lam(x)
        return value * math.sin(value)

    def coefficient(x: float) -> float:
        value = lam(x)
        return (mu * value) ** 2 * (value * value - 2.0)

    def source(x: float) -> float:
        value = lam(x)
        return -4.0 * (mu * value) ** 2 * value * value * math.cos(value)

    return exact, coefficient, source


def manufactured_identity_is_exact() -> bool:
    """Symbolic check that rebuilt c and s satisfy -u'' = c u + s for solution (20)."""
    import sympy as sp

    x = sp.symbols("x", real=True)
    amplitude = 2 * sp.pi * 6
    mu = 5 / amplitude
    lam = amplitude / (1 + 5 * x)
    u = lam * sp.sin(lam)
    coefficient = (mu * lam) ** 2 * (lam**2 - 2)
    source = -4 * (mu * lam) ** 2 * lam**2 * sp.cos(lam)
    residual = sp.simplify(-sp.diff(u, x, 2) - (coefficient * u + source))
    return residual == 0


def shifted_nodes(n_internal: int, p: int = 5) -> np.ndarray:
    """Left-shifted nodes from their transformation (24)."""
    if n_internal < 2:
        raise ValueError("Need at least two internal nodes")
    uniform = np.linspace(0.0, 1.0, n_internal + 2)
    inside = 1.0 + p * (p + 2.0) * (1.0 - uniform)
    shifted = (1.0 + p - np.sqrt(inside)) / p
    shifted[0] = 0.0
    shifted[-1] = 1.0
    if np.any(np.diff(shifted) <= 0.0):
        raise NonuniformNumerovError("Shifted nodes are not increasing")
    return shifted


@dataclass(frozen=True)
class ManufacturedRun:
    n_internal: int
    max_error: float
    finite_difference_max_error: float
    grid: str
    reduction_ratio: float | None
    characteristic_spacing: float
    observed_order: float | None
    formal_order: str = "NOT_ASSIGNED"


def finite_difference_model(nodes: np.ndarray, c_at, s_at) -> np.ndarray:
    """Equation (22): the paper's finite-difference comparison, not Numerov."""
    x = np.asarray(nodes, dtype=float)
    n_internal = len(x) - 2
    matrix = np.zeros((n_internal, n_internal), dtype=float)
    rhs = np.zeros(n_internal, dtype=float)
    for row, i in enumerate(range(1, len(x) - 1)):
        h_i = float(x[i] - x[i - 1])
        h_next = float(x[i + 1] - x[i])
        beta = 1.0 / h_i
        gamma = 1.0 / h_next
        alpha = beta + gamma - 0.5 * (h_i + h_next) * c_at(x[i])
        if row > 0:
            matrix[row, row - 1] = -beta
        matrix[row, row] = alpha
        if row + 1 < n_internal:
            matrix[row, row + 1] = -gamma
        rhs[row] = 0.5 * (h_i + h_next) * s_at(x[i])
    return np.linalg.solve(matrix, rhs)


def manufactured_convergence(n_values: tuple[int, ...] = (160, 320, 640)) -> list[ManufacturedRun]:
    """Uniform meshes. Spacing is 1/(N+1). Observed order is a measurement, not a theorem."""
    from engine05.tridiagonal import observed_order

    exact, coefficient, source = brunetti_model()
    runs = []
    previous_error = None
    previous_spacing = None
    for n_internal in n_values:
        nodes = np.linspace(0.0, 1.0, n_internal + 2)
        spacing = 1.0 / (n_internal + 1)
        solved = solve_nonuniform_bvp(nodes, coefficient, source, 0.0, 0.0)
        truth = np.array([exact(float(node)) for node in nodes])
        fd_internal = finite_difference_model(nodes, coefficient, source)
        fd_error = float(np.max(np.abs(fd_internal - truth[1:-1])))
        error = float(np.max(np.abs(solved - truth)))
        ratio = None if previous_error is None else previous_error / error
        order = None
        if previous_error is not None and previous_spacing is not None and error > 0.0:
            order = observed_order(previous_error, error, previous_spacing, spacing)
        runs.append(
            ManufacturedRun(
                n_internal=n_internal,
                max_error=error,
                finite_difference_max_error=fd_error,
                grid="uniform",
                reduction_ratio=ratio,
                characteristic_spacing=spacing,
                observed_order=order,
            )
        )
        previous_error = error
        previous_spacing = spacing
    return runs
