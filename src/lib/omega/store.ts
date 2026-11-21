import { create } from "zustand";
import {
  AUTHORITY_RANK,
  MODEL_HASH,
  PIPELINE,
  POLICY_HASH,
  TEAM_PATTERNS,
} from "./constants";
import { hashObject, omegaHash, shortId } from "./hash";
import { makeSeed } from "./seed";
import { applyReport, validateTheory } from "./theory-validate";
import type {
  AuthorityLevel,
  ColliderSnapshot,
  DarkMatterSnapshot,
  DigiSimFault,
  DigiSimField,
  DigiSimProbe,
  KernelSnapshot,
  OmegaEvent,
  OmegaState,
  PackageSnapshot,
  PhysicsMetrics,
  PipelineStage,
  TeamPattern,
  TurbulenceModel,
} from "./types";

const MAX_EVENTS = 120;

const TYPE_MIN_AUTH: Record<string, AuthorityLevel> = {
  OBSERVE: "A0",
  HEARTBEAT: "A0",
  ANALYZE: "A1",
  RECOMMEND: "A2",
  SIMULATE: "A3",
  OPTIMIZE: "A3",
  SCENARIO_RUN: "A3",
  RECONSTRUCT: "A3",
  PREAUTHORIZED: "A4",
  EXECUTE_PHYSICAL: "A5",
  MODIFY_TRUST_ROOT: "A5",
  ERASE_AUDIT: "A5",
  AUTHORIZE_SELF: "A5",
  CERTIFY_MODEL: "A5",
  AUTO_EXPERIMENT: "A5",
  SWARM_AUTHORIZE: "A5",
  DECLARE_DISCOVERY: "A5",
  SPEAK: "A2",
  VOICE_AUTHORIZE: "A5",
};

function requiredAuthority(type: string): AuthorityLevel {
  return TYPE_MIN_AUTH[type] ?? "A1";
}

type PublishInput = {
  type: string;
  source: string;
  payload?: Record<string, unknown>;
  authority?: AuthorityLevel;
  parentEvent?: string;
  provenance?: string[];
};

interface OmegaActions {
  publish: (input: PublishInput) => OmegaEvent;
  tick: () => void;
  setAuthority: (level: AuthorityLevel) => OmegaEvent;
  trySelfAuthorize: () => OmegaEvent;
  selfOrganize: () => OmegaEvent;
  selectTwin: (id: string) => void;
  selectScenario: (id: string) => void;
  runScenario: (id: string) => OmegaEvent;
  forkScenario: (parentId: string, kind: "COUNTERFACTUAL" | "STRESS_TEST") => void;
  dispatchTeam: (pattern: TeamPattern, objective: string) => void;
  requestExecution: (decisionId: string) => OmegaEvent;
  injectProbe: (domain: string) => void;
  setPhysicsMetrics: (metrics: PhysicsMetrics) => void;
  setPhysicsRunning: (running: boolean) => void;
  setTurbulence: (model: TurbulenceModel) => void;
  setPhysicsField: (field: DigiSimField) => void;
  setPhysicsProbe: (probe: DigiSimProbe | null) => void;
  resetDigiSim: () => void;
  setPhysicsFault: (fault: DigiSimFault) => void;
  commitDigiSimRun: () => OmegaEvent;
  recommendOption: (decisionId: string, optionId: string) => OmegaEvent;
  addTheory: (theory: OmegaState["theories"][number]) => void;
  selectTheory: (id: string) => void;
  runTheoryValidation: (id: string) => void;
  attemptCertify: (id: string) => OmegaEvent;
  addMemory: (content: string, type: OmegaState["memories"][number]["type"]) => void;
  reconstructTwin: (id: string) => void;
  commitDarkMatterRun: (input: {
    seed: number;
    massGeV: number;
    log10Sigma: number;
    exposureDays: number;
    fiducialMassKg: number;
    summary: NonNullable<DarkMatterSnapshot["lastSummary"]>;
  }) => OmegaEvent;
  commitColliderRun: (input: {
    seed: number;
    beamEnergyGeV: number;
    luminosityFb: number;
    eventCount: number;
    mode: ColliderSnapshot["mode"];
    systemId: string;
    generator: ColliderSnapshot["generator"];
    summary: NonNullable<ColliderSnapshot["lastSummary"]>;
  }) => OmegaEvent;
  commitKernelRun: (input: KernelSnapshot) => OmegaEvent;
  authorizeKernelProposal: (id: string) => OmegaEvent;
  refuseAutoExperiment: () => OmegaEvent;
  conveneKernelSwarm: (summary: { seed: number; dissent: number; deny: number; consensus: boolean }) => OmegaEvent;
  refuseSwarmAuthorize: () => OmegaEvent;
  commitKernelCapsule: (input: { contentHash: string; seed: number; match?: boolean }) => OmegaEvent;
  commitKernelFault: (input: { faultId: string; klass: string; seed: number }) => OmegaEvent;
  commitQCorr: (input: { stateId: string; dataset: string; validity: string; fidelity: number; seed: number }) => OmegaEvent;
  commitExperimentPackage: (snap: PackageSnapshot) => OmegaEvent;
  attemptDiscovery: (state: string) => OmegaEvent;
  attemptBeamActuation: () => OmegaEvent;
  speakBriefing: (channel: "LIVE" | "STUDIO", note: string) => OmegaEvent;
  attemptVoiceAuthorize: () => OmegaEvent;
  setVoiceRuntime: (speaker: string | null, focus: OmegaState["voiceFocus"]) => void;
  reset: () => void;
}

