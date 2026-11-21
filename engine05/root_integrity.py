"""Shared residual and root contract.

An invalid propagation is a failed sample. It is never replaced by a
fabricated residual such as +1e6 or -1e6.
"""

from __future__ import annotations

import math
from collections.abc import Callable
from dataclasses import dataclass

from scipy.optimize import brentq


class RootIntegrityError(RuntimeError):
    """Raised when a caller asks for a residual that was not computed."""


@dataclass(frozen=True)
class ResidualEvaluation:
    energy: float
    residual: float | None
    valid: bool
    reason: str


@dataclass(frozen=True)
class RootAcceptance:
    energy: float | None
    residual: float | None
    bracket: tuple[float, float] | None
    iterations: int
    converged: bool
    termination_reason: str


Producer = Callable[[float], tuple[float, bool] | float]


def evaluate_sample(energy: float, producer: Producer) -> ResidualEvaluation:
    """Evaluate one residual. A failed sample stays invalid."""
    if not math.isfinite(energy):
        return ResidualEvaluation(energy, None, False, "NONFINITE_ENERGY")
    try:
        produced = producer(energy)
    except Exception as exc:
        return ResidualEvaluation(energy, None, False, f"PROPAGATION_FAILED:{type(exc).__name__}")
    if isinstance(produced, tuple):
        if len(produced) != 2:
            return ResidualEvaluation(energy, None, False, "MALFORMED_PRODUCER")
        residual, ok = produced
        if not ok:
            return ResidualEvaluation(energy, None, False, "PROPAGATION_INVALID")
    else:
        residual = produced
    if residual is None or not math.isfinite(float(residual)):
        return ResidualEvaluation(energy, None, False, "NONFINITE_RESIDUAL")
    value = float(residual)
    if value == 0.0:
        return ResidualEvaluation(energy, 0.0, True, "EXACT_ZERO")
    return ResidualEvaluation(energy, value, True, "OK")


def contiguous_sign_bracket(
    samples: list[float] | tuple[float, ...],
    producer: Producer,
) -> tuple[tuple[float, float] | None, str]:
    """Opposite signs on adjacent valid samples. Invalid samples break the chain."""
    previous: ResidualEvaluation | None = None
    saw_invalid = False
    for energy in samples:
        evaluation = evaluate_sample(float(energy), producer)
        if not evaluation.valid or evaluation.residual is None:
            saw_invalid = True
            previous = None
            continue
        if evaluation.residual == 0.0:
            return (evaluation.energy, evaluation.energy), "EXACT_ZERO"
        if previous is not None and previous.residual is not None and previous.residual * evaluation.residual < 0.0:
            return (previous.energy, evaluation.energy), "SIGN_CHANGE"
        previous = evaluation
    if saw_invalid:
        return None, "NO_CONTIGUOUS_SIGN_CHANGE_AFTER_INVALID_SAMPLE"
    return None, "NO_CONTIGUOUS_SIGN_CHANGE"


def refine_root(
    lower: float,
    upper: float,
    producer: Producer,
    *,
    xtol: float,
    rtol: float,
    maxiter: int,
    residual_atol: float,
) -> RootAcceptance:
    """Refine a bracket. An invalid interior sample stops the search."""
    if not lower <= upper:
        return RootAcceptance(None, None, None, 0, False, "BRACKET_REVERSED")
    if lower == upper:
        exact = evaluate_sample(lower, producer)
        if exact.valid and exact.residual == 0.0:
            return RootAcceptance(lower, 0.0, (lower, upper), 1, True, "EXACT_ZERO")
        return RootAcceptance(None, exact.residual, (lower, upper), 1, False, "DEGENERATE_BRACKET")
    calls = {"n": 0}

    def scalar(energy: float) -> float:
        calls["n"] += 1
        evaluation = evaluate_sample(energy, producer)
        if not evaluation.valid or evaluation.residual is None:
            raise RootIntegrityError(evaluation.reason)
        return evaluation.residual

    try:
        energy = float(brentq(scalar, lower, upper, xtol=xtol, rtol=rtol, maxiter=maxiter))
    except RootIntegrityError as exc:
        return RootAcceptance(None, None, (lower, upper), calls["n"], False, f"INVALID_DURING_REFINEMENT:{exc}")
    except ValueError as exc:
        return RootAcceptance(None, None, (lower, upper), calls["n"], False, f"REFINEMENT_FAILED:{exc}")
    except RuntimeError as exc:
        return RootAcceptance(None, None, (lower, upper), calls["n"], False, f"ITERATION_EXHAUSTED:{exc}")

    final = evaluate_sample(energy, producer)
    if not final.valid or final.residual is None:
        return RootAcceptance(None, None, (lower, upper), calls["n"], False, "FINAL_REEVALUATION_INVALID")
    if abs(final.residual) > residual_atol:
        return RootAcceptance(energy, final.residual, (lower, upper), calls["n"], False, "RESIDUAL_TOLERANCE_FAILED")
    return RootAcceptance(energy, final.residual, (lower, upper), calls["n"], True, "RESIDUAL_ACCEPTED")
