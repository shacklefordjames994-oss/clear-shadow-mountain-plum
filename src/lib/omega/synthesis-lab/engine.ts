export type EvidenceClass = "OBSERVED" | "COMPUTED" | "DERIVED" | "SIMULATED" | "INFERRED";
export type DomainId = "COLLISION" | "MATERIALS";

export interface Provenance {
  source: string;
  timestamp: string;
  uncertainty: number;
  note: string;
}

export interface Observation {
  evidence: "OBSERVED";
  domain: DomainId;
  quantity: string;
  value: number;
  units: string;
  provenance: Provenance;
}

export interface CollisionParams {
  seed: number;
  beamMomentumGeV: number;
  massAGeV: number;
  massBGeV: number;
  chargeA: number;
  chargeB: number;
  thresholdGeV: number;
  bindingGeV: number;
  events: number;
}

export interface CollisionEvent {
  id: number;
  evidence: "SIMULATED";
  channel: "ELASTIC" | "SYNTHESIS" | "FORBIDDEN";
  cmEnergyGeV: number;
  energyResidualGeV: number;
  momentumResidualGeV: number;
  productMassGeV: number | null;
  pxGeV: number;
  pyGeV: number;
}

export interface CollisionRun {
  domain: "COLLISION";
  evidence: "SIMULATED";
  events: CollisionEvent[];
  synthesisFraction: number;
  meanEnergyResidualGeV: number;
  meanMomentumResidualGeV: number;
  units: { synthesisFraction: "1"; meanEnergyResidualGeV: "GeV" };
  inputStatus: "ACCEPTED" | "REJECTED";
  rejection: string | null;
}

export interface MaterialsParams {
  seed: number;
  temperatureK: number;
  precursorMolar: number;
  timeMin: number;
  barrierEV: number;
  samples: number;
}

export interface MaterialsRun {
  domain: "MATERIALS";
  evidence: "SIMULATED";
  diametersNm: number[];
  meanDiameterNm: number;
  stdDiameterNm: number;
  nucleatedFraction: number;
  massBalanceResidual: number;
  units: { meanDiameterNm: "nm"; nucleatedFraction: "1" };
  inputStatus: "ACCEPTED" | "REJECTED";
  rejection: string | null;
}

export type Comparison =
  | { status: "DERIVED"; residual: number; pull: number | null }
  | { status: "NONCOMPARABLE"; reason: string };

export function configurationPreview(domain: DomainId, population: number, energy: number, seed: number) {
  return {
    schema: "SIMULATION_PLATFORM_V1" as const,
    status: "NOT_EXECUTED" as const,
    domain,
    population: clampInt(population, 1, 1000),
    energy,
    seed: seed >>> 0,
    gaussianSolver: "UNTOUCHED" as const,
    externalAdapters: ["Pythia", "Geant4", "ROOT", "LAMMPS"] as const,
    adaptersInstalled: false,
  };
}

export const TOY_LIMITS = {
  momentumGeV: [0, 1e4],
  massGeV: [0, 1e3],
  bindingGeV: [0, 10],
  thresholdGeV: [0, 10],
  charge: [-5, 5],
  events: [1, 1000],
  temperatureK: [1, 5000],
  barrierEV: [0, 5],
  precursorMolar: [0, 10],
  timeMin: [0, 1e4],
  samples: [1, 1000],
} as const;

