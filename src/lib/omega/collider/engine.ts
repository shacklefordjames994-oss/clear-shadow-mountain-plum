/*
 * Digital Hadron Collider Twin — Monte Carlo + detector response.
 * Toy LHC-like kinematics. Pedagogical yields, not an LHC analysis.
 * SIMULATION != OBSERVATION. This module never mints evidence.
 * Twin != control system: no beam actuation lives here.
 */

import { RNG } from "../scinet/master";

export type ColliderMode = "standard" | "dm" | "top" | "z" | "higgs" | "entangled";
export type ProcessId =
  | "QCD_jets"
  | "Drell_Yan"
  | "diboson"
  | "ttbar"
  | "higgs_like"
  | "dark_matter_candidate"
  | "quantum_correlated";
export type Species =
  | "electron"
  | "muon"
  | "photon"
  | "jet"
  | "neutrino"
  | "dark"
  | "proton";
export type EvidenceClass = "SIMULATED" | "DERIVED" | "INFERRED" | "HYPOTHETICAL";

export interface FourVec {
  E: number;
  px: number;
  py: number;
  pz: number;
}

export interface Particle extends FourVec {
  id: string;
  name: Species;
  mass: number;
  charge: number;
  pT: number;
  eta: number;
  phi: number;
  visible: boolean;
}

export interface DetectedParticle extends Particle {
  measuredPT: number;
  trackerHit: boolean;
  ecalHit: boolean;
  hcalHit: boolean;
  muonHit: boolean;
  triggered: boolean;
}

export interface QuantumReport {
  correlation: number;
  purity: number;
  entropy: number;
  chsh: number;
  classification: "CONTROL" | "CORRELATED" | "STRONG_CORRELATION";
}

export interface Reconstruction {
  leptonCount: number;
  jetCount: number;
  photonCount: number;
  invariantMasses: number[];
  maxMass: number;
  MET: number;
  metPhi: number;
  truthInvisiblePT: number;
  conservationResidual: number;
  vertexZ: number;
}

export interface CollisionEvent {
  id: string;
  process: ProcessId;
  beamEnergyGeV: number;
  luminosityFb: number;
  partons: { flavor: string; x: number }[];
  generated: Particle[];
  detected: DetectedParticle[];
  reconstruction: Reconstruction;
  dmScore: number;
  quantum: QuantumReport;
  evidence: EvidenceClass;
  seed: number;
}

export interface AcceleratorConfig {
  beamEnergyGeV: number;
  luminosityFb: number;
  bunches: number;
  crossingNs: number;
  inelasticMb: number;
}

export const DEFAULT_ACCEL: AcceleratorConfig = {
  beamEnergyGeV: 6800,
  luminosityFb: 35,
  bunches: 2556,
  crossingNs: 25,
  inelasticMb: 80,
};

export const PDG: Record<Species, { mass: number; charge: number }> = {
  electron: { mass: 0.000511, charge: -1 },
  muon: { mass: 0.10566, charge: -1 },
  photon: { mass: 0, charge: 0 },
  jet: { mass: 0.14, charge: 0 },
  neutrino: { mass: 0, charge: 0 },
  dark: { mass: 100, charge: 0 },
  proton: { mass: 0.938, charge: 1 },
};

const B_FIELD = 2;
const FLAVORS = ["u", "d", "s", "c", "g"] as const;

export function pT(v: FourVec): number {
  return Math.hypot(v.px, v.py);
}

export function massOf(v: FourVec): number {
  return Math.sqrt(Math.max(0, v.E * v.E - v.px * v.px - v.py * v.py - v.pz * v.pz));
}

export function etaOf(v: FourVec): number {
  const p = Math.hypot(v.px, v.py, v.pz);
  if (p === 0) return 0;
  const arg = (p + v.pz) / Math.max(1e-12, p - v.pz);
  return 0.5 * Math.log(Math.max(1e-12, arg));
}

export function phiOf(v: FourVec): number {
  return Math.atan2(v.py, v.px);
}

export function add4(a: FourVec, b: FourVec): FourVec {
  return { E: a.E + b.E, px: a.px + b.px, py: a.py + b.py, pz: a.pz + b.pz };
}

export function fourFrom(mass: number, pt: number, eta: number, phi: number): FourVec {
  const px = pt * Math.cos(phi);
  const py = pt * Math.sin(phi);
  const pz = pt * Math.sinh(eta);
  const E = Math.sqrt(Math.max(0, mass * mass + px * px + py * py + pz * pz));
  return { E, px, py, pz };
}

export function invariantMass(a: FourVec, b: FourVec): number {
  return massOf(add4(a, b));
}

