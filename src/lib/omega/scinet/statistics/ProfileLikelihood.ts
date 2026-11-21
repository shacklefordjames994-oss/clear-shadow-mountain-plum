/*
 * SCI-NETv2 profiled likelihood + toy covariance.
 * Uses JointLikelihood. Does not reimplement Poisson.
 *
 * q(μ) and approximate Z are sandbox diagnostics.
 * Profiled synthetic data is not a discovery.
 */

import {
  approximateZ,
  calculateJointLikelihood,
  type DetectorLikelihood,
  type JointBin,
} from "./JointLikelihood";

export interface ProfileBin {
  lo: number;
  hi: number;
  observed: number;
  background: number;
  signal: number;
}

export interface NuisancePoint {
  lumi: number;
  etaScale: number;
  litCal: number;
}

export interface ProfilePoint {
  mu: number;
  logL: number;
  q: number;
  theta: NuisancePoint;
}

export interface ProfileScan {
  method: "profiled-joint-poisson";
  names: string[];
  sigma: Record<string, number>;
  matrix: number[][];
  points: ProfilePoint[];
  muHat: number;
  logLHat: number;
  q0: number;
  approxZ: number;
  clsToy: number;
  bestTheta: NuisancePoint;
  observedState: "LITERATURE";
  expectedState: "SCI:SIMULATED";
  discoveryEligible: false;
  note: string;
}

export function toyCovariance(litRelativeUnc: number): {
  names: string[];
  sigma: Record<string, number>;
  matrix: number[][];
} {
  const sL = 0.05;
  const sE = 0.03;
  const sC = Math.max(0.02, Math.min(0.12, litRelativeUnc));
  const rLE = 0.4;
  const rLC = 0.2;
  const rEC = 0.15;
  return {
    names: ["lumi", "etaScale", "litCal"],
    sigma: { lumi: sL, etaScale: sE, litCal: sC },
    matrix: [
      [sL * sL, rLE * sL * sE, rLC * sL * sC],
      [rLE * sL * sE, sE * sE, rEC * sE * sC],
      [rLC * sL * sC, rEC * sE * sC, sC * sC],
    ],
  };
}

function binsAt(mu: number, bins: ProfileBin[], theta: NuisancePoint): JointBin[] {
  return bins.map((b) => {
    const c = (b.lo + b.hi) / 2;
    const tilt = 1 + (theta.etaScale - 1) * (c / 2.5);
    const efficiency = Math.max(1e-6, theta.lumi * theta.litCal * tilt);
    return {
      detectorId: "ATLAS-eta",
      energyMinKeV: b.lo,
      energyMaxKeV: b.hi,
      observed: Math.max(0, Math.round(b.observed)),
      signalExpected: b.signal,
      backgroundExpected: Math.max(1e-6, b.background),
      efficiency,
    };
  });
}

function modelAt(
  mu: number,
  bins: ProfileBin[],
  theta: NuisancePoint,
  cov: ReturnType<typeof toyCovariance>,
): DetectorLikelihood {
  return {
    detectorId: "ATLAS-eta",
    hypothesisId: "H_SHAPE",
    signalStrength: mu,
    backgroundScale: 1,
    bins: binsAt(mu, bins, theta),
    constraints: [
      { name: "lumi", value: theta.lumi, nominal: 1, sigma: cov.sigma.lumi },
      { name: "etaScale", value: theta.etaScale, nominal: 1, sigma: cov.sigma.etaScale },
      { name: "litCal", value: theta.litCal, nominal: 1, sigma: cov.sigma.litCal },
    ],
    correlatedNuisance: { names: cov.names, covariance: cov.matrix },
  };
}

function profileTheta(mu: number, bins: ProfileBin[], cov: ReturnType<typeof toyCovariance>): {
  logL: number;
  theta: NuisancePoint;
} {
  const steps = [-1, 0, 1];
  let best = Number.NEGATIVE_INFINITY;
  let theta: NuisancePoint = { lumi: 1, etaScale: 1, litCal: 1 };
  for (const nl of steps) {
    for (const ne of steps) {
      for (const nc of steps) {
        const cand: NuisancePoint = {
          lumi: 1 + nl * cov.sigma.lumi,
          etaScale: 1 + ne * cov.sigma.etaScale,
          litCal: 1 + nc * cov.sigma.litCal,
        };
        const result = calculateJointLikelihood([modelAt(mu, bins, cand, cov)]);
        if (result.logLikelihood > best) {
          best = result.logLikelihood;
          theta = cand;
        }
      }
    }
  }
  return { logL: best, theta };
}

export function scanProfile(bins: ProfileBin[], litRelativeUnc: number): ProfileScan {
  const cov = toyCovariance(litRelativeUnc);
  const mus: number[] = [];
  for (let mu = 0; mu <= 2.4 + 1e-9; mu += 0.2) mus.push(Number(mu.toFixed(2)));

  const raw = mus.map((mu) => {
    const fit = profileTheta(mu, bins, cov);
    return { mu, logL: fit.logL, theta: fit.theta };
  });

  const hat = raw.reduce((a, b) => (b.logL > a.logL ? b : a), raw[0]);
  const points: ProfilePoint[] = raw.map((p) => ({
    mu: p.mu,
    logL: p.logL,
    q: Number.isFinite(hat.logL) && Number.isFinite(p.logL) ? Math.max(0, -2 * (p.logL - hat.logL)) : Number.NaN,
    theta: p.theta,
  }));

  const at0 = points.find((p) => p.mu === 0);
  const at1 = points.find((p) => p.mu === 1);
  const q0 = at0?.q ?? Number.NaN;
  const q1 = at1?.q ?? Number.NaN;
  const z = approximateZ(q0);

  return {
    method: "profiled-joint-poisson",
    names: cov.names,
    sigma: cov.sigma,
    matrix: cov.matrix,
    points,
    muHat: hat.mu,
    logLHat: hat.logL,
    q0,
    approxZ: Number.isFinite(z) ? z : 0,
    clsToy: Number.isFinite(q1) && Number.isFinite(q0) ? q1 / (q1 + q0 + 1e-9) : Number.NaN,
    bestTheta: hat.theta,
    observedState: "LITERATURE",
    expectedState: "SCI:SIMULATED",
    discoveryEligible: false,
    note: "μ=0 is GEN_A, μ=1 is GEN_B. Observed bins are a rate-matched literature shape, not this twin’s dataset. q(μ) is a diagnostic. PROFILE != DISCOVERY.",
  };
}
