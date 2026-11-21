# Architecture inventory

Authoritative tree inspected: `shacklefordjames994-oss/SQRT-01-Engine-05` at `3ad6aaf` on `main`, plus the local workspace that contained that tree.

| Module | Role | Not this |
| --- | --- | --- |
| `numerov_solver.py` | Fixed-step Numerov eigenvalue | Variable-step recurrence |
| `leg_mesh.py` | Two frozen uniform legs | Variable-step recurrence |
| `variable_numerov.py` | 2005 equation (8), prefactor `h_n^2/12` | 2021 tridiagonal BVP |
| `ode_reference.py` | DOP853 initial-value check | Eigenvalue solver |
| `ode_matching.py` | DOP853 two-sided eigenvalue match | A call to Numerov |
| `tridiagonal.py` | Thomas algebra | Gaussian Hamiltonian |
| `nonuniform_numerov.py` | 2021 manufactured boundary-value test | Gaussian eigenvalue |
| `gaussian_matrix.py` | Symmetric second-order Hamiltonian | Numerov or the 2021 BVP |
| `root_integrity.py` | Shared residual contract | Sentinel residuals |
| `adaptive_refinement.py` | Global Richardson around the fixed-step solver | A new recurrence |

New work is on `reconstruction/phase3-4-and-validation`. `main` is not updated by this change.