function boost(v: FourVec, parent: FourVec): FourVec {
  const m = Math.max(1e-9, massOf(parent));
  const g = parent.E / m;
  const bx = parent.px / parent.E;
  const by = parent.py / parent.E;
  const bz = parent.pz / parent.E;
  const b2 = bx * bx + by * by + bz * bz;
  if (b2 < 1e-12) return v;
  const bp = bx * v.px + by * v.py + bz * v.pz;
  const g2 = g * g / (g + 1);
  return {
    E: g * (v.E + bp),
    px: v.px + g2 * bp * bx + g * bx * v.E,
    py: v.py + g2 * bp * by + g * by * v.E,
    pz: v.pz + g2 * bp * bz + g * bz * v.E,
  };
}

function twoBody(parent: FourVec, m1: number, m2: number, rng: RNG): [FourVec, FourVec] {
  const M = Math.max(massOf(parent), m1 + m2 + 1e-6);
  const pStar = Math.sqrt(Math.max(0, (M * M - (m1 + m2) ** 2) * (M * M - (m1 - m2) ** 2))) / (2 * M);
  const cos = 2 * rng.next() - 1;
  const sin = Math.sqrt(Math.max(0, 1 - cos * cos));
  const phi = 2 * Math.PI * rng.next();
  const aRest: FourVec = {
    E: Math.sqrt(m1 * m1 + pStar * pStar),
    px: pStar * sin * Math.cos(phi),
    py: pStar * sin * Math.sin(phi),
    pz: pStar * cos,
  };
  const bRest: FourVec = {
    E: Math.sqrt(m2 * m2 + pStar * pStar),
    px: -aRest.px,
    py: -aRest.py,
    pz: -aRest.pz,
  };
  return [boost(aRest, parent), boost(bRest, parent)];
}

function bw(rng: RNG, M: number, width: number): number {
  return M + (width / 2) * Math.tan(Math.PI * (rng.next() - 0.5));
}

function particle(name: Species, fv: FourVec, charge = PDG[name].charge): Particle {
  return {
    id: `${name}-${Math.abs(fv.px * 1e6).toFixed(0)}`,
    name,
    mass: PDG[name].mass,
    charge,
    pT: pT(fv),
    eta: etaOf(fv),
    phi: phiOf(fv),
    visible: name !== "neutrino" && name !== "dark",
    ...fv,
  };
}

function sampleParent(rng: RNG, mass: number, meanPt: number): FourVec {
  const pt = Math.max(1, Math.abs(rng.gaussian()) * meanPt * 0.55 + meanPt * 0.45);
  const eta = (rng.next() * 2 - 1) * 2.2;
  const phi = rng.next() * 2 * Math.PI;
  return fourFrom(mass, pt, eta, phi);
}

function selectProcess(mode: ColliderMode, rng: RNG): ProcessId {
  if (mode === "dm") return "dark_matter_candidate";
  if (mode === "top") return "ttbar";
  if (mode === "z") return "Drell_Yan";
  if (mode === "higgs") return "higgs_like";
  if (mode === "entangled") return "quantum_correlated";
  const u = rng.next();
  if (u < 0.62) return "QCD_jets";
  if (u < 0.78) return "Drell_Yan";
  if (u < 0.88) return "ttbar";
  if (u < 0.95) return "diboson";
  return "higgs_like";
}

