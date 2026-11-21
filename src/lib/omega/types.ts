import type { DimAnalysis } from "./dimensions";

export type AuthorityLevel = "A0" | "A1" | "A2" | "A3" | "A4" | "A5";
export type SecurityStatus = "CLEAR" | "WATCH" | "CONTAINED" | "REJECTED";
export type EvidenceGrade =
  | "STRONG"
  | "MODERATE"
  | "LIMITED"
  | "PRELIMINARY"
  | "HYPOTHESIS"
  | "REJECTED"
  | "UNKNOWN";
export type EvidenceType = "MEASUREMENT" | "SIMULATION" | "INFERRED" | "LITERATURE" | "THEORETICAL";
export type MemoryType =
  | "WORKING"
  | "EPISODIC"
  | "SEMANTIC"
  | "OBSERVATIONAL"
  | "DECISION"
  | "MISSION"
  | "THEORY"
  | "FAILURE"
  | "AUDIT"
  | "RESEARCH"
  | "SCENARIO";
export type TwinLevel =
  | "COMPONENT"
  | "DEVICE"
  | "ASSET"
  | "SYSTEM"
  | "FACILITY"
  | "BUILDING"
  | "CAMPUS"
  | "UTILITY_NETWORK"
  | "TRANSPORT_NETWORK"
  | "WATER_NETWORK"
  | "ENERGY_NETWORK"
  | "COMMUNICATION_NETWORK"
  | "CITY"
  | "COUNTY"
  | "REGION"
  | "STATE"
  | "COUNTRY"
  | "CONTINENT"
  | "PLANETARY_SYSTEM"
  | "GLOBAL_SYSTEM";
export type StateClass =
  | "OBSERVED"
  | "MEASURED"
  | "ESTIMATED"
  | "PREDICTED"
  | "SIMULATED"
  | "RECONSTRUCTED"
  | "FORECAST"
  | "SCENARIO"
  | "COUNTERFACTUAL"
  | "TRUSTED"
  | "QUARANTINED"
  | "UNKNOWN";
export type AgentRole =
  | "OBSERVER"
  | "PHYSICS"
  | "FORECAST"
  | "SCENARIO"
  | "OPTIMIZATION"
  | "RISK"
  | "SECURITY"
  | "RECOVERY"
  | "AUDITOR"
  | "COORDINATOR"
  | "THEORY"
  | "VALIDATION"
  | "EVIDENCE"
  | "RESEARCH"
  | "MODEL_DISCOVERY"
  | "MISSION"
  | "RESILIENCE"
  | "RED_TEAM"
  | "KNOWLEDGE";
export type AgentStatus = "idle" | "working" | "blocked" | "dissent";
export type PipelineStage =
  | "INGEST"
  | "AUTHENTICATE"
  | "CLASSIFY"
  | "QUALITY_GATE"
  | "OBSERVE"
  | "ESTIMATE"
  | "RECONSTRUCT"
  | "UNDERSTAND"
  | "SIMULATE"
  | "FORECAST"
  | "CAUSAL_ANALYSIS"
  | "SCENARIO_GENERATION"
  | "RISK"
  | "OPTIMIZATION"
  | "AGENT_COORDINATION"
  | "RED_TEAM"
  | "VALIDATION"
  | "POLICY"
  | "AUTHORITY"
  | "ACTION_OR_RECOMMENDATION"
  | "OUTCOME_VERIFICATION"
  | "RECOVERY"
  | "LEARNING"
  | "MEMORY"
  | "KNOWLEDGE_UPDATE"
  | "MODEL_REVALIDATION"
  | "AUDIT"
  | "CONTINUE";
export type ScenarioKind =
  | "BASELINE"
  | "ADVERSE"
  | "WORST_CASE"
  | "STRESS_TEST"
  | "FAILURE"
  | "CASCADE"
  | "RECOVERY"
  | "POLICY"
  | "COUNTERFACTUAL"
  | "EXPLORATORY";
