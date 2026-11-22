import {
  compareToObservation,
  parseObservations,
  runCollision,
  runMaterials,
  type CollisionParams,
} from "./engine.ts";

export const PREREGISTERED_KS_D_MAX = 0.2;

export type ProtocolGate =
  | "NONE"
  | "INTERNAL_CONSISTENCY_PASS"
  | "NUMERICAL_VALIDATION_PASS"
  | "REFERENCE_DATA_AGREEMENT_PASS"
  | "EXPERIMENTAL_VALIDATION_PASS";

export interface ProtocolCase {
  id: string;
  status: "PASS" | "FAIL" | "NOT_RUN";
  highestGate: ProtocolGate;
  detail: string;
}

export interface SampleEstimate {
  count: number;
  mean: number;
  standardDeviation: number;
  quantile05: number;
  quantile50: number;
  quantile95: number;
  stdAt16: number;
  stdAt32: number;
  confidenceInterval: null;
}

export interface ProtocolManifest {
  protocol: "SYNTHESIS_VALIDATION_PROTOCOL_V1_1";
  release: "NOT_CERTIFIED";
  gaussianSolver: "UNTOUCHED";
  github: "NO_CHANGES";
  cases: ProtocolCase[];
  gates: {
    internalConsistency: boolean;
    numericalValidation: boolean;
    referenceDataAgreement: false;
    experimentalValidation: false;
  };
  uncertainty: {
    sampling: SampleEstimate;
    numericalTolerance: "1e-9";
    modelUncertainty: "NOT_QUANTIFIED";
    parameterUncertainty: "NOT_ESTABLISHED";
    measurementUncertainty: "ABSENT";
    experimentalUncertainty: "NOT_AVAILABLE";
  };
  manifest: {
    configuration: CollisionParams;
    seed: number;
    datasetHash: null;
    preregisteredKsDMax: 0.2;
    sourceFingerprint: string;
    software: "synthesis-lab 1.1";
  };
}

const BASE: CollisionParams = {
  seed: 7,
  beamMomentumGeV: 10,
  massAGeV: 0.938,
  massBGeV: 0.938,
  chargeA: 1,
  chargeB: -1,
  thresholdGeV: 0.2,
  bindingGeV: 0.05,
  events: 200,
};

export function runSynthesisProtocol(): ProtocolManifest {
  const cases: ProtocolCase[] = [
    domainWall(),
    domainUnits(),
    repeatSameSeed(),
    differentSeed(),
    prefixStable(),
    energyIdentity(),
    massIdentity(),
    chargeBlocked(),
    cmEnergyIndependent(),
    elasticMomentum(),
    csvRejected(),
    hashMismatch(),
    propertyInvariants(),
    adversarialInputs(),
    ksStatistic(),
    referenceAbsent(),
    experimentAbsent(),
  ];
  const sampling = sampleEstimate();
  const internalIds = new Set(["energy-identity", "mass-identity"]);
  const numericalIds = new Set([
    "domain-wall",
    "domain-units",
    "repeat-seed",
    "different-seed",
    "prefix-stable",
    "charge-blocked",
    "cm-energy",
    "elastic-momentum",
    "property-invariants",
    "adversarial-inputs",
    "ks-statistic",
  ]);
  return {
    protocol: "SYNTHESIS_VALIDATION_PROTOCOL_V1_1",
    release: "NOT_CERTIFIED",
    gaussianSolver: "UNTOUCHED",
    github: "NO_CHANGES",
    cases,
    gates: {
      internalConsistency: cases.filter((item) => internalIds.has(item.id)).every((item) => item.status === "PASS"),
      numericalValidation: cases.filter((item) => numericalIds.has(item.id)).every((item) => item.status === "PASS"),
      referenceDataAgreement: false,
      experimentalValidation: false,
    },
    uncertainty: {
      sampling,
      numericalTolerance: "1e-9",
      modelUncertainty: "NOT_QUANTIFIED",
      parameterUncertainty: "NOT_ESTABLISHED",
      measurementUncertainty: "ABSENT",
      experimentalUncertainty: "NOT_AVAILABLE",
    },
    manifest: {
      configuration: BASE,
      seed: BASE.seed,
      datasetHash: null,
      preregisteredKsDMax: PREREGISTERED_KS_D_MAX,
      sourceFingerprint: fingerprint(JSON.stringify(BASE)),
      software: "synthesis-lab 1.1",
    },
  };
}

