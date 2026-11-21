/*
 * Bounded scientific swarm. Agents disagree on purpose.
 * SWARM != AUTHORITY
 * CONSENSUS != VALIDATION
 * REPRODUCTION != INDEPENDENT EXPERIMENT
 * REPORT != DISCOVERY
 */

import { runEmitLum001, type KernelMode, type KernelRun } from "./experiment";
import { pairAt, type KnowledgeState } from "./design";

export const SWARM_ROLES = [
  "PLANNER",
  "PHYSICS",
  "NUMERICAL",
  "EXPERIMENT",
  "SIMULATION",
  "DATA",
  "FALSIFIER",
  "REPRODUCTION",
  "SECURITY",
  "EVIDENCE",
  "REPORTER",
] as const;

export type SwarmRole = (typeof SWARM_ROLES)[number];
export type SwarmVote = "PROCEED" | "HOLD" | "DISSENT" | "DENY";

export interface SwarmClaim {
  role: SwarmRole;
  vote: SwarmVote;
  claim: string;
}

export interface SwarmRound {
  id: string;
  seed: number;
  reproductionMatch: boolean;
  residualA: number;
  residualB: number;
  disagreement: number;
  votes: Record<SwarmVote, number>;
  claims: SwarmClaim[];
  consensus: boolean;
  authorization: "HUMAN_REQUIRED";
  discoveryEligible: false;
  evidence: "SIMULATED";
  report: string;
}

export function conveneSwarm(opts: {
  run: KernelRun;
  knowledge: KnowledgeState;
  emitN: number;
  crab: number;
  mode: KernelMode;
  seed: number;
}): SwarmRound {
  const replay = runEmitLum001({
    emitN_m: opts.emitN,
    crabFraction: opts.crab,
    mode: opts.mode,
    seed: opts.seed,
  });
  const reproductionMatch =
    Math.abs(replay.simulated.lumiE34 - opts.run.simulated.lumiE34) < 1e-12 && replay.seed === opts.seed;
  const pair = pairAt(opts.emitN, opts.crab);
  const claims: SwarmClaim[] = [
    {
      role: "PLANNER",
      vote: "HOLD",
      claim: "Decompose EMIT-LUM-001 into envelope, crab lock, and MACRO noise. Do not skip the human gate.",
    },
    {
      role: "PHYSICS",
      vote: "PROCEED",
      claim: "MODEL_A is the Gaussian identity. Hourglass is a correction, not a new interaction.",
    },
    {
      role: "NUMERICAL",
      vote: "DISSENT",
      claim: "DISTRIBUTION is too clean. MACRO sampling is the honest residual. PHYSICS is overconfident.",
    },
    {
      role: "EXPERIMENT",
      vote: "PROCEED",
      claim: `Peak |A−B| is ${(pair.d).toFixed(2)}e34. ED-LUM-DISC is the informative cell — still a proposal.`,
    },
    {
      role: "SIMULATION",
      vote: "HOLD",
      claim: "Sandbox class is ready. No quadrupole current. Waiting for human Authorize.",
    },
    {
      role: "DATA",
      vote: "HOLD",
      claim: `L_A=${pair.a.toFixed(2)}e34 L_B=${pair.b.toFixed(2)}e34. Numbers are SIMULATED.`,
    },
    {
      role: "FALSIFIER",
      vote: "DISSENT",
      claim: "H1 is not established. A slope vs εn is the toy identity, not a beam-effect discovery.",
    },
    {
      role: "REPRODUCTION",
      vote: reproductionMatch ? "PROCEED" : "DISSENT",
      claim: reproductionMatch
        ? `Same seed ${opts.seed} replayed. Self-consistency, not an independent lab.`
        : "Replay mismatch. Stop. Do not paper over the seed.",
    },
    {
      role: "SECURITY",
      vote: "DENY",
      claim: "external_control false. PHYSICAL_ACTUATOR_CONTROL denied. SCI:DISC denied. SWARM != AUTHORITY.",
    },
    {
      role: "EVIDENCE",
      vote: "HOLD",
      claim: `Knowledge v${opts.knowledge.version}. Provenance is SIMULATED. No claim is OBSERVED.`,
    },
    {
      role: "REPORTER",
      vote: "HOLD",
      claim: "Record the dissent. Do not flatten it. The report is a sandbox artifact, not a paper.",
    },
  ];
  const votes: Record<SwarmVote, number> = { PROCEED: 0, HOLD: 0, DISSENT: 0, DENY: 0 };
  for (const c of claims) votes[c.vote] += 1;
  const consensus = votes.DISSENT === 0 && votes.DENY === 0;
  return {
    id: `SWARM-${opts.seed}`,
    seed: opts.seed,
    reproductionMatch,
    residualA: opts.run.residual,
    residualB: replay.residual,
    disagreement: pair.d,
    votes,
    claims,
    consensus,
    authorization: "HUMAN_REQUIRED",
    discoveryEligible: false,
    evidence: "SIMULATED",
    report: consensus
      ? "Illegal: a scientific swarm without dissent is a rubber stamp. Rebuild the falsifier."
      : `Dissent is live (${votes.DISSENT} DISSENT, ${votes.DENY} DENY, ${votes.HOLD} HOLD, ${votes.PROCEED} PROCEED). Consensus is not validation. Human review remains the gate.`,
  };
}
