"""Frozen Gaussian-model constants.

K is computed from the constants named here. The three historical K
reports are stored as historical statements. None of them is selected
as a replacement for this calculation.
"""

from __future__ import annotations

import hashlib
import json
import math
from dataclasses import asdict, dataclass

H_J_S = 6.62607015e-34
HBAR_FROM_EXACT_H = H_J_S / (2.0 * math.pi)
HBAR_J_S = 1.054571817e-34
U_KG_CODATA_2018 = 1.66053906660e-27
U_KG_CODATA_2022 = 1.66053906892e-27
EV_J = 1.602176634e-19

HISTORICAL_K_EV = (
    0.004180159277260055,
    0.004180159279778997,
    0.0041801592804967215,
)


@dataclass(frozen=True)
class ModelManifest:
    model_version: str
    h_J_s: float
    hbar_J_s: float
    hbar_source: str
    u_kg: float
    u_source: str
    ev_J: float
    ev_source: str
    mu_u: float
    V0_eV: float
    a_pm: float
    ell: int
    origin_boundary: str
    outer_boundary: str
    K_eV: float
    g: float
    historical_K_eV: tuple[float, ...]
    historical_K_status: str
    manifest_sha256: str


def kinetic_scale_eV(mu_u: float, a_pm: float, u_kg: float, hbar_J_s: float = HBAR_J_S) -> float:
    """K = hbar^2 / (2 mu a^2), in eV."""
    if mu_u <= 0 or a_pm <= 0 or u_kg <= 0:
        raise ValueError("mass, length, and the atomic mass unit must be positive")
    mu = mu_u * u_kg
    a_m = a_pm * 1e-12
    joules = hbar_J_s**2 / (2.0 * mu * a_m**2)
    return joules / EV_J


def build_manifest(
    *,
    mu_u: float = 0.5,
    V0_eV: float = 5.0,
    a_pm: float = 100.0,
    ell: int = 0,
    u_kg: float = U_KG_CODATA_2018,
) -> ModelManifest:
    if ell < 0:
        raise ValueError("ell must be non-negative")
    k_eV = kinetic_scale_eV(mu_u, a_pm, u_kg, HBAR_J_S)
    payload = {
        "model_version": "gaussian-v1",
        "h_J_s": H_J_S,
        "hbar_J_s": HBAR_J_S,
        "hbar_source": "engine constant 1.054571817e-34 J s; sibling h/(2*pi) is recorded and not substituted",
        "u_kg": u_kg,
        "u_source": "CODATA 2018 atomic mass constant" if u_kg == U_KG_CODATA_2018 else "caller-supplied",
        "ev_J": EV_J,
        "ev_source": "exact SI electronvolt",
        "mu_u": mu_u,
        "V0_eV": V0_eV,
        "a_pm": a_pm,
        "ell": ell,
        "origin_boundary": "u(0)=0 for ell=0",
        "outer_boundary": "decaying real exponential for E<0 on a finite domain",
        "K_eV": k_eV,
        "g": V0_eV / k_eV,
        "historical_K_eV": list(HISTORICAL_K_EV),
        "historical_K_status": "HISTORICAL_NOT_SELECTED",
    }
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    digest = hashlib.sha256(encoded).hexdigest()
    return ModelManifest(
        model_version=payload["model_version"],
        h_J_s=H_J_S,
        hbar_J_s=HBAR_J_S,
        hbar_source=payload["hbar_source"],
        u_kg=u_kg,
        u_source=payload["u_source"],
        ev_J=EV_J,
        ev_source=payload["ev_source"],
        mu_u=mu_u,
        V0_eV=V0_eV,
        a_pm=a_pm,
        ell=ell,
        origin_boundary=payload["origin_boundary"],
        outer_boundary=payload["outer_boundary"],
        K_eV=k_eV,
        g=payload["g"],
        historical_K_eV=HISTORICAL_K_EV,
        historical_K_status="HISTORICAL_NOT_SELECTED",
        manifest_sha256=digest,
    )


def manifest_document(manifest: ModelManifest | None = None) -> dict:
    manifest = manifest or build_manifest()
    document = asdict(manifest)
    document["historical_K_eV"] = list(manifest.historical_K_eV)
    document["codata_2022_u_kg"] = U_KG_CODATA_2022
    document["codata_2022_K_eV"] = kinetic_scale_eV(manifest.mu_u, manifest.a_pm, U_KG_CODATA_2022)
    document["hbar_from_exact_h_J_s"] = HBAR_FROM_EXACT_H
    document["note"] = (
        "Active K uses the engine hbar 1.054571817e-34 J s and CODATA 2018 u. "
        "h/(2*pi) and CODATA 2022 u are recorded and are not substituted. "
        "The three historical K values are not used as inputs."
    )
    return document
