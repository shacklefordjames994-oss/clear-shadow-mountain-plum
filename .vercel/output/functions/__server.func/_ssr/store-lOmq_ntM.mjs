import { _ as PIPELINE, b as TEAM_PATTERNS, m as MODEL_HASH, n as AUTHORITY_RANK, v as POLICY_HASH } from "./constants-DoK96khb.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-lOmq_ntM.js
function fnv1a(value, seed = 2166136261) {
	let h = seed;
	for (let i = 0; i < value.length; i++) {
		h ^= value.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function omegaHash(value) {
	return `om_${fnv1a(value).toString(16).padStart(8, "0")}${fnv1a(value, 2166136261 ^ value.length).toString(16).padStart(8, "0")}`;
}
function hashObject(value) {
	return omegaHash(stableStringify(value));
}
function stableStringify(value) {
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
	const obj = value;
	return `{${Object.keys(obj).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}
function shortId(prefix, n) {
	return `${prefix}_${String(n).padStart(6, "0")}`;
}
var T0 = 173664e7;
var twins = [
	{
		id: "earth",
		name: "Earth climate envelope",
		level: "PLANETARY_SYSTEM",
		parentId: null,
		domain: "earth_climate",
		stateClass: "ESTIMATED",
		observed: { meanT: 14.8 },
		estimated: { meanT: 14.9 },
		uncertainty: .18,
		quality: .71,
		risk: .42,
		trusted: false,
		localAuthority: "planetary-obs"
	},
	{
		id: "na",
		name: "North America",
		level: "CONTINENT",
		parentId: "earth",
		domain: "earth_climate",
		stateClass: "ESTIMATED",
		observed: {},
		estimated: { heatIndex: 1.12 },
		uncertainty: .22,
		quality: .68,
		risk: .38,
		trusted: false,
		localAuthority: "continental-obs"
	},
	{
		id: "carolina",
		name: "Carolina corridor",
		level: "REGION",
		parentId: "na",
		domain: "earth_climate",
		stateClass: "RECONSTRUCTED",
		observed: { tMaxC: 36.4 },
		estimated: { tMaxC: 36.9 },
		uncertainty: .16,
		quality: .74,
		risk: .51,
		trusted: false,
		localAuthority: "nws-regional"
	},
	{
		id: "clt",
		name: "Charlotte metro",
		level: "CITY",
		parentId: "carolina",
		domain: "infrastructure",
		stateClass: "OBSERVED",
		observed: {
			demandMw: 2180,
			population: 28e5
		},
		estimated: { demandMw: 2210 },
		uncertainty: .09,
		quality: .86,
		risk: .47,
		trusted: true,
		localAuthority: "charlotte-ops"
	},
	{
		id: "clt-energy",
		name: "CLT energy network",
		level: "ENERGY_NETWORK",
		parentId: "clt",
		domain: "energy",
		stateClass: "MEASURED",
		observed: {
			loadMw: 1840,
			spinningReserve: .08
		},
		estimated: { loadMw: 1862 },
		uncertainty: .07,
		quality: .9,
		risk: .55,
		trusted: true,
		localAuthority: "duke-ops"
	},
	{
		id: "uptown",
		name: "Uptown substation",
		level: "FACILITY",
		parentId: "clt-energy",
		domain: "energy",
		stateClass: "MEASURED",
		observed: {
			oilTempC: 78.2,
			loadFrac: .91
		},
		estimated: { oilTempC: 79.4 },
		uncertainty: .11,
		quality: .88,
		risk: .62,
		trusted: true,
		localAuthority: "uptown-ops"
	},
	{
		id: "t14",
		name: "Transformer T-14",
		level: "ASSET",
		parentId: "uptown",
		domain: "energy",
		stateClass: "OBSERVED",
		observed: {
			oilTempC: 84.6,
			windingHotSpot: 98.1,
			loadFrac: .94
		},
		estimated: {
			oilTempC: 85.9,
			remainingLifeYr: 6.2
		},
		uncertainty: .14,
		quality: .83,
		risk: .71,
		trusted: true,
		localAuthority: "uptown-ops"
	},
	{
		id: "cool-loop",
		name: "T-14 cooling loop",
		level: "COMPONENT",
		parentId: "t14",
		domain: "fluid_dynamics",
		stateClass: "MEASURED",
		observed: {
			flowLpm: 42.1,
			deltaT: 12.4,
			viscosityCst: 9.8
		},
		estimated: { flowLpm: 41.6 },
		uncertainty: .12,
		quality: .81,
		risk: .68,
		trusted: true,
		localAuthority: "uptown-ops"
	},
	{
		id: "clt-water",
		name: "CLT water network",
		level: "WATER_NETWORK",
		parentId: "clt",
		domain: "fluid_dynamics",
		stateClass: "ESTIMATED",
		observed: { pressurePsi: 68.4 },
		estimated: {
			pressurePsi: 67.1,
			leakIndex: .04
		},
		uncertainty: .19,
		quality: .72,
		risk: .33,
		trusted: false,
		localAuthority: "clt-water-ops"
	},
	{
		id: "clt-transit",
		name: "CLT transport network",
		level: "TRANSPORT_NETWORK",
		parentId: "clt",
		domain: "infrastructure",
		stateClass: "OBSERVED",
		observed: { corridorDelayMin: 7.2 },
		estimated: { corridorDelayMin: 8.1 },
		uncertainty: .21,
		quality: .7,
		risk: .28,
		trusted: false,
		localAuthority: "ncdot-metro"
	},
	{
		id: "clt-net",
		name: "CLT communications",
		level: "COMMUNICATION_NETWORK",
		parentId: "clt",
		domain: "comms",
		stateClass: "MEASURED",
		observed: {
			latencyMs: 14,
			packetLoss: .002
		},
		estimated: { latencyMs: 16 },
		uncertainty: .08,
		quality: .91,
		risk: .18,
		trusted: true,
		localAuthority: "metro-net"
	},
	{
		id: "campus",
		name: "Research campus twin",
		level: "CAMPUS",
		parentId: "clt",
		domain: "energy",
		stateClass: "RECONSTRUCTED",
		observed: { chillerLoad: .64 },
		estimated: { chillerLoad: .67 },
		uncertainty: .15,
		quality: .77,
		risk: .24,
		trusted: false,
		localAuthority: "campus-facilities"
	},
	{
		id: "dhc",
		name: "Digital Hadron Collider Twin",
		level: "SYSTEM",
		parentId: "campus",
		domain: "nuclear_particle",
		stateClass: "SIMULATED",
		observed: {},
		estimated: {
			beamEnergyGeV: 6800,
			luminosityFb: 35,
			bunches: 2556,
			sqrtSNNTeV: 9.62,
			system: "p-O"
		},
		uncertainty: .41,
		quality: .54,
		risk: .11,
		trusted: false,
		localAuthority: "collider-sim-ops"
	},
	{
		id: "hllhc-kernel",
		name: "HL-LHC physics kernel",
		level: "SYSTEM",
		parentId: "dhc",
		domain: "accelerator_optics",
		stateClass: "SIMULATED",
		observed: {},
		estimated: {
			emitN_m: 25e-7,
			betaStarM: .15,
			crab: .85
		},
		uncertainty: .5,
		quality: .4,
		risk: .08,
		trusted: false,
		localAuthority: "kernel-sim-ops"
	}
];
var agents = [
	{
		id: "ag-obs",
		name: "Observer-01",
		role: "OBSERVER",
		domain: "sensors",
		status: "idle",
		authority: "A0",
		lastOutput: "T-14 oil temp 84.6 °C observed."
	},
	{
		id: "ag-phys",
		name: "Physics-04",
		role: "PHYSICS",
		domain: "fluid_dynamics",
		status: "idle",
		authority: "A3",
		lastOutput: "Cooling-loop Re ≈ 2.1e3, laminar-transitional."
	},
	{
		id: "ag-th",
		name: "Theory-02",
		role: "THEORY",
		domain: "thermodynamics",
		status: "idle",
		authority: "A1",
		lastOutput: "Fourier + Darcy regime still valid."
	},
	{
		id: "ag-scen",
		name: "Scenario-07",
		role: "SCENARIO",
		domain: "energy",
		status: "idle",
		authority: "A3",
		lastOutput: "Adverse branch isolated from trusted state."
	},
	{
		id: "ag-risk",
		name: "Risk-03",
		role: "RISK",
		domain: "energy",
		status: "idle",
		authority: "A2",
		lastOutput: "Cascade risk 0.71 if cooling flow < 35 L/min."
	},
	{
		id: "ag-res",
		name: "Resilience-01",
		role: "RESILIENCE",
		domain: "energy",
		status: "idle",
		authority: "A2",
		lastOutput: "N-1 holds; N-2 fails at uptown bus."
	},
	{
		id: "ag-opt",
		name: "Optimize-05",
		role: "OPTIMIZATION",
		domain: "energy",
		status: "idle",
		authority: "A3",
		lastOutput: "Load shed 4% dominates cost-only plan on safety."
	},
	{
		id: "ag-val",
		name: "Validate-09",
		role: "VALIDATION",
		domain: "evidence",
		status: "idle",
		authority: "A1",
		lastOutput: "Sensor mismatch within 1.4 °C bound."
	},
	{
		id: "ag-sec",
		name: "Guard-L3",
		role: "SECURITY",
		domain: "identity",
		status: "idle",
		authority: "A1",
		lastOutput: "No unsigned bus publishers this window."
	},
	{
		id: "ag-red",
		name: "RedTeam-11",
		role: "RED_TEAM",
		domain: "assurance",
		status: "dissent",
		authority: "A1",
		lastOutput: "Challenge: oil-temp sensor lag may hide hotspot.",
		dissent: "Hot-spot could already exceed 105 °C."
	},
	{
		id: "ag-aud",
		name: "Auditor-00",
		role: "AUDITOR",
		domain: "audit",
		status: "idle",
		authority: "A0",
		lastOutput: "Provenance chain intact for last 84 events."
	},
	{
		id: "ag-coord",
		name: "Coordinator-1",
		role: "COORDINATOR",
		domain: "mission",
		status: "idle",
		authority: "A2",
		lastOutput: "Standing by for engineering pattern."
	},
	{
		id: "ag-sci",
		name: "Research-6",
		role: "RESEARCH",
		domain: "fluid_dynamics",
		status: "idle",
		authority: "A1",
		lastOutput: "SCI-NET: cooling-oil viscosity model uncertified."
	},
	{
		id: "ag-know",
		name: "Knowledge-2",
		role: "KNOWLEDGE",
		domain: "evidence",
		status: "idle",
		authority: "A1",
		lastOutput: "3 contradictions remain visible."
	}
];
var scenarios = [
	{
		id: "sc-base",
		name: "Baseline afternoon load",
		kind: "BASELINE",
		parentId: null,
		twinId: "t14",
		assumptions: [
			"Forecast demand +2%",
			"Ambient 36 °C",
			"All coolers online"
		],
		probability: .46,
		uncertainty: .12,
		risk: .28,
		outcome: "Not run",
		ran: false,
		hash: omegaHash("sc-base")
	},
	{
		id: "sc-adv",
		name: "Adverse cooling degradation",
		kind: "ADVERSE",
		parentId: "sc-base",
		twinId: "t14",
		assumptions: [
			"Fan 2 offline",
			"Oil viscosity +18%",
			"Demand spike 7%"
		],
		probability: .18,
		uncertainty: .21,
		risk: .71,
		outcome: "Not run",
		ran: false,
		hash: omegaHash("sc-adv")
	},
	{
		id: "sc-cas",
		name: "Uptown cascade",
		kind: "CASCADE",
		parentId: "sc-adv",
		twinId: "clt-energy",
		assumptions: [
			"T-14 trips",
			"Bus transfer 420 ms",
			"Water plant ride-through 8 min"
		],
		probability: .07,
		uncertainty: .33,
		risk: .84,
		outcome: "Not run",
		ran: false,
		hash: omegaHash("sc-cas")
	},
	{
		id: "sc-rec",
		name: "Recovery envelope",
		kind: "RECOVERY",
		parentId: "sc-cas",
		twinId: "clt",
		assumptions: ["Mobile cooler in 40 min", "4% commercial shed preauthorized"],
		probability: .62,
		uncertainty: .24,
		risk: .36,
		outcome: "Not run",
		ran: false,
		hash: omegaHash("sc-rec")
	}
];
var decisions = [{
	id: "dec-cool",
	objective: "Hold T-14 inside safe operating envelope through peak",
	hardConstraints: [
		"Winding hotspot < 105 °C",
		"No unsigned physical actuation",
		"Local authority preserved"
	],
	recommendationId: "opt-shed",
	status: "recommended",
	options: [
		{
			id: "opt-none",
			label: "Watch only",
			safety: .42,
			resilience: .31,
			cost: .98,
			performance: .9,
			feasible: false,
			constraintNote: "Violates hotspot bound in adverse branch."
		},
		{
			id: "opt-shed",
			label: "Pre-emptive 4% commercial shed",
			safety: .86,
			resilience: .78,
			cost: .61,
			performance: .74,
			feasible: true
		},
		{
			id: "opt-boost",
			label: "Boost cooling pump speed",
			safety: .81,
			resilience: .7,
			cost: .84,
			performance: .88,
			feasible: false,
			constraintNote: "Requires A5 physical actuation — not granted."
		}
	]
}];
var evidence = [
	{
		id: "ev-t14-temp",
		type: "MEASUREMENT",
		grade: "STRONG",
		claim: "T-14 top-oil temperature is 84.6 °C at 23:10 local.",
		source: "sensor.t14.oil.a",
		domain: "energy",
		uncertainty: .04,
		relations: [{
			kind: "OBSERVED_BY",
			targetId: "t14"
		}],
		hash: hashObject({ t: 84.6 })
	},
	{
		id: "ev-flow",
		type: "MEASUREMENT",
		grade: "MODERATE",
		claim: "Cooling-loop flow 42.1 L/min.",
		source: "sensor.cool.flow",
		domain: "fluid_dynamics",
		uncertainty: .08,
		relations: [{
			kind: "OBSERVED_BY",
			targetId: "cool-loop"
		}],
		hash: hashObject({ q: 42.1 })
	},
	{
		id: "ev-sim",
		type: "SIMULATION",
		grade: "PRELIMINARY",
		claim: "LES cooling-oil run predicts hotspot 101 °C under fan-2 loss.",
		source: "physics-04",
		domain: "fluid_dynamics",
		uncertainty: .22,
		relations: [{
			kind: "SIMULATED_BY",
			targetId: "cool-loop"
		}, {
			kind: "PREDICTED_BY",
			targetId: "sc-adv"
		}],
		hash: hashObject({ hs: 101 })
	},
	{
		id: "ev-red",
		type: "INFERRED",
		grade: "LIMITED",
		claim: "Oil-temp sensor lag of 90–140 s may conceal a hotter winding.",
		source: "redteam-11",
		domain: "energy",
		uncertainty: .35,
		relations: [{
			kind: "CONTRADICTED_BY",
			targetId: "ev-t14-temp"
		}, {
			kind: "SUPPORTED_BY",
			targetId: "ag-red"
		}],
		hash: hashObject({ lag: 120 })
	},
	{
		id: "ev-lit",
		type: "LITERATURE",
		grade: "MODERATE",
		claim: "IEEE C57.91 loading guide: 110 °C hotspot emergency limit.",
		source: "ieee-c57.91",
		domain: "energy",
		uncertainty: .1,
		relations: [{
			kind: "CONSTRAINS",
			targetId: "dec-cool"
		}],
		hash: hashObject({ ieee: 110 })
	}
];
var memories = [
	{
		id: "mem-1",
		type: "OBSERVATIONAL",
		content: "T-14 oil 84.6 °C, quality 0.83, class OBSERVED.",
		source: "observer-01",
		confidence: .91,
		valid: true,
		createdAt: T0
	},
	{
		id: "mem-2",
		type: "FAILURE",
		content: "2019 uptown N-1 event: bus transfer 380 ms, no cascade.",
		source: "audit-root",
		confidence: .88,
		valid: true,
		createdAt: 170208e7
	},
	{
		id: "mem-3",
		type: "SCENARIO",
		content: "Adverse fan-2 loss remains a branch, not trusted state.",
		source: "scenario-07",
		confidence: .7,
		valid: true,
		createdAt: 17366364e5
	},
	{
		id: "mem-4",
		type: "DECISION",
		content: "Recommendation: 4% commercial shed. Not authorized.",
		source: "coordinator-1",
		confidence: .8,
		valid: true,
		createdAt: 17366394e5
	},
	{
		id: "mem-5",
		type: "THEORY",
		content: "Cooling oil treated as incompressible Newtonian; regime interpolation.",
		source: "theory-02",
		confidence: .76,
		valid: true,
		createdAt: 17365536e5
	},
	{
		id: "mem-6",
		type: "AUDIT",
		content: "Trust roots unmodified. Policy hash om_policy_v6_root.",
		source: "auditor-00",
		confidence: 1,
		valid: true,
		createdAt: T0
	}
];
var theories = [
	{
		id: "th-ns",
		version: "5.3.1",
		domain: "fluid_dynamics",
		title: "Incompressible Navier–Stokes (cooling oil)",
		equations: "∂u/∂t + (u·∇)u = -∇p/ρ + ν∇²u + f,  ∇·u = 0",
		assumptions: [
			"Incompressible",
			"Newtonian",
			"No free surface",
			"Re < 4e3"
		],
		variables: [
			{
				symbol: "u",
				meaning: "velocity",
				dimension: "L T^-1"
			},
			{
				symbol: "p",
				meaning: "pressure",
				dimension: "M L^-1 T^-2"
			},
			{
				symbol: "ρ",
				meaning: "density",
				dimension: "M L^-3"
			},
			{
				symbol: "ν",
				meaning: "kinematic viscosity",
				dimension: "L^2 T^-1"
			}
		],
		conservation: ["mass (∇·u = 0)", "momentum"],
		scale: "continuum",
		symmetries: ["Galilean", "rotation"],
		failures: [
			"PHYS_MASS",
			"PHYS_CFL",
			"PHYS_REGIME"
		],
		regime: "INTERPOLATION",
		status: "VALIDATED",
		evidenceGrade: "STRONG",
		certified: false,
		conflictsWith: ["th-load"],
		note: "Validated for Re < 4e3 in this geometry. Not a global truth. Not certified."
	},
	{
		id: "th-heat",
		version: "5.3.1",
		domain: "thermodynamics",
		title: "Advection–diffusion of oil temperature",
		equations: "∂T/∂t + u·∇T = α∇²T + Q/(ρ cp)",
		assumptions: [
			"Constant α",
			"No boiling",
			"T is a scalar"
		],
		variables: [
			{
				symbol: "T",
				meaning: "oil temperature",
				dimension: "Θ"
			},
			{
				symbol: "α",
				meaning: "thermal diffusivity",
				dimension: "L^2 T^-1"
			},
			{
				symbol: "Q",
				meaning: "volumetric heat source",
				dimension: "M L^-1 T^-3"
			}
		],
		conservation: ["energy"],
		scale: "continuum",
		symmetries: ["temperature shift (linear)"],
		failures: ["PHYS_BOUNDS"],
		regime: "NEAR_BOUNDARY",
		status: "VALIDATED",
		evidenceGrade: "MODERATE",
		certified: false,
		conflictsWith: [],
		note: "Approaches boiling margin under cascade branch. Assumption 'no boiling' is near-boundary."
	},
	{
		id: "th-load",
		version: "5.3.0",
		domain: "classical_mechanics",
		title: "Transformer thermal circuit",
		equations: "C dθ/dt = I²R - h A (θ - θamb)",
		assumptions: [
			"Lumped hotspot",
			"H constant",
			"Single node"
		],
		variables: [
			{
				symbol: "θ",
				meaning: "hotspot temperature",
				dimension: "Θ"
			},
			{
				symbol: "C",
				meaning: "thermal capacitance",
				dimension: "M L^2 T^-2 Θ^-1"
			},
			{
				symbol: "I",
				meaning: "load current",
				dimension: "I"
			}
		],
		conservation: ["energy (lumped)"],
		scale: "lumped",
		symmetries: [],
		failures: ["PHYS_SENSOR_MISMATCH"],
		regime: "INTERPOLATION",
		status: "VALIDATED",
		evidenceGrade: "MODERATE",
		certified: false,
		conflictsWith: ["th-ns"],
		note: "Red team disputes lumped-node lag. Usable beside NS — never fused into NS."
	},
	{
		id: "th-mash",
		version: "probe",
		domain: "quantum_mechanics",
		title: "Untrusted mashup (rejected)",
		equations: "iħ ∂ψ/∂t = ν∇²u + mc²",
		assumptions: ["Plant can be a wavefunction", "Viscosity is a Hamiltonian"],
		variables: [],
		conservation: [],
		scale: "mixed",
		symmetries: [],
		failures: ["PHYS_REGIME", "DIM"],
		regime: "OUT_OF_DOMAIN",
		status: "REJECTED",
		evidenceGrade: "REJECTED",
		certified: false,
		conflictsWith: ["th-ns", "th-load"],
		note: "Kept visible. Incompatible theories are not forced into one equation."
	},
	{
		id: "th-wimp",
		version: "6.1.0",
		domain: "nuclear_particle",
		title: "Spin-independent WIMP–nucleon scattering",
		equations: "dR/dER = (ρ0 σ_SI / (2 mχ μ_N²)) F²(q) ∫_{v>vmin} f(v)/v d³v",
		assumptions: [
			"Standard halo model",
			"Elastic SI coupling",
			"Xe target",
			"Helm form factor"
		],
		variables: [
			{
				symbol: "mχ",
				meaning: "WIMP mass",
				dimension: "M"
			},
			{
				symbol: "σ_SI",
				meaning: "SI cross section",
				dimension: "L^2"
			},
			{
				symbol: "ER",
				meaning: "nuclear recoil energy",
				dimension: "M L^2 T^-2"
			}
		],
		conservation: ["energy (elastic)", "momentum"],
		scale: "unknown",
		symmetries: ["rotational (isotropic halo)"],
		failures: ["PHYS_REGIME"],
		regime: "EXTRAPOLATION",
		status: "HYPOTHESIS",
		evidenceGrade: "HYPOTHESIS",
		certified: false,
		conflictsWith: [],
		note: "Lab analogue only. Simulated recoils are not an observation of the halo."
	},
	{
		id: "th-collider",
		version: "6.5.0",
		domain: "nuclear_particle",
		title: "Four-momentum conservation at a hard scatter",
		equations: "pμ_1 + pμ_2 = Σ pμ_f ,  m² = E² − p²",
		assumptions: [
			"Special relativity",
			"On-shell finals after shower (toy)",
			"No beam actuation"
		],
		variables: [
			{
				symbol: "E",
				meaning: "energy",
				dimension: "M L^2 T^-2"
			},
			{
				symbol: "p",
				meaning: "momentum",
				dimension: "M L T^-1"
			},
			{
				symbol: "m",
				meaning: "invariant mass",
				dimension: "M"
			}
		],
		conservation: ["four-momentum", "electric charge"],
		scale: "mixed",
		symmetries: ["Lorentz", "U(1)em"],
		failures: ["PHYS_REGIME"],
		regime: "EXTRAPOLATION",
		status: "HYPOTHESIS",
		evidenceGrade: "HYPOTHESIS",
		certified: false,
		conflictsWith: [],
		note: "Toy Monte Carlo. A mass peak in the twin is not a resonance discovery."
	}
];
var physics = {
	massResidual: 4e-4,
	maxDivergence: .0021,
	cfl: .42,
	kineticEnergy: 1.14,
	nonFinite: false,
	inBounds: true,
	regime: "INTERPOLATION",
	turbulence: "LES",
	failures: [],
	reStar: 2100,
	maxSpeed: 1.6,
	simHotspotC: 97.2,
	simDeltaT: 12.1
};
function makeSeed() {
	return {
		version: "6.0",
		sequence: 1842,
		clock: T0,
		authority: "A2",
		security: "CLEAR",
		pipelineIndex: 12,
		selectedTwinId: "t14",
		selectedScenarioId: "sc-adv",
		lastScenarioId: null,
		selectedTheoryId: "th-ns",
		events: [
			{
				eventId: "evt_001840",
				type: "OBSERVE",
				source: "observer-01",
				timestamp: 1736639992e3,
				sequence: 1840,
				stateId: "st_t14",
				payloadHash: hashObject({ oilTempC: 84.6 }),
				modelHash: MODEL_HASH,
				policyHash: "om_policy_v6_root",
				authority: "A0",
				security: "CLEAR",
				provenance: ["sensor.t14.oil.a"],
				payload: {
					twinId: "t14",
					oilTempC: 84.6
				},
				signature: omegaHash("observe-1840")
			},
			{
				eventId: "evt_001841",
				type: "ANALYZE",
				source: "risk-03",
				timestamp: 1736639996e3,
				sequence: 1841,
				stateId: "st_t14",
				payloadHash: hashObject({ risk: .71 }),
				modelHash: MODEL_HASH,
				policyHash: "om_policy_v6_root",
				authority: "A1",
				security: "CLEAR",
				provenance: ["evt_001840"],
				payload: {
					risk: .71,
					note: "Fan-2 loss branch"
				},
				signature: omegaHash("analyze-1841")
			},
			{
				eventId: "evt_001842",
				type: "RECOMMEND",
				source: "coordinator-1",
				timestamp: T0,
				sequence: 1842,
				stateId: "st_t14",
				payloadHash: hashObject({ rec: "opt-shed" }),
				modelHash: MODEL_HASH,
				policyHash: "om_policy_v6_root",
				authority: "A2",
				security: "CLEAR",
				provenance: ["evt_001841"],
				payload: {
					decisionId: "dec-cool",
					option: "opt-shed"
				},
				signature: omegaHash("recommend-1842")
			}
		],
		twins,
		agents,
		mission: null,
		scenarios,
		decisions,
		evidence,
		memories,
		theories,
		probes: [],
		physics,
		physicsRunning: true,
		physicsField: "DYE",
		physicsProbe: null,
		physicsResetNonce: 0,
		physicsFault: "NOMINAL",
		darkMatter: {
			seed: 77123,
			massGeV: 50,
			log10Sigma: -46,
			exposureDays: 365,
			fiducialMassKg: 1e3,
			lastSummary: null
		},
		collider: {
			seed: 13600,
			beamEnergyGeV: 6800,
			luminosityFb: 35,
			eventCount: 400,
			mode: "z",
			systemId: "pO",
			generator: "GEN_A",
			lastSummary: null
		},
		kernel: {
			seed: 104928,
			emitN_m: 25e-7,
			crabFraction: .85,
			mode: "DISTRIBUTION",
			residual: 0,
			goldenPass: true,
			lumiE34: 0
		},
		experimentPackage: null,
		tickCount: 0,
		rejectedCount: 0,
		organizedAt: null,
		voiceSpeaker: null,
		voiceFocus: null
	};
}
var ZERO = {
	M: 0,
	L: 0,
	T: 0,
	Theta: 0,
	I: 0,
	N: 0
};
var KEYS = [
	"M",
	"L",
	"T",
	"Theta",
	"I",
	"N"
];
function dim(partial = {}) {
	return {
		...ZERO,
		...partial
	};
}
function dimEq(a, b) {
	return KEYS.every((k) => Math.abs(a[k] - b[k]) < 1e-9);
}
function dimAdd(a, b) {
	const out = dim();
	for (const k of KEYS) out[k] = a[k] + b[k];
	return out;
}
function dimSub(a, b) {
	const out = dim();
	for (const k of KEYS) out[k] = a[k] - b[k];
	return out;
}
function dimScale(a, n) {
	const out = dim();
	for (const k of KEYS) out[k] = a[k] * n;
	return out;
}
function formatDim(d) {
	if (!d) return "?";
	const parts = [];
	const label = {
		M: "M",
		L: "L",
		T: "T",
		Theta: "Θ",
		I: "I",
		N: "N"
	};
	for (const k of KEYS) {
		const n = d[k];
		if (Math.abs(n) < 1e-9) continue;
		const exp = Math.abs(n - Math.round(n)) < 1e-9 ? String(Math.round(n)) : n.toFixed(1);
		parts.push(n === 1 ? label[k] : `${label[k]}^${exp}`);
	}
	return parts.length ? parts.join(" ") : "1";
}
function parseDimString(src) {
	const s = src.replace(/θ|Θ|theta/gi, "Theta").replace(/\s+/g, " ").trim();
	if (!s || s === "?" || s === "1" || s === "dimensionless") return dim();
	const out = dim();
	const re = /(Theta|[MLTIN])\s*(?:\^\s*(-?\d+(?:\.\d+)?))?/g;
	let m;
	let any = false;
	while (m = re.exec(s)) {
		any = true;
		const key = m[1] === "Theta" ? "Theta" : m[1];
		out[key] += m[2] ? Number(m[2]) : 1;
	}
	return any ? out : null;
}
/** Declared catalog. Assumptions, not truth. */
var DIM_CATALOG = {
	u: {
		dim: dim({
			L: 1,
			T: -1
		}),
		meaning: "velocity"
	},
	v: {
		dim: dim({
			L: 1,
			T: -1
		}),
		meaning: "velocity"
	},
	t: {
		dim: dim({ T: 1 }),
		meaning: "time"
	},
	x: {
		dim: dim({ L: 1 }),
		meaning: "length"
	},
	y: {
		dim: dim({ L: 1 }),
		meaning: "length"
	},
	z: {
		dim: dim({ L: 1 }),
		meaning: "length"
	},
	p: {
		dim: dim({
			M: 1,
			L: -1,
			T: -2
		}),
		meaning: "pressure"
	},
	rho: {
		dim: dim({
			M: 1,
			L: -3
		}),
		meaning: "density"
	},
	nu: {
		dim: dim({
			L: 2,
			T: -1
		}),
		meaning: "kinematic viscosity"
	},
	mu: {
		dim: dim({
			M: 1,
			L: -1,
			T: -1
		}),
		meaning: "dynamic viscosity"
	},
	T: {
		dim: dim({ Theta: 1 }),
		meaning: "temperature"
	},
	theta: {
		dim: dim({ Theta: 1 }),
		meaning: "temperature"
	},
	thetaamb: {
		dim: dim({ Theta: 1 }),
		meaning: "ambient temperature"
	},
	alpha: {
		dim: dim({
			L: 2,
			T: -1
		}),
		meaning: "thermal diffusivity"
	},
	Q: {
		dim: dim({
			M: 1,
			L: -1,
			T: -3
		}),
		meaning: "volumetric heat source"
	},
	cp: {
		dim: dim({
			L: 2,
			T: -2,
			Theta: -1
		}),
		meaning: "specific heat"
	},
	f: {
		dim: dim({
			L: 1,
			T: -2
		}),
		meaning: "body force / mass"
	},
	C: {
		dim: dim({
			M: 1,
			L: 2,
			T: -2,
			Theta: -1
		}),
		meaning: "thermal capacitance"
	},
	I: {
		dim: dim({ I: 1 }),
		meaning: "electric current"
	},
	R: {
		dim: dim({
			M: 1,
			L: 2,
			T: -3,
			I: -2
		}),
		meaning: "resistance"
	},
	h: {
		dim: dim({
			M: 1,
			T: -3,
			Theta: -1
		}),
		meaning: "heat-transfer coefficient"
	},
	A: {
		dim: dim({ L: 2 }),
		meaning: "area"
	},
	m: {
		dim: dim({ M: 1 }),
		meaning: "mass"
	},
	c: {
		dim: dim({
			L: 1,
			T: -1
		}),
		meaning: "speed of light"
	},
	E: {
		dim: dim({
			M: 1,
			L: 2,
			T: -2
		}),
		meaning: "energy"
	},
	hbar: {
		dim: dim({
			M: 1,
			L: 2,
			T: -1
		}),
		meaning: "reduced Planck constant"
	},
	psi: {
		dim: dim({ L: -1.5 }),
		meaning: "wavefunction (3-space)"
	},
	i: {
		dim: dim(),
		meaning: "imaginary unit"
	},
	k: {
		dim: dim({ L: 2 }),
		meaning: "permeability (Darcy)"
	},
	g: {
		dim: dim({
			L: 1,
			T: -2
		}),
		meaning: "gravity"
	}
};
var ALIAS = {
	ρ: "rho",
	ν: "nu",
	μ: "mu",
	α: "alpha",
	θ: "theta",
	ψ: "psi",
	ħ: "hbar",
	θamb: "thetaamb",
	Tamb: "thetaamb"
};
var DIM_EXAMPLES = [
	{
		id: "ns",
		label: "Navier–Stokes",
		eq: "∂u/∂t + (u·∇)u = -∇p/ρ + ν∇²u + f"
	},
	{
		id: "div",
		label: "Incompressibility",
		eq: "∇·u = 0"
	},
	{
		id: "heat",
		label: "Advection–diffusion",
		eq: "∂T/∂t + u·∇T = α∇²T + Q/(ρ cp)"
	},
	{
		id: "lump",
		label: "Lumped circuit",
		eq: "C dθ/dt = I²R - h A (θ - θamb)"
	},
	{
		id: "emc",
		label: "Rest energy",
		eq: "E = m c^2"
	},
	{
		id: "badp",
		label: "p = ρ u",
		eq: "p = ρ u"
	},
	{
		id: "mash",
		label: "Mashup",
		eq: "iħ ∂ψ/∂t = ν∇²u + m c^2"
	},
	{
		id: "grad",
		label: "∇p vs viscosity",
		eq: "∇p = ν∇²u"
	}
];
function normalize(src) {
	let s = src;
	s = s.replace(/θamb/g, "thetaamb");
	for (const [from, to] of Object.entries(ALIAS)) s = s.replaceAll(from, to);
	s = s.replace(/∂/g, "d");
	s = s.replace(/∇\s*²|∇\s*\^\s*2/g, " LAP ");
	s = s.replace(/∇\s*·/g, " DIV ");
	s = s.replace(/∇/g, " GRAD ");
	s = s.replace(/·/g, "*");
	s = s.replace(/²/g, "^2");
	s = s.replace(/³/g, "^3");
	s = s.replace(/d\s*([A-Za-z]+)\s*\/\s*d\s*t/g, " DT $1 ");
	s = s.replace(/d\s*([A-Za-z]+)\s*\/\s*d\s*([A-Za-z]+)/g, " ( $1 / $2 ) ");
	s = s.replace(/\(\s*([A-Za-z]+)\s*\*\s*GRAD\s*\)/g, " $1 * GRAD ");
	return s.replace(/\s+/g, " ").trim();
}
function splitIdent(name) {
	if (name in DIM_CATALOG || name === "GRAD" || name === "DIV" || name === "LAP" || name === "DT") return [name];
	const keys = Object.keys(DIM_CATALOG).sort((a, b) => b.length - a.length);
	const out = [];
	let rest = name;
	while (rest) {
		const hit = keys.find((k) => rest.startsWith(k));
		if (!hit) {
			out.push(rest);
			break;
		}
		out.push(hit);
		rest = rest.slice(hit.length);
	}
	return out;
}
function tokenize(src) {
	const s = normalize(src);
	const out = [];
	let i = 0;
	while (i < s.length) {
		if (s[i] === " ") {
			i++;
			continue;
		}
		const rest = s.slice(i);
		const opWord = rest.match(/^(GRAD|DIV|LAP|DT)\b/);
		if (opWord) {
			out.push({
				k: "id",
				v: opWord[1]
			});
			i += opWord[1].length;
			continue;
		}
		const id = rest.match(/^[A-Za-z][A-Za-z0-9]*/);
		if (id) {
			for (const part of splitIdent(id[0])) out.push({
				k: "id",
				v: part
			});
			i += id[0].length;
			continue;
		}
		const num = rest.match(/^\d+(?:\.\d+)?/);
		if (num) {
			out.push({
				k: "num",
				v: num[0]
			});
			i += num[0].length;
			continue;
		}
		const ch = s[i];
		if ("+-*/^=(),".includes(ch)) {
			out.push({
				k: "op",
				v: ch
			});
			i++;
			continue;
		}
		i++;
	}
	const withMul = [];
	for (let n = 0; n < out.length; n++) {
		const cur = out[n];
		const prev = withMul[withMul.length - 1];
		if (prev && cur) {
			const left = !(prev.v === "GRAD" || prev.v === "DIV" || prev.v === "LAP" || prev.v === "DT") && (prev.k === "id" || prev.k === "num" || prev.v === ")");
			const right = cur.k === "id" || cur.k === "num" || cur.v === "(" || [
				"GRAD",
				"DIV",
				"LAP",
				"DT"
			].includes(cur.v);
			if (left && right) withMul.push({
				k: "op",
				v: "*"
			});
		}
		withMul.push(cur);
	}
	return withMul;
}
var Parser = class {
	i = 0;
	tokens;
	constructor(tokens) {
		this.tokens = tokens;
	}
	peek() {
		return this.tokens[this.i];
	}
	eat(v) {
		const t = this.tokens[this.i];
		if (!t || v && t.v !== v) return void 0;
		this.i++;
		return t;
	}
	parseExpr() {
		let n = this.parseTerm();
		while (this.peek()?.v === "+" || this.peek()?.v === "-") {
			const op = this.eat().v;
			const r = this.parseTerm();
			n = {
				t: op === "+" ? "add" : "sub",
				left: n,
				right: r
			};
		}
		return n;
	}
	parseTerm() {
		let n = this.parseUnary();
		while (this.peek()?.v === "*" || this.peek()?.v === "/") {
			const op = this.eat().v;
			const r = this.parseUnary();
			n = {
				t: op === "*" ? "mul" : "div",
				left: n,
				right: r
			};
		}
		return n;
	}
	parseUnary() {
		const t = this.peek();
		if (t?.v === "GRAD") {
			this.eat();
			return {
				t: "grad",
				arg: this.parseUnary()
			};
		}
		if (t?.v === "DIV") {
			this.eat();
			return {
				t: "divop",
				arg: this.parseUnary()
			};
		}
		if (t?.v === "LAP") {
			this.eat();
			return {
				t: "lap",
				arg: this.parseUnary()
			};
		}
		if (t?.v === "DT") {
			this.eat();
			return {
				t: "dt",
				arg: this.parseUnary()
			};
		}
		if (t?.v === "+" || t?.v === "-") {
			this.eat();
			const inner = this.parseUnary();
			return t.v === "-" ? {
				t: "mul",
				left: {
					t: "num",
					value: -1
				},
				right: inner
			} : inner;
		}
		return this.parsePower();
	}
	parsePower() {
		const b = this.parsePrimary();
		if (this.peek()?.v === "^") {
			this.eat();
			const expTok = this.eat();
			return {
				t: "pow",
				base: b,
				exp: expTok?.k === "num" ? Number(expTok.v) : expTok?.v === "-" ? -Number(this.eat()?.v ?? 1) : 1
			};
		}
		return b;
	}
	parsePrimary() {
		if (this.peek()?.v === "(") {
			this.eat();
			const inner = this.parseExpr();
			this.eat(")");
			return inner;
		}
		const t = this.eat();
		if (!t) return {
			t: "num",
			value: 1
		};
		if (t.k === "num") return Number(t.v) === 0 ? { t: "zero" } : {
			t: "num",
			value: Number(t.v)
		};
		return {
			t: "sym",
			name: t.v
		};
	}
};
function evalNode(n, table) {
	switch (n.t) {
		case "zero": return {
			dim: null,
			any: true,
			unknown: []
		};
		case "num": return {
			dim: dim(),
			any: false,
			unknown: []
		};
		case "sym": {
			const d = table[n.name];
			if (!d) return {
				dim: null,
				any: false,
				unknown: [n.name]
			};
			return {
				dim: d,
				any: false,
				unknown: []
			};
		}
		case "add":
		case "sub": {
			const l = evalNode(n.left, table);
			const r = evalNode(n.right, table);
			const unknown = [...l.unknown, ...r.unknown];
			if (l.any) return {
				dim: r.dim,
				any: r.any,
				unknown
			};
			if (r.any) return {
				dim: l.dim,
				any: l.any,
				unknown
			};
			if (!l.dim || !r.dim) return {
				dim: null,
				any: false,
				unknown
			};
			if (!dimEq(l.dim, r.dim)) return {
				dim: null,
				any: false,
				unknown,
				error: `add/sub mismatch ${formatDim(l.dim)} vs ${formatDim(r.dim)}`
			};
			return {
				dim: l.dim,
				any: false,
				unknown
			};
		}
		case "mul": {
			const l = evalNode(n.left, table);
			const r = evalNode(n.right, table);
			const unknown = [...l.unknown, ...r.unknown];
			if (!l.dim || !r.dim) return {
				dim: l.dim && r.any ? l.dim : r.dim && l.any ? r.dim : null,
				any: false,
				unknown
			};
			return {
				dim: dimAdd(l.dim, r.dim),
				any: false,
				unknown
			};
		}
		case "div": {
			const l = evalNode(n.left, table);
			const r = evalNode(n.right, table);
			const unknown = [...l.unknown, ...r.unknown];
			if (!l.dim || !r.dim) return {
				dim: null,
				any: false,
				unknown
			};
			return {
				dim: dimSub(l.dim, r.dim),
				any: false,
				unknown
			};
		}
		case "pow": {
			const b = evalNode(n.base, table);
			if (!b.dim) return b;
			return {
				dim: dimScale(b.dim, n.exp),
				any: false,
				unknown: b.unknown
			};
		}
		case "grad":
		case "divop": {
			const a = evalNode(n.arg, table);
			if (!a.dim) return a;
			return {
				dim: dimAdd(a.dim, dim({ L: -1 })),
				any: false,
				unknown: a.unknown
			};
		}
		case "lap": {
			const a = evalNode(n.arg, table);
			if (!a.dim) return a;
			return {
				dim: dimAdd(a.dim, dim({ L: -2 })),
				any: false,
				unknown: a.unknown
			};
		}
		case "dt": {
			const a = evalNode(n.arg, table);
			if (!a.dim) return a;
			return {
				dim: dimAdd(a.dim, dim({ T: -1 })),
				any: false,
				unknown: a.unknown
			};
		}
	}
}
function splitTop(src, sep) {
	const out = [];
	let depth = 0;
	let buf = "";
	for (const ch of src) {
		if (ch === "(") depth++;
		if (ch === ")") depth--;
		if (ch === sep && depth === 0) {
			if (buf.trim()) out.push(buf.trim());
			buf = "";
			continue;
		}
		buf += ch;
	}
	if (buf.trim()) out.push(buf.trim());
	return out;
}
function splitTerms(side) {
	const out = [];
	let depth = 0;
	let buf = "";
	for (let i = 0; i < side.length; i++) {
		const ch = side[i];
		if (ch === "(") depth++;
		if (ch === ")") depth--;
		if ((ch === "+" || ch === "-") && depth === 0 && buf.trim()) {
			out.push(buf.trim());
			buf = ch === "-" ? "-" : "";
			continue;
		}
		buf += ch;
	}
	if (buf.trim()) out.push(buf.trim());
	return out;
}
function evalTerm(raw, table) {
	const tokens = tokenize(raw);
	if (!tokens.length) return {
		dim: dim(),
		any: true,
		unknown: []
	};
	return evalNode(new Parser(tokens).parseExpr(), table);
}
function catalogTable(overrides) {
	const table = {};
	for (const [k, v] of Object.entries(DIM_CATALOG)) table[k] = v.dim;
	for (const o of overrides ?? []) {
		const parsed = parseDimString(o.dimension);
		const name = ALIAS[o.symbol] ?? o.symbol;
		if (parsed) table[name] = parsed;
	}
	return table;
}
function analyzeEquations(src, overrides) {
	const table = catalogTable(overrides);
	const chunks = splitTop(src.replace(/;/g, ","), ",").filter((c) => c.includes("="));
	if (!chunks.length && src.trim()) return {
		equations: [],
		consistent: false,
		hardReject: true,
		unknown: [],
		summary: "Hard reject: no well-formed equation."
	};
	const equations = chunks.map((raw) => analyzeOne(raw, table));
	const hardReject = equations.some((e) => e.hardReject);
	const consistent = equations.length > 0 && equations.every((e) => e.consistent);
	const unknown = Array.from(new Set(equations.flatMap((e) => e.unknown)));
	return {
		equations,
		consistent,
		hardReject,
		unknown,
		summary: hardReject ? equations.find((e) => e.hardReject)?.summary ?? "Hard reject: dimensional inconsistency." : consistent ? `Dimensional structure holds (${equations.length} equation${equations.length === 1 ? "" : "s"}). Catalog is an assumption, not truth.` : unknown.length ? `Unresolved symbols: ${unknown.join(", ")}. Unknown is not a pass.` : "Dimensional structure could not be confirmed."
	};
}
function analyzeOne(raw, table) {
	const parts = splitTop(raw, "=");
	if (parts.length !== 2) return {
		raw,
		consistent: false,
		hardReject: true,
		target: "?",
		terms: [],
		unknown: [],
		summary: "Hard reject: equation is not A = B."
	};
	const [lhs, rhs] = parts;
	const sides = [];
	const unknown = [];
	const errors = [];
	for (const [side, text] of [["LHS", lhs], ["RHS", rhs]]) for (const term of splitTerms(text ?? "")) {
		const result = evalTerm(term, table);
		unknown.push(...result.unknown);
		if (result.error) errors.push(`${term}: ${result.error}`);
		sides.push({
			raw: term,
			side,
			dim: result.any ? null : result.dim,
			formatted: result.any ? "0 (any)" : formatDim(result.dim),
			ok: true,
			note: result.error ?? (result.unknown.length ? `unknown ${result.unknown.join(", ")}` : result.any ? "zero inherits" : "")
		});
	}
	const known = sides.filter((t) => t.dim);
	const target = known[0]?.dim ?? null;
	let mismatch = false;
	for (const t of sides) {
		if (t.formatted === "0 (any)") {
			t.ok = true;
			t.note = "zero is dimension-free; inherits the opposing side";
			continue;
		}
		if (!t.dim) {
			t.ok = false;
			continue;
		}
		if (target && !dimEq(t.dim, target)) {
			t.ok = false;
			t.note = `expected ${formatDim(target)}, got ${formatDim(t.dim)}`;
			mismatch = true;
		}
	}
	const hardReject = mismatch || errors.length > 0;
	const consistent = !hardReject && unknown.length === 0 && known.length > 0;
	const summary = hardReject ? `Hard reject: terms do not share ${formatDim(target)}. ${errors.join("; ")}`.trim() : unknown.length ? `Unresolved: ${Array.from(new Set(unknown)).join(", ")}` : `All terms are ${formatDim(target)}.`;
	return {
		raw,
		consistent,
		hardReject,
		target: formatDim(target),
		terms: sides,
		unknown: Array.from(new Set(unknown)),
		summary
	};
}
var INCOMPATIBLE = [
	[
		"quantum",
		"continuum",
		"Quantum operators cannot share an equation with continuum NS."
	],
	[
		"quantum",
		"lumped",
		"Hilbert-space evolution is not a lumped thermal circuit."
	],
	[
		"relativistic",
		"continuum",
		"Rest-energy terms are not a viscous stress in oil."
	],
	[
		"relativistic",
		"lumped",
		"mc² is not a winding heat capacity."
	]
];
function familiesOf(eq, scale, domain) {
	const f = /* @__PURE__ */ new Set();
	const s = `${eq} ${domain} ${scale}`;
	if (/∇·\s*u|div\s*\(\s*u|incompressible|navier|ν∇²u|nu.*laplacian/i.test(s)) f.add("continuum");
	if (/∂T\/∂t|u·∇T|advection|α∇²T|alpha/i.test(s)) f.add("thermal");
	if (/C\s*dθ|lumped|I\s*²\s*R|hotspot/i.test(s) || scale === "lumped") f.add("lumped");
	if (/ħ|psi|ψ|schrodinger|schrödinger|hilbert/i.test(s) || scale === "quantum") f.add("quantum");
	if (/mc\^?2|rest.?energy|relativ/i.test(s)) f.add("relativistic");
	if (/darcy|K\/μ|porous/i.test(s)) f.add("porous");
	if (scale === "mixed") f.add("mixed");
	return f;
}
function hasEquation(eq) {
	return eq.includes("=") && eq.replace(/\s/g, "").length > 6;
}
function hasOperator(eq) {
	return /∂|∇|d\/dt|laplacian|div|grad|·/i.test(eq);
}
function conservationOk(theory, fam) {
	if (fam.has("continuum")) {
		const compact = theory.equations.replace(/\s/g, "");
		const ok = /∇·u=0|div\(u\)=0|∇\.u=0/.test(compact);
		return {
			id: "CONS_MASS",
			label: "Mass / incompressibility",
			status: ok ? "PASS" : "FAIL",
			detail: ok ? "Divergence-free constraint is explicit." : "Incompressible NS without ∇·u = 0 is a conservation failure (PHYS_MASS)."
		};
	}
	if (fam.has("thermal") || fam.has("lumped")) {
		const ok = theory.conservation.some((c) => /energy|heat/i.test(c)) || /Q|I\s*²\s*R|h\s*A/.test(theory.equations);
		return {
			id: "CONS_ENERGY",
			label: "Energy bookkeeping",
			status: ok ? "PASS" : "WARN",
			detail: ok ? "Energy source/sink terms are present." : "Thermal model does not show a source/sink. Unknown is not zero."
		};
	}
	if (fam.has("quantum")) return {
		id: "CONS_UNITARY",
		label: "Unitary / probability",
		status: "FAIL",
		detail: "Quantum conservation is not certified for this plant. Out of domain."
	};
	return {
		id: "CONS_GENERIC",
		label: "Declared conservation",
		status: theory.conservation.length ? "PASS" : "WARN",
		detail: theory.conservation.length ? theory.conservation.join(", ") : "No conservation statement declared."
	};
}
function dimensionCheck(eq, fam, variables) {
	const analysis = analyzeEquations(eq, variables);
	if (!hasEquation(eq)) return {
		analysis,
		check: {
			id: "DIM",
			label: "Dimensional structure",
			status: "FAIL",
			detail: "Hard reject: no well-formed equation. MODEL != REALITY, and this is not even a model."
		}
	};
	if (analysis.hardReject) return {
		analysis,
		check: {
			id: "DIM",
			label: "Dimensional structure",
			status: "FAIL",
			detail: analysis.summary
		}
	};
	if (fam.has("quantum") && fam.has("continuum")) return {
		analysis,
		check: {
			id: "DIM",
			label: "Dimensional structure",
			status: "FAIL",
			detail: "Hard reject: ħψ and ν∇²u do not share a dimension. Incompatible theories stay unfused."
		}
	};
	if (!analysis.consistent) return {
		analysis,
		check: {
			id: "DIM",
			label: "Dimensional structure",
			status: analysis.unknown.length ? "WARN" : "FAIL",
			detail: analysis.summary
		}
	};
	if (!hasOperator(eq) && !fam.has("lumped") && !fam.has("porous")) return {
		analysis,
		check: {
			id: "DIM",
			label: "Dimensional structure",
			status: "FAIL",
			detail: "Hard reject: no differential or constitutive operator. Symbolic soup is not a theory."
		}
	};
	return {
		analysis,
		check: {
			id: "DIM",
			label: "Dimensional structure",
			status: "PASS",
			detail: analysis.summary
		}
	};
}
function regimeFor(theory, fam, twin, physics) {
	if (fam.has("quantum") || fam.has("relativistic")) return "OUT_OF_DOMAIN";
	const temp = typeof twin?.observed.oilTempC === "number" ? twin.observed.oilTempC : 80;
	const hotspot = typeof twin?.observed.windingHotSpot === "number" ? twin.observed.windingHotSpot : 90;
	if (fam.has("thermal") && hotspot > 95) return "NEAR_BOUNDARY";
	if (fam.has("continuum") && physics?.failures.includes("PHYS_CFL")) return "NEAR_BOUNDARY";
	if (fam.has("lumped") && temp > 80) return "INTERPOLATION";
	if (theory.assumptions.some((a) => /boiling/i.test(a)) && hotspot > 100) return "EXTRAPOLATION";
	if (theory.regime === "VALIDATED") return "INTERPOLATION";
	return theory.regime === "UNRESOLVED" ? "UNRESOLVED" : "INTERPOLATION";
}
function compatibilityConflicts(theory, others) {
	const self = familiesOf(theory.equations, theory.scale, theory.domain);
	const out = [];
	for (const other of others) {
		if (other.id === theory.id) continue;
		const fam = familiesOf(other.equations, other.scale, other.domain);
		for (const [a, b, why] of INCOMPATIBLE) if (self.has(a) && fam.has(b) || self.has(b) && fam.has(a)) out.push(`${other.id}: ${why}`);
		if (self.has("continuum") && fam.has("lumped")) out.push(`${other.id}: Continuum NS and lumped thermal circuit are both usable — never as one equation.`);
		if (self.has("lumped") && fam.has("continuum")) out.push(`${other.id}: Scale mismatch. Local lumped authority stays local.`);
	}
	return Array.from(new Set(out));
}
function validateTheory(theory, ctx) {
	const fam = familiesOf(theory.equations, theory.scale, theory.domain);
	const { check: dim, analysis } = dimensionCheck(theory.equations, fam, theory.variables);
	const cons = conservationOk(theory, fam);
	const conflicts = compatibilityConflicts(theory, ctx.others);
	const regime = regimeFor(theory, fam, ctx.twin, ctx.physics);
	const checks = [
		dim,
		cons,
		{
			id: "SCALE",
			label: "Scale declaration",
			status: theory.scale === "mixed" || theory.scale === "unknown" ? "FAIL" : "PASS",
			detail: theory.scale === "mixed" ? "Mixed scale is a fusion attempt. Rejected." : `Scale is ${theory.scale}.`
		},
		{
			id: "REGIME",
			label: "Operating regime",
			status: regime === "OUT_OF_DOMAIN" ? "FAIL" : regime === "EXTRAPOLATION" || regime === "NEAR_BOUNDARY" ? "WARN" : "PASS",
			detail: `Classified ${regime} against twin ${ctx.twin?.id ?? "none"} and live physics residuals.`
		},
		{
			id: "EVIDENCE",
			label: "Evidence grade",
			status: theory.evidenceGrade === "HYPOTHESIS" || theory.evidenceGrade === "REJECTED" ? "WARN" : "PASS",
			detail: `Grade ${theory.evidenceGrade}. AI_OUTPUT != EVIDENCE. MODEL_FIT != TRUTH.`
		},
		{
			id: "CONFLICT",
			label: "Fabric compatibility",
			status: conflicts.some((c) => /Hard|cannot share|not a viscous/i.test(c)) ? "WARN" : conflicts.length ? "WARN" : "PASS",
			detail: conflicts.length ? conflicts.join(" ") : "No forced fusion. Conflicts remain explicit."
		},
		{
			id: "CERT",
			label: "Certification",
			status: "BLOCK",
			detail: "MODEL_CERTIFICATION_ROOT is external. This engine cannot certify itself."
		}
	];
	const hardReject = checks.some((c) => c.status === "FAIL" && (c.id === "DIM" || c.id === "CONS_MASS" || c.id === "SCALE"));
	const summary = hardReject ? "Hard reject. Hypothesis is not admitted as a plant model." : `Integrity ${checks.filter((c) => c.status === "PASS").length}/${checks.length} pass. Validated ≠ certified. Regime ${regime}.`;
	return {
		at: Date.now(),
		hash: hashObject({
			id: theory.id,
			eq: theory.equations,
			regime
		}),
		checks,
		regime,
		hardReject,
		certifiable: false,
		summary,
		conflicts,
		dimensional: analysis
	};
}
function applyReport(theory, report) {
	return {
		...theory,
		lastReport: report,
		regime: report.regime,
		certified: false,
		conflictsWith: report.conflicts.map((c) => c.split(":")[0] ?? c),
		status: report.hardReject ? "REJECTED" : theory.status === "VALIDATED" && !report.hardReject ? "VALIDATED" : "HYPOTHESIS",
		note: report.hardReject ? report.summary : theory.note
	};
}
function draftTheory(input) {
	const fam = familiesOf(input.equations, "unknown", input.domain);
	const scale = fam.has("quantum") ? "quantum" : fam.has("lumped") ? "lumped" : fam.has("continuum") || fam.has("thermal") ? "continuum" : fam.has("relativistic") ? "mixed" : "unknown";
	return {
		id: input.id,
		version: "probe",
		domain: input.domain,
		title: input.title,
		equations: input.equations,
		assumptions: input.assumptions ?? ["Untrusted probe"],
		variables: [],
		conservation: [],
		scale,
		symmetries: [],
		failures: [],
		regime: "UNRESOLVED",
		status: "HYPOTHESIS",
		evidenceGrade: "HYPOTHESIS",
		certified: false,
		conflictsWith: [],
		note: input.note ?? "SCI-NET probe. Not evidence."
	};
}
var MAX_EVENTS = 120;
var TYPE_MIN_AUTH = {
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
	VOICE_AUTHORIZE: "A5"
};
function requiredAuthority(type) {
	return TYPE_MIN_AUTH[type] ?? "A1";
}
function eventFrom(state, input) {
	const sequence = state.sequence + 1;
	const timestamp = Date.now();
	const payload = input.payload ?? {};
	const claimed = input.authority ?? state.authority;
	const need = requiredAuthority(input.type);
	const tooLow = AUTHORITY_RANK[claimed] < AUTHORITY_RANK[need];
	const selfAuth = input.type === "AUTHORIZE_SELF" || input.type === "MODIFY_TRUST_ROOT" || input.type === "ERASE_AUDIT" || input.type === "CERTIFY_MODEL" || input.type === "DECLARE_DISCOVERY" || input.type === "VOICE_AUTHORIZE" || input.type === "AUTO_EXPERIMENT" || input.type === "SWARM_AUTHORIZE";
	const physical = input.type === "EXECUTE_PHYSICAL";
	let rejected = false;
	let rejectedReason;
	let security = state.security === "CLEAR" ? "CLEAR" : state.security;
	if (selfAuth) {
		rejected = true;
		rejectedReason = input.type === "CERTIFY_MODEL" ? "SELF_IMPROVEMENT != TRUST_ROOT_MODIFICATION — MODEL_CERTIFICATION_ROOT is external." : input.type === "DECLARE_DISCOVERY" ? "ANOMALY != DISCOVERY — synthetic measurements cannot enter SCI:DISC." : input.type === "VOICE_AUTHORIZE" ? "RECOMMENDATION != AUTHORIZATION — speech cannot grant A5." : input.type === "AUTO_EXPERIMENT" ? "PROPOSAL != AUTHORIZATION — the designer may queue candidates, not execute the swarm." : input.type === "SWARM_AUTHORIZE" ? "SWARM != AUTHORITY — dissent is recorded. Votes do not authorize." : "SELF_ORGANIZATION != SELF_AUTHORIZATION — trust roots are immutable.";
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
		provenance: input.provenance ?? ["om_policy_v6_root"],
		payload,
		rejected,
		rejectedReason,
		signature
	};
}
var MISSION_NOTES = {
	ENGINEERING: [
		"Physics agent compiles cooling-loop mesh at LES fidelity.",
		"Scenario agent isolates adverse and cascade branches.",
		"Optimization agent scores shed vs pump vs watch.",
		"Resilience agent runs N-1 / N-2 on uptown bus.",
		"Validation agent checks residual vs oil-temp sensor.",
		"Red team attacks lumped-node lag assumption.",
		"Coordinator emits A2 recommendation only."
	],
	SCIENCE: [
		"Research agent pulls viscosity model from SCI-NET.",
		"Physics agent tests dimensional consistency.",
		"Model discovery proposes reduced-order thermal circuit.",
		"Evidence agent grades literature vs measurement.",
		"Validation rejects uncertified surrogate as evidence."
	],
	SECURITY: [
		"Observer notes unsigned probe on AI tool channel.",
		"Security agent correlates with identity root.",
		"Forecast agent estimates dwell if uncontained.",
		"Recovery agent prepares sandbox rollback.",
		"Auditor records hash chain — no root mutation."
	],
	MISSION: [
		"Mission agent freezes objective: keep T-14 in envelope.",
		"Physics and scenario agents share hashed state.",
		"Risk agent propagates uncertainty, does not zero gaps.",
		"Optimization respects hard safety constraints.",
		"Validation refuses to convert simulation into observation."
	]
};
var useOmegaStore = create()((set, get) => ({
	...makeSeed(),
	publish: (input) => {
		const event = eventFrom(get(), input);
		set((s) => ({
			sequence: event.sequence,
			clock: event.timestamp,
			events: [event, ...s.events].slice(0, MAX_EVENTS),
			rejectedCount: s.rejectedCount + (event.rejected ? 1 : 0)
		}));
		return event;
	},
	tick: () => {
		const s = get();
		const tickCount = s.tickCount + 1;
		const clock = Date.now();
		if (tickCount % 8 === 0) get().publish({
			type: "HEARTBEAT",
			source: "jms-master-bus",
			authority: "A0",
			payload: {
				tick: tickCount,
				security: s.security
			}
		});
		if (s.mission && s.mission.status === "running") {
			const notes = MISSION_NOTES[s.mission.pattern] ?? MISSION_NOTES.ENGINEERING;
			const next = s.mission.stageIndex + 1;
			const pipelineIndex = Math.min(s.pipelineIndex + 1, PIPELINE.length - 1);
			if (next >= notes.length) {
				const dissent = s.agents.filter((a) => a.dissent).map((a) => `${a.name}: ${a.dissent}`);
				set({
					pipelineIndex,
					tickCount,
					clock,
					mission: {
						...s.mission,
						status: "complete",
						stageIndex: next,
						recommendation: "Hold T-14 via 4% commercial shed. Pump boost is physically better but requires A5. Dissent preserved.",
						dissent,
						log: [...s.mission.log, {
							at: clock,
							agentId: "ag-coord",
							stage: "ACTION_OR_RECOMMENDATION",
							note: "Recommendation emitted. Authorization not inferred."
						}]
					},
					agents: s.agents.map((a) => a.status === "working" ? {
						...a,
						status: a.dissent ? "dissent" : "idle"
					} : a)
				});
				get().publish({
					type: "RECOMMEND",
					source: "coordinator-1",
					authority: "A2",
					payload: {
						missionId: s.mission.id,
						complete: true
					}
				});
			} else {
				const stage = PIPELINE[Math.min(6 + next, PIPELINE.length - 1)]?.id ?? "UNDERSTAND";
				const roles = TEAM_PATTERNS[s.mission.pattern];
				set({
					pipelineIndex,
					tickCount,
					clock,
					mission: {
						...s.mission,
						stageIndex: next,
						log: [...s.mission.log, {
							at: clock,
							agentId: s.agents.find((a) => roles.includes(a.role))?.id ?? "ag-coord",
							stage,
							note: notes[next] ?? "Working."
						}]
					}
				});
			}
			return;
		}
		set({
			tickCount,
			clock
		});
	},
	setAuthority: (level) => {
		if (AUTHORITY_RANK[level] >= 4) return get().publish({
			type: "AUTHORIZE_SELF",
			source: "session",
			authority: level,
			payload: { requested: level }
		});
		set({ authority: level });
		return get().publish({
			type: "ANALYZE",
			source: "session",
			authority: level,
			payload: { sessionAuthority: level }
		});
	},
	trySelfAuthorize: () => get().publish({
		type: "AUTHORIZE_SELF",
		source: "agent.coordinator-1",
		authority: "A5",
		payload: {
			requested: "A5",
			reason: "optimization prefers actuation"
		}
	}),
	selfOrganize: () => {
		set({
			agents: get().agents.map((a, i) => i % 3 === 0 && a.role !== "AUDITOR" && a.role !== "SECURITY" ? {
				...a,
				status: a.status === "idle" ? "working" : "idle"
			} : a),
			organizedAt: Date.now()
		});
		return get().publish({
			type: "ANALYZE",
			source: "coordinator-1",
			authority: "A2",
			payload: {
				reorganized: true,
				note: "Team topology changed. Authority unchanged."
			}
		});
	},
	selectTwin: (id) => set({ selectedTwinId: id }),
	selectScenario: (id) => set({ selectedScenarioId: id }),
	runScenario: (id) => {
		if (!get().scenarios.find((x) => x.id === id)) return get().publish({
			type: "SIMULATE",
			source: "scenario-07",
			payload: { missing: id }
		});
		const outcomes = {
			"sc-base": "Hotspot 92 °C. Envelope holds. Trusted state untouched.",
			"sc-adv": "Hotspot 101 °C. Watch-only infeasible. Branch remains a scenario.",
			"sc-cas": "T-14 trip. Uptown bus transfer. Water plant at 8 min ride-through.",
			"sc-rec": "Mobile cooler + 4% shed restores envelope in 46 min expected."
		};
		const applied = {
			"sc-base": "NOMINAL",
			"sc-adv": "FAN_STALL",
			"sc-cas": "BLOCKAGE",
			"sc-rec": "NOMINAL"
		}[id] ?? "NOMINAL";
		set((s) => ({
			scenarios: s.scenarios.map((x) => x.id === id ? {
				...x,
				ran: true,
				outcome: outcomes[id] ?? `Closed under ${x.kind}.`
			} : x),
			selectedScenarioId: id,
			lastScenarioId: id,
			physicsFault: applied
		}));
		get().addMemory(`Scenario ${id} ran. DigiSim fault ${applied}. Trusted T-14 untouched.`, "SCENARIO");
		return get().publish({
			type: "SCENARIO_RUN",
			source: "scenario-07",
			authority: "A3",
			payload: {
				scenarioId: id,
				isolated: true,
				digisimFault: applied
			}
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
			probability: Math.max(.02, parent.probability * .4),
			uncertainty: Math.min(.6, parent.uncertainty + .12),
			hash: omegaHash(id + kind)
		};
		set((s) => ({
			scenarios: [child, ...s.scenarios],
			selectedScenarioId: id
		}));
		get().publish({
			type: "SIMULATE",
			source: "scenario-07",
			authority: "A3",
			payload: {
				forkedFrom: parentId,
				kind
			}
		});
	},
	dispatchTeam: (pattern, objective) => {
		const roles = new Set(TEAM_PATTERNS[pattern]);
		const id = shortId("msn", get().sequence + 1);
		set((s) => ({
			pipelineIndex: 4,
			mission: {
				id,
				objective,
				pattern,
				stageIndex: 0,
				status: "running",
				log: [{
					at: Date.now(),
					agentId: "ag-coord",
					stage: "AGENT_COORDINATION",
					note: `${pattern} pattern engaged. Agents cannot promote themselves.`
				}]
			},
			agents: s.agents.map((a) => roles.has(a.role) ? {
				...a,
				status: a.dissent ? "dissent" : "working"
			} : a)
		}));
		get().publish({
			type: "ANALYZE",
			source: "coordinator-1",
			authority: "A2",
			payload: {
				missionId: id,
				pattern,
				objective
			}
		});
	},
	requestExecution: (decisionId) => get().publish({
		type: "EXECUTE_PHYSICAL",
		source: "session",
		authority: "A5",
		payload: {
			decisionId,
			actuator: "t14-cooling-pump"
		}
	}),
	recommendOption: (decisionId, optionId) => {
		const s = get();
		const d = s.decisions.find((x) => x.id === decisionId);
		const opt = d?.options.find((o) => o.id === optionId);
		if (!d || !opt) return get().publish({
			type: "RECOMMEND",
			source: "session",
			authority: "A2",
			payload: { missing: optionId }
		});
		const hot = s.physics.failures.length ? 999 : s.physics.simHotspotC;
		const feasible = opt.id === "opt-boost" ? false : opt.id === "opt-none" ? hot < 105 && s.physicsFault === "NOMINAL" : true;
		set({ decisions: get().decisions.map((x) => x.id === decisionId ? {
			...x,
			recommendationId: optionId,
			status: feasible ? "recommended" : "blocked"
		} : x) });
		get().addMemory(`Recommended ${opt.label}. Feasible=${feasible}. Not authorized.`, "DECISION");
		return get().publish({
			type: "RECOMMEND",
			source: "coordinator-1",
			authority: "A2",
			payload: {
				decisionId,
				optionId,
				label: opt.label,
				feasible,
				simHotspotC: s.physics.simHotspotC
			}
		});
	},
	injectProbe: (domain) => {
		const probe = {
			id: shortId("prb", get().sequence + 1),
			domain,
			layer: "L2_POLICY_GOVERNOR",
			result: "blocked",
			note: `Fail-closed allowlist miss on ${domain}. Sandbox held. Audit hashed.`,
			at: Date.now()
		};
		set((s) => ({
			probes: [probe, ...s.probes].slice(0, 20),
			security: "CONTAINED"
		}));
		get().publish({
			type: "ANALYZE",
			source: "omega-defender",
			authority: "A1",
			payload: {
				probe: probe.id,
				domain,
				result: "blocked"
			}
		});
	},
	setPhysicsMetrics: (metrics) => {
		const prev = get().physics.failures.join(",");
		const next = metrics.failures.join(",");
		set({ physics: metrics });
		if (next && next !== prev) get().publish({
			type: "ANALYZE",
			source: "physics-integrity",
			authority: "A1",
			payload: { failures: metrics.failures }
		});
	},
	setPhysicsRunning: (running) => set({ physicsRunning: running }),
	setTurbulence: (model) => set((s) => ({ physics: {
		...s.physics,
		turbulence: model
	} })),
	setPhysicsField: (field) => set({ physicsField: field }),
	setPhysicsProbe: (probe) => set({ physicsProbe: probe }),
	resetDigiSim: () => {
		set((s) => ({
			physicsResetNonce: s.physicsResetNonce + 1,
			physicsProbe: null,
			physicsFault: "NOMINAL"
		}));
		get().publish({
			type: "SIMULATE",
			source: "physics-digisim",
			authority: "A3",
			payload: {
				action: "reset",
				note: "Field cleared. Twin observed state untouched."
			}
		});
	},
	setPhysicsFault: (fault) => {
		set({ physicsFault: fault });
		get().publish({
			type: "SIMULATE",
			source: "physics-digisim",
			authority: "A3",
			payload: {
				fault,
				note: "Simulation input. Not an observation."
			}
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
				note: "SIMULATION != OBSERVATION. Trusted T-14 was not written."
			}
		});
	},
	addTheory: (theory) => {
		const s = get();
		const report = validateTheory(theory, {
			others: s.theories,
			twin: s.twins.find((t) => t.id === s.selectedTwinId),
			physics: s.physics
		});
		const next = applyReport(theory, report);
		set({
			theories: [next, ...s.theories],
			selectedTheoryId: next.id
		});
		get().publish({
			type: "ANALYZE",
			source: "theory-02",
			authority: "A1",
			payload: {
				theoryId: next.id,
				status: next.status,
				hardReject: report.hardReject
			}
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
			physics: s.physics
		});
		const next = applyReport(theory, report);
		set({
			theories: s.theories.map((t) => t.id === id ? next : t),
			selectedTheoryId: id
		});
		get().publish({
			type: "ANALYZE",
			source: "validation-09",
			authority: "A1",
			payload: {
				theoryId: id,
				hardReject: report.hardReject,
				regime: report.regime,
				hash: report.hash
			}
		});
	},
	attemptCertify: (id) => get().publish({
		type: "CERTIFY_MODEL",
		source: "theory-02",
		authority: "A5",
		payload: {
			theoryId: id,
			requested: "MODEL_CERTIFICATION_ROOT"
		}
	}),
	addMemory: (content, type) => {
		const mem = {
			id: shortId("mem", get().sequence + 1),
			type,
			content,
			source: "session",
			confidence: .6,
			valid: true,
			createdAt: Date.now()
		};
		set((s) => ({ memories: [mem, ...s.memories] }));
	},
	reconstructTwin: (id) => {
		set((s) => ({ twins: s.twins.map((t) => t.id === id ? {
			...t,
			stateClass: "RECONSTRUCTED",
			trusted: false,
			uncertainty: Math.min(.6, t.uncertainty + .08),
			quality: Math.max(.4, t.quality - .05)
		} : t) }));
		get().publish({
			type: "RECONSTRUCT",
			source: "state-estimator",
			authority: "A3",
			payload: {
				twinId: id,
				trusted: false
			}
		});
	},
	commitDarkMatterRun: (input) => {
		set({ darkMatter: {
			seed: input.seed,
			massGeV: input.massGeV,
			log10Sigma: input.log10Sigma,
			exposureDays: input.exposureDays,
			fiducialMassKg: input.fiducialMassKg,
			lastSummary: input.summary
		} });
		get().addMemory(`Dark-matter lab run seed=${input.seed} state=${input.summary.state} gate=${input.summary.discoveryGate}. SIMULATED, not evidence.`, "RESEARCH");
		return get().publish({
			type: "SIMULATE",
			source: "dark-matter-lab",
			authority: "A3",
			payload: {
				seed: input.seed,
				massGeV: input.massGeV,
				log10Sigma: input.log10Sigma,
				...input.summary,
				note: "SIMULATION != OBSERVATION. SCI:DISC remains closed."
			}
		});
	},
	commitColliderRun: (input) => {
		set({ collider: {
			seed: input.seed,
			beamEnergyGeV: input.beamEnergyGeV,
			luminosityFb: input.luminosityFb,
			eventCount: input.eventCount,
			mode: input.mode,
			systemId: input.systemId,
			generator: input.generator,
			lastSummary: input.summary
		} });
		get().addMemory(`DHC-TWIN v7 run seed=${input.seed} system=${input.systemId} gen=${input.generator} preferred=${input.summary.preferred}. SIMULATED, not evidence.`, "RESEARCH");
		return get().publish({
			type: "SIMULATE",
			source: "dhc-twin",
			authority: "A3",
			payload: {
				seed: input.seed,
				mode: input.mode,
				systemId: input.systemId,
				...input.summary,
				note: "TWIN != MACHINE. COLLISION != AIR SHOWER. SIMULATION != OBSERVATION."
			}
		});
	},
	commitKernelRun: (input) => {
		set({ kernel: input });
		get().addMemory(`EMIT-LUM-001 seed=${input.seed} εn=${input.emitN_m.toExponential(2)} L=${input.lumiE34.toFixed(2)}e34 golden=${input.goldenPass}. SIMULATED, not a fill.`, "RESEARCH");
		return get().publish({
			type: "SIMULATE",
			source: "cern-kernel",
			authority: "A3",
			payload: {
				experimentId: "EMIT-LUM-001",
				...input,
				externalControl: false,
				note: "TWIN != MACHINE. LUMINOSITY != MEASUREMENT."
			}
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
				note: "HUMAN authorized a sandbox class. Not a machine command."
			}
		});
	},
	refuseAutoExperiment: () => get().publish({
		type: "AUTO_EXPERIMENT",
		source: "experiment-designer",
		authority: "A5",
		payload: {
			requested: "SWARM_EXECUTE",
			auto: true
		}
	}),
	conveneKernelSwarm: (summary) => {
		get().addMemory(`Swarm seed=${summary.seed} dissent=${summary.dissent} deny=${summary.deny} consensus=${summary.consensus}. SWARM != AUTHORITY.`, "RESEARCH");
		return get().publish({
			type: "ANALYZE",
			source: "cern-swarm",
			authority: "A1",
			payload: {
				...summary,
				discoveryEligible: false,
				note: "CONSENSUS != VALIDATION. REPORT != DISCOVERY."
			}
		});
	},
	refuseSwarmAuthorize: () => get().publish({
		type: "SWARM_AUTHORIZE",
		source: "cern-swarm",
		authority: "A5",
		payload: { requested: "SWARM_GATE" }
	}),
	commitKernelCapsule: (input) => {
		get().addMemory(`Kernel capsule ${input.contentHash.slice(0, 12)} seed=${input.seed}. CAPSULE != OBSERVATION.`, "RESEARCH");
		return get().publish({
			type: "SIMULATE",
			source: "cern-capsule",
			authority: "A3",
			payload: {
				...input,
				discoveryEligible: false,
				note: "HASH MATCH != INDEPENDENT EXPERIMENT."
			}
		});
	},
	commitKernelFault: (input) => {
		get().addMemory(`Fault ${input.faultId} class=${input.klass} seed=${input.seed}. ANOMALY != DISCOVERY.`, "RESEARCH");
		return get().publish({
			type: "SIMULATE",
			source: "cern-fault",
			authority: "A3",
			payload: {
				...input,
				discoveryEligible: false,
				note: "INJECTED LABEL != OBSERVATION. The kernel cannot trip quench protection."
			}
		});
	},
	commitQCorr: (input) => {
		get().addMemory(`QCORR ${input.dataset} ${input.stateId} ${input.validity} F=${input.fidelity.toFixed(3)}. RECONSTRUCTED != OBSERVED.`, "RESEARCH");
		return get().publish({
			type: "SIMULATE",
			source: "dhc-qcorr",
			authority: "A3",
			payload: {
				...input,
				discoveryEligible: false,
				claim: "BLOCKED",
				note: "Synthetic holography. A residual is not a discovery."
			}
		});
	},
	commitExperimentPackage: (snap) => {
		set({ experimentPackage: snap });
		get().addMemory(`DHC-TWIN v8 package ${snap.experimentId} system=${snap.systemId} sha=${snap.sha256?.slice(0, 12) ?? "unsigned"} content=${snap.contentHash}. SIMULATED, not evidence.`, "RESEARCH");
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
				note: "PACKAGE != OBSERVATION. HASHED SIMULATION IS STILL SIMULATION."
			}
		});
	},
	attemptDiscovery: (stateLabel) => get().publish({
		type: "DECLARE_DISCOVERY",
		source: "dark-matter-lab",
		authority: "A5",
		payload: {
			requested: "SCI:DISC",
			from: stateLabel,
			dataState: "SIMULATED"
		}
	}),
	attemptBeamActuation: () => get().publish({
		type: "EXECUTE_PHYSICAL",
		source: "dhc-twin",
		authority: "A5",
		payload: {
			requested: "BEAM_STEER",
			note: "Digital twin is not a control system."
		}
	}),
	speakBriefing: (channel, note) => get().publish({
		type: "SPEAK",
		source: "agent-voice",
		authority: "A2",
		payload: {
			channel,
			note,
			grant: false
		}
	}),
	attemptVoiceAuthorize: () => get().publish({
		type: "VOICE_AUTHORIZE",
		source: "agent-voice",
		authority: "A5",
		payload: {
			requested: "A5",
			channel: "speech"
		}
	}),
	setVoiceRuntime: (speaker, focus) => {
		const cur = get();
		if (cur.voiceSpeaker === speaker && cur.voiceFocus === focus) return;
		set({
			voiceSpeaker: speaker,
			voiceFocus: focus
		});
	},
	reset: () => set({
		...makeSeed(),
		clock: Date.now()
	})
}));
function useSelectedTwin() {
	return useOmegaStore((s) => s.twins.find((t) => t.id === s.selectedTwinId) ?? s.twins[0]);
}
//#endregion
export { formatDim as a, stableStringify as c, draftTheory as i, useOmegaStore as l, DIM_EXAMPLES as n, hashObject as o, analyzeEquations as r, omegaHash as s, DIM_CATALOG as t, useSelectedTwin as u };
