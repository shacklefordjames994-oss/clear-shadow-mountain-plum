/*
 * DHC-QCORR research prototype — simulation first.
 * Off-axis biphoton holography is a template, not a hadron camera.
 *
 * The reconstructor sees coincidence counts and the assumed calibration.
 * It does not see the injected state. Validation compares afterward.
 *
 * SYNTHETIC != OBSERVED
 * RECONSTRUCTED != PHOTOGRAPH
 * DISCREPANCY != DISCOVERY
 * FAILED reconstruction is not replaced with a guess.
 */

import { hashObject } from "../hash";
import { RNG, poisson } from "../scinet/master";

export const QCORR_VERSION = "0.1";
export const QCORR_SCHEMA = "DHC-QCORR-0.1";
export const QCORR_N = 32;
export const QCORR_CARRIER = 8;

export type QStateId = "SLIT" | "VORTEX" | "TILT";
export type QDataset = "IDEAL" | "INSTRUMENT" | "ADVERSARIAL";
export type QModelId = "TRUTH" | "PRODUCT" | "FLAT";
export type QValidity =
  | "VALID"
  | "DEGRADED"
  | "INSUFFICIENT_DATA"
  | "CALIBRATION_WARNING"
  | "RECONSTRUCTION_FAILED";

export interface QPair {
  id: string;
  i: number;
  j: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  tNs: number;
  energyEV: number;
  detectorA: "QCAM-A";
  detectorB: "QCAM-B";
}

export interface QBusMessage {
  eventId: string;
  schema: typeof QCORR_SCHEMA;
  source: string;
  epistemic: "SIMULATED" | "DERIVED" | "RECONSTRUCTED" | "INFERRED" | "HYPOTHETICAL";
  role: string;
  parentIds: string[];
  provenanceHash: string;
  note: string;
}

export interface QValidation {
  amplitudeError: number;
  phaseError: number;
  stateFidelity: number;
  intensityFidelity: number;
  signalToBackground: number;
  modelChi: number;
  verdict: "CONSISTENT" | "DISCREPANCY";
  note: string;
}

export interface QCorrRun {
  stateId: QStateId;
  dataset: QDataset;
  modelId: QModelId;
  seed: number;
  n: number;
  counts: number;
  coincidence: number[];
  truthAmplitude: number[];
  truthPhase: number[];
  amplitude: number[] | null;
  phase: number[] | null;
  residual: number[] | null;
  validity: QValidity;
  confidence: number;
  sidebandRatio: number;
  pairs: QPair[];
  validation: QValidation;
  messages: QBusMessage[];
  peak: { i: number; j: number } | null;
  calibrationId: string;
  runId: string;
  stateRecordId: string;
  assumedCarrier: number;
  trueCarrier: number;
  evidence: "SIMULATED";
  discoveryEligible: false;
  externalControl: false;
  claim: "BLOCKED";
}

const LABELS: Record<QStateId, string> = {
  SLIT: "Two-lobe correlation",
  VORTEX: "Phase vortex",
  TILT: "Phase ramp",
};

export function qStateLabel(id: QStateId): string {
  return LABELS[id];
}

export const DATASET_NOTE: Record<QDataset, string> = {
  IDEAL: "High count. No dark counts. Calibration matches the carrier.",
  INSTRUMENT: "Blur, dark counts, loss, and a thinner sample.",
  ADVERSARIAL: "Wrong carrier, detector asymmetry, and background. The gate should fail closed.",
};

function coord(i: number, n: number): number {
  return (i + 0.5) / n - 0.5;
}

