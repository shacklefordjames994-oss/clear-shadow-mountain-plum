/*
 * Dark Matter Lab adapter — SCI-NETv2 master is the inference engine.
 * This file preserves the lab UI contract (calibration sliders, TPC events)
 * and maps it onto: physics → detector → response → background → statistics
 * → replication → evidence graph → discovery gate.
 *
 * simulation != observation
 * simulation != evidence
 * likelihood preference != discovery
 * This module cannot promote synthetic data to SCI:DISC.
 */

import {
  asSimulated,
  DEFAULT_DETECTOR,
  DEFAULT_DM,
  DEFAULT_HALO,
  type DetectorConfig,
  type DMModel,
  type HaloConfig,
  type SimulatedEvent,
  targetToMedium,
} from "./engine";
import {
  discoveryMetric,
  evaluateDiscoveryGate as sciGate,
  runSciNetPipeline,
  type EvidenceGraph,
  type EvidenceState,
  type GateResult,
  type HypothesisId,
  type InformationGain,
  type LikelihoodResult,
  type ModulationResult,
  type PosteriorSet,
  type PpcResult,
  type ReplicationResult,
  type ResearchRun,
  type RobustnessReport,
  type SciNetRun,
} from "../scinet/master";

export type BackgroundClass =
  | "RADON"
  | "KRYPTON"
  | "GAMMA_BETA"
  | "NEUTRON"
  | "MUON"
  | "ACCIDENTAL"
  | "SURFACE"
  | "ELECTRODE";

export interface BackgroundComponent {
  name: BackgroundClass;
  ratePerKgDay: number;
  spectralSlope: number;
  nrFraction: number;
  uncertaintyFraction: number;
  enabled: boolean;
}

export interface CalibrationParameters {
  energyScale: number;
  energyResolutionScale: number;
  photonEfficiencyScale: number;
  electronGainScale: number;
  electronLifetimeMs: number;
  positionScale: number;
  triggerEfficiency: number;
  nrClassificationBias: number;
}

export interface NuisanceParameters {
  backgroundNormalization: number;
  detectorEfficiency: number;
  energyScale: number;
  resolutionScale: number;
  haloDensityScale: number;
  velocityScale: number;
}

export type { ModulationResult };
export type ModulationBin = ModulationResult["bins"][number];

export interface SensitivityPoint {
  crossSectionCm2: number;
  expectedSignal: number;
  expectedBackground: number;
  discoveryMetric: number;
}

export interface SensitivityCurve {
  massGeV: number;
  points: SensitivityPoint[];
}

export type SciState = EvidenceState;

export interface ResearchResult {
  backgrounds: BackgroundComponent[];
  calibration: CalibrationParameters;
  nuisance: NuisanceParameters;
  modulation: ModulationResult;
  sensitivity: SensitivityCurve;
  eventSummary: {
    total: number;
    accepted: number;
    nrLike: number;
    highEnergy: number;
    expectedBackground: number;
  };
  epistemic: {
    state: SciState;
    discoveryGate: boolean;
    blockers: string[];
  };
  sciNet: {
    run: SciNetRun;
    posterior: PosteriorSet;
    likelihoods: LikelihoodResult[];
    replication: ReplicationResult;
    ppc: PpcResult;
    info: InformationGain;
    evidence: EvidenceGraph;
    gate: GateResult;
    preferredHypothesis: HypothesisId;
    logBayesH1H0: number;
    researchRun: ResearchRun;
    robustness: RobustnessReport;
    ledger: SciNetRun["ledger"];
    joint: SciNetRun["joint"];
    testStatistic: number;
    approxZ: number;
  };
}

