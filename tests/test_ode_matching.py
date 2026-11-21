from engine05.numerov_solver import GaussianModel, solve_bound_state
from engine05.ode_matching import match_eigenvalue


def test_dop853_match_is_finite_and_not_a_numerov_call():
    model = GaussianModel()
    matched = match_eigenvalue(model, rmax_over_a=6.0, match_over_a=0.17, n_samples=30, max_step=0.1)
    numerov = solve_bound_state(model, h_over_a=0.01, rmax_over_a=6.0, match_over_a=0.17)
    assert matched.solver == "dop853-two-sided"
    assert matched.termination_reason == "RESIDUAL_ACCEPTED"
    assert abs(matched.residual) < 1e-8
    assert abs(matched.energy_eV - numerov.energy_eV) < 1e-4


def test_ode_module_does_not_call_the_numerov_eigenvalue():
    source = open("engine05/ode_matching.py", encoding="utf-8").read()
    assert "solve_bound_state" not in source
    assert "numerov_forward" not in source
