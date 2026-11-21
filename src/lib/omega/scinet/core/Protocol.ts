/*
 * Frozen analysis protocol / blind box.
 * Uses ResearchRun. Does not mint observations.
 *
 * FROZEN != OBSERVED
 * PEEKED_BEFORE_FREEZE != BLIND
 * UNBLIND_BLOCKED_ON_SYNTHETIC
 */

import { hashObject } from "../../hash";
import {
  createResearchRun,
  prepareRun,
  requestUnblind,
  type ResearchRunState,
} from "./ResearchRun";

export type ProtocolState = "DRAFT" | "BLINDED" | "UNBLIND_REJECTED";

export interface ProtocolSpec {
  systemId: string;
  generator: string;
  eventCount: number;
  seed: number;
}

export interface AnalysisProtocol {
  protocolId: string;
  state: ProtocolState;
  frozen: boolean;
  frozenAt: string | null;
  contractHash: string;
  method: string;
  systemId: string;
  generator: string;
  eventCount: number;
  seed: number;
  statisticalMethod: string;
  injectedMuGrid: number[];
  blindingRequired: true;
  peekedBeforeFreeze: boolean;
  dataState: "SIMULATED";
  research: {
    runId: string;
    state: ResearchRunState;
    dataState: "SIMULATED";
    synthetic: true;
    frozen: boolean;
  };
  unblindBlocked: true;
  unblindReason: string;
  discoveryEligible: false;
  note: string;
}

const METHOD = "profiled-joint-poisson + asimov-expected-cls-toy";
const STAT = "profile-v9+asimov-v11";
const VERSION = "DHC-TWIN-v12";

function makeRun(contractHash: string, frozen: boolean) {
  return createResearchRun(
    {
      contractHash,
      protocolVersion: VERSION,
      hypothesisRegistryVersion: "H_SHAPE",
      detectorConfigurationVersion: "ATLAS-eta",
      backgroundConfigurationVersion: "GEN_A",
      calibrationVersion: "ATLAS_PO_LITERATURE",
      statisticalMethodVersion: STAT,
      blindingRequired: true,
      frozen,
    },
    "SIMULATED",
    ["ATLAS-eta"],
    ["H_SHAPE"],
  );
}

export function draftProtocol(spec: ProtocolSpec): AnalysisProtocol {
  const payload = {
    ...spec,
    method: METHOD,
    protocolVersion: VERSION,
    statisticalMethodVersion: STAT,
  };
  const contractHash = hashObject(payload);
  const run = makeRun(contractHash, false);
  return {
    protocolId: `PROT-${contractHash.slice(0, 12)}`,
    state: "DRAFT",
    frozen: false,
    frozenAt: null,
    contractHash,
    method: METHOD,
    ...spec,
    statisticalMethod: STAT,
    injectedMuGrid: [0, 0.5, 1, 1.5, 2],
    blindingRequired: true,
    peekedBeforeFreeze: false,
    dataState: "SIMULATED",
    research: {
      runId: run.runId,
      state: run.state,
      dataState: "SIMULATED",
      synthetic: true,
      frozen: false,
    },
    unblindBlocked: true,
    unblindReason: "UNBLIND_NOT_REQUESTED",
    discoveryEligible: false,
    note: "Draft protocol. Freeze before claiming a blind analysis. FROZEN != OBSERVED.",
  };
}

export function freezeProtocol(protocol: AnalysisProtocol, peeked: boolean): AnalysisProtocol {
  const peekedBeforeFreeze = protocol.peekedBeforeFreeze || peeked;
  if (protocol.frozen) {
    return { ...protocol, peekedBeforeFreeze };
  }
  const prepared = prepareRun(makeRun(protocol.contractHash, true));
  return {
    ...protocol,
    state: "BLINDED",
    frozen: true,
    frozenAt: new Date().toISOString(),
    peekedBeforeFreeze,
    research: {
      runId: prepared.runId,
      state: prepared.state,
      dataState: "SIMULATED",
      synthetic: true,
      frozen: true,
    },
    unblindReason: "SYNTHETIC_DATA_CANNOT_BE_UNBLINDED",
    discoveryEligible: false,
    note: peekedBeforeFreeze
      ? "Frozen after peek. PEEKED_BEFORE_FREEZE. Blindness cannot be claimed. Still SIMULATED."
      : "Protocol frozen. Asimov controls remain allowed. Unblind of synthetic is blocked. FROZEN != OBSERVED.",
  };
}

export function requestProtocolUnblind(protocol: AnalysisProtocol): AnalysisProtocol {
  if (!protocol.frozen) {
    return {
      ...protocol,
      unblindReason: "CONTRACT_NOT_FROZEN",
      note: "Cannot unblind a draft. Freeze first. Unblind of synthetic still fails.",
    };
  }
  const rejected = requestUnblind(prepareRun(makeRun(protocol.contractHash, true)));
  return {
    ...protocol,
    state: "UNBLIND_REJECTED",
    research: {
      runId: rejected.runId,
      state: rejected.state,
      dataState: "SIMULATED",
      synthetic: true,
      frozen: true,
    },
    unblindBlocked: true,
    unblindReason: "UNBLIND_BLOCKED_ON_SYNTHETIC",
    discoveryEligible: false,
    note: "Unblind refused. This package is SIMULATED. UNBLIND != OBSERVATION. FROZEN != OBSERVED.",
  };
}

export function protocolBlockers(protocol: AnalysisProtocol): string[] {
  const out = [
    "FROZEN_PROTOCOL_IS_NOT_AN_OBSERVATION",
    "UNBLIND_BLOCKED_ON_SYNTHETIC",
  ];
  if (!protocol.frozen) out.push("CONTRACT_NOT_FROZEN");
  if (protocol.peekedBeforeFreeze) out.push("PEEKED_BEFORE_FREEZE");
  if (protocol.state === "UNBLIND_REJECTED") out.push("UNBLIND_REJECTED_SYNTHETIC");
  return out;
}