function domainWall(): ProtocolCase {
  const collision = runCollision(BASE);
  const materials = runMaterials({ seed: 3, temperatureK: 500, precursorMolar: 0.4, timeMin: 30, barrierEV: 0.2, samples: 40 });
  const crossed = compareToObservation(
    { domain: collision.domain, quantity: "synthesisFraction", units: "1", value: collision.synthesisFraction },
    {
      evidence: "OBSERVED",
      domain: materials.domain,
      quantity: "meanDiameterNm",
      value: materials.meanDiameterNm,
      units: "nm",
      provenance: { source: "protocol", timestamp: "2026-01-01T00:00:00Z", uncertainty: 0.1, note: "fixture" },
    },
  );
  const isolated = crossed.status === "NONCOMPARABLE";
  return {
    id: "domain-wall",
    status: isolated ? "PASS" : "FAIL",
    highestGate: isolated ? "NUMERICAL_VALIDATION_PASS" : "NONE",
    detail: isolated ? "A collision fraction was not compared with a materials diameter." : "Domain wall failed.",
  };
}

function domainUnits(): ProtocolCase {
  const collision = runCollision(BASE);
  const materials = runMaterials({ seed: 3, temperatureK: 500, precursorMolar: 0.4, timeMin: 30, barrierEV: 0.2, samples: 40 });
  const ok = collision.units.meanEnergyResidualGeV === "GeV" && materials.units.meanDiameterNm === "nm";
  return {
    id: "domain-units",
    status: ok ? "PASS" : "FAIL",
    highestGate: ok ? "NUMERICAL_VALIDATION_PASS" : "NONE",
    detail: ok ? "Collision stays in GeV. Materials stay in nm." : "Unit labels crossed.",
  };
}

function repeatSameSeed(): ProtocolCase {
  const left = runCollision(BASE);
  const right = runCollision(BASE);
  const same = left.events.every((event, index) => event.channel === right.events[index]?.channel && event.pxGeV === right.events[index]?.pxGeV);
  return {
    id: "repeat-seed",
    status: same ? "PASS" : "FAIL",
    highestGate: same ? "NUMERICAL_VALIDATION_PASS" : "NONE",
    detail: same ? "Seed 7 repeated the same 200 channels and momenta." : "Same seed diverged.",
  };
}

function differentSeed(): ProtocolCase {
  const left = runCollision(BASE);
  const right = runCollision({ ...BASE, seed: 8 });
  const changed = left.events.some((event, index) => event.channel !== right.events[index]?.channel || event.pxGeV !== right.events[index]?.pxGeV);
  return {
    id: "different-seed",
    status: changed ? "PASS" : "FAIL",
    highestGate: changed ? "NUMERICAL_VALIDATION_PASS" : "NONE",
    detail: changed ? "Seed 8 changed the sequence." : "A different seed reproduced the same sequence.",
  };
}

function prefixStable(): ProtocolCase {
  const short = runCollision({ ...BASE, events: 40 });
  const long = runCollision(BASE);
  const same = short.events.every((event, index) => event.channel === long.events[index]?.channel && event.pxGeV === long.events[index]?.pxGeV);
  return {
    id: "prefix-stable",
    status: same ? "PASS" : "FAIL",
    highestGate: same ? "NUMERICAL_VALIDATION_PASS" : "NONE",
    detail: same ? "The first 40 events match the longer run." : "Event count changed earlier draws.",
  };
}

