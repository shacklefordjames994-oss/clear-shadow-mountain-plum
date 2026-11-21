/*
 * Kernel reproducibility capsule.
 * CAPSULE != OBSERVATION
 * REPLAY != INDEPENDENT EXPERIMENT
 * HASH MATCH != VALIDATION
 */

import { hashObject } from "../hash";
import { conveneSwarm, type SwarmRound, type SwarmVote } from "./swarm";
import { runEmitLum001, type KernelMode, type KernelRun } from "./experiment";
import type { KnowledgeState } from "./design";

export const CAPSULE_SCHEMA = "CERN-KERNEL-v19" as const;

export interface KernelCapsule {
  schema: typeof CAPSULE_SCHEMA;
  experimentId: "EMIT-LUM-001";
  seed: number;
  emitN_m: number;
  crabFraction: number;
  mode: KernelMode;
  lumiE34: number;
  residual: number;
  goldenPass: boolean;
  knowledgeVersion: number;
  votes: Record<SwarmVote, number>;
  consensus: boolean;
  dissent: string[];
  contentHash: string;
  evidence: "SIMULATED";
  discoveryEligible: false;
  externalControl: false;
  note: string;
}

export interface ReplayReport {
  hashOk: boolean;
  lumiMatch: boolean;
  swarmMatch: boolean;
  match: boolean;
  mismatches: string[];
  replayedLumi: number;
}

function payload(c: Omit<KernelCapsule, "contentHash">): Omit<KernelCapsule, "contentHash"> {
  return c;
}

export function sealKernelCapsule(opts: {
  run: KernelRun;
  knowledge: KnowledgeState;
  emitN: number;
  crab: number;
  mode: KernelMode;
  seed: number;
  round?: SwarmRound | null;
}): KernelCapsule {
  const round =
    opts.round ??
    conveneSwarm({
      run: opts.run,
      knowledge: opts.knowledge,
      emitN: opts.emitN,
      crab: opts.crab,
      mode: opts.mode,
      seed: opts.seed,
    });
  const body = payload({
    schema: CAPSULE_SCHEMA,
    experimentId: "EMIT-LUM-001",
    seed: opts.seed,
    emitN_m: opts.emitN,
    crabFraction: opts.crab,
    mode: opts.mode,
    lumiE34: opts.run.simulated.lumiE34,
    residual: opts.run.residual,
    goldenPass: opts.run.goldenPass,
    knowledgeVersion: opts.knowledge.version,
    votes: round.votes,
    consensus: round.consensus,
    dissent: round.claims.filter((c) => c.vote === "DISSENT" || c.vote === "DENY").map((c) => c.role),
    evidence: "SIMULATED",
    discoveryEligible: false,
    externalControl: false,
    note: "Sealed sandbox. Replay is the same seed, not another laboratory.",
  });
  return { ...body, contentHash: hashObject(body) };
}

export function replayKernelCapsule(capsule: KernelCapsule, knowledge: KnowledgeState): ReplayReport {
  const run = runEmitLum001({
    emitN_m: capsule.emitN_m,
    crabFraction: capsule.crabFraction,
    mode: capsule.mode,
    seed: capsule.seed,
  });
  const round = conveneSwarm({
    run,
    knowledge,
    emitN: capsule.emitN_m,
    crab: capsule.crabFraction,
    mode: capsule.mode,
    seed: capsule.seed,
  });
  const { contentHash: _drop, ...rest } = capsule;
  const hashOk = hashObject(rest) === capsule.contentHash;
  const lumiMatch = Math.abs(run.simulated.lumiE34 - capsule.lumiE34) < 1e-9;
  const swarmMatch =
    round.votes.DISSENT === capsule.votes.DISSENT &&
    round.votes.DENY === capsule.votes.DENY &&
    round.consensus === capsule.consensus;
  const mismatches: string[] = [];
  if (!hashOk) mismatches.push("HASH");
  if (!lumiMatch) mismatches.push("LUMI");
  if (!swarmMatch) mismatches.push("SWARM");
  return {
    hashOk,
    lumiMatch,
    swarmMatch,
    match: hashOk && lumiMatch && swarmMatch,
    mismatches,
    replayedLumi: run.simulated.lumiE34,
  };
}

export function tamperCapsule(capsule: KernelCapsule): KernelCapsule {
  return { ...capsule, seed: capsule.seed + 1 };
}