export type TeamPattern = "SCIENCE" | "ENGINEERING" | "SECURITY" | "MISSION";
export type TurbulenceModel = "DNS" | "LES" | "RANS";
export type DigiSimField = "DYE" | "SPEED" | "DIV";
export type DigiSimFault = "NOMINAL" | "FAN_STALL" | "BLOCKAGE";

export interface DigiSimProbe {
  nx: number;
  ny: number;
  u: number;
  v: number;
  speed: number;
  dye: number;
}
export type TheoryRegime =
  | "VALIDATED"
  | "INTERPOLATION"
  | "NEAR_BOUNDARY"
  | "EXTRAPOLATION"
  | "OUT_OF_DOMAIN"
  | "UNRESOLVED";
export type CheckStatus = "PASS" | "FAIL" | "WARN" | "BLOCK";

export interface OmegaEvent {
  eventId: string;
  type: string;
  source: string;
  timestamp: number;
  sequence: number;
  parentEvent?: string;
  stateId: string;
  payloadHash: string;
  modelHash: string;
  policyHash: string;
  authority: AuthorityLevel;
  security: SecurityStatus;
  provenance: string[];
  payload: Record<string, unknown>;
  rejected?: boolean;
  rejectedReason?: string;
  signature: string;
}

export interface TwinNode {
  id: string;
  name: string;
  level: TwinLevel;
  parentId: string | null;
  domain: string;
  stateClass: StateClass;
  observed: Record<string, number | string>;
  estimated: Record<string, number | string>;
  uncertainty: number;
  quality: number;
  risk: number;
  trusted: boolean;
  localAuthority: string;
}

export interface AgentRecord {
  id: string;
  name: string;
  role: AgentRole;
  domain: string;
  status: AgentStatus;
  authority: AuthorityLevel;
  lastOutput: string;
  dissent?: string;
}

export interface MissionLog {
  at: number;
  agentId: string;
  stage: PipelineStage;
  note: string;
}

export interface Mission {
  id: string;
  objective: string;
  pattern: TeamPattern;
  stageIndex: number;
  status: "idle" | "running" | "complete" | "blocked";
  recommendation?: string;
  dissent?: string[];
  log: MissionLog[];
}

export interface ScenarioRecord {
  id: string;
  name: string;
  kind: ScenarioKind;
  parentId: string | null;
  twinId: string;
  assumptions: string[];
  probability: number;
  uncertainty: number;
  risk: number;
  outcome: string;
  ran: boolean;
  hash: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  safety: number;
  resilience: number;
  cost: number;
  performance: number;
  feasible: boolean;
  constraintNote?: string;
}

export interface DecisionRecord {
  id: string;
  objective: string;
  options: DecisionOption[];
  recommendationId: string;
  status: "open" | "recommended" | "blocked";
  hardConstraints: string[];
}

export interface EvidenceRecord {
  id: string;
  type: EvidenceType;
  grade: EvidenceGrade;
  claim: string;
  source: string;
  domain: string;
  uncertainty: number;
  relations: { kind: string; targetId: string }[];
  hash: string;
}

export interface MemoryRecord {
  id: string;
  type: MemoryType;
  content: string;
  source: string;
  confidence: number;
  valid: boolean;
  createdAt: number;
}

export interface TheoryVariable {
  symbol: string;
  meaning: string;
  dimension: string;
}

export interface TheoryCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface ValidationReport {
  at: number;
  hash: string;
  checks: TheoryCheck[];
  regime: TheoryRegime;
  hardReject: boolean;
  certifiable: false;
  summary: string;
  conflicts: string[];
  dimensional: DimAnalysis;
}

