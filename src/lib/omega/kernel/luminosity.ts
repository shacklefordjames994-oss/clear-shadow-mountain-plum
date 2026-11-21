/*
 * Reduced-order luminosity. Not a validated HL-LHC operational model.
 * L is calculated from simulated beam size, not typed in as an output.
 * TWIN != MACHINE. LUMINOSITY != MEASUREMENT.
 */

import { HL, fRevHz, sigmaFromTwiss, type Twiss } from "./optics";

export interface CollisionGeom {
  crossingUrad: number;
  crabFraction: number;
  sigmaZM: number;
}

export interface LumiResult {
  sigmaXM: number;
  sigmaYM: number;
  overlapF: number;
  lumiM2s: number;
  lumiE34: number;
  rateHz: number;
  evidence: "SIMULATED";
  note: string;
}

export function crossingF(sigmaX: number, geom: CollisionGeom): number {
  const phi = (geom.crossingUrad * 1e-6) * (1 - Math.min(1, Math.max(0, geom.crabFraction)));
  const arg = (phi * geom.sigmaZM) / (2 * Math.max(sigmaX, 1e-12));
  return 1 / Math.sqrt(1 + arg * arg);
}

export function luminosityFromSigmas(
  sigmaX: number,
  sigmaY: number,
  bunchN: number,
  nBunch: number,
  geom: CollisionGeom,
): LumiResult {
  const F = crossingF(sigmaX, geom);
  const denom = 4 * Math.PI * Math.max(sigmaX * sigmaY, 1e-24);
  const lumiM2s = (nBunch * fRevHz * bunchN * bunchN * F) / denom;
  const lumiE34 = lumiM2s / 1e38;
  return {
    sigmaXM: sigmaX,
    sigmaYM: sigmaY,
    overlapF: F,
    lumiM2s,
    lumiE34,
    rateHz: lumiM2s * 80e-31,
    evidence: "SIMULATED",
    note: "Gaussian round-beam + Piwinski F. Reduced-order. Not a machine measurement.",
  };
}

export function hourglassF(betaStarM: number, sigmaZM: number): number {
  const a = sigmaZM / (2 * Math.max(betaStarM, 1e-9));
  return 1 / Math.sqrt(1 + a * a);
}

export function luminosityFromTwiss(twiss: Twiss, bunchN: number, nBunch: number, geom: CollisionGeom): LumiResult {
  return luminosityFromSigmas(
    sigmaFromTwiss(twiss.betaX, twiss.emitX),
    sigmaFromTwiss(twiss.betaY, twiss.emitY),
    bunchN,
    nBunch,
    geom,
  );
}

/** MODEL_B: Piwinski × hourglass. Not a second machine. MODEL_A != MODEL_B != MEASUREMENT. */
export function luminosityModelB(twiss: Twiss, bunchN: number, nBunch: number, geom: CollisionGeom): LumiResult {
  const a = luminosityFromTwiss(twiss, bunchN, nBunch, geom);
  const hg = hourglassF(twiss.betaX, geom.sigmaZM);
  const lumiM2s = a.lumiM2s * hg;
  return {
    ...a,
    overlapF: a.overlapF * hg,
    lumiM2s,
    lumiE34: lumiM2s / 1e38,
    rateHz: lumiM2s * 80e-31,
    note: "MODEL_B = Piwinski × hourglass. Reduced-order disagreement is not a discovery.",
  };
}

export const DEFAULT_GEOM: CollisionGeom = {
  crossingUrad: HL.crossingUrad,
  crabFraction: 0.85,
  sigmaZM: HL.sigmaZM,
};
