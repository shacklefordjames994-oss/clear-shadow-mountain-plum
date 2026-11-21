import numpy as np

from engine05.gaussian_matrix import assemble, ground_state
from engine05.numerov_solver import GaussianModel, solve_bound_state


def test_matrix_is_symmetric_and_the_ground_state_is_bound():
    model = GaussianModel()
    diagonal, off, _x = assemble(model, 0.02, 6.0)
    size = diagonal.size
    matrix = np.zeros((size, size))
    index = np.arange(size)
    matrix[index, index] = diagonal
    matrix[index[:-1], index[1:]] = off
    matrix[index[1:], index[:-1]] = off
    assert np.max(np.abs(matrix - matrix.T)) == 0.0
    solved = ground_state(model, h_over_a=0.01, rmax_over_a=6.0)
    assert -model.V0_eV < solved.energy_eV < 0.0
    assert solved.nodes == 0
    assert solved.norm == 1.0 or abs(solved.norm - 1.0) < 1e-8
    assert solved.residual_inf < 1e-6
    numerov = solve_bound_state(model, 0.01, 6.0, 0.17)
    assert abs(solved.energy_eV - numerov.energy_eV) < 5e-3


def test_finer_matrix_moves_toward_the_numerov_value():
    model = GaussianModel()
    coarse = ground_state(model, h_over_a=0.02, rmax_over_a=6.0)
    fine = ground_state(model, h_over_a=0.01, rmax_over_a=6.0)
    numerov = solve_bound_state(model, 0.0025, 6.0, 0.17)
    assert abs(fine.energy_eV - numerov.energy_eV) < abs(coarse.energy_eV - numerov.energy_eV)