export interface TheoryRecord {
  id: string;
  version: string;
  domain: string;
  title: string;
  equations: string;
  assumptions: string[];
  variables: TheoryVariable[];
  conservation: string[];
  scale: "continuum" | "lumped" | "quantum" | "mixed" | "unknown";
  symmetries: string[];
  failures: string[];
  regime: TheoryRegime;
  status: "HYPOTHESIS" | "REJECTED" | "VALIDATED";
  evidenceGrade: EvidenceGrade;
  certified: boolean;
  conflictsWith: string[];
  note: string;
  lastReport?: ValidationReport;
}

export interface PhysicsMetrics {
  massResidual: number;
  maxDivergence: number;
  cfl: number;
  kineticEnergy: number;
  nonFinite: boolean;
  inBounds: boolean;
  regime: "VALIDATED" | "INTERPOLATION" | "NEAR_BOUNDARY" | "EXTRAPOLATION";
  turbulence: TurbulenceModel;
  failures: string[];
  reStar: number;
  maxSpeed: number;
  simHotspotC: number;
  simDeltaT: number;
}

export interface DarkMatterSnapshot {
  seed: number;
  massGeV: number;
  log10Sigma: number;
  exposureDays: number;
  fiducialMassKg: number;
  lastSummary: {
    total: number;
    accepted: number;
    nrLike: number;
    preferred: string;
    state: string;
    blockers: string[];
    discoveryGate: boolean;
    hypothesis?: string;
    logBayesH1H0?: number;
    replicationScore?: number;
    runState?: string;
    approxZ?: number;
  } | null;
}

export interface ColliderSnapshot {
  seed: number;
  beamEnergyGeV: number;
  luminosityFb: number;
  eventCount: number;
  mode: "standard" | "dm" | "top" | "z" | "higgs" | "entangled";
  systemId: string;
  generator: "GEN_A" | "GEN_B" | "GEN_C";
  lastSummary: {
    process: string;
    preferred: string;
    approxZ: number;
    state: string;
    blockers: string[];
    discoveryGate: boolean;
    events: number;
    meanMass: number;
    meanMET: number;
    systemId?: string;
    sqrtSNNTeV?: number;
    preferredGenerator?: string;
  } | null;
}

export interface PackageSnapshot {
  experimentId: string;
  schema: string;
  seed: number;
  systemId: string;
  contentHash: string;
  sha256: string | null;
  preferredGenerator: string;
  epistemic: "SCI:SIMULATED";
  discoveryEligible: false;
}

export interface KernelSnapshot {
  seed: number;
  emitN_m: number;
  crabFraction: number;
  mode: "DISTRIBUTION" | "MACRO";
  residual: number;
  goldenPass: boolean;
  lumiE34: number;
}

export interface GuardProbe {
  id: string;
  domain: string;
  layer: string;
  result: "blocked" | "contained" | "watched";
  note: string;
  at: number;
}

export interface OmegaState {
  version: string;
  sequence: number;
  clock: number;
  authority: AuthorityLevel;
  security: SecurityStatus;
  pipelineIndex: number;
  selectedTwinId: string;
  selectedScenarioId: string;
  lastScenarioId: string | null;
  selectedTheoryId: string;
  events: OmegaEvent[];
  twins: TwinNode[];
  agents: AgentRecord[];
  mission: Mission | null;
  scenarios: ScenarioRecord[];
  decisions: DecisionRecord[];
  evidence: EvidenceRecord[];
  memories: MemoryRecord[];
  theories: TheoryRecord[];
  probes: GuardProbe[];
  physics: PhysicsMetrics;
  physicsRunning: boolean;
  physicsField: DigiSimField;
  physicsProbe: DigiSimProbe | null;
  physicsResetNonce: number;
  physicsFault: DigiSimFault;
  darkMatter: DarkMatterSnapshot;
  collider: ColliderSnapshot;
  kernel: KernelSnapshot;
  experimentPackage: PackageSnapshot | null;
  tickCount: number;
  rejectedCount: number;
  organizedAt: number | null;
  voiceSpeaker: string | null;
  voiceFocus: "TPC" | "T14" | "SPACETIME" | "GUARD" | null;
}
