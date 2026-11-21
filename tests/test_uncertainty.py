from engine05.uncertainty import UncertaintyComponent, budget, component_from_spread


def test_missing_component_stays_unresolved():
    missing = component_from_spread("grid", [], method="sweep", classification="NUMERICAL_ERROR")
    assert missing.resolved is False
    report = budget([missing])
    assert report["aggregated_value"] is None
    assert "grid" in report["unresolved"]


def test_correlated_terms_are_not_combined():
    left = UncertaintyComponent("a", 1e-6, "eV", "sweep", "two runs", "same solver", "deterministic-correlated", "NUMERICAL_ERROR", True)
    right = UncertaintyComponent("b", 2e-6, "eV", "sweep", "two runs", "same solver", "deterministic-correlated", "NUMERICAL_ERROR", True)
    report = budget([left, right])
    assert report["aggregation"] == "NOT_PERFORMED"
    assert report["aggregated_value"] is None
    assert set(report["correlated"]) == {"a", "b"}
