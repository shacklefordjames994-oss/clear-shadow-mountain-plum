import { compareToObservation, configurationPreview, parseObservations, runCollision, runMaterials } from "./engine.ts";
import { runSynthesisProtocol } from "./protocol.ts";
import { monteCarloComparison } from "./monte-carlo.ts";

const preview = configurationPreview("COLLISION", 1000, 10, 7);
if (preview.status !== "NOT_EXECUTED" || preview.adaptersInstalled !== false) {
  throw new Error("preview");
}

const first = runCollision({
  seed: 7,
  beamMomentumGeV: 10,
  massAGeV: 0.938,
  massBGeV: 0.938,
  chargeA: 1,
  chargeB: -1,
  thresholdGeV: 0.2,
  bindingGeV: 0.05,
  events: 200,
});
const second = runCollision({
  seed: 7,
  beamMomentumGeV: 10,
  massAGeV: 0.938,
  massBGeV: 0.938,
  chargeA: 1,
  chargeB: -1,
  thresholdGeV: 0.2,
  bindingGeV: 0.05,
  events: 200,
});
if (first.synthesisFraction !== second.synthesisFraction) throw new Error("seed");
if (Math.abs(first.meanEnergyResidualGeV) > 1e-9) throw new Error("energy");
if (Math.abs(first.meanMomentumResidualGeV) > 1e-9) throw new Error("momentum");
if (first.events.some((event) => event.evidence !== "SIMULATED")) throw new Error("class");

const materials = runMaterials({ seed: 3, temperatureK: 500, precursorMolar: 0.4, timeMin: 30, barrierEV: 0.2, samples: 80 });
if (materials.domain !== "MATERIALS" || materials.evidence !== "SIMULATED") throw new Error("materials");
if (!(materials.meanDiameterNm > 0) || materials.massBalanceResidual !== 0) throw new Error("growth");
const crossed = compareToObservation(
  { domain: "COLLISION", quantity: "synthesisFraction", units: "1", value: first.synthesisFraction },
  {
    evidence: "OBSERVED",
    domain: "MATERIALS",
    quantity: "meanDiameterNm",
    value: 4,
    units: "nm",
    provenance: { source: "fixture", timestamp: "2026-01-01T00:00:00Z", uncertainty: 0.2, note: "fixture" },
  },
);
if (crossed.status !== "NONCOMPARABLE") throw new Error("domain wall");

const parsed = parseObservations(
  "evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance\nSIMULATED,COLLISION,synthesisFraction,0.2,0.1,1,nope,2026-01-01T00:00:00Z,not-observed\nOBSERVED,COLLISION,synthesisFraction,0.4,0.05,1,fixture,2026-01-01T00:00:00Z,fixture",
);
if (parsed.rows.length !== 1 || parsed.errors.length !== 1) throw new Error("csv");

const manifest = runSynthesisProtocol();
if (manifest.protocol !== "SYNTHESIS_VALIDATION_PROTOCOL_V1_1") throw new Error("version");
if (manifest.uncertainty.sampling.count !== 32 || manifest.uncertainty.sampling.confidenceInterval !== null) throw new Error("sampling");
if (manifest.manifest.datasetHash !== null || manifest.manifest.preregisteredKsDMax !== 0.2) throw new Error("reference-rule");
if (manifest.gates.referenceDataAgreement !== false || manifest.gates.experimentalValidation !== false) throw new Error("upper-gates");
if (!manifest.gates.internalConsistency || !manifest.gates.numericalValidation) {
  throw new Error(manifest.cases.filter((item) => item.status === "FAIL").map((item) => item.id).join(","));
}
const energyGate = manifest.cases.find((item) => item.id === "energy-identity");
const massGate = manifest.cases.find((item) => item.id === "mass-identity");
if (energyGate?.highestGate !== "INTERNAL_CONSISTENCY_PASS" || massGate?.highestGate !== "INTERNAL_CONSISTENCY_PASS") {
  throw new Error("identity-gate");
}

const quadrature = monteCarloComparison(11, 800);
if (!(quadrature.analytic > 0.24 && quadrature.analytic < 0.26)) throw new Error("analytic");
if (quadrature.estimates.some((item) => !Number.isFinite(item.estimate) || item.error > 0.05)) {
  throw new Error(quadrature.estimates.map((item) => `${item.method}:${item.error}`).join(","));
}
if (!quadrature.notInstalled.includes("VEGAS")) throw new Error("vegas");

console.log(
  JSON.stringify({
    synthesisFraction: first.synthesisFraction,
    energyResidual: first.meanEnergyResidualGeV,
    meanDiameterNm: materials.meanDiameterNm,
    observedRows: parsed.rows.length,
    analytic: quadrature.analytic,
    quadrature: quadrature.estimates.map((item) => ({ method: item.method, error: item.error })),
  }),
);
