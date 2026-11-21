/*
 * SCI-NETv2 layer for the Digital Hadron Collider Twin.
 * Reuses JointLikelihood, ResearchRun, EvidenceGraph, EvidenceLedger.
 * Simulation histograms are observed-in-the-sandbox, never SCI:OBSERVED.
 */

import { hashObject } from "../hash";
import {
  analyzeResearchRun,
  createResearchRun,
  discoveryEligibility,
  prepareRun,
  type ResearchRun,
} from "../scinet/core/ResearchRun";
import { ledgerFromGraph, type EvidenceLedger } from "../scinet/evidence/EvidenceLedger";
import {
  assembleLabGraph,
  validateEvidenceGraph,
  type EvidenceGraph,
} from "../scinet/evidence/EvidenceGraph";
import {
  approximateZ,
  likelihoodRatio,
  type DetectorLikelihood,
  type JointLikelihoodResult,
} from "../scinet/statistics/JointLikelihood";
import { RNG } from "../scinet/master";
import {
  type AcceleratorConfig,
  type CollisionEvent,
  type ColliderMode,
  generateCollision,
} from "./engine";

export const COLLIDER_HYPOTHESES = [
  "H0_QCD",
  "H1_Z",
  "H2_HIGGS",
  "H3_TTBAR",
  "H4_DM_MET",
  "H5_ENTANGLED",
] as const;

export type ColliderHypothesis = (typeof COLLIDER_HYPOTHESES)[number];

const MASS_EDGES = [40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160];
const MET_EDGES = [0, 40, 80, 120, 160, 220, 280, 360, 480];

export interface SpectrumBin {
  lo: number;
  hi: number;
  observed: number;
}

export interface ColliderInference {
  preferred: ColliderHypothesis;
  logL: Record<string, number>;
  deltaVsH0: number;
  approxZ: number;
  joint: JointLikelihoodResult[];
  researchRun: ResearchRun;
  graph: EvidenceGraph;
  ledger: EvidenceLedger;
  graphErrors: string[];
  blockers: string[];
  discoveryGate: boolean;
  state: "SCI:SIMULATED" | "SCI:ANOMALY" | "SCI:BACKGROUND_PREFERRED" | "SCI:REJECTED";
  contractHash: string;
}

export interface ColliderRun {
  events: CollisionEvent[];
  last: CollisionEvent | null;
  mass: SpectrumBin[];
  met: SpectrumBin[];
  counts: Record<string, number>;
  signalCandidates: number;
  background: number;
  significance: number;
  meanMass: number;
  meanMET: number;
  inference: ColliderInference;
}

function emptyBins(edges: number[]): SpectrumBin[] {
  const bins: SpectrumBin[] = [];
  for (let i = 0; i < edges.length - 1; i++) bins.push({ lo: edges[i], hi: edges[i + 1], observed: 0 });
  return bins;
}

function fill(bins: SpectrumBin[], value: number) {
  for (const bin of bins) {
    if (value >= bin.lo && value < bin.hi) {
      bin.observed += 1;
      return;
    }
  }
  if (value >= bins[bins.length - 1].hi) bins[bins.length - 1].observed += 1;
}

function qcd(lo: number, hi: number, kind: "mass" | "met"): number {
  const c = (lo + hi) / 2;
  return kind === "mass" ? Math.exp(-c / 48) : Math.exp(-c / 55);
}

function signalShape(hyp: ColliderHypothesis, lo: number, hi: number, kind: "mass" | "met"): number {
  const c = (lo + hi) / 2;
  if (kind === "mass") {
    if (hyp === "H1_Z" || hyp === "H5_ENTANGLED") return 3.2 * Math.exp(-0.5 * ((c - 91) / 5.5) ** 2);
    if (hyp === "H2_HIGGS") return 2.6 * Math.exp(-0.5 * ((c - 125) / 2.8) ** 2);
    if (hyp === "H3_TTBAR") return 0.45 * Math.exp(-c / 90);
    return 0;
  }
  if (hyp === "H4_DM_MET") return 2.1 * Math.exp(-0.5 * ((c - 240) / 70) ** 2);
  if (hyp === "H3_TTBAR") return 0.55 * Math.exp(-c / 90);
  return 0;
}

function modelsFor(
  hyp: ColliderHypothesis,
  mass: SpectrumBin[],
  met: SpectrumBin[],
  n: number,
  correlated: number,
): DetectorLikelihood[] {
  const scale = Math.max(1, n);
  const massBins = mass.map((b) => ({
    detectorId: "mass",
    energyMinKeV: b.lo,
    energyMaxKeV: b.hi,
    observed: b.observed,
    signalExpected: signalShape(hyp, b.lo, b.hi, "mass") * scale * 0.12,
    backgroundExpected: qcd(b.lo, b.hi, "mass") * scale * 0.12,
    efficiency: 1,
  }));
  const metBins = met.map((b) => ({
    detectorId: "met",
    energyMinKeV: b.lo,
    energyMaxKeV: b.hi,
    observed: b.observed,
    signalExpected: signalShape(hyp, b.lo, b.hi, "met") * scale * 0.12,
    backgroundExpected: qcd(b.lo, b.hi, "met") * scale * 0.12,
    efficiency: 1,
  }));
  const constraint = { name: "lumi", value: 1, nominal: 1, sigma: 0.05 };
  const quantumBins = [
    {
      detectorId: "spin",
      energyMinKeV: 0,
      energyMaxKeV: 1,
      observed: correlated,
      signalExpected: hyp === "H5_ENTANGLED" ? n * 0.72 : n * 0.08,
      backgroundExpected: n * 0.08,
      efficiency: 1,
    },
  ];
  return [
    {
      detectorId: "mass",
      hypothesisId: hyp,
      signalStrength: hyp === "H0_QCD" ? 0 : 1,
      backgroundScale: 1,
      bins: massBins,
      constraints: [constraint],
    },
    {
      detectorId: "met",
      hypothesisId: hyp,
      signalStrength: hyp === "H0_QCD" ? 0 : 1,
      backgroundScale: 1,
      bins: metBins,
    },
    {
      detectorId: "spin",
      hypothesisId: hyp,
      signalStrength: hyp === "H5_ENTANGLED" ? 1 : 0,
      backgroundScale: 1,
      bins: quantumBins,
    },
  ];
}