function unknown(id: QStateId, i: number, j: number, n: number): [number, number] {
  const x1 = coord(i, n);
  const x2 = coord(j, n);
  const env = Math.exp(-(x1 * x1 + x2 * x2) / 0.08);
  if (id === "SLIT") {
    const amp =
      env *
      (Math.exp(-((x1 - x2 - 0.16) ** 2) / 0.0035) + Math.exp(-((x1 - x2 + 0.16) ** 2) / 0.0035));
    return [amp, 0];
  }
  if (id === "VORTEX") {
    const rho = Math.hypot(x1, x2);
    const amp = Math.exp(-(rho * rho) / 0.05) * Math.min(1, rho / 0.2);
    const ph = Math.atan2(x2, x1);
    return [amp * Math.cos(ph), amp * Math.sin(ph)];
  }
  const amp = Math.exp(-(x1 * x1 + x2 * x2) / 0.05) * Math.exp(-((x1 - x2) ** 2) / 0.012);
  const ph = 2 * Math.PI * 1.1 * x1;
  return [amp * Math.cos(ph), amp * Math.sin(ph)];
}

function fft1d(re: Float64Array, im: Float64Array, invert: boolean) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i]!;
      re[i] = re[j]!;
      re[j] = tr;
      const ti = im[i]!;
      im[i] = im[j]!;
      im[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((2 * Math.PI) / len) * (invert ? 1 : -1);
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k;
        const b = a + len / 2;
        const vRe = re[b]! * curRe - im[b]! * curIm;
        const vIm = re[b]! * curIm + im[b]! * curRe;
        re[b] = re[a]! - vRe;
        im[b] = im[a]! - vIm;
        re[a] = re[a]! + vRe;
        im[a] = im[a]! + vIm;
        const nRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nRe;
      }
    }
  }
  if (invert) {
    for (let i = 0; i < n; i++) {
      re[i] = re[i]! / n;
      im[i] = im[i]! / n;
    }
  }
}

function fft2(re: Float64Array, im: Float64Array, n: number, invert: boolean) {
  const rowR = new Float64Array(n);
  const rowI = new Float64Array(n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      rowR[x] = re[y * n + x]!;
      rowI[x] = im[y * n + x]!;
    }
    fft1d(rowR, rowI, invert);
    for (let x = 0; x < n; x++) {
      re[y * n + x] = rowR[x]!;
      im[y * n + x] = rowI[x]!;
    }
  }
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      rowR[y] = re[y * n + x]!;
      rowI[y] = im[y * n + x]!;
    }
    fft1d(rowR, rowI, invert);
    for (let y = 0; y < n; y++) {
      re[y * n + x] = rowR[y]!;
      im[y * n + x] = rowI[y]!;
    }
  }
}

function spectrum(holo: Float64Array, n: number) {
  const re = new Float64Array(holo);
  const im = new Float64Array(n * n);
  fft2(re, im, n, false);
  return { re, im };
}

function bandPower(re: Float64Array, im: Float64Array, n: number, cx: number, cy: number): number {
  let s = 0;
  const rad = 4;
  for (let ky = 0; ky < n; ky++) {
    const dy = ((ky - cy + n + n / 2) % n) - n / 2;
    for (let kx = 0; kx < n; kx++) {
      const dx = ((kx - cx + n + n / 2) % n) - n / 2;
      if (dx * dx + dy * dy <= rad * rad) s += re[ky * n + kx]! ** 2 + im[ky * n + kx]! ** 2;
    }
  }
  return s;
}

function sidebandRatio(re: Float64Array, im: Float64Array, n: number, carrier: number): number {
  const side = bandPower(re, im, n, carrier, 0);
  const control = bandPower(re, im, n, (carrier + 11) % n, 11);
  return side / Math.max(control, 1e-12);
}

