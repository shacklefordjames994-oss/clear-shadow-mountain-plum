def test_eigenvalue_solvers_do_not_substitute_a_sentinel_residual():
    for name in ("numerov_solver.py", "leg_mesh.py", "variable_numerov.py"):
        source = open(f"engine05/{name}", encoding="utf-8").read()
        assert "return 1e6" not in source
        assert "return -1e6" not in source
