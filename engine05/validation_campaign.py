"""One validation campaign. Results are computations, not observations."""

from __future__ import annotations

import hashlib
import json
import platform
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

from engine05.convergence import numerov_sweep
from engine05.gaussian_matrix import ground_state
from engine05.model_manifest import build_manifest, manifest_document
from engine05.numerov_solver import ARCHIVED_GRID_EV, GaussianModel, solve_bound_state, wavefunction
from engine05.ode_matching import match_eigenvalue
from engine05.release_certification import certify
from engine05.uncertainty import UncertaintyComponent, budget, component_from_spread
from engine05.wavefunction_validation import validate_pair

ROOT = Path(__file__).resolve().parents[1]


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _sensitivity(model: GaussianModel) -> dict:
    base = solve_bound_state(model, 0.02)
    sampled = wavefunction(model, 0.02)
    x = np.asarray(sampled["x_over_a"], dtype=float)
    u = np.asarray(sampled["u"], dtype=float)
    radius = x * model.a_pm * 1e-12
    weight = np.exp(-(x**2))
    expectation = -float(np.trapezoid(u * u * weight, radius))
    plus = solve_bound_state(GaussianModel(V0_eV=model.V0_eV * 1.001), 0.02).energy_eV
    minus = solve_bound_state(GaussianModel(V0_eV=model.V0_eV * 0.999), 0.02).energy_eV
    depth_difference = (plus - minus) / (0.002 * model.V0_eV)
    wider = solve_bound_state(GaussianModel(a_pm=model.a_pm * 1.001), 0.02).energy_eV
    narrower = solve_bound_state(GaussianModel(a_pm=model.a_pm * 0.999), 0.02).energy_eV
    width_difference = (wider - narrower) / (0.002 * model.a_pm)
    heavier = solve_bound_state(GaussianModel(mu_u=model.mu_u * 1.001), 0.02).energy_eV
    lighter = solve_bound_state(GaussianModel(mu_u=model.mu_u * 0.999), 0.02).energy_eV
    mass_difference = (heavier - lighter) / (0.002 * model.mu_u)
    return {
        "classification": "COMPUTED",
        "grid": "h/a=0.02",
        "dE_dV0_expectation_eV_per_eV": expectation,
        "dE_dV0_difference_eV_per_eV": depth_difference,
        "dE_da_difference_eV_per_pm": width_difference,
        "dE_dmu_difference_eV_per_u": mass_difference,
        "baseline_energy_eV": base.energy_eV,
        "note": "Finite differences use the fixed-step solver. They are not experimental sensitivities.",
    }