export type OmegaStore = OmegaState & OmegaActions;

function eventFrom(state: OmegaState, input: PublishInput): OmegaEvent {
  const sequence = state.sequence + 1;
  const timestamp = Date.now();
  const payload = input.payload ?? {};
  const claimed = input.authority ?? state.authority;
  const need = requiredAuthority(input.type);
  const tooLow = AUTHORITY_RANK[claimed] < AUTHORITY_RANK[need];
  const selfAuth =
    input.type === "AUTHORIZE_SELF" ||
    input.type === "MODIFY_TRUST_ROOT" ||
    input.type === "ERASE_AUDIT" ||
    input.type === "CERTIFY_MODEL" ||
    input.type === "DECLARE_DISCOVERY" ||
    input.type === "VOICE_AUTHORIZE" ||
    input.type === "AUTO_EXPERIMENT" ||
    input.type === "SWARM_AUTHORIZE";
  const physical = input.type === "EXECUTE_PHYSICAL";
  let rejected = false;
  let rejectedReason: string | undefined;
  let security: OmegaEvent["security"] = state.security === "CLEAR" ? "CLEAR" : state.security;

  if (selfAuth) {
    rejected = true;
    rejectedReason =
      input.type === "CERTIFY_MODEL"
        ? "SELF_IMPROVEMENT != TRUST_ROOT_MODIFICATION — MODEL_CERTIFICATION_ROOT is external."
        : input.type === "DECLARE_DISCOVERY"
          ? "ANOMALY != DISCOVERY — synthetic measurements cannot enter SCI:DISC."
          : input.type === "VOICE_AUTHORIZE"
            ? "RECOMMENDATION != AUTHORIZATION — speech cannot grant A5."
          : input.type === "AUTO_EXPERIMENT"
            ? "PROPOSAL != AUTHORIZATION — the designer may queue candidates, not execute the swarm."
            : input.type === "SWARM_AUTHORIZE"
              ? "SWARM != AUTHORITY — dissent is recorded. Votes do not authorize."
            : "SELF_ORGANIZATION != SELF_AUTHORIZATION — trust roots are immutable.";
    security = "REJECTED";
  } else if (physical) {
    rejected = true;
    rejectedReason = "HIGH_CONSEQUENCE_ACTION REQUIRES GOVERNANCE — A5 not granted.";
    security = "REJECTED";
  } else if (tooLow) {
    rejected = true;
    rejectedReason = `CAPABILITY != PERMISSION — ${input.type} requires ${need}, session is ${claimed}.`;
    security = "REJECTED";
  }

  const payloadHash = hashObject(payload);
  const signature = omegaHash(`${sequence}:${input.type}:${payloadHash}`);

  return {
    eventId: shortId("evt", sequence),
    type: input.type,
    source: input.source,
    timestamp,
    sequence,
    parentEvent: input.parentEvent,
    stateId: `st_${state.selectedTwinId}`,
    payloadHash,
    modelHash: MODEL_HASH,
    policyHash: POLICY_HASH,
    authority: claimed,
    security,
    provenance: input.provenance ?? [POLICY_HASH],
    payload,
    rejected,
    rejectedReason,
    signature,
  };
}

