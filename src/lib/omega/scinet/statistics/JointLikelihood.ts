/*
 * SCI-NETv2 joint likelihood.
 * Detector datasets stay separate. Shared nuisances are explicit.
 * Approximate Z is a development diagnostic, not production significance.
 */

export interface JointBin {
  detectorId: string;
  energyMinKeV: number;
  energyMaxKeV: number;
  observed: number;
  signalExpected: number;
  backgroundExpected: number;
  efficiency?: number;
}

export interface GaussianConstraint {
  name: string;
  value: number;
  nominal: number;
  sigma: number;
}

export interface CorrelatedNuisance {
  names: string[];
  covariance: number[][];
}

export interface DetectorLikelihood {
  detectorId: string;
  hypothesisId: string;
  signalStrength: number;
  backgroundScale: number;
  bins: JointBin[];
  constraints?: GaussianConstraint[];
  correlatedNuisance?: CorrelatedNuisance;
}

export interface JointLikelihoodResult {
  hypothesisId: string;
  logLikelihood: number;
  detectorContributions: Record<string, number>;
  nuisancePenalty: number;
  totalBins: number;
  valid: boolean;
  warnings: string[];
}

function logGamma(z: number): number {
  const c = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.984369578019572e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < c.length; i++) x += c[i] / (z + i + 1);
  const t = z + c.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

export function poissonLogLikelihood(observed: number, expected: number): number {
  if (!Number.isFinite(observed) || !Number.isFinite(expected) || observed < 0 || expected <= 0) {
    return Number.NEGATIVE_INFINITY;
  }
  return observed * Math.log(expected) - expected - logGamma(observed + 1);
}

function gaussianPenalty(constraint: GaussianConstraint): number {
  if (!Number.isFinite(constraint.sigma) || constraint.sigma <= 0) return Number.NEGATIVE_INFINITY;
  const delta = constraint.value - constraint.nominal;
  return -0.5 * (delta / constraint.sigma) ** 2;
}

function invertMatrix(matrix: number[][]): number[][] | null {
  const n = matrix.length;
  if (n === 0 || matrix.some((row) => row.length !== n)) return null;
  const a = matrix.map((row, i) => row.concat(Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))));
  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(a[r][i]) > Math.abs(a[pivot][i])) pivot = r;
    if (Math.abs(a[pivot][i]) < 1e-14) return null;
    [a[i], a[pivot]] = [a[pivot], a[i]];
    const divisor = a[i][i];
    for (let j = 0; j < 2 * n; j++) a[i][j] /= divisor;
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const factor = a[r][i];
      for (let j = 0; j < 2 * n; j++) a[r][j] -= factor * a[i][j];
    }
  }
  return a.map((row) => row.slice(n));
}

function correlatedPenalty(values: number[], nominal: number[], covariance: number[][]): number {
  const delta = values.map((v, i) => v - nominal[i]);
  const inverse = invertMatrix(covariance);
  if (!inverse) return Number.NEGATIVE_INFINITY;
  let quadratic = 0;
  for (let i = 0; i < delta.length; i++) {
    for (let j = 0; j < delta.length; j++) quadratic += delta[i] * inverse[i][j] * delta[j];
  }
  return -0.5 * quadratic;
}

export function calculateDetectorLikelihood(model: DetectorLikelihood): number {
  let total = 0;
  for (const bin of model.bins) {
    const efficiency = bin.efficiency ?? 1;
    const expected = model.signalStrength * bin.signalExpected * efficiency + model.backgroundScale * bin.backgroundExpected;
    const term = poissonLogLikelihood(bin.observed, Math.max(expected, 1e-12));
    if (!Number.isFinite(term)) return Number.NEGATIVE_INFINITY;
    total += term;
  }
  if (model.constraints) {
    const correlated = new Set(model.correlatedNuisance?.names ?? []);
    for (const constraint of model.constraints) {
      if (correlated.has(constraint.name)) continue;
      total += gaussianPenalty(constraint);
    }
  }
  if (model.correlatedNuisance) {
    const names = model.correlatedNuisance.names;
    const values = names.map((name) => model.constraints?.find((x) => x.name === name)?.value ?? 0);
    const nominal = names.map((name) => model.constraints?.find((x) => x.name === name)?.nominal ?? 0);
    total += correlatedPenalty(values, nominal, model.correlatedNuisance.covariance);
  }
  return total;
}

export function calculateJointLikelihood(models: DetectorLikelihood[]): JointLikelihoodResult {
  const warnings: string[] = [];
  if (models.length === 0) {
    return {
      hypothesisId: "UNKNOWN",
      logLikelihood: Number.NEGATIVE_INFINITY,
      detectorContributions: {},
      nuisancePenalty: 0,
      totalBins: 0,
      valid: false,
      warnings: ["NO_DETECTOR_MODELS"],
    };
  }
  const hypothesisId = models[0].hypothesisId;
  const detectorContributions: Record<string, number> = {};
  let total = 0;
  let totalBins = 0;
  let nuisancePenalty = 0;
  for (const model of models) {
    if (model.hypothesisId !== hypothesisId) {
      warnings.push("MIXED_HYPOTHESIS_MODELS");
      continue;
    }
    const unconstrained: DetectorLikelihood = { ...model, constraints: undefined, correlatedNuisance: undefined };
    const raw = calculateDetectorLikelihood(unconstrained);
    const withNuisance = calculateDetectorLikelihood(model);
    detectorContributions[model.detectorId] = withNuisance;
    total += withNuisance;
    totalBins += model.bins.length;
    nuisancePenalty += raw - withNuisance;
  }
  return {
    hypothesisId,
    logLikelihood: total,
    detectorContributions,
    nuisancePenalty,
    totalBins,
    valid: Number.isFinite(total),
    warnings,
  };
}

export function likelihoodRatio(signalLogL: number, backgroundLogL: number): number {
  if (!Number.isFinite(signalLogL) || !Number.isFinite(backgroundLogL)) return Number.NaN;
  return 2 * (signalLogL - backgroundLogL);
}

/** Development diagnostic only. NOT production discovery significance. */
export function approximateZ(testStatistic: number): number {
  if (!Number.isFinite(testStatistic) || testStatistic < 0) return Number.NaN;
  return Math.sqrt(testStatistic);
}

export function leaveOneDetectorOut(
  models: DetectorLikelihood[],
  dropDetectorId: string,
): JointLikelihoodResult {
  return calculateJointLikelihood(models.filter((m) => m.detectorId !== dropDetectorId));
}
