"""Independent initial-value reference for u'' + k(x) u = 0.

DOP853 checks a propagation. It does not replace Numerov and it is not a measurement.
"""

from __future__ import annotations

import numpy as np
from scipy.integrate import solve_ivp


def integrate_second_order(k_function, x_span, initial_state, x_eval, *, rtol=1e-11, atol=1e-13):
    state = np.asarray(initial_state, dtype=float)
    grid = np.asarray(x_eval, dtype=float)
    if state.shape != (2,) or not np.all(np.isfinite(state)):
        raise ValueError("initial_state must be two finite values")
    if not np.all(np.isfinite(grid)) or np.any(np.diff(grid) <= 0.0):
        raise ValueError("x_eval must be finite and strictly increasing")

    def rhs(x, y):
        return np.array([y[1], -float(k_function(x)) * y[0]], dtype=float)

    result = solve_ivp(
        rhs,
        x_span,
        state,
        method="DOP853",
        t_eval=grid,
        rtol=rtol,
        atol=atol,
    )
    if not result.success:
        raise RuntimeError(result.message)
    if not np.all(np.isfinite(result.y)):
        raise FloatingPointError("Reference integrator returned a non-finite value")
    return result
