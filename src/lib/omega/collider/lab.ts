/*
 * DHC-TWIN v7 composition layer.
 * Nuclear collisions, literature calibration, air-shower mapping, SCI-NET firewall.
 * Measured data constrains models. Models generate predictions.
 * Predictions do not become observations because a plot agrees.
 */

import { hashObject } from "../hash";
import { ledgerFromGraph, type EvidenceLedger } from "../scinet/evidence/EvidenceLedger";
import {
  addEvidenceEdge,
  addEvidenceNode,
  createEvidenceGraph,
  validateEvidenceGraph,
  type EvidenceGraph,
  type EvidenceNode,
} from "../scinet/evidence/EvidenceGraph";
import { RNG } from "../scinet/master";
import {
  ATMOSPHERE,
  propagateCosmicRay,
  type CosmicShower,
} from "./cosmic";
import {
  ATLAS_PO_LITERATURE,
  CAMPAIGNS,
  FORWARD,
  campaignById,
  generateNucleus,
  sampleGlauber,
  sqrtSNN,
  type CollisionSystem,
  type GlauberEvent,
  type Nucleon,
} from "./nuclei";
import {
  GENERATORS,
  NCH_EDGES,
  ETA_EDGES,
  PT_EDGES,
  chi2Ndf,
  compareModelToData,
  emptyHist,
  fillHist,
  generatorById,
  literatureEta,
  modelDisagreement,
  sampleNuclearEvent,
  type CompareBin,
  type DisagreementBin,
  type GeneratorId,
  type HistBin,
  type NuclearEvent,
} from "./generators";

export interface ScientificFirewall {
  observed: boolean;
  reconstructed: boolean;
  derived: boolean;
  simulated: boolean;
  inferred: boolean;
  hypothetical: boolean;
  discoveryEligible: boolean;
}

export interface HeavyIonDiagnostics {
  centrality: number;
  participantCount: number;
  binaryCollisionCount: number;
  chargedMultiplicity: number;
  meanPt: number;
  flow: number;
  quenching: number;
  qgpInterpretation: "MODEL_DEPENDENT";
}

export interface JetQuenching {
  jetPtInitial: number;
  jetPtFinal: number;
  energyLoss: number;
  referenceSystem: string;
  interpretation: "DIAGNOSTIC";
}

export interface CompositionInference {
  hypotheses: Array<{ id: string; likelihood: number; posterior: number }>;
  evidenceState: "INFERRED";
  warning: string;
}

export interface UniversalLabRun {
  schema: "DHC-TWIN-v7";
  system: CollisionSystem;
  sqrtSNNGeV: number;
  sqrtSNNTeV: number;
  generator: GeneratorId;
  events: NuclearEvent[];
  last: NuclearEvent | null;
  meanNch: number;
  meanPT: number;
  meanForwardGeV: number;
  eta: Record<GeneratorId, HistBin[]>;
  nch: Record<GeneratorId, HistBin[]>;
  pt: Record<GeneratorId, HistBin[]>;
  literatureEta: HistBin[];
  compare: Record<GeneratorId, CompareBin[]>;
  disagreement: DisagreementBin[];
  chi2: Record<GeneratorId, number>;
  preferredGenerator: GeneratorId;
  shower: CosmicShower;
  nucleusA: Nucleon[];
  nucleusB: Nucleon[];
  geometry: GlauberEvent;
  heavyIon: HeavyIonDiagnostics;
  jet: JetQuenching;
  composition: CompositionInference;
  atmosphere: typeof ATMOSPHERE;
  forward: typeof FORWARD;
  literature: typeof ATLAS_PO_LITERATURE;
  graph: EvidenceGraph;
  ledger: EvidenceLedger;
  graphErrors: string[];
  firewall: ScientificFirewall;
  packageHash: string;
  blockers: string[];
  discoveryGate: false;
  state: "SCI:SIMULATED";
}

function node(
  id: string,
  type: EvidenceNode["type"],
  epistemicState: string,
  label: string,
  metadata: Record<string, unknown> = {},
): EvidenceNode {
  return { id, type, epistemicState, label, provenance: ["dhc-twin-v7"], metadata };
}

