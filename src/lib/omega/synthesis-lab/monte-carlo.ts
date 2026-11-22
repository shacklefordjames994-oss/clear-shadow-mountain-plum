import { mulberry32 } from "./engine.ts";

export interface IntegralEstimate {
  method: "CRUDE" | "ANTITHETIC" | "STRATIFIED" | "IMPORTANCE" | "VAN_DER_CORPUT";
  estimate: number;
  error: number;
  standardError: number | null;
  samples: number;
  note: string;
}

const PEAK = 50;

export function monteCarloComparison(seed: number, samples: number): {
  analytic: number;
  estimates: IntegralEstimate[];
  notInstalled: string[];
} {
  const count = Math.max(16, Math.min(4000, Math.round(samples)));
  const analytic = Math.sqrt(Math.PI / PEAK) * erf(Math.sqrt(PEAK) / 2);
  const rand = mulberry32(seed);
  return {
    analytic,
    estimates: [
      crude(rand, count),
      antithetic(rand, count),
      stratified(rand, count, 8),
      importance(rand, count),
      vanDerCorput(count),
    ],
    notInstalled: ["VEGAS", "VEGAS+", "MISER", "Sobol", "multi-channel", "cuVegas"],
  };
}

export function integrand(x: number) {
  const shifted = x - 0.5;
  return Math.exp(-PEAK * shifted * shifted);
}

function crude(rand: () => number, count: number): IntegralEstimate {
  const values = Array.from({ length: count }, () => integrand(rand()));
  return finish("CRUDE", values, count, "Uniform samples on [0, 1]. The error bar is the sample standard deviation over sqrt(N).");
}

function antithetic(rand: () => number, count: number): IntegralEstimate {
  const pairs = Math.floor(count / 2);
  const values: number[] = [];
  for (let index = 0; index < pairs; index += 1) {
    const draw = rand();
    values.push((integrand(draw) + integrand(1 - draw)) / 2);
  }
  return finish("ANTITHETIC", values, pairs * 2, "Each draw is paired with its reflection. The pair is the sample, so the error bar is not the crude one.");
}

function stratified(rand: () => number, count: number, bins: number): IntegralEstimate {
  const perBin = Math.floor(count / bins);
  const means: number[] = [];
  let variance = 0;
  for (let bin = 0; bin < bins; bin += 1) {
    const local: number[] = [];
    for (let index = 0; index < perBin; index += 1) local.push(integrand((bin + rand()) / bins));
    const mid = mean(local);
    means.push(mid / bins);
    variance += varianceOf(local) / (bins * bins * perBin);
  }
  const estimate = means.reduce((sum, value) => sum + value, 0);
  return {
    method: "STRATIFIED",
    estimate,
    error: Math.abs(estimate - analyticValue()),
    standardError: Math.sqrt(variance),
    samples: perBin * bins,
    note: "Eight equal strata. The error bar uses only within-stratum variance.",
  };
}

function importance(rand: () => number, count: number): IntegralEstimate {
  const weights: number[] = [];
  let draws = 0;
  while (weights.length < count && draws < count * 20) {
    draws += 1;
    const x = rand();
    if (rand() > 4 * x * (1 - x)) continue;
    const density = 6 * x * (1 - x);
    if (density < 1e-12) continue;
    weights.push(integrand(x) / density);
  }
  return finish("IMPORTANCE", weights, weights.length, "Proposal is Beta(2, 2), chosen because the peak is at 0.5. Weights are f/g.");
}

function vanDerCorput(count: number): IntegralEstimate {
  const values = Array.from({ length: count }, (_, index) => integrand(radicalInverse(index + 1, 2)));
  const estimate = mean(values);
  return {
    method: "VAN_DER_CORPUT",
    estimate,
    error: Math.abs(estimate - analyticValue()),
    standardError: null,
    samples: count,
    note: "Deterministic base-2 low-discrepancy points. A 1/sqrt(N) error bar does not apply.",
  };
}

function finish(method: IntegralEstimate["method"], values: number[], samples: number, note: string): IntegralEstimate {
  const estimate = mean(values);
  const standardError = values.length > 1 ? Math.sqrt(varianceOf(values) / values.length) : null;
  return { method, estimate, error: Math.abs(estimate - analyticValue()), standardError, samples, note };
}

function analyticValue() {
  return Math.sqrt(Math.PI / PEAK) * erf(Math.sqrt(PEAK) / 2);
}

function radicalInverse(index: number, base: number) {
  let result = 0;
  let factor = 1 / base;
  let current = index;
  while (current > 0) {
    result += (current % base) * factor;
    current = Math.floor(current / base);
    factor /= base;
  }
  return result;
}

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function varianceOf(values: number[]) {
  const mid = mean(values);
  return values.reduce((sum, value) => sum + (value - mid) ** 2, 0) / (values.length - 1);
}

function erf(x: number) {
  const sign = x < 0 ? -1 : 1;
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-x * x);
  return sign * y;
}