export function runCollision(params: CollisionParams): CollisionRun {
  const problem = collisionInputProblem(params);
  if (problem) return emptyCollision(problem);
  const rand = mulberry32(params.seed);
  const count = params.events;
  const momentum = Math.max(0, params.beamMomentumGeV);
  const massA = Math.max(0, params.massAGeV);
  const massB = Math.max(0, params.massBGeV);
  const energyA = Math.hypot(momentum, massA);
  const energyB = Math.hypot(momentum, massB);
  const cmEnergy = energyA + energyB;
  const available = cmEnergy - massA - massB;
  const charge = params.chargeA + params.chargeB;
  const chargeAllowed = Math.abs(charge - Math.round(charge)) < 1e-6;
  const events: CollisionEvent[] = [];

  for (let id = 0; id < count; id += 1) {
    const angle = rand() * Math.PI * 2;
    const canSynthesize = available > params.thresholdGeV && chargeAllowed;
    if (canSynthesize && rand() < 0.4) {
      const binding = Math.min(Math.max(0, params.bindingGeV), available * 0.5);
      const productMass = Math.max(1e-6, massA + massB - binding);
      const spark = (cmEnergy * cmEnergy - productMass * productMass) / (2 * cmEnergy);
      const productEnergy = cmEnergy - spark;
      const px = spark * Math.cos(angle);
      const py = spark * Math.sin(angle);
      events.push({
        id,
        evidence: "SIMULATED",
        channel: "SYNTHESIS",
        cmEnergyGeV: cmEnergy,
        energyResidualGeV: cmEnergy - (productEnergy + spark),
        momentumResidualGeV: Math.hypot(px + -px, py + -py),
        productMassGeV: productMass,
        pxGeV: px,
        pyGeV: py,
      });
      continue;
    }
    events.push({
      id,
      evidence: "SIMULATED",
      channel: available <= 0 ? "FORBIDDEN" : "ELASTIC",
      cmEnergyGeV: cmEnergy,
      energyResidualGeV: 0,
      momentumResidualGeV: 0,
      productMassGeV: null,
      pxGeV: momentum * Math.cos(angle),
      pyGeV: momentum * Math.sin(angle),
    });
  }

  const synthesized = events.filter((event) => event.channel === "SYNTHESIS").length;
  return {
    domain: "COLLISION",
    evidence: "SIMULATED",
    events,
    synthesisFraction: synthesized / events.length,
    meanEnergyResidualGeV: mean(events.map((event) => event.energyResidualGeV)),
    meanMomentumResidualGeV: mean(events.map((event) => event.momentumResidualGeV)),
    units: { synthesisFraction: "1", meanEnergyResidualGeV: "GeV" },
    inputStatus: "ACCEPTED",
    rejection: null,
  };
}

export function runMaterials(params: MaterialsParams): MaterialsRun {
  const problem = materialsInputProblem(params);
  if (problem) return emptyMaterials(problem);
  const rand = mulberry32(params.seed + 101);
  const count = params.samples;
  const thermal = 0.15 + Math.max(0, params.temperatureK) / 2000;
  const nucleation = Math.min(0.9, Math.exp(-Math.max(0, params.barrierEV) / thermal) * Math.max(0, params.precursorMolar) * 2);
  const diameters: number[] = [];
  let nucleated = 0;
  for (let index = 0; index < count; index += 1) {
    if (rand() > Math.min(0.95, nucleation)) {
      diameters.push(0);
      continue;
    }
    nucleated += 1;
    diameters.push(Math.sqrt(Math.max(0, params.timeMin)) * (0.6 + rand()) * (1 + nucleation));
  }
  const formed = diameters.filter((value) => value > 0);
  const meanDiameter = formed.length ? mean(formed) : 0;
  const variance = formed.length ? mean(formed.map((value) => (value - meanDiameter) ** 2)) : 0;
  return {
    domain: "MATERIALS",
    evidence: "SIMULATED",
    diametersNm: diameters,
    meanDiameterNm: meanDiameter,
    stdDiameterNm: Math.sqrt(variance),
    nucleatedFraction: nucleated / count,
    massBalanceResidual: 0,
    units: { meanDiameterNm: "nm", nucleatedFraction: "1" },
    inputStatus: "ACCEPTED",
    rejection: null,
  };
}

export function compareToObservation(
  sim: { domain: DomainId; quantity: string; units: string; value: number },
  observation: Observation,
): Comparison {
  if (observation.domain !== sim.domain) {
    return { status: "NONCOMPARABLE", reason: "Collision and materials results do not share a domain." };
  }
  if (observation.quantity !== sim.quantity || observation.units !== sim.units) {
    return { status: "NONCOMPARABLE", reason: "Quantity or units differ. GeV is not compared with nm or K." };
  }
  const residual = sim.value - observation.value;
  const uncertainty = observation.provenance.uncertainty;
  return {
    status: "DERIVED",
    residual,
    pull: uncertainty > 0 ? residual / uncertainty : null,
  };
}

