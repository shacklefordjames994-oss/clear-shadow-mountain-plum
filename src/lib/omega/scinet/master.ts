/*
 * SCI-NETv2 / OMEGA THEORY FABRIC — master research architecture.
 * Browser-native inference. Development placeholders, not experimental data.
 *
 * OBSERVED != DERIVED != INFERRED != HYPOTHETICAL != SIMULATED
 * observation !-> phenomenology; simulation !-> evidence; candidate !-> discovery
 * statistical significance !-> causal truth. Synthetic events are controls only.
 * Approximate Z is visualization. Production discovery needs calibrated nulls.
 * OMEGA-GUARD: observe, correlate, explain, simulate, recommend, record.
 * No autonomous physical effects. Human authority = L0. Fail closed.
 */

import { hashObject, omegaHash } from "../hash";
import {
  analyzeResearchRun,
  createResearchRun,
  discoveryEligibility,
  prepareRun,
  type ResearchRun,
} from "./core/ResearchRun";
import { assembleLabGraph, type EvidenceGraph } from "./evidence/EvidenceGraph";
import { ledgerFromGraph, type EvidenceLedger } from "./evidence/EvidenceLedger";
import { robustnessSweep, type RobustnessReport } from "./robustness/LeaveOneOut";
import {
  approximateZ,
  calculateJointLikelihood,
  likelihoodRatio,
  poissonLogLikelihood,
  type DetectorLikelihood,
  type JointBin,
  type JointLikelihoodResult,
} from "./statistics/JointLikelihood";

export const SCINET_VERSION = "2.0";
export const SCINET_PIPELINE = [
  "PHYSICS",
  "DETECTOR",
  "RESPONSE",
  "BACKGROUND",
  "STATISTICS",
  "REPLICATION",
  "EVIDENCE",
  "GATE",
] as const;
export type SciNetStage = (typeof SCINET_PIPELINE)[number];

/* ------------------------------------------------------------------ */
/* 1. Epistemic states                                                 */
/* ------------------------------------------------------------------ */

export type EvidenceState =
  | "SCI:OBSERVED"
  | "SCI:RECONSTRUCTED"
  | "SCI:DERIVED"
  | "SCI:CALIBRATED"
  | "SCI:CANDIDATE"
  | "SCI:ANOMALY"
  | "SCI:MODEL_SUPPORTED"
  | "SCI:MODEL_CHECK_FAILED"
  | "SCI:INDEPENDENT_REPLICATION"
  | "SCI:HIGH_SIGNIFICANCE"
  | "SCI:DISC"
  | "SCI:REJECTED"
  | "SCI:BACKGROUND_PREFERRED"
  | "SCI:SIMULATED"
  | "SCI:CONTROL"
  | "SCI:HYPOTHETICAL";

export type DataState = "OBSERVED" | "SIMULATED" | "CONTROL" | "PENDING";

export interface Provenance {
  datasetId: string;
  contractHash: string;
  source: string;
  version: string;
  timestamp: string;
  seed?: number;
  blinded: boolean;
  unblinded: boolean;
}

/* ------------------------------------------------------------------ */
/* 2. Hypothesis registry                                              */
/* ------------------------------------------------------------------ */

export type HypothesisId =
  | "H0_BACKGROUND"
  | "H1_SI_ELASTIC_NR"
  | "H2_INELASTIC_NR"
  | "H3_MOMENTUM_DEPENDENT_NR"
  | "H4_VELOCITY_DEPENDENT_NR"
  | "H5_NEUTRINO_NR";

export interface HypothesisDefinition {
  id: HypothesisId;
  name: string;
  channel: "NR" | "ER" | "BACKGROUND";
  operator: string;
  massRangeGeV: [number, number];
  priorWeight: number;
  expectedFeatures: string[];
  requiredTests: string[];
  description: string;
}

export const HYPOTHESES: HypothesisDefinition[] = [
  {
    id: "H0_BACKGROUND",
    name: "Background",
    channel: "BACKGROUND",
    operator: "background-mixture",
    massRangeGeV: [0, 0],
    priorWeight: 0.35,
    expectedFeatures: ["background-compatible"],
    requiredTests: ["background validation"],
    description: "Null / background-only hypothesis.",
  },
  {
    id: "H1_SI_ELASTIC_NR",
    name: "Spin-independent elastic NR",
    channel: "NR",
    operator: "SI-elastic",
    massRangeGeV: [1, 1e4],
    priorWeight: 0.25,
    expectedFeatures: ["NR spectrum", "target dependence"],
    requiredTests: ["NR calibration", "cross-target consistency"],
    description: "Canonical SI WIMP development hypothesis.",
  },
  {
    id: "H2_INELASTIC_NR",
    name: "Inelastic NR",
    channel: "NR",
    operator: "inelastic",
    massRangeGeV: [1, 1e4],
    priorWeight: 0.15,
    expectedFeatures: ["high-energy structure", "NR spectrum"],
    requiredTests: ["kinematic test", "cross-target consistency"],
    description: "Inelastic recoil with mediator-scale suppression.",
  },
  {
    id: "H3_MOMENTUM_DEPENDENT_NR",
    name: "Momentum-dependent NR",
    channel: "NR",
    operator: "q-dependent",
    massRangeGeV: [1, 1e4],
    priorWeight: 0.1,
    expectedFeatures: ["energy-shape dependence"],
    requiredTests: ["spectral-shape test"],
    description: "Operator with q^n recoil weighting.",
  },
  {
    id: "H4_VELOCITY_DEPENDENT_NR",
    name: "Velocity-dependent NR",
    channel: "NR",
    operator: "v-dependent",
    massRangeGeV: [1, 1e4],
    priorWeight: 0.08,
    expectedFeatures: ["rate dependence", "possible modulation"],
    requiredTests: ["time-domain test"],
    description: "Velocity-weighted halo response.",
  },
  {
    id: "H5_NEUTRINO_NR",
    name: "Neutrino NR",
    channel: "NR",
    operator: "neutrino-nucleus",
    massRangeGeV: [0, 0],
    priorWeight: 0.07,
    expectedFeatures: ["NR", "target dependence"],
    requiredTests: ["neutrino background model"],
    description: "Coherent neutrino-nucleus comparison.",
  },
];

export function priorDistribution(): Record<HypothesisId, number> {
  const total = HYPOTHESES.reduce((s, h) => s + h.priorWeight, 0);
  return Object.fromEntries(HYPOTHESES.map((h) => [h.id, h.priorWeight / total])) as Record<
    HypothesisId,
    number
  >;
}

export function interactionFor(
  id: HypothesisId,
  massGeV: number,
  sigmaCm2: number,
): InteractionParameters {
  const base: InteractionParameters = {
    hypothesisId: id,
    massGeV: Math.max(1e-6, massGeV),
    referenceCrossSectionCm2: id === "H0_BACKGROUND" ? 0 : sigmaCm2,
    mediatorScaleGeV: 0,
    velocityPower: 0,
    momentumPower: 0,
  };
  if (id === "H2_INELASTIC_NR") return { ...base, mediatorScaleGeV: 80 };
  if (id === "H3_MOMENTUM_DEPENDENT_NR") return { ...base, momentumPower: 1 };
  if (id === "H4_VELOCITY_DEPENDENT_NR") return { ...base, velocityPower: 1 };
  if (id === "H5_NEUTRINO_NR") {
    return { ...base, massGeV: 0.05, referenceCrossSectionCm2: Math.min(sigmaCm2, 1e-45) * 0.08 };
  }
  return base;
}

