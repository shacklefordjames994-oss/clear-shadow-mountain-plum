/*
 * DHC-TWIN v13 — portable experiment package.
 * Leave-one-out robustness. Stable is not evidence.
 * Frozen protocol / blind box. Freeze is not an observation.
 * Unblind of synthetic is refused.
 * One sealed JSON for collider, cosmic, TPC, and DigiSim slices.
 * Asimov expected sensitivity travels as a diagnostic, never as data.
 * Import/export/replay never promotes SIMULATED to OBSERVED.
 */

import { DHC_VERSION, OMEGA_VERSION } from "../constants";
import { hashObject, omegaHash, stableStringify } from "../hash";
import { runUniversalLab, type ScientificFirewall } from "../collider/lab";
import { CAMPAIGNS } from "../collider/nuclei";
import { type GeneratorId } from "../collider/generators";
import { DEFAULT_DETECTOR, DEFAULT_DM, DEFAULT_HALO } from "../dark-matter/engine";
import { composeLabRun } from "../dark-matter/research-engine";
import { sha256, SCINET_VERSION } from "../scinet/master";
import { scanProfile, type ProfileBin, type ProfileScan } from "../scinet/statistics/ProfileLikelihood";
import { scanAsimov, type AsimovResult } from "../scinet/statistics/Asimov";
import { robustnessFromBins, type PackageRobustness } from "../scinet/robustness/PackageRobustness";
import { draftProtocol, protocolBlockers, type AnalysisProtocol } from "../scinet/core/Protocol";
import type { DarkMatterSnapshot, PhysicsMetrics } from "../types";
import type { UniversalLabRun } from "../collider/lab";

export const PACKAGE_SCHEMA = "DHC-TWIN-v13" as const;
export const ACCEPTED_SCHEMAS = [
  "DHC-TWIN-v8",
  "DHC-TWIN-v9",
  "DHC-TWIN-v11",
  "DHC-TWIN-v12",
  "DHC-TWIN-v13",
] as const;

export interface SweepRow {
  systemId: string;
  label: string;
  sqrtSNNTeV: number;
  preferredGenerator: GeneratorId;
  chi2: Record<GeneratorId, number>;
  meanNch: number;
  meanForwardGeV: number;
  discoveryGate: false;
}

export interface ExperimentPackage {
  schema: typeof PACKAGE_SCHEMA;
  experimentId: string;
  createdAt: string;
  versions: { omega: string; dhc: string; scinet: string; protocol: string };
  seed: number;
  configuration: {
    systemId: string;
    generator: GeneratorId;
    eventCount: number;
    beamEnergyGeV: number;
    luminosityFb: number;
    mode: string;
  };
  collider: {
    label: string;
    campaign: string;
    sqrtSNNTeV: number;
    meanNch: number;
    meanPT: number;
    meanForwardGeV: number;
    chi2: Record<GeneratorId, number>;
    preferredGenerator: GeneratorId;
    centrality: number;
    nPart: number;
    nColl: number;
    quench: number;
    qgpInterpretation: "MODEL_DEPENDENT";
  };
  cosmic: {
    target: string;
    generations: number;
    charged: number;
    muons: number;
    groundFlux: number;
    xMaxGcm2: number;
    mapping: "collider-constrains-shower-model";
    evidence: "SIMULATED";
  };
  darkMatter: {
    included: boolean;
    seed: number;
    massGeV: number;
    log10Sigma: number;
    preferred: string | null;
    state: string | null;
    approxZ: number | null;
    discoveryGate: false;
    note: string;
  };
  digisim: {
    included: boolean;
    regime: string | null;
    massResidual: number | null;
    kineticEnergy: number | null;
    note: string;
  };
  sweep: SweepRow[] | null;
  systematics: {
    literatureRelativeUnc: number;
    generatorSpread: number;
    covariance: "TOY_3X3" | "DIAGONAL_TOY";
    names?: string[];
    matrix?: number[][];
    note: string;
  };
  profile?: ProfileScan;
  inference?: {
    bins: ProfileBin[];
    litRelativeUnc: number;
  };
  asimov?: AsimovResult;
  protocol?: AnalysisProtocol;
  robustness?: PackageRobustness;
  statistics: {
    method: string;
    preferredGenerator: GeneratorId;
    chi2Preferred: number;
    muHat?: number;
    q0?: number;
    approxZ?: number;
  };
  validation: {
    firewall: ScientificFirewall;
    blockers: string[];
    graphValid: boolean;
    graphErrors: string[];
    discoveryEligible: false;
    replayable: true;
  };
  evidence: {
    graphId: string;
    nodes: number;
    edges: number;
    terminal: string;
    literatureCalibrates: true;
  };
  hashes: {
    content: string;
    fnv: string;
    sha256: string | null;
  };
  epistemic: "SCI:SIMULATED";
}