function infer(
  mass: SpectrumBin[],
  met: SpectrumBin[],
  n: number,
  seed: number,
  correlated: number,
): ColliderInference {
  const contractHash = hashObject({
    protocol: "dhc-scinet-v2",
    seed,
    n,
    hypotheses: COLLIDER_HYPOTHESES,
  });
  const byHyp: Record<string, DetectorLikelihood[]> = {};
  for (const hyp of COLLIDER_HYPOTHESES) byHyp[hyp] = modelsFor(hyp, mass, met, n, correlated);
  let run = createResearchRun(
    {
      contractHash,
      protocolVersion: "DHC-6.5",
      hypothesisRegistryVersion: "collider-h0-h5",
      detectorConfigurationVersion: "tracker-ecal-hcal-muon-v1",
      backgroundConfigurationVersion: "qcd-continuum-v1",
      calibrationVersion: "toy-smear-v1",
      statisticalMethodVersion: "joint-poisson-v1",
      blindingRequired: true,
      frozen: true,
    },
    "SIMULATED",
    ["mass", "met", "spin"],
    [...COLLIDER_HYPOTHESES],
  );
  run = prepareRun(run);
  run = analyzeResearchRun(run, byHyp);
  const logL: Record<string, number> = {};
  for (const r of run.likelihoodResults) logL[r.hypothesisId] = r.logLikelihood;
  const preferred = (run.likelihoodResults.slice().sort((a, b) => b.logLikelihood - a.logLikelihood)[0]
    ?.hypothesisId ?? "H0_QCD") as ColliderHypothesis;
  const delta = likelihoodRatio(logL[preferred] ?? 0, logL.H0_QCD ?? 0);
  const z = approximateZ(Math.max(0, delta));
  const graph = assembleLabGraph({
    graphId: `dhc-${seed}`,
    dataState: "SIMULATED",
    preferred,
    logBayes: delta / 2,
    replicated: false,
    ppcPassed: true,
    contractHash,
  });
  const check = validateEvidenceGraph(graph);
  const ledger = ledgerFromGraph(graph, contractHash);
  const eligibility = discoveryEligibility(run);
  const blockers = [
    ...eligibility.blockers,
    "SYNTHETIC_EVENTS_ARE_CONTROLS",
    "COLLIDER_TWIN_IS_NOT_AN_EXPERIMENT",
    "MASS_PEAK_IN_SANDBOX_IS_NOT_A_RESONANCE_DISCOVERY",
  ];
  if (!check.valid) blockers.push(...check.errors.slice(0, 4));
  const anomaly = Number.isFinite(z) && z >= 3 && preferred !== "H0_QCD";
  return {
    preferred,
    logL,
    deltaVsH0: delta,
    approxZ: Number.isFinite(z) ? z : 0,
    joint: run.likelihoodResults,
    researchRun: run,
    graph,
    ledger,
    graphErrors: check.errors,
    blockers,
    discoveryGate: false,
    state: anomaly ? "SCI:ANOMALY" : preferred === "H0_QCD" ? "SCI:BACKGROUND_PREFERRED" : "SCI:SIMULATED",
    contractHash,
  };
}

export function runColliderExperiment(
  seed: number,
  accel: AcceleratorConfig,
  mode: ColliderMode,
  nEvents: number,
): ColliderRun {
  const rng = new RNG(seed);
  const n = Math.max(1, Math.min(2000, Math.round(nEvents)));
  const events: CollisionEvent[] = [];
  const mass = emptyBins(MASS_EDGES);
  const met = emptyBins(MET_EDGES);
  const counts: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    const ev = generateCollision(rng, accel, mode);
    events.push(ev);
    counts[ev.process] = (counts[ev.process] ?? 0) + 1;
    if (ev.reconstruction.maxMass > 0) fill(mass, ev.reconstruction.maxMass);
    fill(met, ev.reconstruction.MET);
  }
  const signalCandidates = events.filter((e) => e.dmScore >= 0.5 || e.reconstruction.maxMass > 80).length;
  const background = Math.max(0, n - signalCandidates);
  const significance = background > 0 ? signalCandidates / Math.sqrt(background) : 0;
  const meanMass = events.reduce((s, e) => s + e.reconstruction.maxMass, 0) / n;
  const meanMET = events.reduce((s, e) => s + e.reconstruction.MET, 0) / n;
  const correlated = events.filter((e) => e.quantum.classification !== "CONTROL").length;
  return {
    events,
    last: events[events.length - 1] ?? null,
    mass,
    met,
    counts,
    signalCandidates,
    background,
    significance,
    meanMass,
    meanMET,
    inference: infer(mass, met, n, seed, correlated),
  };
}
