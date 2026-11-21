from engine05.convergence import numerov_sweep


def test_failed_and_computed_runs_are_both_retained():
    rows = numerov_sweep(h_over_a=0.05, matches=(1.5, 3.5), domains=(4.0, 6.0))
    assert len(rows) == 4
    assert all("status" in row and "reason" in row for row in rows)
    computed = [row for row in rows if row["status"] == "COMPUTED"]
    assert computed
    assert all(isinstance(row["nodes"], int) for row in computed)
    assert any(row["nodes"] == 0 for row in numerov_sweep(h_over_a=0.05, matches=(0.17,), domains=(6.0,)))
