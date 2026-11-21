/*
 * EMIT-LUM-001 — golden luminosity vs emittance experiment.
 * DISTRIBUTION mode must match the analytical envelope.
 * MACRO mode carries sampling noise. Neither is a measurement.
 *
 * SIMULATION != OBSERVATION
 * ANALYTICAL != VALIDATED MACHINE
 * external_control = false
 */

import {
  HL,
  geometricEmit,
  ipTwiss,
  measuredSigma,
  sampleBunch,
  sigmaFromTwiss,
} from "./optics";
import { DEFAULT_GEOM, luminosityFromSigmas, luminosityFromTwiss, type CollisionGeom, type LumiResult } from "./luminosity";

export type KernelMode = "DISTRIBUTION" | "MACRO";

export interface KernelRun {
  experimentId: "EMIT-LUM-001";
  emitN_m: number;
  betaStarM: number;
  crabFraction: number;
  mode: KernelMode;
  seed: number;
  macros: number;
  analytic: LumiResult;
  simulated: LumiResult;
  residual: number;
  goldenPass: boolean;
  externalControl: false;
  discoveryEligible: false;
  evidence: "SIMULATED";
}

export interface SweepPoint {
  emitN_m: number;
  analyticE34: number;
  simulatedE34: number;
  sigmaUM: number;
}

export function analyticLumi(emitN: number, geom: CollisionGeom): LumiResult {
  return luminosityFromTwiss(ipTwiss(emitN, HL.betaStarM), HL.bunchN, HL.nBunch, geom);
}

export function runEmitLum001(opts: {
  emitN_m: number;
  crabFraction: number;
  mode: KernelMode;
  seed: number;
  macros?: number;
}): KernelRun {
  const geom: CollisionGeom = { ...DEFAULT_GEOM, crabFraction: opts.crabFraction };
  const twiss = ipTwiss(opts.emitN_m, HL.betaStarM);
  const analytic = luminosityFromTwiss(twiss, HL.bunchN, HL.nBunch, geom);
  let simulated = analytic;
  if (opts.mode === "MACRO") {
    const bunch = sampleBunch(twiss, HL.sigmaZM, opts.macros ?? 400, opts.seed, HL.bunchN);
    simulated = luminosityFromSigmas(
      measuredSigma(bunch, "x"),
      measuredSigma(bunch, "y"),
      HL.bunchN,
      HL.nBunch,
      geom,
    );
  }
  const residual = Math.abs(simulated.lumiE34 - analytic.lumiE34) / Math.max(analytic.lumiE34, 1e-12);
  const goldenPass = opts.mode === "DISTRIBUTION" ? residual < 1e-9 : residual < 0.25;
  return {
    experimentId: "EMIT-LUM-001",
    emitN_m: opts.emitN_m,
    betaStarM: HL.betaStarM,
    crabFraction: opts.crabFraction,
    mode: opts.mode,
    seed: opts.seed,
    macros: opts.macros ?? 400,
    analytic,
    simulated,
    residual,
    goldenPass,
    externalControl: false,
    discoveryEligible: false,
    evidence: "SIMULATED",
  };
}

export function sweepEmittance(opts: { crabFraction: number; mode: KernelMode; seed: number }): SweepPoint[] {
  const emits = [1.5e-6, 2.0e-6, 2.5e-6, 3.0e-6, 3.5e-6];
  return emits.map((emitN_m) => {
    const run = runEmitLum001({ ...opts, emitN_m });
    return {
      emitN_m,
      analyticE34: run.analytic.lumiE34,
      simulatedE34: run.simulated.lumiE34,
      sigmaUM: run.simulated.sigmaXM * 1e6,
    };
  });
}

export function sensitivityLumi(emitN: number, crab: number): number {
  const h = emitN * 0.04;
  const up = runEmitLum001({ emitN_m: emitN + h, crabFraction: crab, mode: "DISTRIBUTION", seed: 1 });
  const dn = runEmitLum001({ emitN_m: emitN - h, crabFraction: crab, mode: "DISTRIBUTION", seed: 1 });
  return (up.simulated.lumiE34 - dn.simulated.lumiE34) / (2 * h);
}

export function fillPhase(t: number): "EMPTY" | "INJECTING" | "RAMPING" | "SQUEEZING" | "COLLISION" | "DUMPED" {
  if (t < 0.08) return "EMPTY";
  if (t < 0.28) return "INJECTING";
  if (t < 0.48) return "RAMPING";
  if (t < 0.68) return "SQUEEZING";
  if (t < 0.92) return "COLLISION";
  return "DUMPED";
}

export function fillLumi(t: number, emitN: number, crab: number): number {
  const phase = fillPhase(t);
  if (phase === "EMPTY" || phase === "DUMPED") return 0;
  const pop = phase === "INJECTING" ? Math.max(0.05, (t - 0.08) / 0.2) : 1;
  const beta = phase === "SQUEEZING" ? 0.55 - 0.4 * ((t - 0.48) / 0.2) : phase === "COLLISION" ? 0.15 : 0.55;
  const geom: CollisionGeom = { ...DEFAULT_GEOM, crabFraction: phase === "COLLISION" ? crab : 0 };
  const e = geometricEmit(emitN);
  const sx = sigmaFromTwiss(beta, e);
  return luminosityFromSigmas(sx, sx, HL.bunchN * pop, HL.nBunch, geom).lumiE34;
}