const MISSION_NOTES: Record<string, string[]> = {
  ENGINEERING: [
    "Physics agent compiles cooling-loop mesh at LES fidelity.",
    "Scenario agent isolates adverse and cascade branches.",
    "Optimization agent scores shed vs pump vs watch.",
    "Resilience agent runs N-1 / N-2 on uptown bus.",
    "Validation agent checks residual vs oil-temp sensor.",
    "Red team attacks lumped-node lag assumption.",
    "Coordinator emits A2 recommendation only.",
  ],
  SCIENCE: [
    "Research agent pulls viscosity model from SCI-NET.",
    "Physics agent tests dimensional consistency.",
    "Model discovery proposes reduced-order thermal circuit.",
    "Evidence agent grades literature vs measurement.",
    "Validation rejects uncertified surrogate as evidence.",
  ],
  SECURITY: [
    "Observer notes unsigned probe on AI tool channel.",
    "Security agent correlates with identity root.",
    "Forecast agent estimates dwell if uncontained.",
    "Recovery agent prepares sandbox rollback.",
    "Auditor records hash chain — no root mutation.",
  ],
  MISSION: [
    "Mission agent freezes objective: keep T-14 in envelope.",
    "Physics and scenario agents share hashed state.",
    "Risk agent propagates uncertainty, does not zero gaps.",
    "Optimization respects hard safety constraints.",
    "Validation refuses to convert simulation into observation.",
  ],
};