export function profileBinsFromLab(lab: UniversalLabRun): { bins: ProfileBin[]; litRelativeUnc: number } {
  const genA = lab.eta.GEN_A;
  const genB = lab.eta.GEN_B;
  const sumA = genA.reduce((s, b) => s + b.observed, 0);
  const sumLit = lab.literatureEta.reduce((s, b) => s + b.observed, 0) || 1;
  const rate = sumA / sumLit;
  return {
    litRelativeUnc: lab.literature.relativeUnc,
    bins: genA.map((b, i) => ({
      lo: b.lo,
      hi: b.hi,
      observed: (lab.literatureEta[i]?.observed ?? 0) * rate,
      background: Math.max(1e-6, b.observed),
      signal: genB[i].observed - b.observed,
    })),
  };
}

export interface AssembleInput {
  seed: number;
  systemId: string;
  generator: GeneratorId;
  eventCount: number;
  beamEnergyGeV: number;
  luminosityFb: number;
  mode: string;
  darkMatter: DarkMatterSnapshot;
  physics: PhysicsMetrics;
  includeTpc: boolean;
  sweep: SweepRow[] | null;
}

function contentPayload(input: {
  seed: number;
  systemId: string;
  generator: string;
  eventCount: number;
  chi2: Record<string, number>;
  preferred: string;
  meanNch: number;
  cosmicCharged: number;
}) {
  return {
    schema: PACKAGE_SCHEMA,
    seed: input.seed,
    systemId: input.systemId,
    generator: input.generator,
    eventCount: input.eventCount,
    chi2: input.chi2,
    preferred: input.preferred,
    meanNch: input.meanNch,
    cosmicCharged: input.cosmicCharged,
  };
}

export function runParameterSweep(seed: number, nEvents: number): SweepRow[] {
  const systems = CAMPAIGNS.filter((c) => c.id === "pO" || c.id === "OO" || c.id === "NeNe");
  const n = Math.max(30, Math.min(80, nEvents));
  return systems.map((sys) => {
    const lab = runUniversalLab(seed, sys.id, "GEN_A", n);
    return {
      systemId: sys.id,
      label: sys.label,
      sqrtSNNTeV: lab.sqrtSNNTeV,
      preferredGenerator: lab.preferredGenerator,
      chi2: lab.chi2,
      meanNch: lab.meanNch,
      meanForwardGeV: lab.meanForwardGeV,
      discoveryGate: false as const,
    };
  });
}