export function parseObservations(text: string): { rows: Observation[]; errors: string[] } {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  const errors: string[] = [];
  const rows: Observation[] = [];
  if (!lines.length) return { rows, errors: ["The file is empty."] };
  const header = lines[0].split(",").map((cell) => cell.trim());
  const expected = ["evidence", "domain", "quantity", "value", "uncertainty", "units", "source", "timestamp", "provenance"];
  if (expected.some((name, index) => header[index] !== name)) {
    return { rows, errors: [`Header must be ${expected.join(",")}.`] };
  }
  for (let index = 1; index < lines.length; index += 1) {
    const cells = lines[index].split(",").map((cell) => cell.trim());
    if (cells.length < 9) {
      errors.push(`Row ${index + 1} is short.`);
      continue;
    }
    if (cells[0] !== "OBSERVED") {
      errors.push(`Row ${index + 1} is ${cells[0] || "blank"}, not OBSERVED, so it was not imported.`);
      continue;
    }
    if (cells[1] !== "COLLISION" && cells[1] !== "MATERIALS") {
      errors.push(`Row ${index + 1} has an unknown domain.`);
      continue;
    }
    if (cells[5] === "") {
      errors.push(`Row ${index + 1} has no units.`);
      continue;
    }
    const value = Number(cells[3]);
    const uncertainty = Number(cells[4]);
    if (!Number.isFinite(value) || !Number.isFinite(uncertainty) || uncertainty < 0) {
      errors.push(`Row ${index + 1} has a bad value or uncertainty.`);
      continue;
    }
    const key = `${cells[1]}|${cells[2]}|${cells[6]}|${cells[7]}`;
    if (rows.some((row) => `${row.domain}|${row.quantity}|${row.provenance.source}|${row.provenance.timestamp}` === key)) {
      errors.push(`Row ${index + 1} duplicates an imported record.`);
      continue;
    }
    rows.push({
      evidence: "OBSERVED",
      domain: cells[1],
      quantity: cells[2],
      value,
      units: cells[5],
      provenance: { source: cells[6], timestamp: cells[7], uncertainty, note: cells[8] },
    });
  }
  return { rows, errors };
}

export function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clampInt(value: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Math.round(value)));
}

function inRange(value: number, bounds: readonly [number, number]) {
  return Number.isFinite(value) && value >= bounds[0] && value <= bounds[1];
}

function collisionInputProblem(params: CollisionParams) {
  if (!Number.isFinite(params.seed)) return "SEED";
  if (!Number.isInteger(params.events) || !inRange(params.events, TOY_LIMITS.events)) return "EVENT_COUNT";
  if (!inRange(params.beamMomentumGeV, TOY_LIMITS.momentumGeV)) return "MOMENTUM";
  if (!inRange(params.massAGeV, TOY_LIMITS.massGeV) || !inRange(params.massBGeV, TOY_LIMITS.massGeV)) return "MASS";
  if (!inRange(params.bindingGeV, TOY_LIMITS.bindingGeV)) return "BINDING";
  if (!inRange(params.thresholdGeV, TOY_LIMITS.thresholdGeV)) return "THRESHOLD";
  if (!inRange(params.chargeA, TOY_LIMITS.charge) || !inRange(params.chargeB, TOY_LIMITS.charge)) return "CHARGE";
  return null;
}

function materialsInputProblem(params: MaterialsParams) {
  if (!Number.isFinite(params.seed)) return "SEED";
  if (!Number.isInteger(params.samples) || !inRange(params.samples, TOY_LIMITS.samples)) return "SAMPLE_COUNT";
  if (!inRange(params.temperatureK, TOY_LIMITS.temperatureK)) return "TEMPERATURE";
  if (!inRange(params.barrierEV, TOY_LIMITS.barrierEV)) return "BARRIER";
  if (!inRange(params.precursorMolar, TOY_LIMITS.precursorMolar)) return "PRECURSOR";
  if (!inRange(params.timeMin, TOY_LIMITS.timeMin)) return "TIME";
  return null;
}

function emptyCollision(rejection: string): CollisionRun {
  return {
    domain: "COLLISION",
    evidence: "SIMULATED",
    events: [],
    synthesisFraction: 0,
    meanEnergyResidualGeV: 0,
    meanMomentumResidualGeV: 0,
    units: { synthesisFraction: "1", meanEnergyResidualGeV: "GeV" },
    inputStatus: "REJECTED",
    rejection,
  };
}

function emptyMaterials(rejection: string): MaterialsRun {
  return {
    domain: "MATERIALS",
    evidence: "SIMULATED",
    diametersNm: [],
    meanDiameterNm: 0,
    stdDiameterNm: 0,
    nucleatedFraction: 0,
    massBalanceResidual: 0,
    units: { meanDiameterNm: "nm", nucleatedFraction: "1" },
    inputStatus: "REJECTED",
    rejection,
  };
}
