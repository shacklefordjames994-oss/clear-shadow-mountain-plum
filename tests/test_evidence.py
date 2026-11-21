import hashlib
import json
from pathlib import Path

import pytest

from engine05.model_manifest import build_manifest, kinetic_scale_eV


HISTORICAL = Path("evidence/SQRT-D02-GAUSS-001.json")


def test_historical_record_is_present_and_classified():
    payload = json.loads(HISTORICAL.read_text(encoding="utf-8"))
    assert payload["experimental_validation"] is False
    digest = hashlib.sha256(HISTORICAL.read_bytes()).hexdigest()
    assert len(digest) == 64


def test_manifest_hash_is_stable_and_does_not_select_a_historical_k():
    first = build_manifest()
    second = build_manifest()
    assert first.manifest_sha256 == second.manifest_sha256
    assert first.historical_K_status == "HISTORICAL_NOT_SELECTED"
    assert first.K_eV == pytest.approx(first.V0_eV / first.g)
    from engine05.model_manifest import kinetic_scale_eV

    assert first.K_eV == kinetic_scale_eV(first.mu_u, first.a_pm, first.u_kg)