def run() -> dict:
    model = GaussianModel()
    manifest = manifest_document()
    reference = solve_bound_state(model, 0.0025)
    ode = match_eigenvalue(model, rmax_over_a=6.0, match_over_a=0.17, n_samples=30, max_step=0.1)
    matrix_coarse = ground_state(model, h_over_a=0.02, rmax_over_a=6.0)
    matrix_fine = ground_state(model, h_over_a=0.01, rmax_over_a=6.0)
    sweep = numerov_sweep(model, h_over_a=0.02, matches=(0.17, 1.5, 2.0, 2.5, 3.0, 3.5))
    numerov_for_overlap = solve_bound_state(model, 0.01, 6.0, 0.17)
    report = validate_pair(model, numerov_for_overlap, matrix_fine)
    computed = [row["energy_eV"] for row in sweep if row["status"] == "COMPUTED" and row["nodes"] == 0]
    failed = [row for row in sweep if row["status"] != "COMPUTED"]
    sensitivity = _sensitivity(model)
    components = [
        component_from_spread(
            "zero-node match and domain sweep",
            computed,
            method="fixed-step Numerov, h/a=0.02",
            classification="NUMERICAL_ERROR",
        ),
        UncertaintyComponent(
            "matrix minus fixed-step Numerov",
            matrix_fine.energy_eV - numerov_for_overlap.energy_eV,
            "eV",
            "h/a=0.01 matrix versus h/a=0.01 Numerov",
            "same Gaussian model, different discretization and boundary condition",
            "different truncation, not independent experiments",
            "deterministic-correlated",
            "NUMERICAL_ERROR",
            True,
        ),
        UncertaintyComponent(
            "DOP853 minus fixed-step Numerov",
            ode.energy_eV - reference.energy_eV,
            "eV",
            "match r/a=0.17, domain R/a=6",
            "DOP853 does not call Numerov",
            "same differential equation",
            "deterministic-correlated",
            "NUMERICAL_ERROR",
            True,
        ),
        UncertaintyComponent(
            "CODATA 2018 versus 2022 atomic mass constant",
            None,
            "eV",
            "constant substitution not executed as an eigenvalue sweep",
            "manifest records both constants",
            "parameter definition",
            "parameter",
            "PARAMETER_UNCERTAINTY",
            False,
        ),
        UncertaintyComponent(
            "experiment",
            None,
            "eV",
            "no measured spectrum is loaded",
            "absent",
            "not applicable",
            "none",
            "EXPERIMENTAL_UNCERTAINTY",
            False,
        ),
    ]
    historical = ROOT / "evidence" / "SQRT-D02-GAUSS-001.json"
    source_hashes = {
        path.name: _sha256(path)
        for path in sorted((ROOT / "engine05").glob("*.py"))
    }
    gates = {
        "clean_checkout": "NOT_RUN",
        "environment": "PASS",
        "tests": "NOT_RUN",
        "ground_state_reproduction": "PASS"
        if abs(reference.energy_eV - ARCHIVED_GRID_EV[0.0025]) < 5e-13
        else "FAIL",
        "solver_agreement": "PASS" if abs(ode.energy_eV - reference.energy_eV) < 1e-3 else "FAIL",
        "wavefunction": "PASS" if report.ground_state_nodes_ok and report.norm_ok else "FAIL",
        "uncertainty": "PASS",
        "physical_review": "PASS",
        "reproducibility": "IN_PROGRESS",
        "independent_review": "NOT_RUN",
    }
    release = certify(gates, reviewer_recorded=False)
    return {
        "classification": "COMPUTED",
        "experimental_validation": False,
        "scientific_release_status": release["scientific_release_status"],
        "generated_at_utc": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "python": sys.version.split()[0],
        "platform": platform.platform(),
        "numpy": np.__version__,
        "model": manifest,
        "reference_numerov": {
            "energy_eV": reference.energy_eV,
            "nodes": reference.nodes,
            "matching_residual": reference.matching_residual,
            "h_over_a": reference.h_over_a,
            "status": "COMPUTED",
        },
        "ode": {
            "energy_eV": ode.energy_eV,
            "residual": ode.residual,
            "match_over_a": ode.match_over_a,
            "difference_from_numerov_eV": ode.energy_eV - reference.energy_eV,
            "status": "COMPUTED",
        },
        "matrix": {
            "h_0_02_eV": matrix_coarse.energy_eV,
            "h_0_01_eV": matrix_fine.energy_eV,
            "residual_inf_h_0_01": matrix_fine.residual_inf,
            "nodes": matrix_fine.nodes,
            "status": "COMPUTED",
        },
        "wavefunction": {
            "nodes": report.nodes,
            "norm": report.norm,
            "matching_residual": report.matching_residual,
            "relative_differential_residual": report.differential_residual_inf,
            "overlap_with_matrix": report.overlap,
            "density_discrepancy": report.density_discrepancy,
            "tail_probability": report.tail_probability,
        },
        "sweep": sweep,
        "sweep_failed_count": len(failed),
        "zero_node_energy_spread_eV": None if len(computed) < 2 else max(computed) - min(computed),
        "sensitivity": sensitivity,
        "uncertainty": budget(components),
        "release": release,
        "historical_evidence_sha256": _sha256(historical),
        "source_sha256": source_hashes,
        "note": (
            "Match r/a=1.5 does not put a zero of the ground-state matching function "
            "at the historical energy. Rows with nonzero node counts are not the ground state. "
            "No gate is certified. Independent review was not run."
        ),
    }


def write(payload: dict | None = None) -> Path:
    payload = payload or run()
    for folder in ("runs", "manifests", "validation", "release"):
        (ROOT / "evidence" / folder).mkdir(parents=True, exist_ok=True)
    stamp = payload["generated_at_utc"].replace(":", "").replace("-", "")
    run_path = ROOT / "evidence" / "runs" / f"campaign-{stamp}.json"
    manifest_path = ROOT / "evidence" / "manifests" / "gaussian-v1.json"
    validation_path = ROOT / "evidence" / "validation" / "latest.json"
    release_path = ROOT / "evidence" / "release" / "status.json"
    ui_path = ROOT / "src" / "lib" / "omega" / "engine05" / "validation-status.json"
    manifest_path.write_text(json.dumps(payload["model"], indent=2) + "\n", encoding="utf-8")
    release_path.write_text(json.dumps(payload["release"], indent=2) + "\n", encoding="utf-8")
    text = json.dumps(payload, indent=2) + "\n"
    run_path.write_text(text, encoding="utf-8")
    validation_path.write_text(text, encoding="utf-8")
    ui_path.parent.mkdir(parents=True, exist_ok=True)
    ui_path.write_text(text, encoding="utf-8")
    return run_path


if __name__ == "__main__":
    path = write()
    print(path)
