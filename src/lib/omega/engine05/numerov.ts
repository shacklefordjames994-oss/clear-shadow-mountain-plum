/** Browser port of the fixed-step SQRT-01 Numerov reference. Not a measurement. */

export const HBAR_J_S = 1.054571817e-34;
export const U_KG = 1.6605390666e-27;
export const EV_J = 1.602176634e-19;
export const ENGINE05_NAME = "SQRT-01 Engine 05";
export const ENGINE05_VERSION = "05-E";

export type GaussianModel = {
  muU: number;
  v0Ev: number;
  aPm: number;
  ell: number;
};

export const GAUSSIAN_BENCHMARK: GaussianModel = {
  muU: 0.5,
  v0Ev: 5,
  aPm: 100,
  ell: 0,
};

export type BoundState = {
  energyEv: number;
  epsilon: number;
  g: number;
  esEv: number;
  norm: number;
  meanRadiusPm: number;
  tailProbability: number;
  nodes: number;
  matchingResidual: number;
  hOverA: number;
  turningOverA: number;
  potentialEvaluations: number;
  nPoints: number;
  x: number[];
  u: number[];
  potentialEv: number[];
};

export function energyScales(model: GaussianModel): { esEv: number; g: number } {
  const mu = model.muU * U_KG;
  const a = model.aPm * 1e-12;
  const esEv = HBAR_J_S ** 2 / (2 * mu * a * a) / EV_J;
  return { esEv, g: model.v0Ev / esEv };
}

function logDerivative(u: Float64Array, k: Float64Array, i: number, h: number): number | null {
  if (Math.abs(u[i]) < 1e-30) return null;
  const kPrime = (k[i + 1] - k[i - 1]) / (2 * h);
  const slope = (u[i + 1] - u[i - 1]) / (2 * h * u[i]);
  const numer = slope + (h * h * kPrime) / 6;
  const denom = 1 - (h * h * k[i]) / 6;
  if (Math.abs(denom) < 1e-14) return null;
  const value = numer / denom;
  return Number.isFinite(value) ? value : null;
}

function trapezoidOfSquares(y: ArrayLike<number>, x: ArrayLike<number>): number {
  let acc = 0;
  for (let i = 0; i < y.length - 1; i += 1) {
    acc += 0.5 * (y[i] * y[i] + y[i + 1] * y[i + 1]) * (x[i + 1] - x[i]);
  }
  return acc;
}

function countNodes(u: Float64Array): number {
  let previous = 0;
  let count = 0;
  for (let i = 1; i < u.length; i += 1) {
    const sign = Math.sign(u[i]);
    if (sign === 0) continue;
    if (previous !== 0 && sign !== previous) count += 1;
    previous = sign;
  }
  return count;
}

