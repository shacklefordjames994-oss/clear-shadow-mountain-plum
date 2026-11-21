import pytest

from engine05.adaptive_refinement import (
    AdaptiveRefinementError,
    adaptive_eigenvalue,
    richardson_extrapolation,
)

EXACT = -4.5741727208


def manufactured_solver(h):
    return EXACT + 0.25 * h**4


def test_recovers_fourth_order_limit():
    result = adaptive_eigenvalue(
        manufactured_solver,
        initial_step=0.2,
        relative_tolerance=1e-6,
        energy_scale=1.0,
    )

    assert result.converged
    assert result.relative_error <= 1e-6
    assert abs(result.energy - EXACT) < 1e-9


def test_refinement_history_is_monotonic():
    result = adaptive_eigenvalue(
        manufactured_solver,
        initial_step=0.2,
        relative_tolerance=1e-7,
    )

    steps = [row["step_size"] for row in result.history]
    assert all(steps[i + 1] < steps[i] for i in range(len(steps) - 1))


def test_invalid_step_is_rejected():
    with pytest.raises(ValueError):
        adaptive_eigenvalue(
            manufactured_solver,
            initial_step=0,
        )


def test_nonconvergence_fails_closed():
    with pytest.raises(AdaptiveRefinementError):
        adaptive_eigenvalue(
            lambda h: -4.0 + h,
            initial_step=0.1,
            relative_tolerance=1e-14,
            min_step=0.099,
            max_iterations=2,
        )


def test_nonfinite_solver_output_fails():
    with pytest.raises(AdaptiveRefinementError):
        adaptive_eigenvalue(
            lambda h: float("inf"),
            initial_step=0.1,
        )


def test_first_comparison_uses_exact_step_doubling():
    result = adaptive_eigenvalue(
        manufactured_solver,
        initial_step=0.2,
        relative_tolerance=1e-6,
    )
    first = result.history[0]
    assert first["q"] == pytest.approx(2.0)
    expected = (16.0 * first["fine_energy"] - first["coarse_energy"]) / 15.0
    assert first["richardson_energy"] == pytest.approx(expected)


def test_invalid_q_is_rejected():
    with pytest.raises(AdaptiveRefinementError):
        richardson_extrapolation(-4.57, -4.58, 1.0)
    with pytest.raises(AdaptiveRefinementError):
        richardson_extrapolation(-4.57, -4.58, 0.5)
    with pytest.raises(AdaptiveRefinementError):
        richardson_extrapolation(float("nan"), -4.58, 2.0)


def test_q2_reduces_to_division_by_15():
    extrapolated, error = richardson_extrapolation(-4.0, -4.15, 2.0)
    assert extrapolated == pytest.approx((16.0 * -4.0 - (-4.15)) / 15.0)
    assert error == pytest.approx(0.15 / 15.0)


def test_general_refinement_ratio_recovers_pure_fourth_order():
    def mild(h):
        return EXACT + 1e-3 * h**4

    result = adaptive_eigenvalue(
        mild,
        initial_step=0.2,
        relative_tolerance=1e-9,
        energy_scale=1.0,
        max_refinement_factor=8.0,
        min_step=1e-4,
    )

    assert result.converged
    assert any(abs(row["q"] - 2.0) > 0.05 for row in result.history)
    for row in result.history:
        q = row["q"]
        expected = (q**4 * row["fine_energy"] - row["coarse_energy"]) / (q**4 - 1.0)
        assert row["richardson_energy"] == pytest.approx(expected, rel=0, abs=1e-12)
    assert abs(result.energy - EXACT) < 1e-10