export const DEFAULT_BACKGROUNDS: BackgroundComponent[] = [
  { name: "RADON", ratePerKgDay: 0.0002, spectralSlope: 0.03, nrFraction: 0.02, uncertaintyFraction: 0.15, enabled: true },
  { name: "KRYPTON", ratePerKgDay: 0.00012, spectralSlope: 0.025, nrFraction: 0.01, uncertaintyFraction: 0.2, enabled: true },
  { name: "GAMMA_BETA", ratePerKgDay: 0.001, spectralSlope: 0.045, nrFraction: 0.005, uncertaintyFraction: 0.1, enabled: true },
  { name: "NEUTRON", ratePerKgDay: 0.00008, spectralSlope: 0.012, nrFraction: 0.75, uncertaintyFraction: 0.25, enabled: true },
  { name: "MUON", ratePerKgDay: 0.00003, spectralSlope: 0.01, nrFraction: 0.6, uncertaintyFraction: 0.3, enabled: true },
  { name: "ACCIDENTAL", ratePerKgDay: 0.0001, spectralSlope: 0.02, nrFraction: 0.15, uncertaintyFraction: 0.25, enabled: true },
  { name: "SURFACE", ratePerKgDay: 0.00007, spectralSlope: 0.06, nrFraction: 0.1, uncertaintyFraction: 0.3, enabled: true },
  { name: "ELECTRODE", ratePerKgDay: 0.00005, spectralSlope: 0.05, nrFraction: 0.08, uncertaintyFraction: 0.35, enabled: true },
];

export const DEFAULT_CALIBRATION: CalibrationParameters = {
  energyScale: 1,
  energyResolutionScale: 1,
  photonEfficiencyScale: 1,
  electronGainScale: 1,
  electronLifetimeMs: 2,
  positionScale: 1,
  triggerEfficiency: 0.98,
  nrClassificationBias: 0,
};

