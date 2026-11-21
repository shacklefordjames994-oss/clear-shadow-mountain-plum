"""Global Richardson refinement for a fourth-order eigenvalue solver.

This wrapper never replaces the fixed-step recurrence. It only calls a
user-supplied uniform-grid solver at successively finer spacings.

For E(h) = E* + C h^4 + O(h^6) and q = h_coarse / h_fine > 1:

    estimated fine error = |E(h) - E(q h)| / (q^4 - 1)
    extrapolated energy  = (q^4 E(h) - E(q h)) / (q^4 - 1)

The controller exponent is 1/4 because the controlled quantity is the global
fourth-order error. It is not a local step-doubling controller.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Callable


@dataclass(frozen=True)
class RefinementResult:
    energy: float
    estimated_error: float
    relative_error: float
    step_size: float
    iterations: int
    converged: bool
    history: tuple[dict, ...]


class AdaptiveRefinementError(RuntimeError):
    """Raised when grid refinement cannot establish convergence."""


def richardson_extrapolation(
    fine_energy: float,
    coarse_energy: float,
    q: float,
) -> tuple[float, float]:
    """Return (extrapolated energy, estimated fine-grid error) for global order 4.

    q = h_coarse / h_fine must be greater than 1. q = 2 reduces to division by 15.
    """
    if not math.isfinite(q) or q <= 1.0:
        raise AdaptiveRefinementError("Refinement ratio q must be greater than 1")
    if not math.isfinite(fine_energy) or not math.isfinite(coarse_energy):
        raise AdaptiveRefinementError("Eigenvalues must be finite")
    denominator = q**4 - 1.0
    estimated_error = abs(fine_energy - coarse_energy) / denominator
    extrapolated = (q**4 * fine_energy - coarse_energy) / denominator
    if not math.isfinite(extrapolated) or not math.isfinite(estimated_error):
        raise AdaptiveRefinementError("Richardson extrapolation was not finite")
    return extrapolated, estimated_error


def adaptive_eigenvalue(
    solve_energy: Callable[[float], float],
    *,
    initial_step: float,
    relative_tolerance: float = 1e-6,
    energy_scale: float = 1.0,
    safety: float = 0.9,
    min_step: float = 1e-6,
    max_iterations: int = 20,
    max_refinement_factor: float = 2.0,
) -> RefinementResult:
    """Adapt the global spacing of an independent fourth-order eigenvalue solver."""
    if initial_step <= 0:
        raise ValueError("initial_step must be positive")
    if relative_tolerance <= 0:
        raise ValueError("relative_tolerance must be positive")
    if energy_scale <= 0:
        raise ValueError("energy_scale must be positive")
    if not 0 < safety <= 1:
        raise ValueError("safety must be in (0, 1]")
    if min_step <= 0 or min_step >= initial_step:
        raise ValueError("min_step must be positive and below initial_step")
    if max_iterations < 1:
        raise ValueError("max_iterations must be at least 1")
    if max_refinement_factor < 1:
        raise ValueError("max_refinement_factor must be >= 1")

    h = initial_step
    previous_step_size = 2.0 * h
    coarse_energy = float(solve_energy(previous_step_size))
    history: list[dict] = []

    for iteration in range(1, max_iterations + 1):
        fine_energy = float(solve_energy(h))
        if not math.isfinite(coarse_energy) or not math.isfinite(fine_energy):
            raise AdaptiveRefinementError("Solver returned a non-finite eigenvalue")

        q = previous_step_size / h
        extrapolated, estimated_error = richardson_extrapolation(
            fine_energy,
            coarse_energy,
            q,
        )

        scale = max(abs(extrapolated), energy_scale)
        relative_error = estimated_error / scale
        history.append(
            {
                "iteration": iteration,
                "step_size": h,
                "previous_step_size": previous_step_size,
                "q": q,
                "coarse_energy": coarse_energy,
                "fine_energy": fine_energy,
                "richardson_energy": extrapolated,
                "estimated_error": estimated_error,
                "relative_error": relative_error,
            }
        )
        if relative_error <= relative_tolerance:
            return RefinementResult(
                energy=extrapolated,
                estimated_error=estimated_error,
                relative_error=relative_error,
                step_size=h,
                iterations=iteration,
                converged=True,
                history=tuple(history),
            )

        factor = safety * (relative_tolerance / relative_error) ** 0.25
        factor = min(1.0, max(1.0 / max_refinement_factor, factor))
        new_h = h * factor
        if new_h >= h:
            new_h = h / 2.0
        if new_h < min_step:
            raise AdaptiveRefinementError("Minimum grid spacing reached before convergence")

        coarse_energy = fine_energy
        previous_step_size = h
        h = new_h

    raise AdaptiveRefinementError(f"Did not converge within {max_iterations} refinements")