function reconstruct(holo: Float64Array, n: number, carrier: number, refAmp: number) {
  const { re, im } = spectrum(holo, n);
  const ratio = sidebandRatio(re, im, n, carrier);
  const sR = new Float64Array(n * n);
  const sI = new Float64Array(n * n);
  for (let ky = 0; ky < n; ky++) {
    for (let kx = 0; kx < n; kx++) {
      const srcX = (kx - carrier + n) % n;
      const src = ky * n + srcX;
      sR[ky * n + kx] = re[src]!;
      sI[ky * n + kx] = im[src]!;
    }
  }
  const rad = 5;
  for (let ky = 0; ky < n; ky++) {
    const yy = ky <= n / 2 ? ky : ky - n;
    for (let kx = 0; kx < n; kx++) {
      const xx = kx <= n / 2 ? kx : kx - n;
      if (xx * xx + yy * yy > rad * rad) {
        sR[ky * n + kx] = 0;
        sI[ky * n + kx] = 0;
      }
    }
  }
  fft2(sR, sI, n, true);
  let pI = 0;
  let pJ = 0;
  let pAmp = -1;
  const amp = new Float64Array(n * n);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const k = j * n + i;
      const a = Math.hypot(sR[k]! / refAmp, sI[k]! / refAmp);
      amp[k] = a;
      if (a > pAmp) {
        pAmp = a;
        pI = i;
        pJ = j;
      }
    }
  }
  const pk = pJ * n + pI;
  const g = Math.hypot(sR[pk]! / refAmp, sI[pk]! / refAmp) || 1;
  const c = sR[pk]! / refAmp / g;
  const s = sI[pk]! / refAmp / g;
  const phase = new Float64Array(n * n);
  for (let k = 0; k < amp.length; k++) {
    const r = sR[k]! / refAmp;
    const m = sI[k]! / refAmp;
    phase[k] = Math.atan2(m * c - r * s, r * c + m * s);
  }
  return { amp, phase, peak: { i: pI, j: pJ }, ratio };
}

function l2norm(a: ArrayLike<number>): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i]! * a[i]!;
  return Math.sqrt(s) || 1;
}

function validate(
  truthRe: Float64Array,
  truthIm: Float64Array,
  amp: Float64Array | null,
  phase: Float64Array | null,
  model: QModelId,
  n: number,
  sbr: number,
): QValidation {
  if (!amp || !phase) {
    return {
      amplitudeError: 1,
      phaseError: Math.PI,
      stateFidelity: 0,
      intensityFidelity: 0,
      signalToBackground: sbr,
      modelChi: Number.POSITIVE_INFINITY,
      verdict: "DISCREPANCY",
      note: "No reconstruction was emitted. Validation refuses to score a blank as a state.",
    };
  }
  const tAmp = new Float64Array(amp.length);
  for (let k = 0; k < amp.length; k++) tAmp[k] = Math.hypot(truthRe[k]!, truthIm[k]!);
  const na = l2norm(amp);
  const nt = l2norm(tAmp);
  let acc = 0;
  for (let k = 0; k < amp.length; k++) {
    const d = amp[k]! / na - tAmp[k]! / nt;
    acc += d * d;
  }
  const amplitudeError = Math.sqrt(acc / amp.length);

  let re = 0;
  let im = 0;
  let n1 = 0;
  let n2 = 0;
  for (let k = 0; k < amp.length; k++) {
    const rr = amp[k]! * Math.cos(phase[k]!);
    const ri = amp[k]! * Math.sin(phase[k]!);
    n1 += rr * rr + ri * ri;
    n2 += truthRe[k]! * truthRe[k]! + truthIm[k]! * truthIm[k]!;
    re += rr * truthRe[k]! + ri * truthIm[k]!;
    im += rr * truthIm[k]! - ri * truthRe[k]!;
  }
  const stateFidelity = (re * re + im * im) / Math.max(n1 * n2, 1e-18);
  const align = Math.atan2(im, re);
  let wsum = 0;
  let perr = 0;
  for (let k = 0; k < amp.length; k++) {
    const w = tAmp[k]! * tAmp[k]!;
    const pr = phase[k]! - align;
    const pt = Math.atan2(truthIm[k]!, truthRe[k]!);
    const d = Math.atan2(Math.sin(pr - pt), Math.cos(pr - pt));
    perr += w * Math.abs(d);
    wsum += w;
  }
  const phaseError = perr / Math.max(wsum, 1e-12);

  const p = densityFrom(amp.map((v) => v * v));
  const q = modelDensity(model, n, tAmp, amp);
  let bc = 0;
  let chi = 0;
  for (let k = 0; k < p.length; k++) {
    bc += Math.sqrt(Math.max(0, p[k]! * q[k]!));
    const d = p[k]! - q[k]!;
    chi += (d * d) / (q[k]! + 1e-6);
  }
  const intensityFidelity = bc;
  const verdict = model === "TRUTH" ? (stateFidelity >= 0.75 && amplitudeError < 0.04 ? "CONSISTENT" : "DISCREPANCY") : chi > 0.8 ? "DISCREPANCY" : "CONSISTENT";
  return {
    amplitudeError,
    phaseError,
    stateFidelity,
    intensityFidelity,
    signalToBackground: sbr,
    modelChi: chi,
    verdict,
    note:
      model === "TRUTH"
        ? "Compared with the injected state after reconstruction. Agreement is not a measurement."
        : "Compared with a stand-in model. A mismatch is a discrepancy, not a particle.",
  };
}

