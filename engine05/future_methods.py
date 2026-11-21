"""Deferred Engine 05 methods.

These names exist so past, present, and future work stay in one tree.
Calling one does not produce a number. None of them is implemented.
"""

from __future__ import annotations


class FutureMethodError(NotImplementedError):
    """Raised when a deferred method is called."""


def coordinate_mapping(*_args, **_kwargs):
    """Meshkov, Stolyarov and Le Roy, Phys. Rev. A 78, 052510 (2008). Not implemented."""
    raise FutureMethodError(
        "Coordinate mapping is not implemented. DOI 10.1103/PhysRevA.78.052510 is a citation, not a result."
    )


def wkb_hybrid(*_args, **_kwargs):
    """No verified WKB/Numerov hybrid recurrence is coded here."""
    raise FutureMethodError("WKB hybrid is not implemented.")


def woods_saxon_table(*_args, **_kwargs):
    """The 2005 Woods-Saxon eigenvalue table has not been reproduced."""
    raise FutureMethodError("Woods-Saxon table reproduction is not implemented.")


FUTURE_METHODS = {
    "coordinate_mapping": "NOT_IMPLEMENTED",
    "wkb_hybrid": "NOT_IMPLEMENTED",
    "woods_saxon_table": "NOT_REPRODUCED",
}
