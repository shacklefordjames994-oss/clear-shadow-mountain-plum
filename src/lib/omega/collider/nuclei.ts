/*
 * Nucleus collision engine.
 * Energy is per nucleon pair: sqrt(s_NN), not the nucleus total energy.
 * 2025 LHC oxygen campaign presets: p–O 9.62 TeV, O–O / Ne–Ne 5.36 TeV.
 * Twin != machine. These are laboratory geometries, not beam control.
 */

export type IonId = "p" | "He" | "N" | "O" | "Ne" | "Xe" | "Pb";

export interface IonSpec {
  id: IonId;
  name: string;
  A: number;
  Z: number;
  radiusFm: number;
}

export const IONS: Record<IonId, IonSpec> = {
  p: { id: "p", name: "proton", A: 1, Z: 1, radiusFm: 0.84 },
  He: { id: "He", name: "helium-4", A: 4, Z: 2, radiusFm: 1.68 },
  N: { id: "N", name: "nitrogen-14", A: 14, Z: 7, radiusFm: 2.61 },
  O: { id: "O", name: "oxygen-16", A: 16, Z: 8, radiusFm: 2.70 },
  Ne: { id: "Ne", name: "neon-20", A: 20, Z: 10, radiusFm: 2.98 },
  Xe: { id: "Xe", name: "xenon-129", A: 129, Z: 54, radiusFm: 5.56 },
  Pb: { id: "Pb", name: "lead-208", A: 208, Z: 82, radiusFm: 6.62 },
};

export interface CollisionSystem {
  id: string;
  projectile: IonId;
  target: IonId;
  energyAGeV: number;
  energyBGeV: number;
  label: string;
  campaign: string;
}

/** Ultra-relativistic √s_NN ≈ 2 √(E_A E_B) with E per nucleon. */
export function sqrtSNN(sys: CollisionSystem): number {
  return 2 * Math.sqrt(sys.energyAGeV * sys.energyBGeV);
}

export const CAMPAIGNS: CollisionSystem[] = [
  {
    id: "pp",
    projectile: "p",
    target: "p",
    energyAGeV: 6800,
    energyBGeV: 6800,
    label: "p–p",
    campaign: "√s = 13.6 TeV",
  },
  {
    id: "pO",
    projectile: "p",
    target: "O",
    energyAGeV: 6800,
    energyBGeV: 3400,
    label: "p–O",
    campaign: "√s_NN = 9.62 TeV · July 2025",
  },
  {
    id: "OO",
    projectile: "O",
    target: "O",
    energyAGeV: 2680,
    energyBGeV: 2680,
    label: "O–O",
    campaign: "√s_NN = 5.36 TeV · July 2025",
  },
  {
    id: "NeNe",
    projectile: "Ne",
    target: "Ne",
    energyAGeV: 2680,
    energyBGeV: 2680,
    label: "Ne–Ne",
    campaign: "√s_NN = 5.36 TeV · July 2025",
  },
  {
    id: "pN",
    projectile: "p",
    target: "N",
    energyAGeV: 6800,
    energyBGeV: 3400,
    label: "p–N",
    campaign: "air analogue · not a 2025 LHC species",
  },
  {
    id: "pHe",
    projectile: "p",
    target: "He",
    energyAGeV: 6800,
    energyBGeV: 3400,
    label: "p–He",
    campaign: "light-ion analogue",
  },
  {
    id: "PbPb",
    projectile: "Pb",
    target: "Pb",
    energyAGeV: 2510,
    energyBGeV: 2510,
    label: "Pb–Pb",
    campaign: "√s_NN = 5.02 TeV · large-system analogue",
  },
];

export function campaignById(id: string): CollisionSystem {
  return CAMPAIGNS.find((c) => c.id === id) ?? CAMPAIGNS[1];
}

export interface GlauberEvent {
  bFm: number;
  nPart: number;
  nColl: number;
  centrality: number;
}

export function sampleGlauber(projectile: IonId, target: IonId, u1: number, u2: number): GlauberEvent {
  const a = IONS[projectile];
  const t = IONS[target];
  const bMax = a.radiusFm + t.radiusFm + 1.2;
  const bFm = bMax * Math.sqrt(Math.min(0.999, u1));
  const overlap = Math.exp((-bFm * bFm) / (2 * (a.radiusFm ** 2 + t.radiusFm ** 2 + 0.8)));
  const nColl = Math.max(1, Math.round(a.A * t.A * 0.018 * overlap * (0.7 + 0.6 * u2)));
  const nPart = Math.max(
    2,
    Math.min(a.A + t.A, Math.round((a.A + t.A) * 0.22 * overlap + (projectile === "p" ? 1 : 2))),
  );
  const centrality = Math.min(100, (bFm / bMax) ** 2 * 100);
  return { bFm, nPart, nColl, centrality };
}

export interface Nucleon {
  nucleonId: number;
  type: "proton" | "neutron";
  x: number;
  y: number;
  z: number;
}

/** Uniform-sphere toy nucleons. Replace with Woods-Saxon for production. */
export function generateNucleus(id: IonId, jitter: number): Nucleon[] {
  const cfg = IONS[id];
  const nucleus: Nucleon[] = [];
  const R = cfg.radiusFm;
  for (let i = 0; i < cfg.A; i++) {
    const u = ((Math.sin((i + 1) * (12.9898 + jitter)) * 43758.5453) % 1 + 1) % 1;
    const v = ((Math.sin((i + 1) * (78.233 + jitter)) * 24634.634) % 1 + 1) % 1;
    const w = ((Math.sin((i + 1) * (39.425 + jitter)) * 18273.1) % 1 + 1) % 1;
    const theta = Math.acos(2 * v - 1);
    const phi = 2 * Math.PI * w;
    const radius = R * Math.cbrt(u);
    nucleus.push({
      nucleonId: i,
      type: i < cfg.Z ? "proton" : "neutron",
      x: radius * Math.sin(theta) * Math.cos(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
      z: radius * Math.cos(theta),
    });
  }
  return nucleus;
}

export const FORWARD = {
  atlasIp: { x: 0, y: 0, z: 0 },
  lhcfZm: 140,
  acceptanceMrad: 1,
  zdcZm: 140,
};

export const ATLAS_PO_LITERATURE = {
  sqrtSNNTeV: 9.62,
  luminosityUb: 634,
  selectedEvents: 246_000_000,
  pTminGeV: 0.5,
  etaMax: 2.5,
  sigmaFidMb: 396,
  sigmaFidUncExpMb: 6,
  sigmaFidUncLumiMb: 9,
  sigmaPairMb: 406,
  relativeUnc: 0.03,
  source: "ATLAS CERN-EP-2026-106 / Phys. Rev. Lett. — literature calibration, not an observation by this twin",
  caveat:
    "ATLAS measured charged-particle production in p–O. It did not reproduce an atmospheric air shower inside the LHC.",
};
