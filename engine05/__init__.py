"""SQRT-01 Engine 05 — fixed-step Numerov and global Richardson refinement.

Computation is not observation. Nothing in this package is an experimental
measurement.
"""

from engine05.adaptive_refinement import (
    AdaptiveRefinementError,
    RefinementResult,
    adaptive_eigenvalue,
)
from engine05.numerov_solver import (
    ARCHIVED_GRID_EV,
    ARCHIVED_REFERENCE_EV,
    ARCHIVED_VARIATIONAL_EV,
    EV,
    HBAR_J_S,
    U_KG,
    BoundStateResult,
    GaussianModel,
    NumerovError,
    energy_scales,
    solve_bound_state,
    variational_gaussian,
)

__all__ = [
    "ARCHIVED_GRID_EV",
    "ARCHIVED_REFERENCE_EV",
    "ARCHIVED_VARIATIONAL_EV",
    "EV",
    "HBAR_J_S",
    "U_KG",
    "AdaptiveRefinementError",
    "BoundStateResult",
    "GaussianModel",
    "NumerovError",
    "RefinementResult",
    "adaptive_eigenvalue",
    "energy_scales",
    "solve_bound_state",
    "variational_gaussian",
]
