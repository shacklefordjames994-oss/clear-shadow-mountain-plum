import math

import pytest

from engine05.root_integrity import contiguous_sign_bracket, evaluate_sample, refine_root


def test_eigenvalue_solvers_do_not_substitute_a_sentinel_residual():
    for name in ("numerov_solver.py", "leg_mesh.py", "variable_numerov.py"):
        source = open(f"engine05/{name}", encoding="utf-8").read()
        assert "return 1e6" not in source
        assert "return -1e6" not in source


def test_exact_zero_is_a_bracket_without_refinement():
    evaluation = evaluate_sample(0.0, lambda energy: energy)
    assert evaluation.reason == "EXACT_ZERO"
    bracket, reason = contiguous_sign_bracket((-1.0, 0.0, 1.0), lambda energy: energy)
    assert reason == "EXACT_ZERO"
    assert bracket == (0.0, 0.0)
    acceptance = refine_root(0.25, 0.25, lambda _energy: 0.0, xtol=1e-12, rtol=1e-12, maxiter=5, residual_atol=1e-8)
    assert acceptance.converged
    assert acceptance.termination_reason == "EXACT_ZERO"


def test_reversed_bracket_is_rejected():
    acceptance = refine_root(1.0, -1.0, lambda energy: energy, xtol=1e-12, rtol=1e-12, maxiter=10, residual_atol=1e-8)
    assert acceptance.converged is False
    assert acceptance.energy is None
    assert acceptance.termination_reason == "BRACKET_REVERSED"


def test_both_sign_orders_bracket_only_adjacent_valid_samples():
    rising, rising_reason = contiguous_sign_bracket((-0.5, 0.5), lambda energy: energy)
    falling, falling_reason = contiguous_sign_bracket((0.5, -0.5), lambda energy: -energy)
    assert rising_reason == falling_reason == "SIGN_CHANGE"
    assert rising == (-0.5, 0.5)
    assert falling == (0.5, -0.5)


def test_invalid_interior_sample_breaks_the_bracket():
    def producer(energy: float):
        if energy == 0.0:
            return math.nan, False
        return energy, True

    evaluation = evaluate_sample(0.0, producer)
    assert evaluation.valid is False
    assert evaluation.residual is None
    bracket, reason = contiguous_sign_bracket((-1.0, 0.0, 1.0), producer)
    assert bracket is None
    assert reason == "NO_CONTIGUOUS_SIGN_CHANGE_AFTER_INVALID_SAMPLE"


def test_invalid_interior_refinement_returns_no_energy():
    def producer(energy: float):
        if abs(energy) < 0.2:
            return math.nan, False
        return energy, True

    acceptance = refine_root(-1.0, 1.0, producer, xtol=1e-12, rtol=1e-10, maxiter=30, residual_atol=1e-8)
    assert acceptance.converged is False
    assert acceptance.energy is None
    assert acceptance.termination_reason.startswith("INVALID_DURING_REFINEMENT")


def test_final_reevaluation_failure_is_not_accepted():
    seen = {"roots": 0}

    def producer(energy: float):
        if abs(energy) < 1e-12:
            seen["roots"] += 1
            if seen["roots"] >= 2:
                return math.nan, False
        return energy, True

    acceptance = refine_root(-1.0, 1.0, producer, xtol=1e-14, rtol=1e-12, maxiter=40, residual_atol=1e-6)
    assert acceptance.converged is False
    assert acceptance.energy is None
    assert acceptance.termination_reason == "FINAL_REEVALUATION_INVALID"


def test_loose_root_fails_a_tight_residual_tolerance():
    acceptance = refine_root(
        0.0,
        1.0,
        lambda energy: 1000.0 * (energy - 0.2) ** 3,
        xtol=0.05,
        rtol=0.05,
        maxiter=30,
        residual_atol=1e-6,
    )
    assert acceptance.converged is False
    assert acceptance.termination_reason == "RESIDUAL_TOLERANCE_FAILED"
    assert acceptance.residual is not None
    assert abs(acceptance.residual) > 1e-6


def test_smooth_root_is_accepted_only_after_reevaluation():
    acceptance = refine_root(
        -1.0,
        2.0,
        lambda energy: energy - 0.5,
        xtol=1e-14,
        rtol=1e-12,
        maxiter=50,
        residual_atol=1e-10,
    )
    assert acceptance.converged
    assert acceptance.energy == pytest.approx(0.5, abs=1e-12)
    assert acceptance.termination_reason == "RESIDUAL_ACCEPTED"
    assert abs(acceptance.residual) <= 1e-10