export function assembleExperimentPackage(input: AssembleInput): ExperimentPackage {
  const n = Math.max(40, Math.min(400, Math.round(input.eventCount)));
  const lab = runUniversalLab(input.seed, input.systemId, input.generator, n);
  const spread =
    Object.values(lab.chi2).reduce((s, v) => s + v, 0) / Math.max(1, Object.keys(lab.chi2).length);

  let dmSlice: ExperimentPackage["darkMatter"] = {
    included: false,
    seed: input.darkMatter.seed,
    massGeV: input.darkMatter.massGeV,
    log10Sigma: input.darkMatter.log10Sigma,
    preferred: input.darkMatter.lastSummary?.preferred ?? null,
    state: input.darkMatter.lastSummary?.state ?? null,
    approxZ: input.darkMatter.lastSummary?.approxZ ?? null,
    discoveryGate: false,
    note: input.darkMatter.lastSummary
      ? "TPC slice from last committed lab run. Still SIMULATED."
      : "TPC not committed this session. Config recorded; no synthetic recoils packed.",
  };

  if (input.includeTpc) {
    const tpc = composeLabRun({
      detector: {
        ...DEFAULT_DETECTOR,
        exposureDays: input.darkMatter.exposureDays,
        fiducialMassKg: input.darkMatter.fiducialMassKg,
      },
      dm: {
        ...DEFAULT_DM,
        massGeV: input.darkMatter.massGeV,
        crossSectionCm2: 10 ** input.darkMatter.log10Sigma,
      },
      halo: DEFAULT_HALO,
      seed: input.darkMatter.seed,
    });
    dmSlice = {
      included: true,
      seed: input.darkMatter.seed,
      massGeV: input.darkMatter.massGeV,
      log10Sigma: input.darkMatter.log10Sigma,
      preferred: tpc.research.sciNet.preferredHypothesis,
      state: tpc.research.epistemic.state,
      approxZ: tpc.research.sciNet.approxZ,
      discoveryGate: false,
      note: "Live TPC compose packed as SIMULATED. Likelihood preference is not discovery.",
    };
  }

  const content = contentPayload({
    seed: input.seed,
    systemId: input.systemId,
    generator: input.generator,
    eventCount: n,
    chi2: lab.chi2,
    preferred: lab.preferredGenerator,
    meanNch: lab.meanNch,
    cosmicCharged: lab.shower.charged,
  });
  const contentHash = hashObject(content);

  const { bins, litRelativeUnc } = profileBinsFromLab(lab);
  const profile = scanProfile(bins, litRelativeUnc);
  const asimov = scanAsimov(bins, litRelativeUnc, 1);

  const pkg: ExperimentPackage = {
    schema: PACKAGE_SCHEMA,
    experimentId: omegaHash(`${PACKAGE_SCHEMA}:${input.seed}:${input.systemId}:${Date.now()}`),
    createdAt: new Date().toISOString(),
    versions: {
      omega: OMEGA_VERSION,
      dhc: DHC_VERSION,
      scinet: SCINET_VERSION,
      protocol: PACKAGE_SCHEMA,
    },
    seed: input.seed,
    configuration: {
      systemId: input.systemId,
      generator: input.generator,
      eventCount: n,
      beamEnergyGeV: input.beamEnergyGeV,
      luminosityFb: input.luminosityFb,
      mode: input.mode,
    },
    collider: {
      label: lab.system.label,
      campaign: lab.system.campaign,
      sqrtSNNTeV: lab.sqrtSNNTeV,
      meanNch: lab.meanNch,
      meanPT: lab.meanPT,
      meanForwardGeV: lab.meanForwardGeV,
      chi2: lab.chi2,
      preferredGenerator: lab.preferredGenerator,
      centrality: lab.geometry.centrality,
      nPart: lab.geometry.nPart,
      nColl: lab.geometry.nColl,
      quench: lab.jet.energyLoss,
      qgpInterpretation: "MODEL_DEPENDENT",
    },
    cosmic: {
      target: lab.shower.target,
      generations: lab.shower.generations,
      charged: lab.shower.charged,
      muons: lab.shower.muons,
      groundFlux: lab.shower.groundFlux,
      xMaxGcm2: lab.shower.xMaxGcm2,
      mapping: "collider-constrains-shower-model",
      evidence: "SIMULATED",
    },
    darkMatter: dmSlice,
    digisim: {
      included: true,
      regime: input.physics.regime,
      massResidual: input.physics.massResidual,
      kineticEnergy: input.physics.kineticEnergy,
      note: "DigiSim metrics are a cooling-loop twin, not collider evidence.",
    },
    sweep: input.sweep,
    systematics: {
      literatureRelativeUnc: lab.literature.relativeUnc,
      generatorSpread: spread,
      covariance: "TOY_3X3",
      names: profile.names,
      matrix: profile.matrix,
      note: "Toy 3×3: luminosity, η-scale, literature calibration. Not a profiled LHC covariance.",
    },
    profile,
    inference: { bins, litRelativeUnc },
    asimov,
    protocol: draftProtocol({
      seed: input.seed,
      systemId: input.systemId,
      generator: input.generator,
      eventCount: n,
    }),
    robustness: robustnessFromBins(bins),
    statistics: {
      method: "profiled joint poisson + asimov expected CLs toy",
      preferredGenerator: lab.preferredGenerator,
      chi2Preferred: lab.chi2[lab.preferredGenerator],
      muHat: profile.muHat,
      q0: profile.q0,
      approxZ: profile.approxZ,
    },
    validation: {
      firewall: { ...lab.firewall, discoveryEligible: false },
      blockers: [
        ...lab.blockers,
        "PACKAGE_EXPORT_DOES_NOT_CREATE_OBSERVATIONS",
        "SHA256_OF_SIMULATION_IS_STILL_SIMULATION",
        "PROFILED_TOY_Z_IS_NOT_DISCOVERY",
        "LITERATURE_IS_NOT_THIS_TWIN_DATASET",
        "ASIMOV_DATASET_IS_NOT_DATA",
        "EXPECTED_SENSITIVITY_IS_NOT_A_LIMIT",
        "CLS_TOY_IS_NOT_AN_EXCLUSION",
        "FROZEN_PROTOCOL_IS_NOT_AN_OBSERVATION",
        "UNBLIND_BLOCKED_ON_SYNTHETIC",
        "STABLE_PREFERENCE_IS_NOT_DISCOVERY",
        "LEAVE_ONE_OUT_IS_NOT_REPLICATION",
      ],
      graphValid: lab.graphErrors.length === 0,
      graphErrors: lab.graphErrors,
      discoveryEligible: false,
      replayable: true,
    },
    evidence: {
      graphId: lab.graph.graphId,
      nodes: lab.graph.nodes.length,
      edges: lab.graph.edges.length,
      terminal: lab.ledger.terminal,
      literatureCalibrates: true,
    },
    hashes: {
      content: contentHash,
      fnv: contentHash,
      sha256: null,
    },
    epistemic: "SCI:SIMULATED",
  };

  return pkg;
}

