/*
 * Cosmic-ray twin. Mapped from collider-constrained hadronic models.
 * Mapping != identity: a p–O collision is not an air shower.
 * Shower functions are toy cascades, not validated CRMC / CORSIKA.
 */

import { RNG } from "../scinet/master";
import { type GeneratorSpec } from "./generators";

export type ShowerSpecies = "proton" | "pion" | "kaon" | "photon" | "electron" | "muon" | "neutrino" | "nucleon";

export interface ShowerParticle {
  species: ShowerSpecies;
  energyGeV: number;
  xKm: number;
  yKm: number;
  zKm: number;
  generation: number;
  charged: boolean;
}

export interface ShowerHistory {
  generation: number;
  parent: ShowerSpecies;
  nProducts: number;
  energyGeV: number;
}

export interface CosmicShower {
  primaryEnergyGeV: number;
  primary: "proton";
  altitudeKm: number;
  target: "oxygen" | "nitrogen";
  generator: string;
  generations: number;
  particles: ShowerParticle[];
  history: ShowerHistory[];
  charged: number;
  photons: number;
  electrons: number;
  muons: number;
  neutrinos: number;
  groundFlux: number;
  xMaxGcm2: number;
  evidence: "SIMULATED";
  cascade: ShowerParticle[];
}

export const ATMOSPHERE = {
  nitrogen: 0.7808,
  oxygen: 0.2095,
  argon: 0.0093,
  other: 0.0004,
};

function interactProb(energyGeV: number, zKm: number, gen: GeneratorSpec): number {
  const density = Math.exp(-zKm / 7.5);
  const lambda = 85 / (0.7 + 0.3 * gen.multScale);
  return Math.min(0.92, density * (12 / lambda) * (1 + Math.log10(Math.max(10, energyGeV)) / 12));
}

function secondaries(parent: ShowerParticle, rng: RNG, gen: GeneratorSpec): ShowerParticle[] {
  if (parent.species === "muon" || parent.species === "neutrino") return [parent];
  if (parent.energyGeV < 0.4) {
    if (parent.species === "pion" && rng.next() < 0.35) {
      return [
        {
          ...parent,
          species: "muon",
          energyGeV: parent.energyGeV * 0.72,
          charged: true,
          generation: parent.generation + 1,
        },
      ];
    }
    return [];
  }
  const n = Math.max(2, Math.min(7, Math.round(2.2 * gen.multScale + rng.next() * 3)));
  const out: ShowerParticle[] = [];
  let remain = parent.energyGeV * 0.92;
  for (let i = 0; i < n && remain > 0.05; i++) {
    const frac = rng.next() * (1.1 / n);
    const e = Math.max(0.05, remain * frac);
    remain -= e;
    const roll = rng.next();
    let species: ShowerSpecies = "pion";
    let charged = true;
    if (parent.species === "photon" || parent.species === "electron" || roll > 0.72) {
      species = roll > 0.86 ? "photon" : "electron";
      charged = species === "electron";
    } else if (roll < 0.08) {
      species = "muon";
    } else if (roll < 0.12) {
      species = "neutrino";
      charged = false;
    }
    const spread = (rng.next() - 0.5) * 0.18 * (1 + parent.generation * 0.08);
    out.push({
      species,
      energyGeV: e,
      xKm: parent.xKm + spread,
      yKm: parent.yKm + (rng.next() - 0.5) * 0.18,
      zKm: Math.max(0, parent.zKm - 1.4 - rng.next() * 1.2),
      generation: parent.generation + 1,
      charged,
    });
  }
  return out;
}

export function propagateCosmicRay(
  rng: RNG,
  gen: GeneratorSpec,
  primaryEnergyGeV: number,
  altitudeKm: number,
): CosmicShower {
  const target: "oxygen" | "nitrogen" = rng.next() < ATMOSPHERE.oxygen / (ATMOSPHERE.oxygen + ATMOSPHERE.nitrogen) ? "oxygen" : "nitrogen";
  const shower: CosmicShower = {
    primaryEnergyGeV,
    primary: "proton",
    altitudeKm,
    target,
    generator: gen.id,
    generations: 0,
    particles: [
      {
        species: "proton",
        energyGeV: primaryEnergyGeV,
        xKm: 0,
        yKm: 0,
        zKm: altitudeKm,
        generation: 0,
        charged: true,
      },
    ],
    history: [],
    charged: 0,
    photons: 0,
    electrons: 0,
    muons: 0,
    neutrinos: 0,
    groundFlux: 0,
    xMaxGcm2: 0,
    evidence: "SIMULATED",
    cascade: [],
  };
  shower.cascade.push(shower.particles[0]);

  const MAX = 10;
  let xmax = 0;
  let xmaxN = 0;
  for (let generation = 0; generation < MAX; generation++) {
    const next: ShowerParticle[] = [];
    let genEnergy = 0;
    for (const particle of shower.particles) {
      if (particle.zKm <= 0.3) {
        next.push(particle);
        continue;
      }
      if (rng.next() < interactProb(particle.energyGeV, particle.zKm, gen)) {
        const products = secondaries(particle, rng, gen);
        next.push(...products);
        genEnergy += products.reduce((s, p) => s + p.energyGeV, 0);
        shower.history.push({
          generation,
          parent: particle.species,
          nProducts: products.length,
          energyGeV: particle.energyGeV,
        });
      } else {
        next.push({ ...particle, zKm: Math.max(0, particle.zKm - 1.6), generation: particle.generation + 1 });
      }
    }
    const chargedNow = next.filter((p) => p.charged).length;
    if (chargedNow > xmaxN) {
      xmaxN = chargedNow;
      xmax = 1030 * Math.exp(-Math.max(0, next[0]?.zKm ?? 0) / 7.5);
    }
    shower.particles = next.slice(0, 420);
    shower.cascade.push(...shower.particles);
    shower.generations = generation + 1;
    if (next.length === 0) break;
  }

  shower.charged = shower.particles.filter((p) => p.charged).length;
  shower.photons = shower.particles.filter((p) => p.species === "photon").length;
  shower.electrons = shower.particles.filter((p) => p.species === "electron").length;
  shower.muons = shower.particles.filter((p) => p.species === "muon").length;
  shower.neutrinos = shower.particles.filter((p) => p.species === "neutrino").length;
  shower.groundFlux = shower.particles.filter((p) => p.zKm < 1.5).length;
  shower.xMaxGcm2 = xmax;
  return shower;
}

export const SOURCE_HYPOTHESES = [
  "SUPERNOVA_REMNANT",
  "ACTIVE_GALACTIC_NUCLEUS",
  "BLACK_HOLE_ENVIRONMENT",
  "GALACTIC_ACCELERATOR",
  "EXTRAGALACTIC_SOURCE",
  "UNKNOWN",
] as const;

export type SourceHypothesis = (typeof SOURCE_HYPOTHESES)[number];