function assembleCosmicGraph(input: {
  graphId: string;
  system: string;
  preferred: string;
  chi2: number;
  packageHash: string;
}): EvidenceGraph {
  let graph = createEvidenceGraph(input.graphId);
  graph = addEvidenceNode(
    graph,
    node("atlas-po-literature", "CALIBRATION", "LITERATURE", "ATLAS p–O published", {
      caveat: ATLAS_PO_LITERATURE.caveat,
    }),
  );
  graph = addEvidenceNode(graph, node("sandbox-events", "DATASET", "SCI:SIMULATED", "Twin nuclear events"));
  graph = addEvidenceNode(graph, node("gen-a", "MODEL", "SCI:HYPOTHETICAL", "Generator A"));
  graph = addEvidenceNode(graph, node("gen-b", "MODEL", "SCI:HYPOTHETICAL", "Generator B"));
  graph = addEvidenceNode(graph, node("gen-c", "MODEL", "SCI:HYPOTHETICAL", "Generator C"));
  graph = addEvidenceNode(graph, node("reco-eta", "STATISTIC", "SCI:DERIVED", "dN/dη comparison"));
  graph = addEvidenceNode(
    graph,
    node("hadronic-constraint", "LIKELIHOOD", "SCI:INFERRED", `Least-disagreeing ${input.preferred}`),
  );
  graph = addEvidenceNode(graph, node("air-shower", "EVENT", "SCI:SIMULATED", "Mapped air shower"));
  graph = addEvidenceNode(graph, node("source", "HYPOTHESIS", "SCI:HYPOTHETICAL", "Cosmic source"));
  graph = addEvidenceNode(graph, node("claim", "CLAIM", "SCI:REJECTED", "Discovery claim"));
  graph = addEvidenceEdge(graph, {
    id: "e1",
    from: "atlas-po-literature",
    to: "reco-eta",
    type: "CALIBRATED_BY",
    provenance: [input.packageHash],
    metadata: {},
  });
  graph = addEvidenceEdge(graph, {
    id: "e2",
    from: "sandbox-events",
    to: "reco-eta",
    type: "DERIVED_FROM",
    provenance: [],
    metadata: {},
  });
  graph = addEvidenceEdge(graph, {
    id: "e3",
    from: "gen-a",
    to: "hadronic-constraint",
    type: "PREDICTED_BY",
    provenance: [],
    metadata: {},
  });
  graph = addEvidenceEdge(graph, {
    id: "e4",
    from: "gen-b",
    to: "hadronic-constraint",
    type: "PREDICTED_BY",
    provenance: [],
    metadata: {},
  });
  graph = addEvidenceEdge(graph, {
    id: "e5",
    from: "gen-c",
    to: "hadronic-constraint",
    type: "PREDICTED_BY",
    provenance: [],
    metadata: {},
  });
  graph = addEvidenceEdge(graph, {
    id: "e6",
    from: "reco-eta",
    to: "hadronic-constraint",
    type: "TESTED_BY",
    provenance: [],
    metadata: { chi2: input.chi2 },
  });
  graph = addEvidenceEdge(graph, {
    id: "e7",
    from: "hadronic-constraint",
    to: "air-shower",
    type: "PREDICTED_BY",
    provenance: [],
    metadata: { mapping: "collider-constrains-shower-model" },
  });
  graph = addEvidenceEdge(graph, {
    id: "e8",
    from: "air-shower",
    to: "source",
    type: "DEPENDS_ON",
    provenance: [],
    metadata: {},
  });
  graph = addEvidenceEdge(graph, {
    id: "e9",
    from: "sandbox-events",
    to: "claim",
    type: "REJECTED_BY",
    provenance: ["simulation-cannot-support-claim"],
    metadata: {},
  });
  return graph;
}

