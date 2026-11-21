/*
 * Canonical research run. State machine is fail-closed.
 * analyzeResearchRun does not unblind and does not open SCI:DISC.
 * Synthetic data cannot support discovery.
 */

import {
  calculateJointLikelihood,
  type DetectorLikelihood,
  type JointLikelihoodResult,
} from "../statistics/JointLikelihood";

export type ResearchRunState =
  | "CREATED"
  | "CONFIGURED"
  | "BLINDED"
  | "ANALYSIS_READY"
  | "RUNNING"
  | "ANALYZED"
  | "UNBLIND_REQUESTED"
  | "UNBLINDED"
  | "REPLICATED"
  | "GATED"
  | "REJECTED";

export type ResearchDataState = "SIMULATED" | "CONTROL" | "OBSERVED" | "PENDING";

export interface ResearchContract {
  contractHash: string;
  protocolVersion: string;
  hypothesisRegistryVersion: string;
  detectorConfigurationVersion: string;
  backgroundConfigurationVersion: string;
  calibrationVersion: string;
  statisticalMethodVersion: string;
  blindingRequired: boolean;
  frozen: boolean;
}

export interface ResearchRun {
  runId: string;
  createdAt: string;
  state: ResearchRunState;
  dataState: ResearchDataState;
  contract: ResearchContract;
  detectorIds: string[];
  hypothesisIds: string[];
  likelihoodResults: JointLikelihoodResult[];
  warnings: string[];
  provenanceComplete: boolean;
  synthetic: boolean;
}

const TRANSITIONS: Record<ResearchRunState, ResearchRunState[]> = {
  CREATED: ["CONFIGURED"],
  CONFIGURED: ["BLINDED", "ANALYSIS_READY"],
  BLINDED: ["ANALYSIS_READY"],
  ANALYSIS_READY: ["RUNNING"],
  RUNNING: ["ANALYZED", "REJECTED"],
  ANALYZED: ["UNBLIND_REQUESTED", "REPLICATED", "GATED", "REJECTED"],
  UNBLIND_REQUESTED: ["UNBLINDED", "REJECTED"],
  UNBLINDED: ["REPLICATED", "GATED", "REJECTED"],
  REPLICATED: ["GATED", "REJECTED"],
  GATED: [],
  REJECTED: [],
};

export function canTransition(from: ResearchRunState, to: ResearchRunState): boolean {
  return TRANSITIONS[from].includes(to);
}

export function transitionRun(run: ResearchRun, next: ResearchRunState): ResearchRun {
  if (!canTransition(run.state, next)) {
    throw new Error(`INVALID_RESEARCH_STATE_TRANSITION:${run.state}->${next}`);
  }
  return { ...run, state: next };
}

export function createResearchRun(
  contract: ResearchContract,
  dataState: ResearchDataState,
  detectorIds: string[],
  hypothesisIds: string[],
): ResearchRun {
  return {
    runId: `RUN-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
    state: "CREATED",
    dataState,
    contract,
    detectorIds,
    hypothesisIds,
    likelihoodResults: [],
    warnings: [],
    provenanceComplete: false,
    synthetic: dataState === "SIMULATED" || dataState === "CONTROL",
  };
}

export function prepareRun(run: ResearchRun): ResearchRun {
  let next = transitionRun(run, "CONFIGURED");
  if (next.contract.blindingRequired) next = transitionRun(next, "BLINDED");
  next = transitionRun(next, "ANALYSIS_READY");
  return next;
}

export function analyzeResearchRun(
  run: ResearchRun,
  modelsByHypothesis: Record<string, DetectorLikelihood[]>,
): ResearchRun {
  if (run.state !== "ANALYSIS_READY" && run.state !== "RUNNING") {
    throw new Error("RUN_NOT_ANALYSIS_READY");
  }
  if (run.dataState === "PENDING") throw new Error("PENDING_DATA_CANNOT_BE_ANALYZED");
  const running = run.state === "RUNNING" ? run : transitionRun(run, "RUNNING");
  const results: JointLikelihoodResult[] = [];
  const warnings = [...running.warnings];
  for (const hypothesisId of running.hypothesisIds) {
    const models = modelsByHypothesis[hypothesisId];
    if (!models) {
      warnings.push(`MISSING_MODEL:${hypothesisId}`);
      continue;
    }
    results.push(calculateJointLikelihood(models));
  }
  return { ...running, state: "ANALYZED", likelihoodResults: results, warnings };
}

export function assertDiscoveryEligibleData(run: ResearchRun): void {
  if (run.synthetic) throw new Error("SYNTHETIC_DATA_CANNOT_SUPPORT_DISCOVERY");
  if (run.dataState !== "OBSERVED") throw new Error("DISCOVERY_REQUIRES_OBSERVED_DATA");
}

export function discoveryEligibility(run: ResearchRun): { eligible: boolean; blockers: string[] } {
  const blockers: string[] = [];
  if (run.synthetic) blockers.push("SYNTHETIC_DATA_CANNOT_SUPPORT_DISCOVERY");
  if (run.dataState !== "OBSERVED") blockers.push("DISCOVERY_REQUIRES_OBSERVED_DATA");
  if (run.state !== "UNBLINDED" && run.state !== "REPLICATED") blockers.push("DATA_NOT_UNBLINDED");
  if (!run.contract.frozen) blockers.push("CONTRACT_NOT_FROZEN");
  if (!run.provenanceComplete) blockers.push("PROVENANCE_INCOMPLETE");
  return { eligible: blockers.length === 0, blockers };
}

export function requestUnblind(run: ResearchRun): ResearchRun {
  if (run.synthetic) {
    return { ...run, state: "REJECTED", warnings: [...run.warnings, "UNBLIND_BLOCKED_ON_SYNTHETIC"] };
  }
  return transitionRun(run, "UNBLIND_REQUESTED");
}
