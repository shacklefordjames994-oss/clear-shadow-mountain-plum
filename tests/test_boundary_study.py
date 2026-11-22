from engine05.boundary_study import (
    matrix_step_study,
    matrix_versus_numerov_domains,
    ode_domain_and_match_sensitivity,
)
from engine05.numerov_solver import GaussianModel


def test_dirichlet_and_exponential_boundaries_are_reported_separately():
    study = matrix_versus_numerov_domains(GaussianModel(), h_over_a=0.05, domains=(4.0, 6.0, 8.0))
    assert study["rows"]
    assert all(row["like_for_like"] is False for row in study["rows"])
    assert all(row["numerov_nodes"] == 0 and row["matrix_nodes"] == 0 for row in study["rows"])
    assert study["matrix_domain_spread_eV"] < 1e-4
    assert study["numerov_domain_spread_eV"] < 1e-8
    assert abs(study["cross_solver_difference_at_largest_domain_eV"]) > study["numerov_domain_spread_eV"]


def test_matrix_gap_shrinks_under_documented_step_halving():
    study = matrix_step_study(GaussianModel())
    gaps = [abs(row["matrix_minus_archived_numerov_eV"]) for row in study["rows"]]
    assert study["formal_order"] == "NOT_ASSIGNED"
    assert study["boundary_equivalence"] is False
    assert all(row["matrix_nodes"] == 0 and row["numerov_same_h_nodes"] == 0 for row in study["rows"])
    assert all(row["like_for_like"] is False for row in study["rows"])
    assert gaps[0] > gaps[1] > gaps[2] > gaps[3]
    assert all(row["refinement_ratio"] == 2.0 for row in study["observed_orders"])
    assert all(1.9 < row["observed_order"] < 2.1 for row in study["observed_orders"])



def test_dop853_ground_state_depends_on_domain_and_rejects_the_outer_match():
    rows = ode_domain_and_match_sensitivity(GaussianModel(), domains=(6.0, 8.0), matches=(0.17, 1.5))
    ground = [row for row in rows if row["status"] == "COMPUTED"]
    rejected = [row for row in rows if row["match_over_a"] == 1.5]
    assert len(ground) == 2
    assert all(row["nodes"] == 0 for row in ground)
    assert abs(ground[0]["energy_eV"] - ground[1]["energy_eV"]) < 1e-6
    assert all(row["residual"] is not None and abs(row["residual"]) < 1e-7 for row in ground)
    assert rejected
    assert all(row["status"] == "FAILED" and row["energy_eV"] is None for row in rejected)