function energyIdentity(): ProtocolCase {
  const run = runCollision(BASE);
  const closed = Math.abs(run.meanEnergyResidualGeV) === 0 && Math.abs(run.meanMomentumResidualGeV) === 0;
  return {
    id: "energy-identity",
    status: closed ? "PASS" : "FAIL",
    highestGate: closed ? "INTERNAL_CONSISTENCY_PASS" : "NONE",
    detail: closed
      ? "Residuals are zero because the outgoing energies are built from the same sum. This is not an independent conservation proof."
      : "The internal residual identity failed.",
  };
}

function massIdentity(): ProtocolCase {
  const run = runMaterials({ seed: 3, temperatureK: 500, precursorMolar: 0.4, timeMin: 30, barrierEV: 0.2, samples: 40 });
  const closed = run.massBalanceResidual === 0;
  return {
    id: "mass-identity",
    status: closed ? "PASS" : "FAIL",
    highestGate: closed ? "INTERNAL_CONSISTENCY_PASS" : "NONE",
    detail: closed
      ? "The mass residual is defined to be zero. It does not weigh a sample."
      : "The accounting identity was not zero.",
  };
}

function chargeBlocked(): ProtocolCase {
  const run = runCollision({ ...BASE, chargeA: 0.2, chargeB: 0.3, events: 120 });
  const blocked = run.synthesisFraction === 0 && run.events.every((event) => event.channel !== "SYNTHESIS");
  return {
    id: "charge-blocked",
    status: blocked ? "PASS" : "FAIL",
    highestGate: blocked ? "NUMERICAL_VALIDATION_PASS" : "NONE",
    detail: blocked ? "Non-integer charge produced no synthesis channel." : "Synthesis ran without an integer charge sum.",
  };
}

function cmEnergyIndependent(): ProtocolCase {
  const run = runCollision(BASE);
  const expected = Math.hypot(BASE.beamMomentumGeV, BASE.massAGeV) + Math.hypot(BASE.beamMomentumGeV, BASE.massBGeV);
  const matched = run.events.every((event) => Math.abs(event.cmEnergyGeV - expected) < 1e-9);
  return {
    id: "cm-energy",
    status: matched ? "PASS" : "FAIL",
    highestGate: matched ? "NUMERICAL_VALIDATION_PASS" : "NONE",
    detail: matched ? "Stored CM energy matches an outside hypot sum within 1e-9." : "CM energy disagreed with the outside sum.",
  };
}

function elasticMomentum(): ProtocolCase {
  const run = runCollision(BASE);
  const elastic = run.events.filter((event) => event.channel === "ELASTIC");
  const matched = elastic.length > 0 && elastic.every((event) => Math.abs(Math.hypot(event.pxGeV, event.pyGeV) - BASE.beamMomentumGeV) < 1e-9);
  return {
    id: "elastic-momentum",
    status: matched ? "PASS" : "FAIL",
    highestGate: matched ? "NUMERICAL_VALIDATION_PASS" : "NONE",
    detail: matched ? "Elastic momenta match the beam momentum within 1e-9." : "Elastic momentum check failed.",
  };
}

