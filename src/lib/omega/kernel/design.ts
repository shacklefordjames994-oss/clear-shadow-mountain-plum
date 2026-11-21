/*
 * Active experiment design. The designer proposes. Humans authorize.
 * PROPOSAL != AUTHORIZATION
 * SUPPORTED_BY_SIMULATION != OBSERVED
 * SURROGATE != HIGH-FIDELITY
 * Never status PROVEN.
 */

import { HL, ipTwiss } from "./optics";
import { DEFAULT_GEOM, luminosityFromTwiss, luminosityModelB, type CollisionGeom } from "./luminosity";

export type HypothesisStatus =
  | "PROPOSED"
  | "UNDER_TEST"
  | "SUPPORTED_BY_SIMULATION"
  | "CONTRADICTED"
  | "INCONCLUSIVE"
  | "RETIRED";

export type ProposalStatus = "PROPOSED" | "APPROVED" | "REJECTED" | "EXECUTED" | "ARCHIVED";

export interface Hypothesis {
  id: string;
  statement: string;
  origin: "KERNEL";
  supportIf: string;
  falsifyIf: string;
  status: HypothesisStatus;
}

export interface CandidateExperiment {
  id: string;
  objective: string;
  variable: string;
  range: string;
  models: ["MODEL_A", "MODEL_B"];
  expectedIG: number;
  cost: number;
  utility: number;
  risk: string;
  authorization: "HUMAN_REQUIRED";
  status: ProposalStatus;
}

export interface KnowledgeState {
  version: number;
  models: ["MODEL_A", "MODEL_B"];
  hypotheses: Hypothesis[];
  uncertainty: number;
  openQuestions: string[];
  evidence: "SIMULATED";
}

export function pairAt(emitN: number, crab: number): { a: number; b: number; d: number } {
  const geom: CollisionGeom = { ...DEFAULT_GEOM, crabFraction: crab };
  const twiss = ipTwiss(emitN, HL.betaStarM);
  const a = luminosityFromTwiss(twiss, HL.bunchN, HL.nBunch, geom).lumiE34;
  const b = luminosityModelB(twiss, HL.bunchN, HL.nBunch, geom).lumiE34;
  return { a, b, d: Math.abs(a - b) };
}

export function uncertaintyGrid(): { emitN: number; crab: number; d: number }[] {
  const emits = [1.5e-6, 2.0e-6, 2.5e-6, 3.0e-6, 3.5e-6];
  const crabs = [0, 0.25, 0.5, 0.75, 1];
  const out: { emitN: number; crab: number; d: number }[] = [];
  for (const emitN of emits) {
    for (const crab of crabs) out.push({ emitN, crab, d: pairAt(emitN, crab).d });
  }
  return out;
}

function seedHypotheses(): Hypothesis[] {
  return [
    {
      id: "H1",
      statement: "Residual is a beam-emittance effect.",
      origin: "KERNEL",
      supportIf: "L changes when εn changes, crab held.",
      falsifyIf: "Residual independent of beam state.",
      status: "PROPOSED",
    },
    {
      id: "H2",
      statement: "Residual is a crab / overlap-F effect.",
      origin: "KERNEL",
      supportIf: "L changes when crab fraction changes, εn held.",
      falsifyIf: "Effect persists with crab locked.",
      status: "PROPOSED",
    },
    {
      id: "H3",
      statement: "Residual is a detector occupancy artifact.",
      origin: "KERNEL",
      supportIf: "Effect tracks occupancy, not σ*.",
      falsifyIf: "Same residual with no detector twin in the loop.",
      status: "PROPOSED",
    },
    {
      id: "H4",
      statement: "Residual is a reconstruction artifact.",
      origin: "KERNEL",
      supportIf: "Independent reco changes the residual.",
      falsifyIf: "L formula residual appears before reco.",
      status: "PROPOSED",
    },
    {
      id: "H5",
      statement: "Residual is an alternative physical mechanism.",
      origin: "KERNEL",
      supportIf: "Survives beam, crab, detector, and reco checks.",
      falsifyIf: "Any controlled alternative reproduces it.",
      status: "PROPOSED",
    },
  ];
}