function generateFinalState(process: ProcessId, rng: RNG): Particle[] {
  if (process === "Drell_Yan") {
    const m = Math.max(60, Math.min(120, bw(rng, 91.1876, 2.495)));
    const z = sampleParent(rng, m, 28);
    const lepton: Species = rng.next() < 0.5 ? "electron" : "muon";
    const [a, b] = twoBody(z, PDG[lepton].mass, PDG[lepton].mass, rng);
    return [particle(lepton, a, -1), particle(lepton, b, +1)];
  }
  if (process === "higgs_like") {
    const m = Math.max(120, Math.min(130, bw(rng, 125.25, 0.04)));
    const h = sampleParent(rng, m, 22);
    const [a, b] = twoBody(h, 0, 0, rng);
    return [particle("photon", a), particle("photon", b)];
  }
  if (process === "ttbar") {
    const out: Particle[] = [];
    for (let i = 0; i < 2; i++) {
      const top = sampleParent(rng, 172.76, 80);
      const [w, bjet] = twoBody(top, 80.379, 5, rng);
      out.push(particle("jet", bjet));
      if (rng.next() < 0.45) {
        const lep: Species = rng.next() < 0.5 ? "muon" : "electron";
        const [l, n] = twoBody(w, PDG[lep].mass, 0, rng);
        out.push(particle(lep, l, rng.next() < 0.5 ? -1 : 1), particle("neutrino", n));
      } else {
        const [j1, j2] = twoBody(w, 0.14, 0.14, rng);
        out.push(particle("jet", j1), particle("jet", j2));
      }
    }
    return out;
  }
  if (process === "dark_matter_candidate") {
    const s = sampleParent(rng, 280, 60);
    const [vis, inv] = twoBody(s, 40, 200, rng);
    const [j1, j2] = twoBody(vis, 0.14, 0.14, rng);
    const [d1, d2] = twoBody(inv, PDG.dark.mass, PDG.dark.mass, rng);
    return [particle("jet", j1), particle("jet", j2), particle("dark", d1), particle("dark", d2)];
  }
  if (process === "quantum_correlated") {
    const m = Math.max(80, Math.min(100, bw(rng, 91.1876, 2.495)));
    const z = sampleParent(rng, m, 18);
    const [a, b] = twoBody(z, PDG.electron.mass, PDG.electron.mass, rng);
    return [particle("electron", a, -1), particle("electron", b, +1)];
  }
  if (process === "diboson") {
    const w = sampleParent(rng, 80.379, 40);
    const z = sampleParent(rng, 91.1876, 36);
    const [l, n] = twoBody(w, PDG.muon.mass, 0, rng);
    const [e1, e2] = twoBody(z, PDG.electron.mass, PDG.electron.mass, rng);
    return [particle("muon", l), particle("neutrino", n), particle("electron", e1, -1), particle("electron", e2, +1)];
  }
  const n = 2 + Math.floor(rng.next() * 4);
  const jets: Particle[] = [];
  for (let i = 0; i < n; i++) {
    const pt = 18 + Math.abs(rng.gaussian()) * 42;
    const eta = (rng.next() * 2 - 1) * 2.4;
    const phi = rng.next() * 2 * Math.PI;
    jets.push(particle("jet", fourFrom(0.14, pt, eta, phi), rng.next() < 0.4 ? (rng.next() < 0.5 ? -1 : 1) : 0));
  }
  return jets;
}

function smearPt(pT0: number, name: Species, rng: RNG): number {
  const rel =
    name === "muon" || name === "electron"
      ? 0.012 * (pT0 / 100) + 0.006
      : name === "photon"
        ? 0.1 / Math.sqrt(Math.max(pT0, 1)) + 0.007
        : 0.5 / Math.sqrt(Math.max(pT0, 1)) + 0.04;
  return Math.max(0.2, pT0 * (1 + rng.gaussian() * rel));
}

function detectorResponse(particles: Particle[], rng: RNG): DetectedParticle[] {
  return particles.filter((p) => p.visible).map((p) => {
    const measuredPT = smearPt(p.pT, p.name, rng);
    const scale = measuredPT / Math.max(p.pT, 1e-6);
    const px = p.px * scale;
    const py = p.py * scale;
    const pz = p.pz * scale;
    const E = Math.sqrt(p.mass * p.mass + px * px + py * py + pz * pz);
    return {
      ...p,
      px,
      py,
      pz,
      E,
      pT: measuredPT,
      measuredPT,
      trackerHit: p.charge !== 0 && Math.abs(p.eta) < 2.5,
      ecalHit: p.name === "electron" || p.name === "photon",
      hcalHit: p.name === "jet",
      muonHit: p.name === "muon",
      triggered: measuredPT > (p.name === "jet" ? 40 : 20),
    };
  });
}

function reconstruct(generated: Particle[], detected: DetectedParticle[]): Reconstruction {
  const leptons = detected.filter((p) => p.name === "electron" || p.name === "muon");
  const photons = detected.filter((p) => p.name === "photon");
  const jets = detected.filter((p) => p.name === "jet");
  const masses: number[] = [];
  const pairs = leptons.length >= 2 ? leptons : photons;
  for (let i = 0; i < pairs.length; i++) {
    for (let j = i + 1; j < pairs.length; j++) masses.push(invariantMass(pairs[i], pairs[j]));
  }
  let sx = 0;
  let sy = 0;
  for (const p of detected) {
    sx += p.px;
    sy += p.py;
  }
  const MET = Math.hypot(sx, sy);
  let tx = 0;
  let ty = 0;
  let te = 0;
  let tpx = 0;
  let tpy = 0;
  let tpz = 0;
  for (const p of generated) {
    te += p.E;
    tpx += p.px;
    tpy += p.py;
    tpz += p.pz;
    if (!p.visible) {
      tx += p.px;
      ty += p.py;
    }
  }
  const conservationResidual = Math.hypot(tpx, tpy, tpz) / Math.max(1, te);
  return {
    leptonCount: leptons.length,
    jetCount: jets.length,
    photonCount: photons.length,
    invariantMasses: masses,
    maxMass: masses.length ? Math.max(...masses) : 0,
    MET,
    metPhi: Math.atan2(-sy, -sx),
    truthInvisiblePT: Math.hypot(tx, ty),
    conservationResidual,
    vertexZ: 0,
  };
}