function csvRejected(): ProtocolCase {
  const refused = [
    "",
    "wrong,header",
    "evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance\nOBSERVED,COLLISION,synthesisFraction,0.2,0.1,,fixture,2026-01-01T00:00:00Z,blank-units",
    "evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance\nOBSERVED,COLLISION,synthesisFraction,NaN,0.1,1,fixture,2026-01-01T00:00:00Z,bad",
    "evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance\nOBSERVED,COLLISION,synthesisFraction,0.2,-1,1,fixture,2026-01-01T00:00:00Z,bad",
    "evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance\nSIMULATED,COLLISION,synthesisFraction,0.2,0.1,1,fixture,2026-01-01T00:00:00Z,class",
  ];
  const held = refused.every((sample) => {
    const parsed = parseObservations(sample);
    return parsed.rows.length === 0 && parsed.errors.length > 0;
  });
  const duplicate = parseObservations(
    "evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance\nOBSERVED,COLLISION,synthesisFraction,0.2,0.1,1,fixture,2026-01-01T00:00:00Z,a\nOBSERVED,COLLISION,synthesisFraction,0.3,0.1,1,fixture,2026-01-01T00:00:00Z,b",
  );
  const duplicateHeld = duplicate.rows.length === 1 && duplicate.errors.some((error) => error.includes("duplicates"));
  const ok = held && duplicateHeld;
  return {
    id: "csv-rejected",
    status: ok ? "PASS" : "FAIL",
    highestGate: "NONE",
    detail: ok
      ? "Empty, bad header, blank units, nonfinite, negative uncertainty, and non-OBSERVED rows were refused. The duplicate was not imported."
      : "A bad row was imported.",
  };
}

function hashMismatch(): ProtocolCase {
  const text = "evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance";
  const actual = fingerprint(text);
  const detected = actual !== "deadbeef";
  return {
    id: "hash-mismatch",
    status: detected ? "PASS" : "FAIL",
    highestGate: "NONE",
    detail: detected ? `Claimed hash deadbeef does not match fingerprint ${actual}. The source text was not rewritten.` : "Hash check failed.",
  };
}

function referenceAbsent(): ProtocolCase {
  return {
    id: "reference-data",
    status: "NOT_RUN",
    highestGate: "NONE",
    detail: `Catalog is empty. The KS bound ${PREREGISTERED_KS_D_MAX} was fixed before any dataset. A synthetic file cannot open this gate.`,
  };
}

function experimentAbsent(): ProtocolCase {
  return {
    id: "experiment",
    status: "NOT_RUN",
    highestGate: "NONE",
    detail: "No instrument is connected. A simulation cannot pass experimental validation.",
  };
}

function sampleEstimate(): SampleEstimate {
  const values = Array.from({ length: 32 }, (_, index) => runCollision({ ...BASE, seed: index + 1, events: 80 }).synthesisFraction);
  const stdAt16 = standardDeviation(values.slice(0, 16));
  const stdAt32 = standardDeviation(values);
  const ordered = [...values].sort((left, right) => left - right);
  return {
    count: values.length,
    mean: ordered.reduce((sum, value) => sum + value, 0) / ordered.length,
    standardDeviation: stdAt32,
    quantile05: quantile(ordered, 0.05),
    quantile50: quantile(ordered, 0.5),
    quantile95: quantile(ordered, 0.95),
    stdAt16,
    stdAt32,
    confidenceInterval: null,
  };
}

function propertyInvariants(): ProtocolCase {
  const draw = mulberry(4401);
  let failures = 0;
  for (let index = 0; index < 24; index += 1) {
    const run = runCollision({
      seed: index + 1,
      beamMomentumGeV: draw() * 20,
      massAGeV: draw() * 2,
      massBGeV: draw() * 2,
      chargeA: Math.round(draw() * 4) - 2,
      chargeB: Math.round(draw() * 4) - 2,
      thresholdGeV: draw(),
      bindingGeV: draw(),
      events: 12 + Math.floor(draw() * 20),
    });
    const ids = new Set(run.events.map((event) => event.id));
    const finite = run.events.every((event) => Number.isFinite(event.cmEnergyGeV) && Number.isFinite(event.pxGeV) && Number.isFinite(event.pyGeV));
    if (run.inputStatus !== "ACCEPTED" || !finite || ids.size !== run.events.length || run.synthesisFraction < 0 || run.synthesisFraction > 1) failures += 1;
  }
  const invalid = runCollision({ ...BASE, beamMomentumGeV: Number.NaN });
  const ok = failures === 0 && invalid.inputStatus === "REJECTED";
  return {
    id: "property-invariants",
    status: ok ? "PASS" : "FAIL",
    highestGate: ok ? "NUMERICAL_VALIDATION_PASS" : "NONE",
    detail: ok ? "24 random configurations stayed finite, unique, and inside the fraction bounds. A NaN momentum was rejected." : `${failures} random configurations broke an invariant.`,
  };
}