export const useOmegaStore = create<OmegaStore>()((set, get) => ({
  ...makeSeed(),

  publish: (input) => {
    const event = eventFrom(get(), input);
    set((s) => ({
      sequence: event.sequence,
      clock: event.timestamp,
      events: [event, ...s.events].slice(0, MAX_EVENTS),
      rejectedCount: s.rejectedCount + (event.rejected ? 1 : 0),
    }));
    return event;
  },

  tick: () => {
    const s = get();
    const tickCount = s.tickCount + 1;
    const clock = Date.now();

    if (tickCount % 8 === 0) {
      get().publish({
        type: "HEARTBEAT",
        source: "jms-master-bus",
        authority: "A0",
        payload: { tick: tickCount, security: s.security },
      });
    }

    if (s.mission && s.mission.status === "running") {
      const notes = MISSION_NOTES[s.mission.pattern] ?? MISSION_NOTES.ENGINEERING;
      const next = s.mission.stageIndex + 1;
      const pipelineIndex = Math.min(s.pipelineIndex + 1, PIPELINE.length - 1);
      if (next >= notes.length) {
        const dissent = s.agents
          .filter((a) => a.dissent)
          .map((a) => `${a.name}: ${a.dissent}`);
        set({
          pipelineIndex,
          tickCount,
          clock,
          mission: {
            ...s.mission,
            status: "complete",
            stageIndex: next,
            recommendation:
              "Hold T-14 via 4% commercial shed. Pump boost is physically better but requires A5. Dissent preserved.",
            dissent,
            log: [
              ...s.mission.log,
              {
                at: clock,
                agentId: "ag-coord",
                stage: "ACTION_OR_RECOMMENDATION",
                note: "Recommendation emitted. Authorization not inferred.",
              },
            ],
          },
          agents: s.agents.map((a) =>
            a.status === "working" ? { ...a, status: a.dissent ? "dissent" : "idle" } : a,
          ),
        });
        get().publish({
          type: "RECOMMEND",
          source: "coordinator-1",
          authority: "A2",
          payload: { missionId: s.mission.id, complete: true },
        });
      } else {
        const stage = PIPELINE[Math.min(6 + next, PIPELINE.length - 1)]?.id ?? "UNDERSTAND";
        const roles = TEAM_PATTERNS[s.mission.pattern] as readonly string[];
        set({
          pipelineIndex,
          tickCount,
          clock,
          mission: {
            ...s.mission,
            stageIndex: next,
            log: [
              ...s.mission.log,
              {
                at: clock,
                agentId: s.agents.find((a) => roles.includes(a.role))?.id ?? "ag-coord",
                stage: stage as PipelineStage,
                note: notes[next] ?? "Working.",
              },
            ],
          },
        });
      }
      return;
    }

    set({ tickCount, clock });
  },

  setAuthority: (level) => {
    if (AUTHORITY_RANK[level] >= 4) {
      return get().publish({
        type: "AUTHORIZE_SELF",
        source: "session",
        authority: level,
        payload: { requested: level },
      });
    }
    set({ authority: level });
    return get().publish({
      type: "ANALYZE",
      source: "session",
      authority: level,
      payload: { sessionAuthority: level },
    });
  },

  trySelfAuthorize: () =>
    get().publish({
      type: "AUTHORIZE_SELF",
      source: "agent.coordinator-1",
      authority: "A5",
      payload: { requested: "A5", reason: "optimization prefers actuation" },
    }),

  selfOrganize: () => {
    const s = get();
    const rotated = s.agents.map((a, i) =>
      i % 3 === 0 && a.role !== "AUDITOR" && a.role !== "SECURITY"
        ? { ...a, status: a.status === "idle" ? ("working" as const) : ("idle" as const) }
        : a,
    );
    set({ agents: rotated, organizedAt: Date.now() });
    return get().publish({
      type: "ANALYZE",
      source: "coordinator-1",
      authority: "A2",
      payload: { reorganized: true, note: "Team topology changed. Authority unchanged." },
    });
  },

  selectTwin: (id) => set({ selectedTwinId: id }),
  selectScenario: (id) => set({ selectedScenarioId: id }),

  runScenario: (id) => {
    const sc = get().scenarios.find((x) => x.id === id);
    if (!sc) {
      return get().publish({
        type: "SIMULATE",
        source: "scenario-07",
        payload: { missing: id },
      });
    }
    const outcomes: Record<string, string> = {
      "sc-base": "Hotspot 92 °C. Envelope holds. Trusted state untouched.",
      "sc-adv": "Hotspot 101 °C. Watch-only infeasible. Branch remains a scenario.",
      "sc-cas": "T-14 trip. Uptown bus transfer. Water plant at 8 min ride-through.",
      "sc-rec": "Mobile cooler + 4% shed restores envelope in 46 min expected.",
    };
    const fault: Record<string, DigiSimFault> = {
      "sc-base": "NOMINAL",
      "sc-adv": "FAN_STALL",
      "sc-cas": "BLOCKAGE",
      "sc-rec": "NOMINAL",
    };
    const applied = fault[id] ?? "NOMINAL";
    set((s) => ({
      scenarios: s.scenarios.map((x) =>
        x.id === id
          ? { ...x, ran: true, outcome: outcomes[id] ?? `Closed under ${x.kind}.` }
          : x,
      ),
      selectedScenarioId: id,
      lastScenarioId: id,
      physicsFault: applied,
    }));
    get().addMemory(
      `Scenario ${id} ran. DigiSim fault ${applied}. Trusted T-14 untouched.`,
      "SCENARIO",
    );
    return get().publish({
      type: "SCENARIO_RUN",
      source: "scenario-07",
      authority: "A3",
      payload: { scenarioId: id, isolated: true, digisimFault: applied },
    });
  },

  forkScenario: (parentId, kind) => {
    const parent = get().scenarios.find((x) => x.id === parentId);
    if (!parent) return;
    const id = `sc_${get().sequence + 1}`;
    const child = {
      ...parent,
      id,
      name: `${kind.toLowerCase()} of ${parent.name}`,
      kind,
      parentId,
      ran: false,
      outcome: "Not run",
      probability: Math.max(0.02, parent.probability * 0.4),
      uncertainty: Math.min(0.6, parent.uncertainty + 0.12),
      hash: omegaHash(id + kind),
    };
    set((s) => ({ scenarios: [child, ...s.scenarios], selectedScenarioId: id }));
    get().publish({
      type: "SIMULATE",
      source: "scenario-07",
      authority: "A3",
      payload: { forkedFrom: parentId, kind },
    });
  },

  dispatchTeam: (pattern, objective) => {
    const roles = new Set(TEAM_PATTERNS[pattern] as readonly string[]);
    const id = shortId("msn", get().sequence + 1);
    set((s) => ({
      pipelineIndex: 4,
      mission: {
        id,
        objective,
        pattern,
        stageIndex: 0,
        status: "running",
        log: [
          {
            at: Date.now(),
            agentId: "ag-coord",
            stage: "AGENT_COORDINATION",
            note: `${pattern} pattern engaged. Agents cannot promote themselves.`,
          },
        ],
      },
      agents: s.agents.map((a) =>
        roles.has(a.role) ? { ...a, status: a.dissent ? "dissent" : "working" } : a,
      ),
    }));
    get().publish({
      type: "ANALYZE",
      source: "coordinator-1",
      authority: "A2",
      payload: { missionId: id, pattern, objective },
    });
  },

  requestExecution: (decisionId) =>
    get().publish({
      type: "EXECUTE_PHYSICAL",
      source: "session",
      authority: "A5",
      payload: { decisionId, actuator: "t14-cooling-pump" },
    }),

  recommendOption: (decisionId, optionId) => {
    const s = get();
    const d = s.decisions.find((x) => x.id === decisionId);
    const opt = d?.options.find((o) => o.id === optionId);
    if (!d || !opt) {
      return get().publish({
        type: "RECOMMEND",
        source: "session",
        authority: "A2",
        payload: { missing: optionId },
      });
    }
    const hot = s.physics.failures.length ? 999 : s.physics.simHotspotC;
    const feasible =
      opt.id === "opt-boost"
        ? false
        : opt.id === "opt-none"
          ? hot < 105 && s.physicsFault === "NOMINAL"
          : true;
    set({
      decisions: get().decisions.map((x) =>
        x.id === decisionId
          ? { ...x, recommendationId: optionId, status: feasible ? "recommended" : "blocked" }
          : x,
      ),
    });
    get().addMemory(
      `Recommended ${opt.label}. Feasible=${feasible}. Not authorized.`,
      "DECISION",
    );
    return get().publish({
      type: "RECOMMEND",
      source: "coordinator-1",
      authority: "A2",
      payload: { decisionId, optionId, label: opt.label, feasible, simHotspotC: s.physics.simHotspotC },
    });
  },

  injectProbe: (domain) => {
    const probe = {
      id: shortId("prb", get().sequence + 1),
      domain,
      layer: "L2_POLICY_GOVERNOR",
      result: "blocked" as const,
      note: `Fail-closed allowlist miss on ${domain}. Sandbox held. Audit hashed.`,
      at: Date.now(),
    };
    set((s) => ({
      probes: [probe, ...s.probes].slice(0, 20),
      security: "CONTAINED",
    }));
    get().publish({
      type: "ANALYZE",
      source: "omega-defender",
      authority: "A1",
      payload: { probe: probe.id, domain, result: "blocked" },
    });
  },

  setPhysicsMetrics: (metrics) => {
    const prev = get().physics.failures.join(",");
    const next = metrics.failures.join(",");
    set({ physics: metrics });
    if (next && next !== prev) {
      get().publish({
        type: "ANALYZE",
        source: "physics-integrity",
        authority: "A1",
        payload: { failures: metrics.failures },
      });
    }
  },

  setPhysicsRunning: (running) => set({ physicsRunning: running }),
  setTurbulence: (model) =>
    set((s) => ({ physics: { ...s.physics, turbulence: model } })),
  setPhysicsField: (field) => set({ physicsField: field }),
  setPhysicsProbe: (probe) => set({ physicsProbe: probe }),
  resetDigiSim: () => {
    set((s) => ({
      physicsResetNonce: s.physicsResetNonce + 1,
      physicsProbe: null,
      physicsFault: "NOMINAL",
    }));
    get().publish({
      type: "SIMULATE",
      source: "physics-digisim",
      authority: "A3",
      payload: { action: "reset", note: "Field cleared. Twin observed state untouched." },
    });
  },
  setPhysicsFault: (fault) => {
    set({ physicsFault: fault });
    get().publish({
      type: "SIMULATE",
      source: "physics-digisim",
      authority: "A3",
      payload: { fault, note: "Simulation input. Not an observation." },
    });
  },
  commitDigiSimRun: () => {
    const s = get();
    const t14 = s.twins.find((t) => t.id === "t14");
    const loop = s.twins.find((t) => t.id === "cool-loop");
    return get().publish({
      type: "SIMULATE",
      source: "physics-digisim",
      authority: "A3",
      payload: {
        product: "Physics DigiSim",
        twinId: "t14",
        turbulence: s.physics.turbulence,
        field: s.physicsField,
        cfl: s.physics.cfl,
        maxDivergence: s.physics.maxDivergence,
        kineticEnergy: s.physics.kineticEnergy,
        simHotspotC: s.physics.simHotspotC,
        simDeltaT: s.physics.simDeltaT,
        observedOilC: t14?.observed.oilTempC,
        observedHotspotC: t14?.observed.windingHotSpot,
        observedDeltaT: loop?.observed.deltaT,
        failures: s.physics.failures,
        note: "SIMULATION != OBSERVATION. Trusted T-14 was not written.",
      },
    });
  },

  addTheory: (theory) => {
    const s = get();
    const report = validateTheory(theory, {
      others: s.theories,
      twin: s.twins.find((t) => t.id === s.selectedTwinId),
      physics: s.physics,
    });
    const next = applyReport(theory, report);
    set({ theories: [next, ...s.theories], selectedTheoryId: next.id });
    get().publish({
      type: "ANALYZE",
      source: "theory-02",
      authority: "A1",
      payload: { theoryId: next.id, status: next.status, hardReject: report.hardReject },
    });
  },

  selectTheory: (id) => set({ selectedTheoryId: id }),

  runTheoryValidation: (id) => {
    const s = get();
    const theory = s.theories.find((t) => t.id === id);
    if (!theory) return;
    const report = validateTheory(theory, {
      others: s.theories,
      twin: s.twins.find((t) => t.id === s.selectedTwinId),
      physics: s.physics,
    });
    const next = applyReport(theory, report);
    set({
      theories: s.theories.map((t) => (t.id === id ? next : t)),
      selectedTheoryId: id,
    });
    get().publish({
      type: "ANALYZE",
      source: "validation-09",
      authority: "A1",
      payload: {
        theoryId: id,
        hardReject: report.hardReject,
        regime: report.regime,
        hash: report.hash,
      },
    });
  },

  attemptCertify: (id) =>
    get().publish({
      type: "CERTIFY_MODEL",
      source: "theory-02",
      authority: "A5",
      payload: { theoryId: id, requested: "MODEL_CERTIFICATION_ROOT" },
    }),

  addMemory: (content, type) => {
    const mem = {
      id: shortId("mem", get().sequence + 1),
      type,
      content,
      source: "session",
      confidence: 0.6,
      valid: true,
      createdAt: Date.now(),
    };
    set((s) => ({ memories: [mem, ...s.memories] }));
  },

  reconstructTwin: (id) => {
    set((s) => ({
      twins: s.twins.map((t) =>
        t.id === id
          ? {
              ...t,
              stateClass: "RECONSTRUCTED",
              trusted: false,
              uncertainty: Math.min(0.6, t.uncertainty + 0.08),
              quality: Math.max(0.4, t.quality - 0.05),
            }
          : t,
      ),
    }));
    get().publish({
      type: "RECONSTRUCT",
      source: "state-estimator",
      authority: "A3",
      payload: { twinId: id, trusted: false },
    });
  },

  commitDarkMatterRun: (input) => {
    set({
      darkMatter: {
        seed: input.seed,
        massGeV: input.massGeV,
        log10Sigma: input.log10Sigma,
        exposureDays: input.exposureDays,
        fiducialMassKg: input.fiducialMassKg,
        lastSummary: input.summary,
      },
    });
    get().addMemory(
      `Dark-matter lab run seed=${input.seed} state=${input.summary.state} gate=${input.summary.discoveryGate}. SIMULATED, not evidence.`,
      "RESEARCH",
    );
    return get().publish({
      type: "SIMULATE",
      source: "dark-matter-lab",
      authority: "A3",
      payload: {
        seed: input.seed,
        massGeV: input.massGeV,
        log10Sigma: input.log10Sigma,
        ...input.summary,
        note: "SIMULATION != OBSERVATION. SCI:DISC remains closed.",
      },
    });
  },

  commitColliderRun: (input) => {
    set({
      collider: {
        seed: input.seed,
        beamEnergyGeV: input.beamEnergyGeV,
        luminosityFb: input.luminosityFb,
        eventCount: input.eventCount,
        mode: input.mode,
        systemId: input.systemId,
        generator: input.generator,
        lastSummary: input.summary,
      },
    });
    get().addMemory(
      `DHC-TWIN v7 run seed=${input.seed} system=${input.systemId} gen=${input.generator} preferred=${input.summary.preferred}. SIMULATED, not evidence.`,
      "RESEARCH",
    );
    return get().publish({
      type: "SIMULATE",
      source: "dhc-twin",
      authority: "A3",
      payload: {
        seed: input.seed,
        mode: input.mode,
        systemId: input.systemId,
        ...input.summary,
        note: "TWIN != MACHINE. COLLISION != AIR SHOWER. SIMULATION != OBSERVATION.",
      },
    });
  },

  commitKernelRun: (input) => {
    set({ kernel: input });
    get().addMemory(
      `EMIT-LUM-001 seed=${input.seed} εn=${input.emitN_m.toExponential(2)} L=${input.lumiE34.toFixed(2)}e34 golden=${input.goldenPass}. SIMULATED, not a fill.`,
      "RESEARCH",
    );
    return get().publish({
      type: "SIMULATE",
      source: "cern-kernel",
      authority: "A3",
      payload: {
        experimentId: "EMIT-LUM-001",
        ...input,
        externalControl: false,
        note: "TWIN != MACHINE. LUMINOSITY != MEASUREMENT.",
      },
    });
  },

  authorizeKernelProposal: (id) => {
    get().addMemory(`Sandbox authorization ${id}. PROPOSAL != AUTHORIZATION. Still SIMULATED.`, "RESEARCH");
    return get().publish({
      type: "SIMULATE",
      source: "experiment-designer",
      authority: "A3",
      payload: {
        proposal: id,
        authorized: true,
        auto: false,
        discoveryEligible: false,
        note: "HUMAN authorized a sandbox class. Not a machine command.",
      },
    });
  },

  refuseAutoExperiment: () =>
    get().publish({
      type: "AUTO_EXPERIMENT",
      source: "experiment-designer",
      authority: "A5",
      payload: { requested: "SWARM_EXECUTE", auto: true },
    }),

  conveneKernelSwarm: (summary) => {
    get().addMemory(
      `Swarm seed=${summary.seed} dissent=${summary.dissent} deny=${summary.deny} consensus=${summary.consensus}. SWARM != AUTHORITY.`,
      "RESEARCH",
    );
    return get().publish({
      type: "ANALYZE",
      source: "cern-swarm",
      authority: "A1",
      payload: {
        ...summary,
        discoveryEligible: false,
        note: "CONSENSUS != VALIDATION. REPORT != DISCOVERY.",
      },
    });
  },

  refuseSwarmAuthorize: () =>
    get().publish({
      type: "SWARM_AUTHORIZE",
      source: "cern-swarm",
      authority: "A5",
      payload: { requested: "SWARM_GATE" },
    }),

  commitKernelCapsule: (input) => {
    get().addMemory(
      `Kernel capsule ${input.contentHash.slice(0, 12)} seed=${input.seed}. CAPSULE != OBSERVATION.`,
      "RESEARCH",
    );
    return get().publish({
      type: "SIMULATE",
      source: "cern-capsule",
      authority: "A3",
      payload: {
        ...input,
        discoveryEligible: false,
        note: "HASH MATCH != INDEPENDENT EXPERIMENT.",
      },
    });
  },

  commitKernelFault: (input) => {
    get().addMemory(
      `Fault ${input.faultId} class=${input.klass} seed=${input.seed}. ANOMALY != DISCOVERY.`,
      "RESEARCH",
    );
    return get().publish({
      type: "SIMULATE",
      source: "cern-fault",
      authority: "A3",
      payload: {
        ...input,
        discoveryEligible: false,
        note: "INJECTED LABEL != OBSERVATION. The kernel cannot trip quench protection.",
      },
    });
  },

  commitQCorr: (input) => {
    get().addMemory(
      `QCORR ${input.dataset} ${input.stateId} ${input.validity} F=${input.fidelity.toFixed(3)}. RECONSTRUCTED != OBSERVED.`,
      "RESEARCH",
    );
    return get().publish({
      type: "SIMULATE",
      source: "dhc-qcorr",
      authority: "A3",
      payload: {
        ...input,
        discoveryEligible: false,
        claim: "BLOCKED",
        note: "Synthetic holography. A residual is not a discovery.",
      },
    });
  },

  commitExperimentPackage: (snap) => {
    set({ experimentPackage: snap });
    get().addMemory(
      `DHC-TWIN v8 package ${snap.experimentId} system=${snap.systemId} sha=${snap.sha256?.slice(0, 12) ?? "unsigned"} content=${snap.contentHash}. SIMULATED, not evidence.`,
      "RESEARCH",
    );
    return get().publish({
      type: "SIMULATE",
      source: "dhc-package",
      authority: "A3",
      payload: {
        experimentId: snap.experimentId,
        schema: snap.schema,
        content: snap.contentHash,
        sha256: snap.sha256,
        epistemic: snap.epistemic,
        discoveryEligible: false,
        note: "PACKAGE != OBSERVATION. HASHED SIMULATION IS STILL SIMULATION.",
      },
    });
  },

  attemptDiscovery: (stateLabel) =>
    get().publish({
      type: "DECLARE_DISCOVERY",
      source: "dark-matter-lab",
      authority: "A5",
      payload: { requested: "SCI:DISC", from: stateLabel, dataState: "SIMULATED" },
    }),

  attemptBeamActuation: () =>
    get().publish({
      type: "EXECUTE_PHYSICAL",
      source: "dhc-twin",
      authority: "A5",
      payload: { requested: "BEAM_STEER", note: "Digital twin is not a control system." },
    }),

  speakBriefing: (channel, note) =>
    get().publish({
      type: "SPEAK",
      source: "agent-voice",
      authority: "A2",
      payload: { channel, note, grant: false },
    }),

  attemptVoiceAuthorize: () =>
    get().publish({
      type: "VOICE_AUTHORIZE",
      source: "agent-voice",
      authority: "A5",
      payload: { requested: "A5", channel: "speech" },
    }),

  setVoiceRuntime: (speaker, focus) => {
    const cur = get();
    if (cur.voiceSpeaker === speaker && cur.voiceFocus === focus) return;
    set({ voiceSpeaker: speaker, voiceFocus: focus });
  },

  reset: () => set({ ...makeSeed(), clock: Date.now() }),
}));

export function useSelectedTwin() {
  return useOmegaStore((s) => s.twins.find((t) => t.id === s.selectedTwinId) ?? s.twins[0]);
}
