import pytest

from engine05.adaptive_refinement import adaptive_eigenvalue
from engine05.numerov_solver import (
    ARCHIVED_GRID_EV,
    ARCHIVED_REFERENCE_EV,
    ARCHIVED_VARIATIONAL_EV,
    ARCHIVED_VARIATIONAL_WIDTH_PM,
    GaussianModel,
    solve_bound_state,
    variational_gaussian,
)

MODEL = GaussianModel()


def test_coupling_matches_specified_scale():
    solved = solve_bound_state(MODEL, h_over_a=0.01)
    assert solved.g == pytest.approx(1196.12666994, rel=0, abs=1e-6)
    assert solved.Es_eV == pytest.approx(5.0 / 1196.12666994, rel=1e-9)


def test_archived_grid_is_reproduced_not_replaced():
    for h in (0.01, 0.005, 0.0025):
        solved = solve_bound_state(MODEL, h_over_a=h)
        assert solved.energy_eV == pytest.approx(ARCHIVED_GRID_EV[h], abs=5e-13)
        assert solved.nodes == 0
        assert solved.norm == pytest.approx(1.0, abs=1e-10)
        assert abs(solved.matching_residual) < 1e-8


def test_grid_errors_scale_as_fourth_order():
    coarse = solve_bound_state(MODEL, h_over_a=0.01).energy_eV
    mid = solve_bound_state(MODEL, h_over_a=0.005).energy_eV
    fine = solve_bound_state(MODEL, h_over_a=0.0025).energy_eV
    ratio = (coarse - mid) / (mid - fine)
    assert ratio == pytest.approx(16.0, rel=0.02)


def test_domain_convergence_at_reference_spacing():
    energies = [
        solve_bound_state(MODEL, h_over_a=0.0025, rmax_over_a=rmax).energy_eV
        for rmax in (4.0, 6.0, 10.0)
    ]
    assert max(energies) - min(energies) < 1e-12


def test_mean_radius_and_tail_are_stable():
    coarse = solve_bound_state(MODEL, h_over_a=0.01)
    mid = solve_bound_state(MODEL, h_over_a=0.005)
    fine = solve_bound_state(MODEL, h_over_a=0.0025)
    assert fine.mean_radius_pm == pytest.approx(coarse.mean_radius_pm, rel=1e-4)
    assert 10.0 < fine.mean_radius_pm < 40.0
    assert abs(mid.tail_probability - fine.tail_probability) < abs(
        coarse.tail_probability - fine.tail_probability
    )
    assert abs(coarse.tail_probability - fine.tail_probability) < 5e-4
    assert 0.0 < fine.tail_probability < 1.0
    assert fine.truncated_tail_probability < 1e-12


def test_variational_upper_bound_matches_archive_and_sits_above_eigenvalue():
    trial = variational_gaussian(MODEL, ARCHIVED_VARIATIONAL_WIDTH_PM)
    optimum = variational_gaussian(MODEL)
    eigenvalue = solve_bound_state(MODEL, h_over_a=0.0025).energy_eV
    assert trial["energy_eV"] == pytest.approx(ARCHIVED_VARIATIONAL_EV, abs=1e-12)
    assert optimum["sigma_pm"] == pytest.approx(ARCHIVED_VARIATIONAL_WIDTH_PM, abs=5e-6)
    assert trial["energy_eV"] > eigenvalue
    assert optimum["energy_eV"] > eigenvalue
    assert optimum["energy_eV"] <= trial["energy_eV"] + 1e-12


def test_adaptive_agrees_with_fixed_step_within_tolerance():
    baseline = solve_bound_state(MODEL, h_over_a=0.0025)

    def solve_gaussian_energy(h: float) -> float:
        return solve_bound_state(MODEL, h_over_a=h).energy_eV

    refined = adaptive_eigenvalue(
        solve_gaussian_energy,
        initial_step=0.02,
        relative_tolerance=1e-6,
        energy_scale=1.0,
        min_step=1e-4,
        max_iterations=8,
    )
    assert refined.converged
    relative = abs(refined.energy - baseline.energy_eV) / abs(baseline.energy_eV)
    assert relative < 1e-6
    assert abs(refined.energy - ARCHIVED_REFERENCE_EV) / abs(ARCHIVED_REFERENCE_EV) < 1e-6


def test_three_tolerances_stay_on_the_same_eigenvalue():
    def solve_gaussian_energy(h: float) -> float:
        return solve_bound_state(MODEL, h_over_a=h).energy_eV

    energies = []
    previous_step = 1.0
    for tolerance in (1e-5, 1e-6, 1e-7):
        refined = adaptive_eigenvalue(
            solve_gaussian_energy,
            initial_step=0.02,
            relative_tolerance=tolerance,
            energy_scale=1.0,
            min_step=1e-4,
            max_iterations=8,
        )
        assert refined.converged
        assert refined.relative_error <= tolerance
        assert refined.step_size <= previous_step + 1e-15
        previous_step = refined.step_size
        energies.append(refined.energy)
    assert max(energies) - min(energies) < 5e-6


def test_potential_evaluations_are_counted_not_assumed():
    solved = solve_bound_state(MODEL, h_over_a=0.01)
    assert solved.potential_evaluations >= solved.n_points
    assert solved.residual_evaluations >= 2
