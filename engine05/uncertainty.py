"""Separate uncertainty components. Correlated deterministic errors are not combined."""

from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class UncertaintyComponent:
    name: str
    value: float | None
    unit: str
    method: str
    evidence: str
    assumptions: str
    correlation: str
    classification: str
    resolved: bool


def component_from_spread(name: str, values: list[float], *, method: str, classification: str) -> UncertaintyComponent:
    finite = [value for value in values if value is not None]
    if len(finite) < 2:
        return UncertaintyComponent(
            name, None, "eV", method, "fewer than two computed values", "sweep", "deterministic", classification, False
        )
    spread = max(finite) - min(finite)
    return UncertaintyComponent(
        name,
        spread,
        "eV",
        method,
        f"max-min of {len(finite)} values",
        "same solver family; not an independent bound",
        "deterministic-correlated",
        classification,
        True,
    )


def budget(components: list[UncertaintyComponent]) -> dict:
    unresolved = [item.name for item in components if not item.resolved]
    correlated = [item.name for item in components if "correlated" in item.correlation]
    return {
        "components": [asdict(item) for item in components],
        "aggregated_value": None,
        "aggregation": "NOT_PERFORMED",
        "reason": "Correlated deterministic errors are not combined by root-sum-square.",
        "unresolved": unresolved,
        "correlated": correlated,
        "classification_note": "A numerical spread is not a mathematical bound and not an experimental uncertainty.",
    }