export function solveBoundState(
  model: GaussianModel,
  hOverA: number,
  rmaxOverA = 6,
  matchOverA = 0.17,
): BoundState {
  if (hOverA <= 0) throw new Error("hOverA must be positive");
  if (model.ell !== 0) throw new Error("Browser reference certifies ell = 0 only");
  const n = Math.round(rmaxOverA / hOverA);
  const m = Math.round(matchOverA / hOverA);
  if (n < 8 || m < 2 || m > n - 2) throw new Error("Grid cannot host the matching point");
  const { esEv, g } = energyScales(model);
  const x = new Float64Array(n + 1);
  for (let i = 0; i <= n; i += 1) x[i] = i * hOverA;
  let evaluations = 0;

  const integrate = (energyEv: number): { mismatch: number; ok: boolean; left: Float64Array; right: Float64Array } => {
    const left = new Float64Array(n + 1);
    const right = new Float64Array(n + 1);
    const eps = energyEv / esEv;
    if (eps >= 0) return { mismatch: Number.NaN, ok: false, left, right };
    const k = new Float64Array(n + 1);
    const f = new Float64Array(n + 1);
    for (let i = 0; i <= n; i += 1) {
      evaluations += 1;
      k[i] = eps + g * Math.exp(-x[i] * x[i]);
      f[i] = 1 + (hOverA * hOverA * k[i]) / 12;
    }
    left[1] = hOverA;
    for (let i = 1; i <= m; i += 1) {
      const denom = f[i + 1];
      if (Math.abs(denom) < 1e-14) return { mismatch: Number.NaN, ok: false, left, right };
      const next = ((12 - 10 * f[i]) * left[i] - f[i - 1] * left[i - 1]) / denom;
      if (!Number.isFinite(next)) return { mismatch: Number.NaN, ok: false, left, right };
      left[i + 1] = next;
    }
    const kappa = Math.sqrt(-eps);
    right[n] = 1;
    right[n - 1] = Math.exp(kappa * hOverA);
    for (let i = n - 1; i >= m; i -= 1) {
      const denom = f[i - 1];
      if (Math.abs(denom) < 1e-14) return { mismatch: Number.NaN, ok: false, left, right };
      const next = ((12 - 10 * f[i]) * right[i] - f[i + 1] * right[i + 1]) / denom;
      if (!Number.isFinite(next)) return { mismatch: Number.NaN, ok: false, left, right };
      right[i - 1] = next;
      if (Math.abs(next) > 1e8) {
        for (let j = i - 1; j <= n; j += 1) right[j] *= 1e-8;
      }
    }
    const dLeft = logDerivative(left, k, m, hOverA);
    const dRight = logDerivative(right, k, m, hOverA);
    if (dLeft === null || dRight === null) return { mismatch: Number.NaN, ok: false, left, right };
    let peak = 1e-30;
    for (let i = 1; i <= m + 1; i += 1) peak = Math.max(peak, Math.abs(left[i]));
    if (Math.abs(left[m]) < 1e-12 * peak) return { mismatch: Number.NaN, ok: false, left, right };
    return { mismatch: dLeft - dRight, ok: true, left, right };
  };

  let previousEnergy: number | null = null;
  let previousMismatch: number | null = null;
  let bracket: [number, number] | null = null;
  const samples = 160;
  for (let s = 0; s < samples; s += 1) {
    const energy = -model.v0Ev + 1e-4 + ((-1e-4 - (-model.v0Ev + 1e-4)) * s) / (samples - 1);
    const shot = integrate(energy);
    if (!shot.ok || !Number.isFinite(shot.mismatch)) {
      previousEnergy = null;
      previousMismatch = null;
      continue;
    }
    if (
      previousMismatch !== null &&
      previousEnergy !== null &&
      previousMismatch * shot.mismatch < 0
    ) {
      bracket = [previousEnergy, energy];
      break;
    }
    previousEnergy = energy;
    previousMismatch = shot.mismatch;
  }
  if (!bracket) throw new Error("No bracketed ground-state sign change");

  let lo = bracket[0];
  let hi = bracket[1];
  let loMismatch = integrate(lo).mismatch;
  for (let iter = 0; iter < 70; iter += 1) {
    const mid = 0.5 * (lo + hi);
    const shot = integrate(mid);
    const mismatch = shot.ok && Number.isFinite(shot.mismatch) ? shot.mismatch : loMismatch > 0 ? -1e6 : 1e6;
    if (loMismatch * mismatch <= 0) {
      hi = mid;
    } else {
      lo = mid;
      loMismatch = mismatch;
    }
    if (hi - lo < 1e-14) break;
  }
  const energyEv = 0.5 * (lo + hi);
  const finalShot = integrate(energyEv);
  if (!finalShot.ok || Math.abs(finalShot.right[m]) < 1e-30) {
    throw new Error("Eigenvalue root landed on an invalid matching point");
  }
  const scale = finalShot.left[m] / finalShot.right[m];
  const radial = new Float64Array(n + 1);
  for (let i = 0; i < m; i += 1) radial[i] = finalShot.left[i];
  for (let i = m; i <= n; i += 1) radial[i] = finalShot.right[i] * scale;
  const aM = model.aPm * 1e-12;
  const radius = new Float64Array(n + 1);
  for (let i = 0; i <= n; i += 1) radius[i] = x[i] * aM;
  const normSq = trapezoidOfSquares(radial, radius);
  if (!Number.isFinite(normSq) || normSq <= 0) throw new Error("Wavefunction norm is not positive");
  const normFactor = Math.sqrt(normSq);
  for (let i = 0; i <= n; i += 1) radial[i] /= normFactor;
  const norm = trapezoidOfSquares(radial, radius);
  let mean = 0;
  for (let i = 0; i < n; i += 1) {
    const weight = 0.5 * (radial[i] * radial[i] + radial[i + 1] * radial[i + 1]) * (radius[i + 1] - radius[i]);
    mean += 0.5 * (radius[i] + radius[i + 1]) * weight;
  }
  const ratio = -energyEv / model.v0Ev;
  const turning = ratio > 0 && ratio < 1 ? Math.sqrt(-Math.log(ratio)) : rmaxOverA;
  const tail = probabilityBeyond(x, radial, radius, turning);
  const step = Math.max(1, Math.floor(n / 240));
  const plotX: number[] = [];
  const plotU: number[] = [];
  const plotV: number[] = [];
  for (let i = 0; i <= n; i += step) {
    plotX.push(x[i]);
    plotU.push(radial[i]);
    plotV.push(-model.v0Ev * Math.exp(-x[i] * x[i]));
  }
  return {
    energyEv,
    epsilon: energyEv / esEv,
    g,
    esEv,
    norm,
    meanRadiusPm: mean * 1e12,
    tailProbability: tail,
    nodes: countNodes(radial),
    matchingResidual: finalShot.mismatch,
    hOverA,
    turningOverA: turning,
    potentialEvaluations: evaluations,
    nPoints: n + 1,
    x: plotX,
    u: plotU,
    potentialEv: plotV,
  };
}

function probabilityBeyond(x: Float64Array, radial: Float64Array, radius: Float64Array, turning: number): number {
  if (turning <= x[0]) return trapezoidOfSquares(radial, radius);
  if (turning >= x[x.length - 1]) return 0;
  let index = 0;
  while (index < x.length && x[index] < turning) index += 1;
  const left = index - 1;
  const span = x[index] - x[left];
  const weight = span === 0 ? 0 : (turning - x[left]) / span;
  const uTurn = radial[left] + weight * (radial[index] - radial[left]);
  const rTurn = radius[left] + weight * (radius[index] - radius[left]);
  const sampleU = [uTurn];
  const sampleR = [rTurn];
  for (let i = index; i < radial.length; i += 1) {
    sampleU.push(radial[i]);
    sampleR.push(radius[i]);
  }
  return trapezoidOfSquares(sampleU, sampleR);
}