function densityFrom(values: ArrayLike<number>): Float64Array {
  const out = new Float64Array(values.length);
  let s = 0;
  for (let i = 0; i < values.length; i++) s += values[i]!;
  const z = s || 1;
  for (let i = 0; i < out.length; i++) out[i] = values[i]! / z;
  return out;
}

function modelDensity(id: QModelId, n: number, truthAmp: Float64Array, recAmp: Float64Array): Float64Array {
  if (id === "FLAT") {
    const out = new Float64Array(n * n);
    out.fill(1 / (n * n));
    return out;
  }
  if (id === "TRUTH") return densityFrom(Array.from(truthAmp, (a) => a * a));
  const rec = densityFrom(Array.from(recAmp, (a) => a * a));
  const mx = new Float64Array(n);
  const my = new Float64Array(n);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const v = rec[j * n + i]!;
      mx[i] = (mx[i] ?? 0) + v;
      my[j] = (my[j] ?? 0) + v;
    }
  }
  const out = new Float64Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) out[j * n + i] = (mx[i] ?? 0) * (my[j] ?? 0);
  return out;
}

function samplePairs(rng: RNG, weight: Float64Array, n: number, seed: number): QPair[] {
  const cdf: number[] = [];
  let acc = 0;
  for (let k = 0; k < weight.length; k++) {
    acc += weight[k]!;
    cdf.push(acc);
  }
  const pairs: QPair[] = [];
  for (let p = 0; p < 6; p++) {
    const u = rng.next() * (acc || 1);
    let k = 0;
    while (k < cdf.length - 1 && cdf[k]! < u) k += 1;
    const i = k % n;
    const j = Math.floor(k / n);
    pairs.push({
      id: `E-${seed.toString(36)}-${p}`,
      i,
      j,
      x1: coord(i, n),
      x2: coord(j, n),
      y1: 0,
      y2: 0,
      tNs: p * 4,
      energyEV: 2,
      detectorA: "QCAM-A",
      detectorB: "QCAM-B",
    });
  }
  return pairs;
}

function blur(src: Float64Array, n: number): Float64Array {
  const out = new Float64Array(src.length);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      let s = 0;
      let w = 0;
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          const ii = i + di;
          const jj = j + dj;
          if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
          const weight = di === 0 && dj === 0 ? 4 : 1;
          s += weight * src[jj * n + ii]!;
          w += weight;
        }
      }
      out[j * n + i] = s / w;
    }
  }
  return out;
}

