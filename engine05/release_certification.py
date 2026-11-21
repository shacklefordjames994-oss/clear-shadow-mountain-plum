"""Release gates. This module cannot certify its own independent review."""

from __future__ import annotations

GATES = (
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
)

ALLOWED = {"NOT_STARTED", "IN_PROGRESS", "PASS", "FAIL", "NOT_RUN", "BLOCKED"}


def certify(
    gate_status: dict[str, str],
    *,
    reviewer_recorded: bool,
    signature_verified_outside_this_process: bool = False,
) -> dict:
    unknown = [name for name in gate_status if name not in GATES]
    if unknown:
        raise ValueError(f"Unknown gate: {unknown[0]}")
    status = {name: gate_status.get(name, "NOT_RUN") for name in GATES}
    for name, value in status.items():
        if value not in ALLOWED:
            raise ValueError(f"Illegal status {value} on {name}")
    if not reviewer_recorded:
        status["independent_review"] = "NOT_RUN"
    missing = [name for name, value in status.items() if value in {"NOT_RUN", "NOT_STARTED", "IN_PROGRESS", "BLOCKED"}]
    failed = [name for name, value in status.items() if value == "FAIL"]
    if (
        signature_verified_outside_this_process
        and reviewer_recorded
        and not failed
        and not missing
        and all(value == "PASS" for value in status.values())
    ):
        release = "CERTIFIED"
    else:
        release = "NOT_CERTIFIED"
    return {
        "gates": status,
        "failed": failed,
        "missing": missing,
        "reviewer_recorded": reviewer_recorded,
        "scientific_release_status": release,
        "self_certification": False,
    }