export function proposeExperiments(grid: { emitN: number; crab: number; d: number }[]): CandidateExperiment[] {
  const peak = grid.reduce((p, q) => (q.d > p.d ? q : p), grid[0]);
  const meanD = grid.reduce((s, g) => s + g.d, 0) / grid.length;
  const igPeak = peak.d / Math.max(meanD, 1e-9);
  const igCrab = pairAt(HL.emitN_m, 1).d - pairAt(HL.emitN_m, 0).d;
  const igMacro = 0.35;
  return [
    {
      id: "ED-LUM-DISC",
      objective: "Discriminate MODEL_A vs MODEL_B at peak disagreement.",
      variable: "εn, crab",
      range: `εn=${(peak.emitN * 1e6).toFixed(2)} μm · crab=${peak.crab.toFixed(2)}`,
      models: ["MODEL_A", "MODEL_B"],
      expectedIG: igPeak,
      cost: 1.2,
      utility: igPeak / 1.2,
      risk: "Outside a validated lattice. Exploratory only.",
      authorization: "HUMAN_REQUIRED",
      status: "PROPOSED",
    },
    {
      id: "ED-CRAB-LOCK",
      objective: "Test H1 vs H2 by locking crab and sweeping εn.",
      variable: "εn",
      range: "1.5–3.5 μm, crab = 0.85",
      models: ["MODEL_A", "MODEL_B"],
      expectedIG: 1.4,
      cost: 1,
      utility: 1.4,
      risk: "Does not touch a quadrupole.",
      authorization: "HUMAN_REQUIRED",
      status: "PROPOSED",
    },
    {
      id: "ED-CRAB-SWEEP",
      objective: "Sweep crab at nominal εn. Falsify H1 if L is crab-blind.",
      variable: "crab fraction",
      range: "0–1 at εn = 2.5 μm",
      models: ["MODEL_A", "MODEL_B"],
      expectedIG: Math.abs(igCrab) + 0.8,
      cost: 0.8,
      utility: (Math.abs(igCrab) + 0.8) / 0.8,
      risk: "Reduced-order F, not a cavity TDR.",
      authorization: "HUMAN_REQUIRED",
      status: "PROPOSED",
    },
    {
      id: "ED-MACRO-NOISE",
      objective: "Compare DISTRIBUTION envelope to MACRO sampling noise.",
      variable: "mode",
      range: "400 macros, seed held",
      models: ["MODEL_A", "MODEL_B"],
      expectedIG: igMacro,
      cost: 2.4,
      utility: igMacro / 2.4,
      risk: "Sampling noise ≠ instrument noise.",
      authorization: "HUMAN_REQUIRED",
      status: "PROPOSED",
    },
  ];
}

export function pareto(cands: CandidateExperiment[]): CandidateExperiment[] {
  return cands.filter(
    (c) =>
      !cands.some(
        (o) => o.id !== c.id && o.expectedIG >= c.expectedIG && o.cost <= c.cost && (o.expectedIG > c.expectedIG || o.cost < c.cost),
      ),
  );
}

export function initialKnowledge(): KnowledgeState {
  const grid = uncertaintyGrid();
  const u = grid.reduce((s, g) => s + g.d, 0) / grid.length;
  return {
    version: 0,
    models: ["MODEL_A", "MODEL_B"],
    hypotheses: seedHypotheses(),
    uncertainty: u,
    openQuestions: [
      "Why does MODEL_B sit below MODEL_A? Hourglass, not new physics.",
      "Which εn, crab cell most discriminates the toys?",
    ],
    evidence: "SIMULATED",
  };
}

export function applyAuthorization(
  knowledge: KnowledgeState,
  cands: CandidateExperiment[],
  id: string,
  decision: "APPROVED" | "REJECTED",
): { knowledge: KnowledgeState; cands: CandidateExperiment[] } {
  const nextCands = cands.map((c) => (c.id === id ? { ...c, status: decision === "APPROVED" ? ("EXECUTED" as const) : ("REJECTED" as const) } : c));
  const hyps = knowledge.hypotheses.map((h) => ({ ...h }));
  if (decision === "APPROVED") {
    if (id === "ED-CRAB-LOCK" || id === "ED-LUM-DISC") {
      hyps[0].status = "SUPPORTED_BY_SIMULATION";
      hyps[2].status = "CONTRADICTED";
      hyps[3].status = "CONTRADICTED";
    }
    if (id === "ED-CRAB-SWEEP") {
      hyps[1].status = "SUPPORTED_BY_SIMULATION";
      hyps[0].status = hyps[0].status === "PROPOSED" ? "INCONCLUSIVE" : hyps[0].status;
    }
    if (id === "ED-MACRO-NOISE") {
      hyps[4].status = "INCONCLUSIVE";
    }
    hyps.forEach((h) => {
      if (h.status === "PROPOSED") h.status = "UNDER_TEST";
    });
  }
  return {
    knowledge: {
      ...knowledge,
      version: knowledge.version + 1,
      hypotheses: hyps,
      uncertainty: Math.max(0.02, knowledge.uncertainty * (decision === "APPROVED" ? 0.72 : 1)),
      openQuestions:
        decision === "APPROVED"
          ? [
              "SUPPORTED_BY_SIMULATION is not OBSERVED.",
              "Hourglass disagreement remains a toy residual.",
            ]
          : knowledge.openQuestions,
    },
    cands: nextCands,
  };
}

export function debateLines(): { role: "INTERPRETER" | "SKEPTIC" | "SYNTHESIZER"; text: string }[] {
  return [
    {
      role: "INTERPRETER",
      text: "MODEL_B sits below MODEL_A because hourglass suppresses overlap at finite σz/β*. Discrimination is largest where L is largest — low εn, crab on.",
    },
    {
      role: "SKEPTIC",
      text: "That is two toys arguing. Neither is a fill. Hourglass here is a one-line factor, not a 6D collision. SUPPORTED_BY_SIMULATION ≠ OBSERVED.",
    },
    {
      role: "SYNTHESIZER",
      text: "Keep both models. Authorize ED-LUM-DISC if you want the kernel to spend budget on the peak cell. Do not promote the residual to a mechanism. Do not actuate a quadrupole.",
    },
  ];
}
