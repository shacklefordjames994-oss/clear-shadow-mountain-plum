from engine05.gaussian_matrix import ground_state
from engine05.numerov_solver import GaussianModel, solve_bound_state
from engine05.wavefunction_validation import validate_numerov, validate_pair


def test_ground_state_has_no_interior_nodes_and_a_finite_residual():
    model = GaussianModel()
    solved = solve_bound_state(model, 0.01)
    report = validate_numerov(solved, model)
    assert report.ground_state_nodes_ok
    assert report.norm_ok
    assert report.matching_ok
    assert report.tail_ok
    assert report.differential_residual_inf is not None
    assert report.differential_residual_inf < 1e-2


def test_overlap_with_the_matrix_ground_state_is_recorded():
    model = GaussianModel()
    solved = solve_bound_state(model, 0.01, 6.0, 0.17)
    matrix = ground_state(model, h_over_a=0.01, rmax_over_a=6.0)
    report = validate_pair(model, solved, matrix)
    assert report.overlap is not None and report.overlap > 0.95
    assert report.density_discrepancy is not None and report.density_discrepancy < 0.2