export const DEFAULT_NUISANCE: NuisanceParameters = {
  backgroundNormalization: 1,
  detectorEfficiency: 1,
  energyScale: 1,
  resolutionScale: 1,
  haloDensityScale: 1,
  velocityScale: 1,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function expectedBackground(
  detector: DetectorConfig,
  components: BackgroundComponent[] = DEFAULT_BACKGROUNDS,
  nuisance: NuisanceParameters = DEFAULT_NUISANCE,
): number {
  let totalRate = 0;
  for (const component of components) {
    if (!component.enabled) continue;
    totalRate += component.ratePerKgDay;
  }
  return totalRate * detector.fiducialMassKg * detector.exposureDays * nuisance.backgroundNormalization;
}

export function calibrateEvent(event: SimulatedEvent, calibration: CalibrationParameters): SimulatedEvent {
  const output = structuredClone(event);
  output.signal.energyKeV *= calibration.energyScale;
  output.signal.s1PE *= calibration.photonEfficiencyScale;
  output.signal.s2PE *= calibration.electronGainScale;
  output.signal.xM *= calibration.positionScale;
  output.signal.yM *= calibration.positionScale;
  output.signal.zM *= calibration.positionScale;
  output.signal.s1PE *= 1 + 0.02 * (calibration.energyResolutionScale - 1);
  output.signal.nrProbability = clamp(output.signal.nrProbability + calibration.nrClassificationBias, 0, 1);
  if (calibration.triggerEfficiency < 1 && output.signal.trigger) {
    const keep = (Math.abs(output.truth.energyKeV * 1000) % 100) / 100 < calibration.triggerEfficiency;
    if (!keep) {
      output.signal.trigger = false;
      output.classification = "VETOED";
    }
  }
  if (output.signal.s1PE > 0.2) output.signal.s2s1 = output.signal.s2PE / output.signal.s1PE;
  return output;
}

export { discoveryMetric };

export function generateSensitivityCurve(detector: DetectorConfig, dm: DMModel): SensitivityCurve {
  const background = expectedBackground(detector);
  const points: SensitivityPoint[] = [];
  for (const crossSection of [1e-39, 1e-41, 1e-43, 1e-45, 1e-47, 1e-49]) {
    const massFactor = Math.max(0.05, Math.min(5, dm.massGeV / 100));
    const signal = detector.exposureDays * detector.fiducialMassKg * (crossSection / 1e-45) * massFactor * 0.002;
    points.push({
      crossSectionCm2: crossSection,
      expectedSignal: signal,
      expectedBackground: background,
      discoveryMetric: discoveryMetric(signal, background),
    });
  }
  return { massGeV: dm.massGeV, points };
}

export function evaluateDiscoveryGate(
  significanceSigma: number,
  independentReplication: boolean,
  backgroundValidated: boolean,
  detectorSystematicsValidated: boolean,
  unblinded: boolean,
  dataState: "SIMULATED" | "OBSERVED",
): { passed: boolean; blockers: string[] } {
  return sciGate({
    significanceSigma,
    independentReplication,
    backgroundValidated,
    detectorSystematicsValidated,
    unblinded,
    ppcPassed: false,
    dataState,
  });
}

export function composeLabRun(opts: {
  detector: DetectorConfig;
  dm: DMModel;
  halo: HaloConfig;
  seed: number;
  calibration?: CalibrationParameters;
  backgrounds?: BackgroundComponent[];
  nuisance?: NuisanceParameters;
  extraSignal?: SimulatedEvent[];
}): {
  events: SimulatedEvent[];
  research: ResearchResult;
  expectedSignal: number;
  generatedBackground: number;
} {
  const backgrounds = opts.backgrounds ?? DEFAULT_BACKGROUNDS;
  const nuisance = opts.nuisance ?? DEFAULT_NUISANCE;
  const calibration = opts.calibration ?? DEFAULT_CALIBRATION;
  const exposureTonYears = (opts.detector.fiducialMassKg / 1000) * (opts.detector.exposureDays / 365);
  const run = runSciNetPipeline({
    seed: opts.seed,
    medium: targetToMedium(opts.detector.target),
    halo: {
      rhoDMGeVPerCm3: opts.halo.localDensityGeVcm3 * nuisance.haloDensityScale,
      v0KmPerS: opts.halo.v0KmS * nuisance.velocityScale,
      vEarthKmPerS: opts.halo.vEarthKmS,
      vEscapeKmPerS: opts.halo.vescKmS,
    },
    geometry: {
      radiusM: opts.detector.radiusM,
      heightM: opts.detector.heightM,
      s1ThresholdPE: opts.detector.s1ThresholdPE,
      s2ThresholdPE: opts.detector.s2ThresholdPE,
    },
    massGeV: opts.dm.massGeV,
    crossSectionCm2: opts.dm.crossSectionCm2 * nuisance.haloDensityScale,
    exposureTonYears: exposureTonYears * nuisance.detectorEfficiency,
    backgroundRates: backgrounds.map((b) => ({
      id: b.name,
      label: b.name,
      rate: b.ratePerKgDay,
      slope: b.spectralSlope,
      nrFraction: b.nrFraction,
      unc: b.uncertaintyFraction,
      on: b.enabled,
    })),
    backgroundNorm: nuisance.backgroundNormalization,
    dataState: "SIMULATED",
  });

  const mapped = run.events.map((e) => asSimulated(e, opts.detector));
  const extra = opts.extraSignal ?? [];
  const calibrated = [...mapped, ...extra].map((e) => calibrateEvent(e, calibration));
  const accepted = calibrated.filter((e) => e.signal.trigger && e.classification !== "VETOED");
  const highEnergy = accepted.filter((e) => e.signal.energyKeV >= 200);
  const sensitivity = generateSensitivityCurve(opts.detector, opts.dm);

  return {
    events: calibrated,
    expectedSignal: run.expectedSignal,
    generatedBackground: run.generatedBackground,
    research: {
      backgrounds,
      calibration,
      nuisance,
      modulation: run.modulation,
      sensitivity,
      eventSummary: {
        total: calibrated.length,
        accepted: accepted.length,
        nrLike: accepted.filter((e) => e.classification === "NR_LIKE").length,
        highEnergy: highEnergy.length,
        expectedBackground: run.expectedBackground,
      },
      epistemic: {
        state: run.epistemic,
        discoveryGate: run.gate.passed,
        blockers: run.gate.blockers,
      },
      sciNet: {
        run,
        posterior: run.posterior,
        likelihoods: run.likelihoods,
        replication: run.replication,
        ppc: run.ppc,
        info: run.info,
        evidence: run.evidence,
        gate: run.gate,
        preferredHypothesis: run.posterior.preferred,
        logBayesH1H0: run.posterior.logBayesH1H0,
        researchRun: run.researchRun,
        robustness: run.robustness,
        ledger: run.ledger,
        joint: run.joint,
        testStatistic: run.testStatistic,
        approxZ: run.approxZ,
      },
    },
  };
}

void DEFAULT_DETECTOR;
void DEFAULT_DM;
void DEFAULT_HALO;