/* ------------------------------------------------------------------ */
/* 3. Hash / provenance                                                */
/* ------------------------------------------------------------------ */

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function syncHash(value: unknown): string {
  return typeof value === "string" ? omegaHash(value) : hashObject(value);
}

/* ------------------------------------------------------------------ */
/* 4. Blind analysis                                                   */
/* ------------------------------------------------------------------ */

export type BlindState = "LOCKED" | "ANALYSIS_READY" | "UNBLIND_REQUESTED" | "UNBLINDED" | "INVALID";

export interface SourceEvent {
  eventId: string;
  energyKeV: number;
  x?: number;
  y?: number;
  z?: number;
  s1PE?: number;
  s2PE?: number;
  nrScore?: number;
  timestamp?: string;
}

export interface BlindEvent {
  publicId: string;
  checksum: string;
  dataState: DataState;
  energyKeV?: number;
  x?: number;
  y?: number;
  z?: number;
}

export interface BlindDataset {
  datasetId: string;
  state: BlindState;
  dataState: DataState;
  createdAt: string;
  eventCount: number;
  events: BlindEvent[];
  contractHash: string;
  unblindCommitment: string;
}

export async function createBlindDataset(
  events: SourceEvent[],
  contractHash: string,
  secret: string,
): Promise<BlindDataset> {
  const commitment = await sha256(`${secret}:${contractHash}`);
  const blinded: BlindEvent[] = [];
  for (const event of events) {
    blinded.push({
      publicId: await sha256(`${event.eventId}:${secret}`),
      checksum: await sha256(JSON.stringify(event)),
      dataState: "OBSERVED",
    });
  }
  return {
    datasetId: await sha256(`${contractHash}:${Date.now()}`),
    state: "LOCKED",
    dataState: "OBSERVED",
    createdAt: new Date().toISOString(),
    eventCount: events.length,
    events: blinded,
    contractHash,
    unblindCommitment: commitment,
  };
}

export function createLockedControlSet(events: SourceEvent[], contractHash: string, seed: number): BlindDataset {
  return {
    datasetId: syncHash(`${contractHash}:${seed}:control`),
    state: "LOCKED",
    dataState: "SIMULATED",
    createdAt: new Date().toISOString(),
    eventCount: events.length,
    events: events.map((e) => ({
      publicId: syncHash(`${e.eventId}:${seed}`),
      checksum: syncHash(e),
      dataState: "SIMULATED" as const,
    })),
    contractHash,
    unblindCommitment: syncHash(`${seed}:${contractHash}:commit`),
  };
}

export function assertAnalysisAllowed(dataset: BlindDataset): void {
  if (dataset.state === "INVALID") throw new Error("Invalid blind dataset");
  if (dataset.dataState === "PENDING") throw new Error("Pending data cannot enter inference");
}

/* ------------------------------------------------------------------ */
/* 5. Detector event model                                             */
/* ------------------------------------------------------------------ */

export type DetectorMedium = "XENON" | "ARGON" | "GERMANIUM" | "SILICON";
export type InteractionChannel = "NR" | "ER";

export interface DetectorMechanicsConfig {
  name: string;
  medium: DetectorMedium;
  density: number;
  workFunctionEV: number;
  photonYieldPerKeV: number;
  electronYieldPerKeV: number;
  extractionEfficiency: number;
  photonDetectionEfficiency: number;
  electronGain: number;
  s1ResolutionFraction: number;
  s2ResolutionFraction: number;
  driftVelocityMmPerUs: number;
  driftLengthMm: number;
  xyResolutionMm: number;
  nrDiscriminationPower: number;
}

export const DETECTOR_MECHANICS: Record<DetectorMedium, DetectorMechanicsConfig> = {
  XENON: {
    name: "Xenon development TPC",
    medium: "XENON",
    density: 2.9,
    workFunctionEV: 13.7,
    photonYieldPerKeV: 30,
    electronYieldPerKeV: 40,
    extractionEfficiency: 0.9,
    photonDetectionEfficiency: 0.1,
    electronGain: 20,
    s1ResolutionFraction: 0.25,
    s2ResolutionFraction: 0.15,
    driftVelocityMmPerUs: 1.5,
    driftLengthMm: 1000,
    xyResolutionMm: 5,
    nrDiscriminationPower: 0.7,
  },
  ARGON: {
    name: "Argon development TPC",
    medium: "ARGON",
    density: 1.4,
    workFunctionEV: 19.5,
    photonYieldPerKeV: 40,
    electronYieldPerKeV: 50,
    extractionEfficiency: 0.9,
    photonDetectionEfficiency: 0.1,
    electronGain: 20,
    s1ResolutionFraction: 0.25,
    s2ResolutionFraction: 0.15,
    driftVelocityMmPerUs: 2,
    driftLengthMm: 1000,
    xyResolutionMm: 5,
    nrDiscriminationPower: 0.7,
  },
  GERMANIUM: {
    name: "Germanium development target",
    medium: "GERMANIUM",
    density: 5.3,
    workFunctionEV: 3,
    photonYieldPerKeV: 0,
    electronYieldPerKeV: 333,
    extractionEfficiency: 1,
    photonDetectionEfficiency: 0,
    electronGain: 1,
    s1ResolutionFraction: 0.1,
    s2ResolutionFraction: 0.1,
    driftVelocityMmPerUs: 1,
    driftLengthMm: 30,
    xyResolutionMm: 1,
    nrDiscriminationPower: 0.5,
  },
  SILICON: {
    name: "Silicon development target",
    medium: "SILICON",
    density: 2.3,
    workFunctionEV: 3.6,
    photonYieldPerKeV: 0,
    electronYieldPerKeV: 278,
    extractionEfficiency: 1,
    photonDetectionEfficiency: 0,
    electronGain: 1,
    s1ResolutionFraction: 0.1,
    s2ResolutionFraction: 0.1,
    driftVelocityMmPerUs: 1,
    driftLengthMm: 10,
    xyResolutionMm: 1,
    nrDiscriminationPower: 0.5,
  },
};

export const TARGETS: Record<DetectorMedium, TargetParameters> = {
  XENON: { targetId: "Xe", atomicMassGeV: 122.3, atomicNumber: 54, exposureTonYears: 1 },
  ARGON: { targetId: "Ar", atomicMassGeV: 37.2, atomicNumber: 18, exposureTonYears: 1 },
  GERMANIUM: { targetId: "Ge", atomicMassGeV: 67.6, atomicNumber: 32, exposureTonYears: 1 },
  SILICON: { targetId: "Si", atomicMassGeV: 26, atomicNumber: 14, exposureTonYears: 1 },
};