function dmScore(process: ProcessId, reco: Reconstruction): number {
  let s = 0;
  if (reco.MET > 120) s += 0.28;
  if (reco.MET > 220) s += 0.22;
  if (reco.jetCount >= 2) s += 0.14;
  if (process === "dark_matter_candidate") s += 0.22;
  if (reco.leptonCount === 0) s += 0.08;
  return Math.min(1, s);
}

function quantumDiagnostics(process: ProcessId, generated: Particle[], rng: RNG): QuantumReport {
  if (process !== "quantum_correlated") {
    return {
      correlation: (rng.next() - 0.5) * 0.24,
      purity: 0.78 + rng.next() * 0.18,
      entropy: 0.2 + rng.next() * 0.5,
      chsh: 1.1 + rng.next() * 0.4,
      classification: "CONTROL",
    };
  }
  const a = generated[0];
  const b = generated[1];
  const dphi = a && b ? Math.abs(((a.phi - b.phi + Math.PI) % (2 * Math.PI)) - Math.PI) : Math.PI;
  const correlation = -Math.cos(dphi) * (0.82 + rng.next() * 0.14);
  const purity = 0.72 + rng.next() * 0.22;
  const rho = Math.min(0.999, Math.abs(correlation));
  const entropy = -rho * Math.log2(Math.max(1e-6, rho)) - (1 - rho) * Math.log2(Math.max(1e-6, 1 - rho));
  const chsh = 2 * Math.SQRT2 * purity * Math.abs(correlation);
  return {
    correlation,
    purity,
    entropy,
    chsh,
    classification: Math.abs(correlation) > 0.75 && chsh > 2 ? "STRONG_CORRELATION" : "CORRELATED",
  };
}

function classify(process: ProcessId): EvidenceClass {
  if (process === "dark_matter_candidate") return "HYPOTHETICAL";
  if (process === "quantum_correlated") return "DERIVED";
  return "SIMULATED";
}

export function generateCollision(rng: RNG, accel: AcceleratorConfig, mode: ColliderMode): CollisionEvent {
  const process = selectProcess(mode, rng);
  const generated = generateFinalState(process, rng);
  const detected = detectorResponse(generated, rng);
  const reconstruction = reconstruct(generated, detected);
  const partons = [
    { flavor: FLAVORS[Math.floor(rng.next() * FLAVORS.length)], x: Math.pow(rng.next(), 2.1) },
    { flavor: FLAVORS[Math.floor(rng.next() * FLAVORS.length)], x: Math.pow(rng.next(), 2.1) },
  ];
  return {
    id: `evt-${(rng.next() * 1e9).toFixed(0)}`,
    process,
    beamEnergyGeV: accel.beamEnergyGeV,
    luminosityFb: accel.luminosityFb,
    partons,
    generated,
    detected,
    reconstruction,
    dmScore: dmScore(process, reconstruction),
    quantum: quantumDiagnostics(process, generated, rng),
    evidence: classify(process),
    seed: rng.next(),
  };
}

export function collisionRateHz(accel: AcceleratorConfig): number {
  const lumiInst = 2e34 * (accel.luminosityFb / 35);
  const sigmaCm2 = accel.inelasticMb * 1e-27;
  return lumiInst * sigmaCm2;
}

export function curvatureRadius(pTGeV: number): number {
  return pTGeV / (0.3 * B_FIELD);
}

export const PROCESS_LABEL: Record<ProcessId, string> = {
  QCD_jets: "QCD jets",
  Drell_Yan: "Drell–Yan / Z",
  diboson: "Diboson",
  ttbar: "t tbar",
  higgs_like: "Higgs-like γγ",
  dark_matter_candidate: "Invisible (χχ)",
  quantum_correlated: "Spin-correlated ll",
};

export const MODE_LABEL: Record<ColliderMode, string> = {
  standard: "Standard Model mix",
  dm: "Dark-matter injection",
  top: "Top quark",
  z: "Z boson",
  higgs: "Higgs-like",
  entangled: "Quantum correlation",
};
