/*
 * Compatibility adapter for the TPC / fabric canvases.
 * Detector response, halo physics, and sampling live in SCI-NET master.
 * SIMULATION != OBSERVATION. This layer never mints evidence.
 */

import {
  MAX_RENDER_EVENTS,
  RNG,
  characteristicRecoilKeV as charRecoil,
  poisson,
  reducedMass as sciReducedMass,
  type DetectorMedium,
  type PipelineEvent,
} from "../scinet/master";

export { RNG, poisson, MAX_RENDER_EVENTS };

export type RecoilType = "NR" | "ER";
export type Target = "Xe" | "Ar" | "Ge";
export type EventClass = "NR_LIKE" | "ER_LIKE" | "VETOED";
export type Coupling = "SI" | "SD";

export interface DMModel {
  name: string;
  massGeV: number;
  crossSectionCm2: number;
  coupling: Coupling;
}

export interface DetectorConfig {
  name: string;
  target: Target;
  radiusM: number;
  heightM: number;
  fiducialMassKg: number;
  exposureDays: number;
  s1ThresholdPE: number;
  s2ThresholdPE: number;
  highEnergyMaxKeV: number;
  photonYieldNr: number;
  photonYieldEr: number;
  electronYieldNr: number;
  electronYieldEr: number;
}

export interface HaloConfig {
  localDensityGeVcm3: number;
  v0KmS: number;
  vescKmS: number;
  vEarthKmS: number;
  modulationAmplitude: number;
  modulationPhase: number;
}

export interface TruthEvent {
  id: string;
  state: "SCI:SIMULATED";
  model: string;
  energyKeV: number;
  xM: number;
  yM: number;
  zM: number;
  velocityKmS: number;
  timeDay: number;
  recoilType: RecoilType;
  target: Target;
}

export interface SimulatedEvent {
  truth: TruthEvent;
  quanta: { photons: number; electrons: number; recombination: number };
  signal: {
    s1PE: number;
    s2PE: number;
    xM: number;
    yM: number;
    zM: number;
    energyKeV: number;
    s2s1: number;
    nrProbability: number;
    trigger: boolean;
  };
  veto: {
    muonPass: boolean;
    neutronPass: boolean;
    surfacePass: boolean;
    fiducialPass: boolean;
  };
  classification: EventClass;
}

export const DEFAULT_DETECTOR: DetectorConfig = {
  name: "OMEGA Xe TPC (software twin)",
  target: "Xe",
  radiusM: 0.72,
  heightM: 1.46,
  fiducialMassKg: 1000,
  exposureDays: 365,
  s1ThresholdPE: 2,
  s2ThresholdPE: 80,
  highEnergyMaxKeV: 250,
  photonYieldNr: 8,
  photonYieldEr: 22,
  electronYieldNr: 6,
  electronYieldEr: 32,
};

export const DEFAULT_DM: DMModel = {
  name: "SI WIMP",
  massGeV: 50,
  crossSectionCm2: 1e-46,
  coupling: "SI",
};

export const DEFAULT_HALO: HaloConfig = {
  localDensityGeVcm3: 0.3,
  v0KmS: 220,
  vescKmS: 544,
  vEarthKmS: 232,
  modulationAmplitude: 0.07,
  modulationPhase: 152.5,
};

const XE_MASS_GEV = 122.3;

export function reducedMass(mChi: number, mN = XE_MASS_GEV): number {
  return sciReducedMass(mChi, mN);
}

export function characteristicRecoilKeV(massGeV: number, v0KmS: number): number {
  return charRecoil(massGeV, v0KmS, XE_MASS_GEV);
}

export function expectedSignalCounts(detector: DetectorConfig, dm: DMModel, halo: HaloConfig): number {
  const mu = reducedMass(dm.massGeV);
  const kinematics = Math.max(0.04, Math.min(2.4, (mu / 30) * (halo.localDensityGeVcm3 / 0.3)));
  const threshold = Math.max(0.15, 1 - detector.s1ThresholdPE / 24);
  return (
    detector.fiducialMassKg *
    detector.exposureDays *
    (dm.crossSectionCm2 / 1e-47) *
    kinematics *
    threshold *
    0.0024
  );
}

export function targetToMedium(target: Target): DetectorMedium {
  if (target === "Ar") return "ARGON";
  if (target === "Ge") return "GERMANIUM";
  return "XENON";
}

export function mediumToTarget(medium: DetectorMedium): Target {
  if (medium === "ARGON") return "Ar";
  if (medium === "GERMANIUM") return "Ge";
  return "Xe";
}

export function asSimulated(ev: PipelineEvent, detector: DetectorConfig): SimulatedEvent {
  const trigger = ev.s1PE >= detector.s1ThresholdPE && ev.s2PE >= detector.s2ThresholdPE;
  return {
    truth: {
      id: ev.eventId,
      state: "SCI:SIMULATED",
      model: ev.model,
      energyKeV: ev.recoilEnergyKeV,
      xM: ev.x,
      yM: ev.y,
      zM: ev.z,
      velocityKmS: ev.velocityKmS,
      timeDay: ev.timeDay,
      recoilType: ev.channel,
      target: mediumToTarget(ev.medium),
    },
    quanta: {
      photons: ev.photonsProduced,
      electrons: ev.electronsProduced,
      recombination: ev.channel === "NR" ? 0.62 : 0.34,
    },
    signal: {
      s1PE: ev.s1PE,
      s2PE: ev.s2PE,
      xM: ev.reconstructedX,
      yM: ev.reconstructedY,
      zM: ev.reconstructedZ,
      energyKeV: ev.reconstructedEnergyKeV,
      s2s1: ev.s1PE > 0.2 ? ev.s2PE / ev.s1PE : ev.s2PE,
      nrProbability: ev.nrScore,
      trigger,
    },
    veto: ev.veto,
    classification: ev.classification,
  };
}

export interface EngineResult {
  events: SimulatedEvent[];
  expectedSignal: number;
  generatedSignal: number;
  rendered: number;
  seed: number;
  detector: DetectorConfig;
  dm: DMModel;
  halo: HaloConfig;
}

export function subsample(events: SimulatedEvent[], max: number, rng: RNG): SimulatedEvent[] {
  if (events.length <= max) return events;
  const out: SimulatedEvent[] = [];
  const step = events.length / max;
  for (let i = 0; i < max; i++) {
    const idx = Math.min(events.length - 1, Math.floor(i * step + rng.next() * 0.3));
    out.push(events[idx]);
  }
  return out;
}
