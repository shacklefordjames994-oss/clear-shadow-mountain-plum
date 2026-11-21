import math

import pytest

from engine05.numerov_solver import GaussianModel, numerov_forward, solve_bound_state
from engine05.variable_numerov import (
    VariableStepError,
    eigenvalue_on_variable_mesh,
    gamma_star_3,
    limit_step_ratio,
    numerov_variable_back,
    numerov_variable_step,
    proposed_step,
)

MODEL = GaussianModel()


def test_equal_step_matches_fixed_recurrence():
    h = 0.01
    k = 1.25
    factor = 1.0 + h * h * k / 12.0
    u_prev, u_curr = 0.2, -0.35
    fixed = numerov_forward(factor, factor, factor, u_prev, u_curr)
    variable = numerov_variable_step(u_prev, u_curr, k, k, k, h, h)
    assert variable == pytest.approx(fixed, abs=1e-15)
    restored = numerov_variable_back(u_curr, variable, k, k, k, h, h)
    assert restored == pytest.approx(u_prev, abs=1e-15)


def test_h_next_prefactor_is_not_the_paper_order():
    """The draft prefactor h_{n+1}^2/12 is second order. Equation (8) uses h_n^2/12."""
    h = 0.01
    c = 1.3
    x0 = 0.7
    u0 = math.sin(x0)
    u1 = math.sin(x0 + h)
    paper = numerov_variable_step(u0, u1, 1.0, 1.0, 1.0, h, c * h)
    # Isolated copy of the rejected draft, kept here so it cannot be imported as a solver.
    a = -1.0 + c + c * c
    b = 1.0 + 4.0 * c + 4.0 * c * c + c**3
    c_coeff = c + c * c - c**3
    h2 = (c * h) ** 2
    numerator = (1.0 + c) * u1 - c * u0 + (h2 / 12.0) * (b * (-u1) + c_coeff * (-u0))
    draft = numerator / (1.0 + (h2 / 12.0) * a)
    exact = math.sin(x0 + h + c * h)
    assert abs(paper - exact) < abs(draft - exact) / 1000.0


def test_local_order_drops_when_the_step_changes():
    def local_error(h: float, c: float) -> float:
        x0 = 0.3
        u0 = math.sin(x0)
        u1 = math.sin(x0 + h)
        predicted = numerov_variable_step(u0, u1, 1.0, 1.0, 1.0, h, c * h)
        return abs(predicted - math.sin(x0 + h + c * h))

    equal_ratio = local_error(0.1, 1.0) / local_error(0.05, 1.0)
    changed_ratio = local_error(0.05, 1.5) / local_error(0.025, 1.5)
    assert equal_ratio == pytest.approx(64.0, rel=0.15)
    assert changed_ratio == pytest.approx(32.0, rel=0.15)


def test_printed_controller_cannot_increase_the_step():
    assert gamma_star_3(0.02, 0.02) == pytest.approx(0.0, abs=1e-15)
    step = proposed_step(0.05, divided_difference=1.0e4, tolerance=1e-6, rho=1.0)
    assert 0.0 < step < 0.05
    target = 1e-6 / 1.0e4
    left = step * (step + 0.05) * gamma_star_3(0.05, step)
    assert left == pytest.approx(target, rel=1e-8)
    with pytest.raises(VariableStepError):
        proposed_step(0.05, divided_difference=1.0, tolerance=1.0)
    with pytest.raises(VariableStepError):
        limit_step_ratio(0.02, 0.07)
    assert limit_step_ratio(0.01, 0.02) == pytest.approx(2.0)


def test_uniform_variable_mesh_reproduces_fixed_eigenvalue():
    fixed = solve_bound_state(MODEL, h_over_a=0.01)
    variable = eigenvalue_on_variable_mesh(MODEL, h_inner=0.01, h_outer=0.01, switch=0.5)
    assert variable == pytest.approx(fixed.energy_eV, abs=1e-12)


def test_two_zone_mesh_stays_near_the_reference():
    reference = solve_bound_state(MODEL, h_over_a=0.0025)
    coarse = eigenvalue_on_variable_mesh(MODEL, h_inner=0.01, h_outer=0.02)
    finer = eigenvalue_on_variable_mesh(MODEL, h_inner=0.005, h_outer=0.01)
    assert abs(coarse - reference.energy_eV) < 1e-6
    assert abs(finer - reference.energy_eV) < abs(coarse - reference.energy_eV) / 5.0
