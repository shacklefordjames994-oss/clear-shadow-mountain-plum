from engine05.convergence import classify_sweep, numerov_sweep


def test_failed_and_computed_runs_are_both_retained():
    rows = numerov_sweep(h_over_a=0.05, matches=(1.5, 3.5), domains=(4.0, 6.0))
    assert len(rows) == 4
    assert all("status" in row and "reason" in row for row in rows)
    computed = [row for row in rows if row["status"] == "COMPUTED"]
    assert computed
    assert all(isinstance(row["nodes"], int) for row in computed)


def test_excited_roots_are_not_counted_as_ground_states():
    rows = numerov_sweep(h_over_a=0.05, matches=(0.17, 1.5, 3.5), domains=(6.0,))
    split = classify_sweep(rows)
    assert split["ground_state_count"] == 1
    assert split["ground_state_rows"][0]["match_over_a"] == 0.17
    assert split["ground_state_rows"][0]["nodes"] == 0
    assert split["excited_count"] >= 1
    assert all(row["nodes"] != 0 for row in split["excited_or_other_root_rows"])
    assert "not convergence evidence" in split["note"]
