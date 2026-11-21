/*
 * Reduced-order HL-LHC optics. Not MAD-X. Not a field map.
 * TWIN != MACHINE. DISTRIBUTION != MACROPARTICLE.
 */

import { RNG } from "../scinet/master";

export const KERNEL_VERSION = "5.0";

export const HL = {
  circumferenceM: 26658.883,
  energyGeV: 7000,
  protonMassGeV: 0.938272,
  bunchN: 2.2e11,
  nBunch: 2760,
  emitN_m: 2.5e-6,
  betaStarM: 0.15,
  sigmaZM: 0.09,
  crossingUrad: 250,
  c: 299792458,
} as const;

export const fRevHz = HL.c / HL.circumferenceM;
export const gammaRel = HL.energyGeV / HL.protonMassGeV;

export type ElementKind =
  | "DRIFT"
  | "QUADRUPOLE"
  | "DIPOLE"
  | "RF_CAVITY"
  | "CRAB_CAVITY"
  | "COLLIMATOR"
  | "INTERACTION_POINT";

export interface LatticeElement {
  id: string;
  kind: ElementKind;
  sM: number;
  lengthM: number;
  k1: number;
  label: string;
}

export type Mat2 = [[number, number], [number, number]];

export interface Twiss {
  betaX: number;
  alphaX: number;
  emitX: number;
  betaY: number;
  alphaY: number;
  emitY: number;
}

export interface Macro {
  x: number;
  px: number;
  y: number;
  py: number;
  z: number;
  delta: number;
  w: number;
}

export function geometricEmit(emitN: number): number {
  return emitN / Math.max(gammaRel, 1);
}

export function gammaTwiss(beta: number, alpha: number): number {
  return (1 + alpha * alpha) / Math.max(beta, 1e-12);
}

export function sigmaFromTwiss(beta: number, emit: number): number {
  return Math.sqrt(Math.max(0, beta * emit));
}

export function mul(a: Mat2, b: Mat2): Mat2 {
  return [
    [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
    [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
  ];
}

export function driftM(l: number): Mat2 {
  return [
    [1, l],
    [0, 1],
  ];
}

export function quadM(k1l: number): Mat2 {
  return [
    [1, 0],
    [-k1l, 1],
  ];
}

export function transportTwiss(t: Twiss, mx: Mat2, my: Mat2): Twiss {
  const gx = gammaTwiss(t.betaX, t.alphaX);
  const gy = gammaTwiss(t.betaY, t.alphaY);
  const mapPlane = (beta: number, alpha: number, g: number, m: Mat2) => {
    const a = m[0][0];
    const b = m[0][1];
    const c = m[1][0];
    const d = m[1][1];
    return {
      beta: a * a * beta - 2 * a * b * alpha + b * b * g,
      alpha: -a * c * beta + (a * d + b * c) * alpha - b * d * g,
    };
  };
  const x = mapPlane(t.betaX, t.alphaX, gx, mx);
  const y = mapPlane(t.betaY, t.alphaY, gy, my);
  return { ...t, betaX: x.beta, alphaX: x.alpha, betaY: y.beta, alphaY: y.alpha };
}

export function toyLattice(): LatticeElement[] {
  const cells = 8;
  const cell = HL.circumferenceM / cells;
  const half = cell / 2;
  const out: LatticeElement[] = [];
  let s = 0;
  for (let i = 0; i < cells; i++) {
    const ip = i === 0 || i === 4;
    if (ip) {
      out.push({
        id: `IP${i === 0 ? 1 : 5}`,
        kind: "INTERACTION_POINT",
        sM: s,
        lengthM: 0,
        k1: 0,
        label: i === 0 ? "IP1 ATLAS" : "IP5 CMS",
      });
      out.push({
        id: `CRAB${i}`,
        kind: "CRAB_CAVITY",
        sM: s + 20,
        lengthM: 8,
        k1: 0,
        label: "crab",
      });
    }
    out.push({
      id: `QF${i}`,
      kind: "QUADRUPOLE",
      sM: s + 40,
      lengthM: 3.1,
      k1: 0.022,
      label: "QF",
    });
    out.push({
      id: `D${i}a`,
      kind: "DRIFT",
      sM: s + 50,
      lengthM: half - 80,
      k1: 0,
      label: "arc",
    });
    out.push({
      id: `B${i}`,
      kind: "DIPOLE",
      sM: s + half,
      lengthM: 14.3,
      k1: 0,
      label: "MB",
    });
    out.push({
      id: `QD${i}`,
      kind: "QUADRUPOLE",
      sM: s + half + 20,
      lengthM: 3.1,
      k1: -0.022,
      label: "QD",
    });
    out.push({
      id: `RF${i}`,
      kind: i === 3 ? "RF_CAVITY" : "DRIFT",
      sM: s + half + 40,
      lengthM: i === 3 ? 11 : 20,
      k1: 0,
      label: i === 3 ? "ACS" : "arc",
    });
    s += cell;
  }
  out.push({
    id: "COL",
    kind: "COLLIMATOR",
    sM: 420,
    lengthM: 1,
    k1: 0,
    label: "TCP",
  });
  return out.sort((a, b) => a.sM - b.sM);
}

export function ipTwiss(emitN: number, betaStar: number): Twiss {
  const e = geometricEmit(emitN);
  return {
    betaX: betaStar,
    alphaX: 0,
    emitX: e,
    betaY: betaStar,
    alphaY: 0,
    emitY: e,
  };
}

export function sampleBunch(twiss: Twiss, sigmaZ: number, n: number, seed: number, bunchN: number): Macro[] {
  const rng = new RNG(seed);
  const sx = sigmaFromTwiss(twiss.betaX, twiss.emitX);
  const sy = sigmaFromTwiss(twiss.betaY, twiss.emitY);
  const spx = Math.sqrt(Math.max(1e-24, twiss.emitX * gammaTwiss(twiss.betaX, twiss.alphaX)));
  const spy = Math.sqrt(Math.max(1e-24, twiss.emitY * gammaTwiss(twiss.betaY, twiss.alphaY)));
  const w = bunchN / Math.max(1, n);
  const macros: Macro[] = [];
  for (let i = 0; i < n; i++) {
    macros.push({
      x: rng.gaussian() * sx,
      px: rng.gaussian() * spx,
      y: rng.gaussian() * sy,
      py: rng.gaussian() * spy,
      z: rng.gaussian() * sigmaZ,
      delta: rng.gaussian() * 1.1e-4,
      w,
    });
  }
  return macros;
}

export function measuredSigma(macros: Macro[], axis: "x" | "y"): number {
  if (!macros.length) return 0;
  const w = macros.reduce((s, m) => s + m.w, 0);
  const mean = macros.reduce((s, m) => s + m.w * m[axis], 0) / w;
  const var_ = macros.reduce((s, m) => s + m.w * (m[axis] - mean) ** 2, 0) / w;
  return Math.sqrt(Math.max(0, var_));
}
