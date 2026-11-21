/*
 * Toy hadronic generators A/B/C vs a literature-inspired ATLAS p–O shape.
 * These are pedagogical stand-ins, not EPOS / QGSJET / SIBYLL.
 * Model disagreement is the scientific point: generators disagree more than the few-percent measurement.
 */

import { RNG } from "../scinet/master";
import { ATLAS_PO_LITERATURE, type CollisionSystem, type GlauberEvent } from "./nuclei";

export type GeneratorId = "GEN_A" | "GEN_B" | "GEN_C";

export interface GeneratorSpec {
  id: GeneratorId;
  name: string;
  note: string;
  multScale: number;
  pTSlope: number;
  forwardBoost: number;
  etaWidth: number;
}

export const GENERATORS: GeneratorSpec[] = [
  {
    id: "GEN_A",
    name: "Generator A",
    note: "Higher central multiplicity. Toy stand-in — not a named air-shower code.",
    multScale: 1.18,
    pTSlope: 0.22,
    forwardBoost: 0.72,
    etaWidth: 1.85,
  },
  {
    id: "GEN_B",
    name: "Generator B",
    note: "Harder pT, more forward energy. Toy stand-in — not a named air-shower code.",
    multScale: 0.92,
    pTSlope: 0.16,
    forwardBoost: 1.28,
    etaWidth: 2.35,
  },
  {
    id: "GEN_C",
    name: "Generator C",
    note: "Softer spectrum, photon-rich forward. Toy stand-in — not a named air-shower code.",
    multScale: 1.05,
    pTSlope: 0.28,
    forwardBoost: 1.12,
    etaWidth: 2.1,
  },
];

export function generatorById(id: GeneratorId): GeneratorSpec {
  return GENERATORS.find((g) => g.id === id) ?? GENERATORS[0];
}

export const ETA_EDGES = [-2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5];
export const PT_EDGES = [0.5, 0.8, 1.2, 1.8, 2.6, 4, 6, 9];
export const NCH_EDGES = [1, 4, 8, 12, 16, 22, 30, 42];

export interface ChargedTrack {
  eta: number;
  phi: number;
  pT: number;
  energy: number;
  charge: number;
  forward: boolean;
}

export interface NuclearEvent {
  id: string;
  system: string;
  sqrtSNNGeV: number;
  glauber: GlauberEvent;
  generator: GeneratorId;
  tracks: ChargedTrack[];
  nCh: number;
  sumPT: number;
  forwardEnergyGeV: number;
  leadingEnergyGeV: number;
  evidence: "SIMULATED";
}

function meanNch(sys: CollisionSystem, g: GlauberEvent, gen: GeneratorSpec): number {
  const s = 2 * Math.sqrt(sys.energyAGeV * sys.energyBGeV);
  const s0 = 9620;
  const aa = Math.pow(s / s0, 0.11);
  return Math.max(1.2, 6.4 * Math.pow(g.nPart, 0.42) * aa * gen.multScale);
}

