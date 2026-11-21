/*
 * Asimov expected sensitivity + toy CLs.
 * Reuses scanProfile. Does not mint observations or exclusions.
 *
 * ASIMOV != DATA
 * EXPECTED != OBSERVED
 * CLS_TOY != EXCLUSION
 */

import { scanProfile, type ProfileBin, type ProfileScan } from "./ProfileLikelihood";

export interface CLsPoint {
  mu: number;
  qExp: number;
  clsToy: number;
}

export interface AsimovResult {
  method: "asimov-expected-cls-toy";
  injectedMu: number;
  expectedMuHat: number;
  expectedQ0: number;
  expectedZ: number;
  mu95Toy: number | null;
  cls: CLsPoint[];
  profile: ProfileScan;
  observedState: "ASIMOV";
  discoveryEligible: false;
  note: string;
}

export function makeAsimovBins(bins: ProfileBin[], injectedMu: number): ProfileBin[] {
  return bins.map((b) => ({
    ...b,
    observed: Math.max(0, b.background + injectedMu * b.signal),
  }));
}

/** Toy CLs proxy. Not the LHC CLs prescription. */
export function clsToyFromQ(q: number): number {
  if (!Number.isFinite(q) || q < 0) return 1;
  return Math.exp(-0.5 * q);
}

export function scanAsimov(bins: ProfileBin[], litRelativeUnc: number, injectedMu: number): AsimovResult {
  const muInj = Math.max(0, Math.min(2.4, injectedMu));
  const profile = scanProfile(makeAsimovBins(bins, muInj), litRelativeUnc);
  const cls: CLsPoint[] = profile.points.map((p) => ({
    mu: p.mu,
    qExp: p.q,
    clsToy: clsToyFromQ(p.q),
  }));
  let mu95Toy: number | null = null;
  for (const p of cls) {
    if (p.mu <= profile.muHat + 1e-9) continue;
    if (p.clsToy < 0.05) {
      mu95Toy = p.mu;
      break;
    }
  }
  return {
    method: "asimov-expected-cls-toy",
    injectedMu: muInj,
    expectedMuHat: profile.muHat,
    expectedQ0: profile.q0,
    expectedZ: profile.approxZ,
    mu95Toy,
    cls,
    profile,
    observedState: "ASIMOV",
    discoveryEligible: false,
    note: "Asimov replaces bin counts with the expected yield at the injected μ. EXPECTED != OBSERVED. CLs toy is not an LHC exclusion. ASIMOV != DATA.",
  };
}
