import pytest

from engine05.release_certification import certify


def test_incomplete_gates_and_a_missing_reviewer_are_not_certified():
    report = certify({"tests": "PASS"}, reviewer_recorded=False)
    assert report["scientific_release_status"] == "NOT_CERTIFIED"
    assert "independent_review" in report["missing"]


def test_a_failed_gate_cannot_be_waived():
    report = certify({"tests": "FAIL", "independent_review": "PASS"}, reviewer_recorded=True)
    assert report["scientific_release_status"] == "NOT_CERTIFIED"
    assert "tests" in report["failed"]


def test_this_process_does_not_self_certify():
    gates = {name: "PASS" for name in (
        "clean_checkout",
        "environment",
        "tests",
        "ground_state_reproduction",
        "solver_agreement",
        "wavefunction",
        "uncertainty",
        "physical_review",
        "reproducibility",
        "independent_review",
    )}
    report = certify(gates, reviewer_recorded=True, signature_verified_outside_this_process=False)
    assert report["scientific_release_status"] == "NOT_CERTIFIED"
    assert report["self_certification"] is False


def test_unknown_gate_is_rejected():
    with pytest.raises(ValueError):
        certify({"not_a_gate": "PASS"}, reviewer_recorded=False)