export interface DetectorInput {
  eventId: string;
  recoilEnergyKeV: number;
  channel: InteractionChannel;
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface DetectorEvent extends DetectorInput {
  photonsProduced: number;
  detectedPhotons: number;
  electronsProduced: number;
  extractedElectrons: number;
  s1PE: number;
  s2PE: number;
  driftTimeUs: number;
  reconstructedEnergyKeV: number;
  reconstructedX: number;
  reconstructedY: number;
  reconstructedZ: number;
  nrScore: number;
  qualityScore: number;
}

export interface LabGeometry {
  radiusM: number;
  heightM: number;
  s1ThresholdPE: number;
  s2ThresholdPE: number;
}

export type EventClass = "NR_LIKE" | "ER_LIKE" | "VETOED";

export interface PipelineEvent extends DetectorEvent {
  dataState: DataState;
  evidenceState: EvidenceState;
  timeDay: number;
  classification: EventClass;
  veto: { muonPass: boolean; neutronPass: boolean; surfacePass: boolean; fiducialPass: boolean };
  model: string;
  medium: DetectorMedium;
  velocityKmS: number;
}

/* ------------------------------------------------------------------ */
/* 6. Physics forward model                                            */
/* ------------------------------------------------------------------ */

export interface HaloParameters {
  rhoDMGeVPerCm3: number;
  v0KmPerS: number;
  vEarthKmPerS: number;
  vEscapeKmPerS: number;
}

export interface TargetParameters {
  targetId: string;
  atomicMassGeV: number;
  atomicNumber: number;
  exposureTonYears: number;
}

export interface InteractionParameters {
  hypothesisId: HypothesisId;
  massGeV: number;
  referenceCrossSectionCm2: number;
  mediatorScaleGeV: number;
  velocityPower: number;
  momentumPower: number;
}

export const DEFAULT_HALO: HaloParameters = {
  rhoDMGeVPerCm3: 0.3,
  v0KmPerS: 220,
  vEarthKmPerS: 232,
  vEscapeKmPerS: 544,
};

export const DEFAULT_BINS_KEV = [1, 2, 3, 5, 8, 12, 18, 25, 35, 50, 75, 100, 150, 200];

export function reducedMass(dmMassGeV: number, targetMassGeV: number): number {
  if (dmMassGeV <= 0 || targetMassGeV <= 0) throw new Error("Masses must be positive");
  return (dmMassGeV * targetMassGeV) / (dmMassGeV + targetMassGeV);
}

export function minimumVelocityKmPerS(
  recoilEnergyKeV: number,
  dmMassGeV: number,
  targetMassGeV: number,
): number {
  if (recoilEnergyKeV <= 0) return 0;
  const mu = reducedMass(dmMassGeV, targetMassGeV);
  const energyGeV = recoilEnergyKeV / 1e6;
  const beta = Math.sqrt((targetMassGeV * energyGeV) / (2 * mu * mu));
  return beta * 299792.458;
}

export function haloSpeedWeight(v: number, halo: HaloParameters): number {
  if (v < 0 || v > halo.vEscapeKmPerS) return 0;
  const shifted = v - halo.vEarthKmPerS;
  const sigma = Math.max(1, halo.v0KmPerS);
  return v * v * Math.exp(-(shifted * shifted) / (sigma * sigma));
}

export function integrateHaloTail(vmin: number, halo: HaloParameters, steps = 128): number {
  const upper = halo.vEscapeKmPerS;
  if (vmin >= upper) return 0;
  const dx = (upper - vmin) / steps;
  let total = 0;
  for (let i = 0; i < steps; i++) {
    const v = vmin + (i + 0.5) * dx;
    total += haloSpeedWeight(v, halo) * dx;
  }
  return Math.max(0, total);
}

export function interactionScaling(E: number, v: number, p: InteractionParameters): number {
  const momentum = Math.max(1e-12, E) ** p.momentumPower;
  const velocity = Math.max(1e-12, v / 299792.458) ** p.velocityPower;
  const mediator =
    p.mediatorScaleGeV > 0 ? 1 / (1 + E / (p.mediatorScaleGeV * 1e6)) : 1;
  return momentum * velocity * mediator;
}

export function recoilSpectrum(
  halo: HaloParameters,
  target: TargetParameters,
  interaction: InteractionParameters,
  binsKeV: number[],
): number[] {
  if (interaction.referenceCrossSectionCm2 <= 0) return binsKeV.map(() => 0);
  return binsKeV.map((E) => {
    const vmin = minimumVelocityKmPerS(E, interaction.massGeV, target.atomicMassGeV);
    const tail = integrateHaloTail(vmin, halo);
    const scaling = interactionScaling(E, Math.max(vmin, halo.vEarthKmPerS), interaction);
    const nuclear = target.atomicNumber ** 2;
    return Math.max(
      0,
      halo.rhoDMGeVPerCm3 * interaction.referenceCrossSectionCm2 * nuclear * tail * scaling,
    );
  });
}

export function characteristicRecoilKeV(massGeV: number, v0KmS: number, targetMassGeV = 122.3): number {
  const mu = reducedMass(massGeV, targetMassGeV);
  const beta = v0KmS / 299792.458;
  return Math.max(0.4, (mu * mu * beta * beta * 1e6) / targetMassGeV);
}

/* ------------------------------------------------------------------ */
/* 7. Response matrix                                                  */
/* ------------------------------------------------------------------ */

export interface ResponseMatrix {
  trueBinsKeV: number[];
  reconstructedBinsKeV: number[];
  efficiency: number[];
  matrix: number[][];
}

export function validateResponseMatrix(r: ResponseMatrix): void {
  if (r.efficiency.length !== r.trueBinsKeV.length) throw new Error("Response efficiency mismatch");
  if (r.matrix.length !== r.reconstructedBinsKeV.length) throw new Error("Response row mismatch");
  for (const row of r.matrix) {
    if (row.length !== r.trueBinsKeV.length) throw new Error("Response column mismatch");
    for (const p of row) if (p < 0 || p > 1) throw new Error("Invalid response probability");
  }
}

export function gaussianResponse(binsKeV: number[], mech: DetectorMechanicsConfig, s1Thr: number): ResponseMatrix {
  const efficiency = binsKeV.map((E) => {
    const yieldPE = E * mech.photonYieldPerKeV * mech.photonDetectionEfficiency;
    return 1 / (1 + Math.exp(-(yieldPE - s1Thr) / Math.max(0.4, s1Thr * 0.25)));
  });
  const raw = binsKeV.map((reco) =>
    binsKeV.map((trueE) => {
      const sigma = Math.max(0.35, trueE * mech.s1ResolutionFraction);
      const z = (reco - trueE) / sigma;
      return Math.exp(-0.5 * z * z);
    }),
  );
  const colSum = binsKeV.map((_, j) => raw.reduce((s, row) => s + row[j], 0));
  const matrix = raw.map((row) => row.map((p, j) => (colSum[j] > 0 ? p / colSum[j] : 0)));
  return { trueBinsKeV: binsKeV, reconstructedBinsKeV: binsKeV, efficiency, matrix };
}

export function foldSpectrum(trueSpectrum: number[], response: ResponseMatrix): number[] {
  validateResponseMatrix(response);
  return response.matrix.map((row) =>
    row.reduce((total, probability, trueBin) => total + probability * response.efficiency[trueBin] * trueSpectrum[trueBin], 0),
  );
}

/* ------------------------------------------------------------------ */
/* 8. Background mixture                                               */
/* ------------------------------------------------------------------ */

export interface MixtureComponent {
  id: string;
  label: string;
  expectedByBin: number[];
  uncertaintyFraction: number;
  correlation: "SHARED" | "DETECTOR_SPECIFIC" | "UNCORRELATED";
}

export interface BackgroundMixture {
  detectorId: string;
  components: MixtureComponent[];
  totalExpected: number[];
  validated: boolean;
}

export function combineBackgroundComponents(components: MixtureComponent[], binCount: number): number[] {
  const total = new Array(binCount).fill(0);
  for (const component of components) {
    for (let i = 0; i < binCount; i++) total[i] += Math.max(0, component.expectedByBin[i] ?? 0);
  }
  return total;
}

export function createBackgroundMixture(detectorId: string, components: MixtureComponent[]): BackgroundMixture {
  const bins = components.reduce((m, c) => Math.max(m, c.expectedByBin.length), 0);
  return {
    detectorId,
    components,
    totalExpected: combineBackgroundComponents(components, bins),
    validated: false,
  };
}

export function removeBackgroundComponent(mixture: BackgroundMixture, excludedId: string): number[] {
  return combineBackgroundComponents(
    mixture.components.filter((c) => c.id !== excludedId),
    mixture.totalExpected.length,
  );
}

export function exponentialSpectrum(bins: number[], rate: number, slope: number): number[] {
  const weights = bins.map((E) => Math.exp(-Math.max(0, E) * Math.max(1e-6, slope)));
  const sum = weights.reduce((s, w) => s + w, 0) || 1;
  return weights.map((w) => (rate * w) / sum);
}

/* ------------------------------------------------------------------ */
/* 9. Likelihood                                                       */
/* ------------------------------------------------------------------ */

export interface LikelihoodBin {
  energyMinKeV: number;
  energyMaxKeV: number;
  observed: number;
  signalExpected: number;
  backgroundExpected: number;
  efficiency: number;
}

export { poissonLogLikelihood };

export interface LikelihoodResult {
  hypothesisId: HypothesisId;
  logLikelihood: number;
  expectedTotal: number;
  observedTotal: number;
}

export function calculateLikelihood(
  hypothesisId: HypothesisId,
  bins: LikelihoodBin[],
  signalStrength = 1,
  backgroundScale = 1,
  nuisancePenalty = 0,
): LikelihoodResult {
  let logLikelihood = -Math.max(0, nuisancePenalty);
  let expectedTotal = 0;
  let observedTotal = 0;
  for (const bin of bins) {
    const expected = Math.max(
      1e-12,
      bin.signalExpected * signalStrength * bin.efficiency + bin.backgroundExpected * backgroundScale,
    );
    logLikelihood += poissonLogLikelihood(bin.observed, expected);
    expectedTotal += expected;
    observedTotal += bin.observed;
  }
  return { hypothesisId, logLikelihood, expectedTotal, observedTotal };
}

export function discoveryMetric(signal: number, background: number): number {
  if (signal <= 0) return 0;
  if (background <= 0) return Math.sqrt(signal);
  return Math.sqrt(2 * ((signal + background) * Math.log(1 + signal / background) - signal));
}

/* ------------------------------------------------------------------ */
/* 10. Bayesian model comparison                                       */
/* ------------------------------------------------------------------ */

export interface PosteriorSet {
  prior: Record<HypothesisId, number>;
  logLikelihood: Record<HypothesisId, number>;
  posterior: Record<HypothesisId, number>;
  logBayesH1H0: number;
  preferred: HypothesisId;
  entropy: number;
}

export function bayesianCompare(results: LikelihoodResult[], prior = priorDistribution()): PosteriorSet {
  const logLikelihood = Object.fromEntries(HYPOTHESES.map((h) => [h.id, -1e9])) as Record<HypothesisId, number>;
  for (const r of results) logLikelihood[r.hypothesisId] = r.logLikelihood;
  const maxLL = Math.max(...Object.values(logLikelihood));
  const unnorm: Record<HypothesisId, number> = { ...prior };
  let sum = 0;
  for (const h of HYPOTHESES) {
    unnorm[h.id] = prior[h.id] * Math.exp(logLikelihood[h.id] - maxLL);
    sum += unnorm[h.id];
  }
  const posterior = Object.fromEntries(HYPOTHESES.map((h) => [h.id, unnorm[h.id] / (sum || 1)])) as Record<
    HypothesisId,
    number
  >;
  let preferred: HypothesisId = "H0_BACKGROUND";
  let best = -1;
  for (const h of HYPOTHESES) {
    if (posterior[h.id] > best) {
      best = posterior[h.id];
      preferred = h.id;
    }
  }
  const entropy = -HYPOTHESES.reduce((s, h) => {
    const p = posterior[h.id];
    return s + (p > 0 ? p * Math.log(p) : 0);
  }, 0);
  return {
    prior,
    logLikelihood,
    posterior,
    logBayesH1H0: logLikelihood.H1_SI_ELASTIC_NR - logLikelihood.H0_BACKGROUND,
    preferred,
    entropy,
  };
}

/* ------------------------------------------------------------------ */
/* 11. Modulation                                                      */
/* ------------------------------------------------------------------ */

export interface ModulationBin {
  day: number;
  observed: number;
  expectedConstant: number;
  expectedModulated: number;
  residual: number;
}

export interface ModulationResult {
  amplitudeFraction: number;
  phaseDay: number;
  chiSquareConstant: number;
  chiSquareModulated: number;
  deltaChiSquare: number;
  preferred: "CONSTANT" | "MODULATED" | "INCONCLUSIVE";
  bins: ModulationBin[];
}

export function modulationRate(day: number, amplitude = 0.07, phase = 152.5): number {
  return 1 + amplitude * Math.cos((2 * Math.PI * (day - phase)) / 365.25);
}

export function calculateModulation(
  timeDays: number[],
  amplitude = 0.07,
  phase = 152.5,
  binCount = 12,
): ModulationResult {
  const bins: ModulationBin[] = [];
  for (let i = 0; i < binCount; i++) {
    const start = (i * 365.25) / binCount;
    const end = ((i + 1) * 365.25) / binCount;
    const observed = timeDays.filter((d) => d >= start && d < end).length;
    const expectedConstant = timeDays.length / binCount;
    const center = (start + end) / 2;
    const expectedModulated = expectedConstant * modulationRate(center, amplitude, phase);
    bins.push({ day: center, observed, expectedConstant, expectedModulated, residual: observed - expectedModulated });
  }
  let chiConstant = 0;
  let chiModulated = 0;
  for (const bin of bins) {
    const v = Math.max(1, bin.observed);
    chiConstant += (bin.observed - bin.expectedConstant) ** 2 / v;
    chiModulated += (bin.observed - bin.expectedModulated) ** 2 / v;
  }
  const delta = chiConstant - chiModulated;
  return {
    amplitudeFraction: amplitude,
    phaseDay: phase,
    chiSquareConstant: chiConstant,
    chiSquareModulated: chiModulated,
    deltaChiSquare: delta,
    preferred: Math.abs(delta) < 2 ? "INCONCLUSIVE" : delta > 0 ? "MODULATED" : "CONSTANT",
    bins,
  };
}

/* ------------------------------------------------------------------ */
/* 12. Information gain / experiment design                            */
/* ------------------------------------------------------------------ */

export interface InformationGain {
  fisherZ: number;
  bitsVsH0: number;
  recommend: "EXPOSURE" | "SECOND_TARGET" | "THRESHOLD" | "HOLD";
  note: string;
}

export function informationGain(signal: number, background: number, entropy: number): InformationGain {
  const fisherZ = discoveryMetric(signal, background);
  const bitsVsH0 = Math.max(0, Math.log2(Math.E) * 0.5 * Math.log(1 + (signal * signal) / Math.max(1, background)));
  let recommend: InformationGain["recommend"] = "HOLD";
  if (background > signal * 8) recommend = "THRESHOLD";
  else if (fisherZ < 2) recommend = "EXPOSURE";
  else if (entropy > 1.2) recommend = "SECOND_TARGET";
  const note =
    recommend === "EXPOSURE"
      ? "Expected information is exposure-limited. More live-days beat a louder claim."
      : recommend === "SECOND_TARGET"
        ? "Posterior mass is split. A second medium is the cheapest discriminator."
        : recommend === "THRESHOLD"
          ? "Background dominates. Lower the analysis threshold or veto, not the cross-section slider."
          : "Sandbox information is saturated. Do not confuse that with a discovery.";
  return { fisherZ, bitsVsH0, recommend, note };
}

/* ------------------------------------------------------------------ */
/* 13. Cross-detector replication                                      */
/* ------------------------------------------------------------------ */

export interface ReplicationResult {
  primary: DetectorMedium;
  replica: DetectorMedium;
  shapeDistance: number;
  rateRatio: number;
  consistent: boolean;
  independent: boolean;
  score: number;
  note: string;
}

export function replicateSpectrum(
  primary: number[],
  replica: number[],
  primaryMedium: DetectorMedium,
  replicaMedium: DetectorMedium,
): ReplicationResult {
  const n = Math.min(primary.length, replica.length);
  let l1 = 0;
  let pSum = 0;
  let rSum = 0;
  for (let i = 0; i < n; i++) {
    l1 += Math.abs(primary[i] - replica[i]);
    pSum += primary[i];
    rSum += replica[i];
  }
  const shapeDistance = l1 / Math.max(1e-9, pSum + rSum);
  const rateRatio = rSum / Math.max(1e-9, pSum);
  const consistent = shapeDistance < 0.45 && rateRatio > 0.05 && rateRatio < 20;
  return {
    primary: primaryMedium,
    replica: replicaMedium,
    shapeDistance,
    rateRatio,
    consistent,
    independent: false,
    score: Math.max(0, 1 - shapeDistance),
    note: "Same codebase, same seed family — shape agreement is a control, not independent replication.",
  };
}

/* ------------------------------------------------------------------ */
/* 14. Posterior predictive checks                                     */
/* ------------------------------------------------------------------ */

export interface PpcResult {
  chiSquare: number;
  pApprox: number;
  passed: boolean;
  note: string;
}

export function posteriorPredictive(observed: number[], expected: number[]): PpcResult {
  const n = Math.min(observed.length, expected.length);
  let chi = 0;
  for (let i = 0; i < n; i++) {
    const mu = Math.max(0.25, expected[i]);
    chi += (observed[i] - mu) ** 2 / mu;
  }
  const dof = Math.max(1, n - 1);
  const x = chi / dof;
  const pApprox = 1 / (1 + Math.exp(1.2 * (x - 1.4)));
  return {
    chiSquare: chi,
    pApprox,
    passed: pApprox > 0.05,
    note: "PPC on synthetic counts is a self-consistency check, not a goodness-of-nature test.",
  };
}

/* ------------------------------------------------------------------ */
/* 15. Evidence graph — canonical module                               */
/* ------------------------------------------------------------------ */

export { assembleLabGraph, validateEvidenceGraph } from "./evidence/EvidenceGraph";
export type { EvidenceEdge, EvidenceGraph, EvidenceNode } from "./evidence/EvidenceGraph";
export type { EvidenceLedger } from "./evidence/EvidenceLedger";
export type { ResearchRun } from "./core/ResearchRun";
export type { JointLikelihoodResult } from "./statistics/JointLikelihood";
export type { RobustnessReport } from "./robustness/LeaveOneOut";

/* ------------------------------------------------------------------ */
/* 16. Discovery gate                                                  */
/* ------------------------------------------------------------------ */

export interface GateInput {
  significanceSigma: number;
  independentReplication: boolean;
  backgroundValidated: boolean;
  detectorSystematicsValidated: boolean;
  unblinded: boolean;
  ppcPassed: boolean;
  dataState: DataState;
}

export interface GateResult {
  passed: boolean;
  blockers: string[];
  requested: "SCI:DISC";
}

export function evaluateDiscoveryGate(input: GateInput): GateResult {
  const blockers: string[] = [];
  if (input.dataState !== "OBSERVED") blockers.push("DATA_NOT_OBSERVED");
  if (input.significanceSigma < 5) blockers.push("SIGNIFICANCE_LT_5_SIGMA");
  if (!input.independentReplication) blockers.push("INDEPENDENT_REPLICATION_REQUIRED");
  if (!input.backgroundValidated) blockers.push("BACKGROUND_MODEL_NOT_VALIDATED");
  if (!input.detectorSystematicsValidated) blockers.push("DETECTOR_SYSTEMATICS_NOT_VALIDATED");
  if (!input.unblinded) blockers.push("DATA_NOT_UNBLINDED");
  if (!input.ppcPassed) blockers.push("PPC_FAILED");
  if (input.dataState === "SIMULATED" || input.dataState === "CONTROL") {
    if (!blockers.includes("DATA_NOT_OBSERVED")) blockers.push("DATA_NOT_OBSERVED");
    blockers.push("SYNTHETIC_EVENTS_ARE_CONTROLS");
  }
  return { passed: blockers.length === 0, blockers, requested: "SCI:DISC" };
}

/* ------------------------------------------------------------------ */
/* RNG / sampling                                                      */
/* ------------------------------------------------------------------ */

export class RNG {
  private s: number;
  constructor(seed: number) {
    this.s = (seed >>> 0) || 1;
  }
  next(): number {
    this.s = (this.s + 0x6d2b79f5) | 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  gaussian(): number {
    const u1 = Math.max(this.next(), 1e-12);
    const u2 = this.next();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}

export function poisson(rng: RNG, mean: number): number {
  if (mean <= 0) return 0;
  if (mean < 25) {
    const limit = Math.exp(-mean);
    let product = 1;
    let count = 0;
    do {
      count += 1;
      product *= rng.next();
    } while (product > limit);
    return count - 1;
  }
  return Math.max(0, Math.round(mean + Math.sqrt(mean) * rng.gaussian()));
}

export const MAX_RENDER_EVENTS = 480;

export function subsample<T>(events: T[], max: number, rng: RNG): T[] {
  if (events.length <= max) return events;
  const out: T[] = [];
  const step = events.length / max;
  for (let i = 0; i < max; i++) {
    const idx = Math.min(events.length - 1, Math.floor(i * step + rng.next() * 0.3));
    out.push(events[idx]);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Detector response (S1 / S2)                                         */
/* ------------------------------------------------------------------ */

export function simulateDetectorEvent(
  input: DetectorInput,
  mech: DetectorMechanicsConfig,
  rng: RNG,
): DetectorEvent {
  const nr = input.channel === "NR";
  const phY = mech.photonYieldPerKeV * (nr ? 0.32 : 1);
  const eY = mech.electronYieldPerKeV * (nr ? 0.38 : 1);
  const photonsProduced = poisson(rng, Math.max(0, input.recoilEnergyKeV * phY));
  const electronsProduced = poisson(rng, Math.max(0, input.recoilEnergyKeV * eY));
  const detectedPhotons = poisson(rng, photonsProduced * mech.photonDetectionEfficiency);
  const extractedElectrons = poisson(rng, electronsProduced * mech.extractionEfficiency);
  const s1PE = Math.max(0, detectedPhotons * (1 + rng.gaussian() * mech.s1ResolutionFraction));
  const s2PE = Math.max(
    0,
    extractedElectrons * mech.electronGain * (1 + rng.gaussian() * mech.s2ResolutionFraction),
  );
  const driftTimeUs = (Math.abs(input.z) * 1000) / Math.max(0.2, mech.driftVelocityMmPerUs);
  const xyN = mech.xyResolutionMm / 1000;
  const reconstructedX = input.x + rng.gaussian() * xyN;
  const reconstructedY = input.y + rng.gaussian() * xyN;
  const reconstructedZ = input.z + rng.gaussian() * xyN * 0.4;
  const reconstructedEnergyKeV = Math.max(
    0.05,
    (s1PE / Math.max(1e-6, mech.photonDetectionEfficiency * phY) +
      s2PE / Math.max(1e-6, mech.electronGain * eY * mech.extractionEfficiency)) /
      2,
  );
  const s2s1 = s1PE > 0.2 ? s2PE / s1PE : s2PE;
  const split = nr ? 16 : 28;
  const nrScore = 1 / (1 + Math.exp((s2s1 - split) / 4.2));
  const qualityScore = Math.max(0, Math.min(1, 0.35 + 0.65 * mech.nrDiscriminationPower * (s1PE > 1 ? 1 : 0.4)));
  return {
    ...input,
    photonsProduced,
    detectedPhotons,
    electronsProduced,
    extractedElectrons,
    s1PE,
    s2PE,
    driftTimeUs,
    reconstructedEnergyKeV,
    reconstructedX,
    reconstructedY,
    reconstructedZ,
    nrScore,
    qualityScore,
  };
}

function placeCylinder(rng: RNG, geo: LabGeometry) {
  const r = geo.radiusM * Math.sqrt(rng.next());
  const a = 2 * Math.PI * rng.next();
  return { x: r * Math.cos(a), y: r * Math.sin(a), z: (rng.next() - 0.5) * geo.heightM };
}

function classify(ev: DetectorEvent, geo: LabGeometry, rng: RNG, bgId?: string): Pick<PipelineEvent, "classification" | "veto"> {
  const r = Math.hypot(ev.reconstructedX, ev.reconstructedY);
  const fiducialPass = r < geo.radiusM * 0.82 && Math.abs(ev.reconstructedZ) < geo.heightM * 0.38;
  const veto = {
    muonPass: bgId !== "MUON",
    neutronPass: bgId !== "NEUTRON",
    surfacePass: bgId !== "SURFACE" && r < geo.radiusM * 0.94,
    fiducialPass: bgId !== "ELECTRODE" && fiducialPass,
  };
  const trigger = ev.s1PE >= geo.s1ThresholdPE && ev.s2PE >= geo.s2ThresholdPE;
  const vetoed = !veto.muonPass || !veto.neutronPass || !veto.surfacePass || !veto.fiducialPass;
  void rng;
  let classification: EventClass = "ER_LIKE";
  if (!trigger || vetoed) classification = "VETOED";
  else if (ev.nrScore >= 0.5) classification = "NR_LIKE";
  return { classification, veto };
}

/* ------------------------------------------------------------------ */
/* 17. Master pipeline                                                 */
/* ------------------------------------------------------------------ */

export interface SciNetInput {
  seed: number;
  medium: DetectorMedium;
  replicaMedium?: DetectorMedium;
  halo: HaloParameters;
  geometry: LabGeometry;
  massGeV: number;
  crossSectionCm2: number;
  exposureTonYears: number;
  backgroundRates: { id: string; label: string; rate: number; slope: number; nrFraction: number; unc: number; on: boolean }[];
  backgroundNorm: number;
  dataState?: DataState;
}

export interface SciNetRun {
  binsKeV: number[];
  trueSpectrum: number[];
  foldedSpectrum: number[];
  replicaFolded: number[];
  observedByBin: number[];
  backgroundByBin: number[];
  mixture: BackgroundMixture;
  events: PipelineEvent[];
  likelihoods: LikelihoodResult[];
  posterior: PosteriorSet;
  modulation: ModulationResult;
  replication: ReplicationResult;
  ppc: PpcResult;
  info: InformationGain;
  evidence: EvidenceGraph;
  ledger: EvidenceLedger;
  joint: JointLikelihoodResult[];
  researchRun: ResearchRun;
  robustness: RobustnessReport;
  testStatistic: number;
  approxZ: number;
  gate: GateResult;
  expectedSignal: number;
  expectedBackground: number;
  generatedBackground: number;
  contractHash: string;
  provenance: Provenance;
  blind: BlindDataset;
  epistemic: EvidenceState;
}

function scaleToCounts(spectrum: number[], exposureTonYears: number, massGeV: number): number[] {
  const massFactor = Math.max(0.05, Math.min(6, massGeV / 50));
  const k = exposureTonYears * 1e7 * massFactor;
  return spectrum.map((s) => s * k);
}

function histogram(values: number[], bins: number[]): number[] {
  const counts = bins.map(() => 0);
  for (const v of values) {
    let idx = 0;
    for (let i = 0; i < bins.length; i++) if (v >= bins[i]) idx = i;
    counts[idx] += 1;
  }
  return counts;
}

export function runSciNetPipeline(input: SciNetInput): SciNetRun {
  const dataState: DataState = input.dataState ?? "SIMULATED";
  const bins = DEFAULT_BINS_KEV;
  const mech = DETECTOR_MECHANICS[input.medium];
  const replicaMedium = input.replicaMedium ?? (input.medium === "XENON" ? "ARGON" : "XENON");
  const replicaMech = DETECTOR_MECHANICS[replicaMedium];
  const target: TargetParameters = { ...TARGETS[input.medium], exposureTonYears: input.exposureTonYears };
  const replicaTarget: TargetParameters = { ...TARGETS[replicaMedium], exposureTonYears: input.exposureTonYears };
  const halo = input.halo;
  const rng = new RNG(input.seed);
  const response = gaussianResponse(bins, mech, input.geometry.s1ThresholdPE);
  const replicaResponse = gaussianResponse(bins, replicaMech, input.geometry.s1ThresholdPE);

  const enabledBg = input.backgroundRates.filter((b) => b.on);
  const components: MixtureComponent[] = enabledBg.map((b) => ({
    id: b.id,
    label: b.label,
    expectedByBin: exponentialSpectrum(bins, b.rate * input.exposureTonYears * 365 * 1000 * input.backgroundNorm, b.slope),
    uncertaintyFraction: b.unc,
    correlation: b.id === "NEUTRON" || b.id === "MUON" ? "SHARED" : "DETECTOR_SPECIFIC",
  }));
  const mixture = createBackgroundMixture(input.medium, components);
  const backgroundByBin = mixture.totalExpected;

  const likelihoods: LikelihoodResult[] = [];
  const spectra: Partial<Record<HypothesisId, number[]>> = {};
  for (const h of HYPOTHESES) {
    const inter = interactionFor(h.id, input.massGeV, input.crossSectionCm2);
    const truth = recoilSpectrum(halo, target, inter, bins);
    const folded = scaleToCounts(foldSpectrum(truth, response), input.exposureTonYears, input.massGeV);
    spectra[h.id] = folded;
    const binsLL: LikelihoodBin[] = bins.map((E, i) => ({
      energyMinKeV: i === 0 ? 0 : bins[i - 1],
      energyMaxKeV: E,
      observed: 0,
      signalExpected: h.id === "H0_BACKGROUND" ? 0 : folded[i],
      backgroundExpected: backgroundByBin[i] ?? 0,
      efficiency: response.efficiency[i],
    }));
    likelihoods.push(calculateLikelihood(h.id, binsLL, 1, 1, 0));
  }

  const h1 = interactionFor("H1_SI_ELASTIC_NR", input.massGeV, input.crossSectionCm2);
  const trueSpectrum = recoilSpectrum(halo, target, h1, bins);
  const foldedSpectrum = scaleToCounts(foldSpectrum(trueSpectrum, response), input.exposureTonYears, input.massGeV);
  const replicaTruth = recoilSpectrum(halo, replicaTarget, h1, bins);
  const replicaFolded = scaleToCounts(foldSpectrum(replicaTruth, replicaResponse), input.exposureTonYears, input.massGeV);
  const expectedSignal = foldedSpectrum.reduce((s, v) => s + v, 0);
  const expectedBackground = backgroundByBin.reduce((s, v) => s + v, 0);

  const nSig = poisson(rng, expectedSignal);
  const nBg = poisson(rng, expectedBackground);
  const events: PipelineEvent[] = [];

  const e0 = characteristicRecoilKeV(input.massGeV, halo.v0KmPerS, target.atomicMassGeV);
  for (let i = 0; i < nSig; i++) {
    const energy = Math.min(200, Math.max(0.4, -Math.log(Math.max(rng.next(), 1e-12)) * e0));
    const pos = placeCylinder(rng, input.geometry);
    const det = simulateDetectorEvent(
      {
        eventId: `DM-${String(i).padStart(7, "0")}`,
        recoilEnergyKeV: energy,
        channel: "NR",
        x: pos.x,
        y: pos.y,
        z: pos.z,
        timestamp: input.seed + i,
      },
      mech,
      rng,
    );
    const cls = classify(det, input.geometry, rng);
    const vmin = minimumVelocityKmPerS(energy, input.massGeV, target.atomicMassGeV);
    events.push({
      ...det,
      ...cls,
      dataState,
      evidenceState: "SCI:SIMULATED",
      timeDay: rng.next() * 365.25,
      model: "H1_SI_ELASTIC_NR",
      medium: input.medium,
      velocityKmS: Math.min(halo.vEscapeKmPerS, Math.max(vmin, halo.v0KmPerS + rng.gaussian() * 40)),
    });
  }

  const bgTotal = enabledBg.reduce((s, b) => s + b.rate, 0) || 1;
  for (let i = 0; i < nBg; i++) {
    let draw = rng.next() * bgTotal;
    let pick = enabledBg[enabledBg.length - 1];
    for (const b of enabledBg) {
      draw -= b.rate;
      if (draw <= 0) {
        pick = b;
        break;
      }
    }
    const energy = Math.min(200, Math.max(0.05, -Math.log(Math.max(rng.next(), 1e-12)) / Math.max(pick.slope, 1e-6)));
    const pos = placeCylinder(rng, input.geometry);
    const channel: InteractionChannel = rng.next() < pick.nrFraction ? "NR" : "ER";
    const det = simulateDetectorEvent(
      {
        eventId: `BG-${pick.id}-${String(i).padStart(7, "0")}`,
        recoilEnergyKeV: energy,
        channel,
        x: pos.x,
        y: pos.y,
        z: pos.z,
        timestamp: input.seed + 90000 + i,
      },
      mech,
      rng,
    );
    const cls = classify(det, input.geometry, rng, pick.id);
    events.push({
      ...det,
      ...cls,
      dataState,
      evidenceState: "SCI:CONTROL",
      timeDay: rng.next() * 365.25,
      model: pick.id,
      medium: input.medium,
      velocityKmS: 0,
    });
  }

  const rendered = subsample(events, MAX_RENDER_EVENTS, new RNG(input.seed + 99));
  const accepted = rendered.filter((e) => e.classification !== "VETOED");
  const observedByBin = histogram(
    accepted.map((e) => e.reconstructedEnergyKeV),
    bins,
  );

  const likelihoodsObs: LikelihoodResult[] = HYPOTHESES.map((h) => {
    const folded = spectra[h.id] ?? bins.map(() => 0);
    const llBins: LikelihoodBin[] = bins.map((E, i) => ({
      energyMinKeV: i === 0 ? 0 : bins[i - 1],
      energyMaxKeV: E,
      observed: observedByBin[i],
      signalExpected: h.id === "H0_BACKGROUND" ? 0 : folded[i],
      backgroundExpected: backgroundByBin[i] ?? 0,
      efficiency: response.efficiency[i],
    }));
    const unc =
      enabledBg.reduce((s, b) => s + b.unc, 0) / Math.max(1, enabledBg.length);
    const penalty = 0.5 * ((input.backgroundNorm - 1) / Math.max(0.05, unc)) ** 2;
    return calculateLikelihood(h.id, llBins, 1, 1, penalty);
  });

  const posterior = bayesianCompare(likelihoodsObs);
  const modulation = calculateModulation(accepted.map((e) => e.timeDay));
  const replication = replicateSpectrum(foldedSpectrum, replicaFolded, input.medium, replicaMedium);
  const expectedMix = bins.map((_, i) => (spectra.H1_SI_ELASTIC_NR?.[i] ?? 0) + (backgroundByBin[i] ?? 0));
  const ppc = posteriorPredictive(observedByBin, expectedMix);
  const info = informationGain(expectedSignal, expectedBackground, posterior.entropy);

  const constraints = [
    { name: "bgNorm", value: input.backgroundNorm, nominal: 1, sigma: 0.2 },
    { name: "haloDensity", value: 1, nominal: 1, sigma: 0.15 },
  ];
  const modelsByHypothesis: Record<string, DetectorLikelihood[]> = {};
  for (const h of HYPOTHESES) {
    const folded = spectra[h.id] ?? bins.map(() => 0);
    const primaryBins: JointBin[] = bins.map((E, i) => ({
      detectorId: input.medium,
      energyMinKeV: i === 0 ? 0 : bins[i - 1],
      energyMaxKeV: E,
      observed: observedByBin[i],
      signalExpected: h.id === "H0_BACKGROUND" ? 0 : folded[i],
      backgroundExpected: backgroundByBin[i] ?? 0,
      efficiency: response.efficiency[i],
    }));
    const replicaBins: JointBin[] = bins.map((E, i) => ({
      detectorId: replicaMedium,
      energyMinKeV: i === 0 ? 0 : bins[i - 1],
      energyMaxKeV: E,
      observed: replicaFolded[i] + (backgroundByBin[i] ?? 0),
      signalExpected: h.id === "H0_BACKGROUND" ? 0 : replicaFolded[i],
      backgroundExpected: backgroundByBin[i] ?? 0,
      efficiency: replicaResponse.efficiency[i],
    }));
    modelsByHypothesis[h.id] = [
      {
        detectorId: input.medium,
        hypothesisId: h.id,
        signalStrength: 1,
        backgroundScale: 1,
        bins: primaryBins,
        constraints,
        correlatedNuisance: {
          names: ["bgNorm", "haloDensity"],
          covariance: [
            [0.04, 0.004],
            [0.004, 0.0225],
          ],
        },
      },
      {
        detectorId: replicaMedium,
        hypothesisId: h.id,
        signalStrength: 1,
        backgroundScale: 1,
        bins: replicaBins,
        constraints,
      },
    ];
  }

  const joint = HYPOTHESES.map((h) => calculateJointLikelihood(modelsByHypothesis[h.id] ?? []));
  const contractHash = syncHash({
    v: SCINET_VERSION,
    seed: input.seed,
    medium: input.medium,
    mass: input.massGeV,
    sigma: input.crossSectionCm2,
    exposure: input.exposureTonYears,
  });
  const contract = {
    contractHash,
    protocolVersion: SCINET_VERSION,
    hypothesisRegistryVersion: "HYP-6",
    detectorConfigurationVersion: mech.name,
    backgroundConfigurationVersion: `BG-${components.length}`,
    calibrationVersion: "DEV-1",
    statisticalMethodVersion: "JOINT-POISSON-1",
    blindingRequired: true,
    frozen: true,
  };
  let researchRun = createResearchRun(contract, dataState, [input.medium, replicaMedium], HYPOTHESES.map((h) => h.id));
  researchRun = prepareRun(researchRun);
  researchRun = analyzeResearchRun(researchRun, modelsByHypothesis);
  const robustness = robustnessSweep({
    h1: modelsByHypothesis.H1_SI_ELASTIC_NR ?? [],
    h0: modelsByHypothesis.H0_BACKGROUND ?? [],
    components: components.map((c) => ({ id: c.id, expectedByBin: c.expectedByBin })),
  });
  const h1Joint = joint.find((j) => j.hypothesisId === "H1_SI_ELASTIC_NR");
  const h0Joint = joint.find((j) => j.hypothesisId === "H0_BACKGROUND");
  const testStatistic = likelihoodRatio(h1Joint?.logLikelihood ?? 0, h0Joint?.logLikelihood ?? 0);
  const zJoint = approximateZ(Math.max(0, testStatistic));
  const evidence = assembleLabGraph({
    graphId: `EG-${contractHash.slice(0, 12)}`,
    dataState,
    preferred: posterior.preferred,
    logBayes: posterior.logBayesH1H0,
    replicated: replication.consistent,
    ppcPassed: ppc.passed,
    contractHash,
  });
  const ledger = ledgerFromGraph(evidence, contractHash);
  const z = discoveryMetric(expectedSignal, expectedBackground);
  const eligibility = discoveryEligibility(researchRun);
  const gate = evaluateDiscoveryGate({
    significanceSigma: Number.isFinite(zJoint) ? zJoint : z,
    independentReplication: false,
    backgroundValidated: mixture.validated,
    detectorSystematicsValidated: false,
    unblinded: false,
    ppcPassed: ppc.passed,
    dataState,
  });
  gate.blockers = [...new Set([...gate.blockers, ...eligibility.blockers])];
  gate.passed = false;

  let epistemic: EvidenceState = "SCI:SIMULATED";
  if (posterior.preferred === "H0_BACKGROUND") epistemic = "SCI:BACKGROUND_PREFERRED";
  else if (posterior.logBayesH1H0 > 2) epistemic = "SCI:MODEL_SUPPORTED";
  if (accepted.filter((e) => e.classification === "NR_LIKE").length > expectedBackground * 0.35 + 12) {
    epistemic = "SCI:ANOMALY";
  }

  const provenance: Provenance = {
    datasetId: syncHash(`${contractHash}:ds`),
    contractHash,
    source: "scinet-master",
    version: SCINET_VERSION,
    timestamp: new Date().toISOString(),
    seed: input.seed,
    blinded: true,
    unblinded: false,
  };
  const blind = createLockedControlSet(
    rendered.map((e) => ({
      eventId: e.eventId,
      energyKeV: e.reconstructedEnergyKeV,
      x: e.reconstructedX,
      y: e.reconstructedY,
      z: e.reconstructedZ,
      s1PE: e.s1PE,
      s2PE: e.s2PE,
      nrScore: e.nrScore,
    })),
    contractHash,
    input.seed,
  );

  void likelihoods;
  return {
    binsKeV: bins,
    trueSpectrum,
    foldedSpectrum,
    replicaFolded,
    observedByBin,
    backgroundByBin,
    mixture,
    events: rendered,
    likelihoods: likelihoodsObs,
    posterior,
    modulation,
    replication,
    ppc,
    info,
    evidence,
    ledger,
    joint,
    researchRun,
    robustness,
    testStatistic,
    approxZ: Number.isFinite(zJoint) ? zJoint : 0,
    gate,
    expectedSignal,
    expectedBackground,
    generatedBackground: nBg,
    contractHash,
    provenance,
    blind,
    epistemic,
  };
}