export function sampleNuclearEvent(
  rng: RNG,
  sys: CollisionSystem,
  gen: GeneratorSpec,
  glauber: GlauberEvent,
): NuclearEvent {
  const mean = meanNch(sys, glauber, gen);
  const nCh = Math.max(1, Math.round(mean + rng.gaussian() * Math.sqrt(mean)));
  const tracks: ChargedTrack[] = [];
  let sumPT = 0;
  let forwardEnergyGeV = 0;
  let leadingEnergyGeV = 0;
  for (let i = 0; i < nCh; i++) {
    const eta = rng.gaussian() * gen.etaWidth;
    const inFid = Math.abs(eta) < ATLAS_PO_LITERATURE.etaMax;
    const pT = Math.max(0.15, -Math.log(Math.max(1e-9, rng.next())) * gen.pTSlope * 4 + 0.35);
    const phi = rng.next() * 2 * Math.PI;
    const energy = pT * Math.cosh(eta);
    const forward = Math.abs(eta) > 4 || Math.abs(Math.atan(1 / Math.sinh(Math.max(0.2, Math.abs(eta))))) < 0.02;
    if (inFid && pT >= ATLAS_PO_LITERATURE.pTminGeV) {
      tracks.push({ eta, phi, pT, energy, charge: rng.next() < 0.5 ? 1 : -1, forward: false });
      sumPT += pT;
    } else if (forward || Math.abs(eta) > 2.5) {
      forwardEnergyGeV += energy * gen.forwardBoost * 0.15;
    }
    leadingEnergyGeV = Math.max(leadingEnergyGeV, energy);
  }
  const fid = tracks.filter((t) => Math.abs(t.eta) < ATLAS_PO_LITERATURE.etaMax && t.pT >= ATLAS_PO_LITERATURE.pTminGeV);
  return {
    id: `po-${(rng.next() * 1e9).toFixed(0)}`,
    system: sys.id,
    sqrtSNNGeV: 2 * Math.sqrt(sys.energyAGeV * sys.energyBGeV),
    glauber,
    generator: gen.id,
    tracks: fid,
    nCh: fid.length,
    sumPT,
    forwardEnergyGeV,
    leadingEnergyGeV,
    evidence: "SIMULATED",
  };
}

export interface HistBin {
  lo: number;
  hi: number;
  observed: number;
}

export function emptyHist(edges: number[]): HistBin[] {
  const bins: HistBin[] = [];
  for (let i = 0; i < edges.length - 1; i++) bins.push({ lo: edges[i], hi: edges[i + 1], observed: 0 });
  return bins;
}

export function fillHist(bins: HistBin[], value: number) {
  for (const bin of bins) {
    if (value >= bin.lo && value < bin.hi) {
      bin.observed += 1;
      return;
    }
  }
  if (value >= bins[bins.length - 1].hi) bins[bins.length - 1].observed += 1;
}

/** Literature-inspired ATLAS-like dN/dη shape. Not the published histogram. */
export function literatureEta(edges: number[], nEvents: number): HistBin[] {
  const bins = emptyHist(edges);
  const mid = (ATLAS_PO_LITERATURE.etaMax * 2) / (edges.length - 1);
  for (const bin of bins) {
    const c = (bin.lo + bin.hi) / 2;
    const shape = 1.05 - 0.08 * c * c;
    bin.observed = nEvents * 1.35 * Math.max(0.2, shape) * ((bin.hi - bin.lo) / mid);
  }
  return bins;
}

export interface CompareBin {
  bin: number;
  lo: number;
  hi: number;
  data: number;
  model: number;
  residual: number;
  ratio: number | null;
}

export function compareModelToData(data: HistBin[], model: HistBin[]): CompareBin[] {
  const n = Math.min(data.length, model.length);
  const out: CompareBin[] = [];
  for (let i = 0; i < n; i++) {
    const d = data[i].observed;
    const m = model[i].observed;
    out.push({
      bin: i,
      lo: data[i].lo,
      hi: data[i].hi,
      data: d,
      model: m,
      residual: d - m,
      ratio: m !== 0 ? d / m : null,
    });
  }
  return out;
}

export interface DisagreementBin {
  bin: number;
  lo: number;
  hi: number;
  mean: number;
  spread: number;
  models: number[];
}

export function modelDisagreement(models: HistBin[][]): DisagreementBin[] {
  if (models.length < 2) return [];
  const bins = models[0].length;
  const out: DisagreementBin[] = [];
  for (let i = 0; i < bins; i++) {
    const values = models.map((m) => m[i]?.observed ?? 0);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((s, x) => s + (x - mean) ** 2, 0) / values.length;
    out.push({ bin: i, lo: models[0][i].lo, hi: models[0][i].hi, mean, spread: Math.sqrt(variance), models: values });
  }
  return out;
}

export function chi2Ndf(compare: CompareBin[], relUnc: number): number {
  if (compare.length === 0) return 0;
  let s = 0;
  for (const row of compare) {
    const sigma = Math.max(1e-6, relUnc * row.data);
    s += (row.residual / sigma) ** 2;
  }
  return s / compare.length;
}