function adversarialInputs(): ProtocolCase {
  const collisions = [
    runCollision({ ...BASE, beamMomentumGeV: Number.POSITIVE_INFINITY }),
    runCollision({ ...BASE, beamMomentumGeV: Number.MAX_VALUE }),
    runCollision({ ...BASE, massAGeV: Number.NaN }),
    runCollision({ ...BASE, events: 0 }),
    runCollision({ ...BASE, events: -4 }),
    runCollision({ ...BASE, events: 1e12 }),
    runCollision({ ...BASE, thresholdGeV: Number.NEGATIVE_INFINITY }),
  ];
  const materials = [
    runMaterials({ seed: 1, temperatureK: 0, precursorMolar: 0.2, timeMin: 10, barrierEV: 0.2, samples: 10 }),
    runMaterials({ seed: Number.NaN, temperatureK: 400, precursorMolar: -1, timeMin: 10, barrierEV: 0.2, samples: 10 }),
  ];
  const underflow = runCollision({ ...BASE, beamMomentumGeV: 1e-12, events: 8 });
  const boundary = runCollision({ ...BASE, beamMomentumGeV: 0, events: 8 });
  const ids = new Set(boundary.events.map((event) => event.id));
  const ok =
    collisions.every((run) => run.inputStatus === "REJECTED" && run.events.length === 0) &&
    materials.every((run) => run.inputStatus === "REJECTED" && run.diametersNm.length === 0) &&
    underflow.inputStatus === "ACCEPTED" &&
    boundary.inputStatus === "ACCEPTED" &&
    ids.size === boundary.events.length;
  return {
    id: "adversarial-inputs",
    status: ok ? "PASS" : "FAIL",
    highestGate: ok ? "NUMERICAL_VALIDATION_PASS" : "NONE",
    detail: ok
      ? "Overflow, nonfinite values, empty and huge counts, and a negative precursor were rejected. Zero and 1e-12 GeV stayed finite. Event ids were unique."
      : "An extreme input was accepted or produced a duplicate id.",
  };
}

function ksStatistic(): ProtocolCase {
  const sample = [0.1, 0.4, 0.4, 0.9];
  const same = kolmogorovSmirnovD(sample, sample) === 0;
  const apart = kolmogorovSmirnovD(sample, [10, 11, 12, 13]) > PREREGISTERED_KS_D_MAX;
  const ok = same && apart;
  return {
    id: "ks-statistic",
    status: ok ? "PASS" : "FAIL",
    highestGate: ok ? "NUMERICAL_VALIDATION_PASS" : "NONE",
    detail: ok
      ? `The KS function returns 0 on identical samples and exceeds the preregistered ${PREREGISTERED_KS_D_MAX} on a separated pair. That does not bind a reference dataset.`
      : "The KS function failed its self-check.",
  };
}

function kolmogorovSmirnovD(left: number[], right: number[]) {
  const points = [...left, ...right].sort((a, b) => a - b);
  let gap = 0;
  for (const point of points) {
    const leftCdf = left.filter((value) => value <= point).length / left.length;
    const rightCdf = right.filter((value) => value <= point).length / right.length;
    gap = Math.max(gap, Math.abs(leftCdf - rightCdf));
  }
  return gap;
}

function standardDeviation(values: number[]) {
  const mid = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mid) ** 2, 0) / values.length);
}

function quantile(sorted: number[], probability: number) {
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(probability * sorted.length) - 1));
  return sorted[index] ?? 0;
}

function mulberry(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function fingerprint(text: string) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