export function runQCorr(opts: {
  seed: number;
  stateId: QStateId;
  dataset: QDataset;
  modelId?: QModelId;
}): QCorrRun {
  const n = QCORR_N;
  const trueCarrier = QCORR_CARRIER;
  const modelId = opts.modelId ?? "TRUTH";
  const assumedCarrier = opts.dataset === "ADVERSARIAL" ? 16 : trueCarrier;
  const refAmp = 1.15;
  const budget = opts.dataset === "IDEAL" ? 80000 : opts.dataset === "INSTRUMENT" ? 14000 : 20000;
  const truthRe = new Float64Array(n * n);
  const truthIm = new Float64Array(n * n);
  const intensity = new Float64Array(n * n);
  const truthAmp = new Float64Array(n * n);
  const truthPhase = new Float64Array(n * n);
  let sumI = 0;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const [or, oi] = unknown(opts.stateId, i, j, n);
      const k = j * n + i;
      truthRe[k] = or;
      truthIm[k] = oi;
      truthAmp[k] = Math.hypot(or, oi);
      truthPhase[k] = Math.atan2(oi, or);
      const ph = (2 * Math.PI * trueCarrier * i) / n;
      const sr = or + refAmp * Math.cos(ph);
      const si = oi + refAmp * Math.sin(ph);
      intensity[k] = sr * sr + si * si;
      sumI += intensity[k]!;
    }
  }
  const rng = new RNG(opts.seed);
  const holo = new Float64Array(n * n);
  const scale = budget / (sumI || 1);
  for (let k = 0; k < intensity.length; k++) holo[k] = poisson(rng, scale * intensity[k]!);
  const measured = new Float64Array(opts.dataset === "INSTRUMENT" ? blur(holo, n) : holo);
  let darkExpected = 0;
  if (opts.dataset === "INSTRUMENT") {
    const dark = 0.12;
    darkExpected = dark * n * n;
    for (let k = 0; k < measured.length; k++) {
      measured[k] = (measured[k] ?? 0) * 0.92 + poisson(rng, dark);
    }
  }
  if (opts.dataset === "ADVERSARIAL") {
    const dark = 1.1;
    darkExpected = dark * n * n;
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const k = j * n + i;
        let v = measured[k]! + poisson(rng, dark);
        if (i < n / 2) v *= 0.35;
        measured[k] = v;
      }
    }
  }
  let counts = 0;
  for (let k = 0; k < measured.length; k++) counts += measured[k]!;
  const signal = Math.max(0, counts - darkExpected);
  const sbr = signal / Math.max(darkExpected, 1);

  let amplitude: number[] | null = null;
  let phase: number[] | null = null;
  let residual: number[] | null = null;
  let peak: { i: number; j: number } | null = null;
  let validity: QValidity = "VALID";
  let confidence = 0;
  let ratio = 0;

  if (counts < 2500) {
    validity = "INSUFFICIENT_DATA";
  } else {
    const rec = reconstruct(measured, n, assumedCarrier, refAmp);
    ratio = rec.ratio;
    if (ratio < 4) {
      validity = assumedCarrier !== trueCarrier ? "CALIBRATION_WARNING" : "RECONSTRUCTION_FAILED";
    } else if (sbr < 200) {
      validity = "DEGRADED";
      amplitude = Array.from(rec.amp);
      phase = Array.from(rec.phase);
      peak = rec.peak;
      confidence = Math.min(0.7, 0.35 + Math.min(ratio, 20) / 40);
    } else {
      validity = "VALID";
      amplitude = Array.from(rec.amp);
      phase = Array.from(rec.phase);
      peak = rec.peak;
      confidence = Math.min(0.99, 0.55 + Math.min(ratio, 30) / 80);
    }
  }

  if (amplitude && phase) {
    const model = modelDensity(
      modelId,
      n,
      truthAmp,
      Float64Array.from(amplitude),
    );
    const obs = densityFrom(amplitude.map((a) => a * a));
    residual = Array.from(obs, (v, k) => v - model[k]!);
  }

  const validation = validate(
    truthRe,
    truthIm,
    amplitude ? Float64Array.from(amplitude) : null,
    phase ? Float64Array.from(phase) : null,
    modelId,
    n,
    sbr,
  );

  const pairs = samplePairs(rng, truthAmp, n, opts.seed);
  const runId = `RUN-TOY-${opts.dataset}-${opts.seed}`;
  const calibrationId = `CAL-TOY-${opts.dataset}-${assumedCarrier}`;
  const inputHash = hashObject({
    seed: opts.seed,
    stateId: opts.stateId,
    dataset: opts.dataset,
    trueCarrier,
    assumedCarrier,
    counts,
  });
  const reconHash = hashObject({
    validity,
    confidence: Number(confidence.toFixed(4)),
    ratio: Number(ratio.toFixed(4)),
    version: QCORR_VERSION,
  });
  const messages: QBusMessage[] = [
    {
      eventId: `A-${opts.seed}`,
      schema: QCORR_SCHEMA,
      source: "qcam",
      epistemic: "SIMULATED",
      role: "WOULD_BE_OBSERVED",
      parentIds: [],
      provenanceHash: inputHash,
      note: "Synthetic coincidences. Not a detector timestamp.",
    },
    {
      eventId: `C-${opts.seed}`,
      schema: QCORR_SCHEMA,
      source: "qcorr",
      epistemic: "DERIVED",
      role: "CORRELATION",
      parentIds: [`A-${opts.seed}`],
      provenanceHash: hashObject({ parent: inputHash, kind: "C(x1,x2)" }),
      note: "C(x1,x2) only. y is not reconstructed in this prototype.",
    },
    {
      eventId: `R-${opts.seed}`,
      schema: QCORR_SCHEMA,
      source: "qholo",
      epistemic: "RECONSTRUCTED",
      role: validity,
      parentIds: [`C-${opts.seed}`],
      provenanceHash: reconHash,
      note:
        amplitude == null
          ? "Fail closed. No amplitude was invented."
          : "Sideband isolation. Global phase set to 0 at the peak.",
    },
    {
      eventId: `V-${opts.seed}`,
      schema: QCORR_SCHEMA,
      source: "qfalsify",
      epistemic: "INFERRED",
      role: validation.verdict,
      parentIds: [`R-${opts.seed}`],
      provenanceHash: hashObject({
        F: Number(validation.stateFidelity.toFixed(4)),
        Ea: Number(validation.amplitudeError.toFixed(4)),
      }),
      note: "Validation may see the injected state. The reconstructor did not.",
    },
    {
      eventId: `H-${opts.seed}`,
      schema: QCORR_SCHEMA,
      source: "claim-gate",
      epistemic: "HYPOTHETICAL",
      role: "BLOCKED",
      parentIds: [`V-${opts.seed}`],
      provenanceHash: hashObject({ claim: "BLOCKED" }),
      note: "Human review required. No scientific claim is written.",
    },
  ];

  return {
    stateId: opts.stateId,
    dataset: opts.dataset,
    modelId,
    seed: opts.seed,
    n,
    counts: Math.round(counts),
    coincidence: Array.from(measured),
    truthAmplitude: Array.from(truthAmp),
    truthPhase: Array.from(truthPhase),
    amplitude,
    phase,
    residual,
    validity,
    confidence,
    sidebandRatio: ratio,
    pairs,
    validation,
    messages,
    peak,
    calibrationId,
    runId,
    stateRecordId: `QSR-${opts.dataset}-${opts.seed}`,
    assumedCarrier,
    trueCarrier,
    evidence: "SIMULATED",
    discoveryEligible: false,
    externalControl: false,
    claim: "BLOCKED",
  };
}

export const PIPELINE_STAGES = [
  { id: "t0", clock: "event", label: "Source", note: "Injected Ψ is hidden from the reconstructor." },
  { id: "t1", clock: "event", label: "Pairs", note: "Samples from |Ψ|². Synthetic, not a collision." },
  { id: "t2", clock: "event", label: "Coincidence", note: "Interferometric image. Counts are not the wavefunction." },
  { id: "t3", clock: "compute", label: "Reconstruction", note: "Amplitude and phase, or a closed gate." },
  { id: "t4", clock: "compute", label: "Validation", note: "Error against the injected state. Agreement is not nature." },
  { id: "t5", clock: "compute", label: "Claim gate", note: "Blocked. A residual is not a discovery." },
] as const;
