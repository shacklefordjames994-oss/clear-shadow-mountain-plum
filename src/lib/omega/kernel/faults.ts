/*
 * Synthetic fault injection on EMIT-LUM-001.
 * ANOMALY != DISCOVERY
 * INJECTED LABEL != OBSERVATION
 * QUENCH TEMPLATE != CRYOSTAT
 * The kernel cannot trip real quench protection.
 */

import { fillLumi, runEmitLum001, type KernelMode } from "./experiment";

export const FAULT_IDS = [
  "NOMINAL",
  "QUAD_ERROR",
  "RF_SLIP",
  "QUENCH",
  "INSTRUMENT",
  "CORRELATED",
] as const;

export type FaultId = (typeof FAULT_IDS)[number];
export type AnomalyClass = "NOMINAL" | "KNOWN_FAULT" | "INSTRUMENT" | "UNEXPLAINED";

export interface FaultChannels {
  lumiRatio: number;
  betaRatio: number;
  crabRatio: number;
  sigmaRatio: number;
  tempK: number;
  quenchBit: boolean;
}

export interface FaultCase {
  id: FaultId;
  label: string;
  injected: string;
  channels: FaultChannels;
  klass: AnomalyClass;
  hypothesis: string;
  discoveryEligible: false;
  evidence: "SIMULATED";
  actuation: false;
}

export interface FaultSample {
  t: number;
  lumi: number;
  tempK: number;
}

const LABELS: Record<FaultId, string> = {
  NOMINAL: "Nominal collision",
  QUAD_ERROR: "Quadrupole gradient error",
  RF_SLIP: "Crab / RF phase slip",
  QUENCH: "Synthetic quench",
  INSTRUMENT: "Stuck quench bit",
  CORRELATED: "Correlated unknown",
};

export function blindFaultId(seed: number): FaultId {
  const n = Math.abs(Math.imul(seed | 0, 1103515245) + 12345) >>> 0;
  return FAULT_IDS[n % FAULT_IDS.length]!;
}

function channelsFor(id: FaultId, emitN: number, crab: number): FaultChannels {
  const base = runEmitLum001({
    emitN_m: emitN,
    crabFraction: crab,
    mode: "DISTRIBUTION",
    seed: 1,
  });
  if (id === "NOMINAL") {
    return { lumiRatio: 1, betaRatio: 1, crabRatio: 1, sigmaRatio: 1, tempK: 1.9, quenchBit: false };
  }
  if (id === "QUAD_ERROR") {
    const betaRatio = 1 / (1 - 0.15);
    return {
      lumiRatio: 1 / betaRatio,
      betaRatio,
      crabRatio: 1,
      sigmaRatio: Math.sqrt(betaRatio),
      tempK: 1.9,
      quenchBit: false,
    };
  }
  if (id === "RF_SLIP") {
    const slipped = runEmitLum001({
      emitN_m: emitN,
      crabFraction: crab * 0.35,
      mode: "DISTRIBUTION",
      seed: 1,
    });
    const lumiRatio = slipped.simulated.lumiE34 / Math.max(base.simulated.lumiE34, 1e-12);
    return {
      lumiRatio,
      betaRatio: 1,
      crabRatio: 0.35,
      sigmaRatio: 1,
      tempK: 1.9,
      quenchBit: false,
    };
  }
  if (id === "QUENCH") {
    return { lumiRatio: 0, betaRatio: 1, crabRatio: 1, sigmaRatio: 1, tempK: 9.5, quenchBit: true };
  }
  if (id === "INSTRUMENT") {
    return { lumiRatio: 1, betaRatio: 1, crabRatio: 1, sigmaRatio: 1, tempK: 1.9, quenchBit: true };
  }
  return { lumiRatio: 0.78, betaRatio: 1.02, crabRatio: 1, sigmaRatio: 1.01, tempK: 2.35, quenchBit: false };
}

export function classifyChannels(c: FaultChannels): { klass: AnomalyClass; hypothesis: string } {
  const near = (a: number, b: number, tol: number) => Math.abs(a - b) < tol;
  if (c.quenchBit && near(c.lumiRatio, 1, 0.03) && c.tempK < 2.2) {
    return {
      klass: "INSTRUMENT",
      hypothesis: "Quench bit is set. L, β*, and temperature are nominal. Treat as a stuck channel.",
    };
  }
  if (c.quenchBit && c.lumiRatio < 0.05 && c.tempK > 4) {
    return {
      klass: "KNOWN_FAULT",
      hypothesis: "Matches the synthetic quench template. A template is not a cryostat.",
    };
  }
  if (!c.quenchBit && c.betaRatio > 1.08 && c.tempK < 2.2 && c.lumiRatio < 0.95) {
    return {
      klass: "KNOWN_FAULT",
      hypothesis: "β* grew and L fell. Quadrupole-error template. Not a field map.",
    };
  }
  if (!c.quenchBit && c.crabRatio < 0.6 && c.betaRatio < 1.05 && c.lumiRatio < 0.98) {
    return {
      klass: "KNOWN_FAULT",
      hypothesis: "Crab fraction fell, β* did not. RF-slip template.",
    };
  }
  if (!c.quenchBit && near(c.lumiRatio, 1, 0.03) && c.tempK < 2.2 && c.betaRatio < 1.05) {
    return { klass: "NOMINAL", hypothesis: "Inside the toy collision envelope." };
  }
  return {
    klass: "UNEXPLAINED",
    hypothesis: "No single template fits. Unexplained is not new physics.",
  };
}

const INJECTED: Record<FaultId, string> = {
  NOMINAL: "Nothing was injected. The envelope is the reduced-order fill.",
  QUAD_ERROR: "Injector scaled β* by 1/(1−0.15). Round-beam L falls as 1/β*.",
  RF_SLIP: "Injector cut the crab fraction to 35% and recomputed overlap.",
  QUENCH: "Injector zeroed L and raised a toy temperature. Not a helium bath.",
  INSTRUMENT: "Injector set the quench bit and left the physics channels alone.",
  CORRELATED: "Injector dropped L to 78% and warmed the toy bath to 2.35 K. No template owns both.",
};

export function injectFault(id: FaultId, opts: { emitN: number; crab: number; mode: KernelMode; seed: number }): FaultCase {
  const channels = channelsFor(id, opts.emitN, opts.crab);
  const judged = classifyChannels(channels);
  return {
    id,
    label: LABELS[id],
    injected: INJECTED[id],
    channels,
    klass: judged.klass,
    hypothesis:
      opts.mode === "MACRO"
        ? `${judged.hypothesis} MACRO sampling was not used for the envelope.`
        : judged.hypothesis,
    discoveryEligible: false,
    evidence: "SIMULATED",
    actuation: false,
  };
}

export function faultSamples(id: FaultId, emitN: number, crab: number): FaultSample[] {
  const ratio = channelsFor(id, emitN, crab);
  const out: FaultSample[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    let lumi = fillLumi(t, emitN, crab);
    let tempK = 1.9;
    if (t >= 0.7) {
      lumi *= ratio.lumiRatio;
      tempK = ratio.tempK;
      if (id === "QUENCH") lumi = 0;
    }
    out.push({ t, lumi, tempK });
  }
  return out;
}