export function runUniversalLab(
  seed: number,
  systemId: string,
  generatorId: GeneratorId,
  nEvents: number,
): UniversalLabRun {
  const rng = new RNG(seed);
  const system = campaignById(systemId);
  const gen = generatorById(generatorId);
  const n = Math.max(20, Math.min(500, Math.round(nEvents)));
  const sNN = sqrtSNN(system);

  const eta: Record<GeneratorId, HistBin[]> = {
    GEN_A: emptyHist(ETA_EDGES),
    GEN_B: emptyHist(ETA_EDGES),
    GEN_C: emptyHist(ETA_EDGES),
  };
  const nch: Record<GeneratorId, HistBin[]> = {
    GEN_A: emptyHist(NCH_EDGES),
    GEN_B: emptyHist(NCH_EDGES),
    GEN_C: emptyHist(NCH_EDGES),
  };
  const pt: Record<GeneratorId, HistBin[]> = {
    GEN_A: emptyHist(PT_EDGES),
    GEN_B: emptyHist(PT_EDGES),
    GEN_C: emptyHist(PT_EDGES),
  };

  const events: NuclearEvent[] = [];
  let geometry: GlauberEvent = sampleGlauber(system.projectile, system.target, 0.2, 0.4);

  for (const spec of GENERATORS) {
    const local = new RNG(seed + spec.id.charCodeAt(4) * 17);
    for (let i = 0; i < n; i++) {
      const g = sampleGlauber(system.projectile, system.target, local.next(), local.next());
      const ev = sampleNuclearEvent(local, system, spec, g);
      fillHist(nch[spec.id], ev.nCh);
      for (const tr of ev.tracks) {
        fillHist(eta[spec.id], tr.eta);
        fillHist(pt[spec.id], tr.pT);
      }
      if (spec.id === gen.id) {
        events.push(ev);
        if (i === n - 1) geometry = g;
      }
    }
  }

  const lit = literatureEta(ETA_EDGES, n);
  const tot = (h: HistBin[]) => h.reduce((s, b) => s + b.observed, 0);
  const meanTot = (tot(eta.GEN_A) + tot(eta.GEN_B) + tot(eta.GEN_C)) / 3;
  const litTot = tot(lit);
  if (litTot > 0) {
    const scale = meanTot / litTot;
    for (const bin of lit) bin.observed *= scale;
  }
  const compare = {
    GEN_A: compareModelToData(lit, eta.GEN_A),
    GEN_B: compareModelToData(lit, eta.GEN_B),
    GEN_C: compareModelToData(lit, eta.GEN_C),
  };
  const chi2 = {
    GEN_A: chi2Ndf(compare.GEN_A, ATLAS_PO_LITERATURE.relativeUnc),
    GEN_B: chi2Ndf(compare.GEN_B, ATLAS_PO_LITERATURE.relativeUnc),
    GEN_C: chi2Ndf(compare.GEN_C, ATLAS_PO_LITERATURE.relativeUnc),
  };
  const preferredGenerator = (Object.entries(chi2).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "GEN_A") as GeneratorId;
  const disagreement = modelDisagreement([eta.GEN_A, eta.GEN_B, eta.GEN_C]);

  const meanNch = events.reduce((s, e) => s + e.nCh, 0) / Math.max(1, events.length);
  const meanPT = events.reduce((s, e) => s + (e.nCh ? e.sumPT / e.nCh : 0), 0) / Math.max(1, events.length);
  const meanForwardGeV = events.reduce((s, e) => s + e.forwardEnergyGeV, 0) / Math.max(1, events.length);

  const primaryEnergyGeV = Math.max(1e5, sNN * 80);
  const shower = propagateCosmicRay(rng, generatorById(preferredGenerator), primaryEnergyGeV, 18);

  const nucleusA = generateNucleus(system.projectile, seed * 0.001);
  const nucleusB = generateNucleus(system.target, seed * 0.002 + 1);

  const aa = system.projectile !== "p" && system.target !== "p";
  const quench = aa ? Math.min(0.35, 0.04 * geometry.nColl * 0.02) : 0;
  const heavyIon: HeavyIonDiagnostics = {
    centrality: geometry.centrality,
    participantCount: geometry.nPart,
    binaryCollisionCount: geometry.nColl,
    chargedMultiplicity: meanNch,
    meanPt: meanPT,
    flow: aa ? Math.min(0.12, 0.02 + geometry.centrality / 900) : 0,
    quenching: quench,
    qgpInterpretation: "MODEL_DEPENDENT",
  };
  const jet: JetQuenching = {
    jetPtInitial: 80,
    jetPtFinal: 80 * (1 - quench),
    energyLoss: 80 * quench,
    referenceSystem: system.id === "OO" || system.id === "NeNe" || system.id === "PbPb" ? "p-p / p-O" : "none",
    interpretation: "DIAGNOSTIC",
  };

  const muonFrac = shower.muons / Math.max(1, shower.charged);
  const raw = [
    { id: "proton", likelihood: Math.exp(-((muonFrac - 0.18) ** 2) / 0.01) },
    { id: "helium", likelihood: Math.exp(-((muonFrac - 0.22) ** 2) / 0.012) },
    { id: "oxygen", likelihood: Math.exp(-((muonFrac - 0.28) ** 2) / 0.014) },
    { id: "iron", likelihood: Math.exp(-((muonFrac - 0.36) ** 2) / 0.02) },
  ];
  const zsum = raw.reduce((s, h) => s + h.likelihood, 0);
  const composition: CompositionInference = {
    hypotheses: raw.map((h) => ({ ...h, posterior: h.likelihood / zsum })),
    evidenceState: "INFERRED",
    warning: "Model-dependent inference. Shower observables are simulated. Composition is not observed.",
  };

  const firewall: ScientificFirewall = {
    observed: false,
    reconstructed: true,
    derived: true,
    simulated: true,
    inferred: true,
    hypothetical: true,
    discoveryEligible: false,
  };

  const packageHash = hashObject({
    schema: "DHC-TWIN-v7",
    seed,
    system: system.id,
    generator: generatorId,
    n,
    sNN,
    preferredGenerator,
  });

  const graph = assembleCosmicGraph({
    graphId: `dhc-v7-${seed}`,
    system: system.id,
    preferred: preferredGenerator,
    chi2: chi2[preferredGenerator],
    packageHash,
  });
  const check = validateEvidenceGraph(graph);
  const ledger = ledgerFromGraph(graph, packageHash);

  const blockers = [
    "DATA_NOT_OBSERVED",
    "ATLAS_PO_IS_LITERATURE_CALIBRATION_NOT_THIS_TWINS_DATASET",
    "COLLIDER_EVENT_IS_NOT_AN_AIR_SHOWER",
    "GENERATOR_PREFERENCE_IS_NOT_A_HADRONIC_DISCOVERY",
    "SOURCE_INFERENCE_IS_HYPOTHETICAL",
    "TWIN_IS_NOT_THE_LHC",
    "QGP_INTERPRETATION_IS_MODEL_DEPENDENT",
    "SYNTHETIC_DATA_CANNOT_SUPPORT_DISCOVERY",
  ];
  if (!check.valid) blockers.push(...check.errors.slice(0, 4));

  return {
    schema: "DHC-TWIN-v7",
    system,
    sqrtSNNGeV: sNN,
    sqrtSNNTeV: sNN / 1000,
    generator: generatorId,
    events,
    last: events[events.length - 1] ?? null,
    meanNch,
    meanPT,
    meanForwardGeV,
    eta,
    nch,
    pt,
    literatureEta: lit,
    compare,
    disagreement,
    chi2,
    preferredGenerator,
    shower,
    nucleusA,
    nucleusB,
    geometry,
    heavyIon,
    jet,
    composition,
    atmosphere: ATMOSPHERE,
    forward: FORWARD,
    literature: ATLAS_PO_LITERATURE,
    graph,
    ledger,
    graphErrors: check.errors,
    firewall,
    packageHash,
    blockers,
    discoveryGate: false,
    state: "SCI:SIMULATED",
  };
}