export async function sealPackage(pkg: ExperimentPackage): Promise<ExperimentPackage> {
  const unsigned = { ...pkg, hashes: { ...pkg.hashes, sha256: null } };
  const digest = await sha256(stableStringify(unsigned));
  return { ...pkg, hashes: { ...pkg.hashes, sha256: digest } };
}

export function replayPackage(pkg: ExperimentPackage): {
  match: boolean;
  replayHash: string;
  originalHash: string;
} {
  const lab = runUniversalLab(
    pkg.seed,
    pkg.configuration.systemId,
    pkg.configuration.generator,
    pkg.configuration.eventCount,
  );
  const replayHash = hashObject(
    contentPayload({
      seed: pkg.seed,
      systemId: pkg.configuration.systemId,
      generator: pkg.configuration.generator,
      eventCount: pkg.configuration.eventCount,
      chi2: lab.chi2,
      preferred: lab.preferredGenerator,
      meanNch: lab.meanNch,
      cosmicCharged: lab.shower.charged,
    }),
  );
  return { match: replayHash === pkg.hashes.content, replayHash, originalHash: pkg.hashes.content };
}

export function applyProtocol(pkg: ExperimentPackage, protocol: AnalysisProtocol): ExperimentPackage {
  const extra = protocolBlockers(protocol);
  const blockers = [...pkg.validation.blockers];
  for (const b of extra) if (!blockers.includes(b)) blockers.push(b);
  return {
    ...pkg,
    protocol,
    hashes: { ...pkg.hashes, sha256: null },
    validation: { ...pkg.validation, blockers, discoveryEligible: false },
  };
}

export function validateImported(raw: unknown): { ok: boolean; errors: string[]; pkg?: ExperimentPackage } {
  const errors: string[] = [];
  if (!raw || typeof raw !== "object") return { ok: false, errors: ["NOT_AN_OBJECT"] };
  const p = raw as Record<string, unknown>;
  if (!ACCEPTED_SCHEMAS.includes(p.schema as (typeof ACCEPTED_SCHEMAS)[number])) {
    errors.push(`SCHEMA:${String(p.schema)}`);
  }
  if (p.epistemic && p.epistemic !== "SCI:SIMULATED") errors.push("EPISTEMIC_MUST_REMAIN_SIMULATED");
  const validation = p.validation as { discoveryEligible?: boolean } | undefined;
  if (validation?.discoveryEligible) errors.push("IMPORT_REFUSED_DISCOVERY_ELIGIBLE");
  if (p.schema === PACKAGE_SCHEMA && !p.hashes) errors.push("MISSING_HASHES");
  if (errors.length) return { ok: false, errors };
  return { ok: true, errors: [], pkg: raw as ExperimentPackage };
}
