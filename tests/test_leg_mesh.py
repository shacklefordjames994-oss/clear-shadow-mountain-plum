import pytest

from engine05.leg_mesh import (
    LegMeshError,
    eigenvalue_on_legs,
    independent_leg_eigenvalue,
    mismatch_on_legs,
)
from engine05.numerov_solver import ARCHIVED_GRID_EV, GaussianModel, solve_bound_state

MODEL = GaussianModel()


def test_equal_legs_reproduce_uniform_reference():
    uniform = solve_bound_state(MODEL, h_over_a=0.0025)
    legs = eigenvalue_on_legs(MODEL, n_out=68, n_in=2332)
    assert legs == pytest.approx(uniform.energy_eV, abs=5e-13)
    assert legs == pytest.approx(ARCHIVED_GRID_EV[0.0025], abs=5e-13)


def test_independent_legs_agree_with_fixed_step():
    baseline = solve_bound_state(MODEL, h_over_a=0.0025)
    refined = independent_leg_eigenvalue(
        MODEL,
        initial_step=0.02,
        relative_tolerance=1e-6,
        min_step=1e-3,
        max_iterations=4,
    )
    assert refined.converged
    assert refined.mesh_frozen_during_root_search
    assert refined.relative_error <= 1e-6
    relative = abs(refined.energy_eV - baseline.energy_eV) / abs(baseline.energy_eV)
    assert relative < 1e-6
    assert refined.h_out < refined.history[0]["h_out"]
    assert refined.h_in <= refined.history[0]["h_in"]
    assert all(row["mesh_frozen_during_root_search"] for row in refined.history)


def test_short_leg_is_rejected():
    with pytest.raises(LegMeshError):
        mismatch_on_legs(MODEL, -4.57, n_out=4, n_in=20)


def test_unresolved_legs_fail_closed():
    with pytest.raises(LegMeshError):
        independent_leg_eigenvalue(
            MODEL,
            initial_step=0.02,
            relative_tolerance=1e-14,
            min_step=1e-4,
            max_iterations=1,
        )
