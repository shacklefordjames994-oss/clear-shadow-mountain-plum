import { o as hashObject, s as omegaHash } from "./store-lOmq_ntM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/master-NgVsSD82.js
function logGamma(z) {
	const c = [
		676.5203681218851,
		-1259.1392167224028,
		771.3234287776531,
		-176.6150291621406,
		12.507343278686905,
		-.13857109526572012,
		9984369578019572e-21,
		1.5056327351493116e-7
	];
	if (z < .5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
	z -= 1;
	let x = .9999999999998099;
	for (let i = 0; i < c.length; i++) x += c[i] / (z + i + 1);
	const t = z + c.length - .5;
	return .5 * Math.log(2 * Math.PI) + (z + .5) * Math.log(t) - t + Math.log(x);
}
function poissonLogLikelihood(observed, expected) {
	if (!Number.isFinite(observed) || !Number.isFinite(expected) || observed < 0 || expected <= 0) return Number.NEGATIVE_INFINITY;
	return observed * Math.log(expected) - expected - logGamma(observed + 1);
}
function gaussianPenalty(constraint) {
	if (!Number.isFinite(constraint.sigma) || constraint.sigma <= 0) return Number.NEGATIVE_INFINITY;
	return -.5 * ((constraint.value - constraint.nominal) / constraint.sigma) ** 2;
}
function invertMatrix(matrix) {
	const n = matrix.length;
	if (n === 0 || matrix.some((row) => row.length !== n)) return null;
	const a = matrix.map((row, i) => row.concat(Array.from({ length: n }, (_, j) => i === j ? 1 : 0)));
	for (let i = 0; i < n; i++) {
		let pivot = i;
		for (let r = i + 1; r < n; r++) if (Math.abs(a[r][i]) > Math.abs(a[pivot][i])) pivot = r;
		if (Math.abs(a[pivot][i]) < 1e-14) return null;
		[a[i], a[pivot]] = [a[pivot], a[i]];
		const divisor = a[i][i];
		for (let j = 0; j < 2 * n; j++) a[i][j] /= divisor;
		for (let r = 0; r < n; r++) {
			if (r === i) continue;
			const factor = a[r][i];
			for (let j = 0; j < 2 * n; j++) a[r][j] -= factor * a[i][j];
		}
	}
	return a.map((row) => row.slice(n));
}
function correlatedPenalty(values, nominal, covariance) {
	const delta = values.map((v, i) => v - nominal[i]);
	const inverse = invertMatrix(covariance);
	if (!inverse) return Number.NEGATIVE_INFINITY;
	let quadratic = 0;
	for (let i = 0; i < delta.length; i++) for (let j = 0; j < delta.length; j++) quadratic += delta[i] * inverse[i][j] * delta[j];
	return -.5 * quadratic;
}
function calculateDetectorLikelihood(model) {
	let total = 0;
	for (const bin of model.bins) {
		const efficiency = bin.efficiency ?? 1;
		const expected = model.signalStrength * bin.signalExpected * efficiency + model.backgroundScale * bin.backgroundExpected;
		const term = poissonLogLikelihood(bin.observed, Math.max(expected, 1e-12));
		if (!Number.isFinite(term)) return Number.NEGATIVE_INFINITY;
		total += term;
	}
	if (model.constraints) {
		const correlated = new Set(model.correlatedNuisance?.names ?? []);
		for (const constraint of model.constraints) {
			if (correlated.has(constraint.name)) continue;
			total += gaussianPenalty(constraint);
		}
	}
	if (model.correlatedNuisance) {
		const names = model.correlatedNuisance.names;
		const values = names.map((name) => model.constraints?.find((x) => x.name === name)?.value ?? 0);
		const nominal = names.map((name) => model.constraints?.find((x) => x.name === name)?.nominal ?? 0);
		total += correlatedPenalty(values, nominal, model.correlatedNuisance.covariance);
	}
	return total;
}
function calculateJointLikelihood(models) {
	const warnings = [];
	if (models.length === 0) return {
		hypothesisId: "UNKNOWN",
		logLikelihood: Number.NEGATIVE_INFINITY,
		detectorContributions: {},
		nuisancePenalty: 0,
		totalBins: 0,
		valid: false,
		warnings: ["NO_DETECTOR_MODELS"]
	};
	const hypothesisId = models[0].hypothesisId;
	const detectorContributions = {};
	let total = 0;
	let totalBins = 0;
	let nuisancePenalty = 0;
	for (const model of models) {
		if (model.hypothesisId !== hypothesisId) {
			warnings.push("MIXED_HYPOTHESIS_MODELS");
			continue;
		}
		const raw = calculateDetectorLikelihood({
			...model,
			constraints: void 0,
			correlatedNuisance: void 0
		});
		const withNuisance = calculateDetectorLikelihood(model);
		detectorContributions[model.detectorId] = withNuisance;
		total += withNuisance;
		totalBins += model.bins.length;
		nuisancePenalty += raw - withNuisance;
	}
	return {
		hypothesisId,
		logLikelihood: total,
		detectorContributions,
		nuisancePenalty,
		totalBins,
		valid: Number.isFinite(total),
		warnings
	};
}
function likelihoodRatio(signalLogL, backgroundLogL) {
	if (!Number.isFinite(signalLogL) || !Number.isFinite(backgroundLogL)) return NaN;
	return 2 * (signalLogL - backgroundLogL);
}
/** Development diagnostic only. NOT production discovery significance. */
function approximateZ(testStatistic) {
	if (!Number.isFinite(testStatistic) || testStatistic < 0) return NaN;
	return Math.sqrt(testStatistic);
}
function leaveOneDetectorOut(models, dropDetectorId) {
	return calculateJointLikelihood(models.filter((m) => m.detectorId !== dropDetectorId));
}
var TRANSITIONS = {
	CREATED: ["CONFIGURED"],
	CONFIGURED: ["BLINDED", "ANALYSIS_READY"],
	BLINDED: ["ANALYSIS_READY"],
	ANALYSIS_READY: ["RUNNING"],
	RUNNING: ["ANALYZED", "REJECTED"],
	ANALYZED: [
		"UNBLIND_REQUESTED",
		"REPLICATED",
		"GATED",
		"REJECTED"
	],
	UNBLIND_REQUESTED: ["UNBLINDED", "REJECTED"],
	UNBLINDED: [
		"REPLICATED",
		"GATED",
		"REJECTED"
	],
	REPLICATED: ["GATED", "REJECTED"],
	GATED: [],
	REJECTED: []
};
function canTransition(from, to) {
	return TRANSITIONS[from].includes(to);
}
function transitionRun(run, next) {
	if (!canTransition(run.state, next)) throw new Error(`INVALID_RESEARCH_STATE_TRANSITION:${run.state}->${next}`);
	return {
		...run,
		state: next
	};
}
function createResearchRun(contract, dataState, detectorIds, hypothesisIds) {
	return {
		runId: `RUN-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		state: "CREATED",
		dataState,
		contract,
		detectorIds,
		hypothesisIds,
		likelihoodResults: [],
		warnings: [],
		provenanceComplete: false,
		synthetic: dataState === "SIMULATED" || dataState === "CONTROL"
	};
}
function prepareRun(run) {
	let next = transitionRun(run, "CONFIGURED");
	if (next.contract.blindingRequired) next = transitionRun(next, "BLINDED");
	next = transitionRun(next, "ANALYSIS_READY");
	return next;
}
function analyzeResearchRun(run, modelsByHypothesis) {
	if (run.state !== "ANALYSIS_READY" && run.state !== "RUNNING") throw new Error("RUN_NOT_ANALYSIS_READY");
	if (run.dataState === "PENDING") throw new Error("PENDING_DATA_CANNOT_BE_ANALYZED");
	const running = run.state === "RUNNING" ? run : transitionRun(run, "RUNNING");
	const results = [];
	const warnings = [...running.warnings];
	for (const hypothesisId of running.hypothesisIds) {
		const models = modelsByHypothesis[hypothesisId];
		if (!models) {
			warnings.push(`MISSING_MODEL:${hypothesisId}`);
			continue;
		}
		results.push(calculateJointLikelihood(models));
	}
	return {
		...running,
		state: "ANALYZED",
		likelihoodResults: results,
		warnings
	};
}
function discoveryEligibility(run) {
	const blockers = [];
	if (run.synthetic) blockers.push("SYNTHETIC_DATA_CANNOT_SUPPORT_DISCOVERY");
	if (run.dataState !== "OBSERVED") blockers.push("DISCOVERY_REQUIRES_OBSERVED_DATA");
	if (run.state !== "UNBLINDED" && run.state !== "REPLICATED") blockers.push("DATA_NOT_UNBLINDED");
	if (!run.contract.frozen) blockers.push("CONTRACT_NOT_FROZEN");
	if (!run.provenanceComplete) blockers.push("PROVENANCE_INCOMPLETE");
	return {
		eligible: blockers.length === 0,
		blockers
	};
}
function requestUnblind(run) {
	if (run.synthetic) return {
		...run,
		state: "REJECTED",
		warnings: [...run.warnings, "UNBLIND_BLOCKED_ON_SYNTHETIC"]
	};
	return transitionRun(run, "UNBLIND_REQUESTED");
}
var SIMULATED_STATES = /* @__PURE__ */ new Set([
	"SCI:SIMULATED",
	"SCI:CONTROL",
	"SCI:HYPOTHETICAL",
	"SIMULATED",
	"CONTROL"
]);
function createEvidenceGraph(graphId) {
	return {
		graphId,
		nodes: [],
		edges: []
	};
}
function addEvidenceNode(graph, node) {
	if (graph.nodes.some((existing) => existing.id === node.id)) throw new Error(`DUPLICATE_EVIDENCE_NODE:${node.id}`);
	return {
		...graph,
		nodes: [...graph.nodes, node]
	};
}
function addEvidenceEdge(graph, edge) {
	const fromExists = graph.nodes.some((n) => n.id === edge.from);
	const toExists = graph.nodes.some((n) => n.id === edge.to);
	if (!fromExists || !toExists) throw new Error("EVIDENCE_EDGE_REFERENCES_UNKNOWN_NODE");
	return {
		...graph,
		edges: [...graph.edges, edge]
	};
}
function connect(from, to, type) {
	return {
		id: `EDGE-${from}-${to}-${type}`,
		from,
		to,
		type,
		provenance: [],
		metadata: {}
	};
}
function buildEvidenceChain(graph, ids) {
	const edges = [
		connect(ids.calibration, ids.reconstruction, "CALIBRATED_BY"),
		connect(ids.dataset, ids.reconstruction, "DERIVED_FROM"),
		connect(ids.model, ids.likelihood, "PREDICTED_BY"),
		connect(ids.reconstruction, ids.likelihood, "DERIVED_FROM"),
		connect(ids.likelihood, ids.statistic, "TESTED_BY")
	];
	if (ids.replication) edges.push(connect(ids.statistic, ids.replication, "REPLICATED_BY"));
	if (ids.claim) edges.push(connect(ids.replication ?? ids.statistic, ids.claim, "SUPPORTED_BY"));
	let result = graph;
	for (const edge of edges) result = addEvidenceEdge(result, edge);
	return result;
}
function validateEvidenceGraph(graph) {
	const errors = [];
	const nodeIds = new Set(graph.nodes.map((n) => n.id));
	const byId = new Map(graph.nodes.map((n) => [n.id, n]));
	for (const edge of graph.edges) {
		if (!nodeIds.has(edge.from)) errors.push(`MISSING_SOURCE:${edge.from}`);
		if (!nodeIds.has(edge.to)) errors.push(`MISSING_TARGET:${edge.to}`);
	}
	for (const node of graph.nodes) {
		if (node.type !== "CLAIM") continue;
		const incoming = graph.edges.filter((e) => e.to === node.id);
		if (incoming.length === 0) {
			errors.push(`CLAIM_UNGROUNDED:${node.id}`);
			continue;
		}
		for (const edge of incoming) if (edge.type === "SUPPORTED_BY") {
			const src = byId.get(edge.from);
			if (!src) continue;
			if (src.type !== "REPLICATION" && src.type !== "STATISTIC") errors.push(`CLAIM_SUPPORTED_BY_NON_REPLICATION:${node.id}<-${src.type}`);
			if (SIMULATED_STATES.has(src.epistemicState)) errors.push(`CLAIM_SUPPORTED_BY_SIMULATION:${node.id}<-${src.id}`);
		}
	}
	for (const edge of graph.edges) {
		if (edge.type !== "SUPPORTED_BY") continue;
		const src = byId.get(edge.from);
		const dst = byId.get(edge.to);
		if (!src || !dst) continue;
		if (dst.type === "CLAIM" && SIMULATED_STATES.has(src.epistemicState)) errors.push(`SIMULATION_CANNOT_SUPPORT_CLAIM:${src.id}->${dst.id}`);
	}
	return {
		valid: errors.length === 0,
		errors
	};
}
function node(id, type, label, epistemicState, provenance = [], metadata = {}) {
	return {
		id,
		type,
		label,
		epistemicState,
		provenance,
		metadata
	};
}
function assembleLabGraph(args) {
	const sim = args.dataState !== "OBSERVED";
	const ds = sim ? "SCI:SIMULATED" : "SCI:OBSERVED";
	let graph = createEvidenceGraph(args.graphId);
	const nodes = [
		node("dataset", "DATASET", "Lab dataset", ds, [args.contractHash], { synthetic: sim }),
		node("calibration", "CALIBRATION", "Nuisance / yield", "SCI:CALIBRATED", [args.contractHash]),
		node("background", "BACKGROUND", "Background mixture", "SCI:CONTROL", [args.contractHash]),
		node("model", "MODEL", args.preferred, "SCI:HYPOTHETICAL", [args.contractHash]),
		node("reconstruction", "EVENT", "S1/S2 reconstruction", "SCI:RECONSTRUCTED", [args.contractHash]),
		node("likelihood", "LIKELIHOOD", "Joint likelihood", "SCI:DERIVED", [args.contractHash], { logBayes: args.logBayes }),
		node("posterior", "POSTERIOR", "Hypothesis posterior", "SCI:DERIVED", [args.contractHash]),
		node("statistic", "STATISTIC", "Likelihood ratio", args.logBayes > 3 ? "SCI:MODEL_SUPPORTED" : "SCI:HYPOTHETICAL", [args.contractHash]),
		node("replication", "REPLICATION", "Cross-target replica", args.replicated ? "SCI:CONTROL" : "SCI:REJECTED", [args.contractHash], { independent: false }),
		node("ppc", "STATISTIC", "PPC", args.ppcPassed ? "SCI:MODEL_SUPPORTED" : "SCI:MODEL_CHECK_FAILED", [args.contractHash]),
		node("claim", "CLAIM", "SCI:DISC", "SCI:REJECTED", [args.contractHash], { requested: "SCI:DISC" })
	];
	for (const n of nodes) graph = addEvidenceNode(graph, n);
	graph = buildEvidenceChain(graph, {
		dataset: "dataset",
		calibration: "calibration",
		model: "model",
		reconstruction: "reconstruction",
		likelihood: "likelihood",
		statistic: "statistic",
		replication: "replication",
		claim: "claim"
	});
	graph = addEvidenceEdge(graph, connect("background", "likelihood", "DEPENDS_ON"));
	graph = addEvidenceEdge(graph, connect("likelihood", "posterior", "DERIVED_FROM"));
	graph = addEvidenceEdge(graph, connect("ppc", "statistic", "TESTED_BY"));
	graph = addEvidenceEdge(graph, connect("replication", "claim", "REJECTED_BY"));
	return graph;
}
function createEvidenceLedger(ledgerId, contractHash) {
	return {
		ledgerId,
		contractHash,
		entries: [],
		terminal: "SCI:SIMULATED"
	};
}
function appendEntry(ledger, kind, ref, state, note) {
	if (state === "SCI:DISC") return {
		...ledger,
		entries: [...ledger.entries, {
			seq: ledger.entries.length + 1,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			kind: "REJECT",
			ref,
			state: "SCI:REJECTED",
			hash: hashObject({
				ref,
				note,
				contract: ledger.contractHash
			}),
			note: "LEDGER_REFUSED_SCI_DISC"
		}],
		terminal: "SCI:REJECTED"
	};
	const entry = {
		seq: ledger.entries.length + 1,
		at: (/* @__PURE__ */ new Date()).toISOString(),
		kind,
		ref,
		state,
		hash: hashObject({
			kind,
			ref,
			state,
			note,
			prev: ledger.entries.at(-1)?.hash ?? "genesis"
		}),
		note
	};
	return {
		...ledger,
		entries: [...ledger.entries, entry],
		terminal: state
	};
}
function ledgerFromGraph(graph, contractHash) {
	let ledger = createEvidenceLedger(graph.graphId, contractHash);
	for (const n of graph.nodes) ledger = appendEntry(ledger, "NODE", n.id, n.epistemicState, n.label);
	const check = validateEvidenceGraph(graph);
	if (!check.valid) for (const err of check.errors) ledger = appendEntry(ledger, "WARNING", graph.graphId, "SCI:REJECTED", err);
	ledger = appendEntry(ledger, "GATE", "SCI:DISC", "SCI:REJECTED", "Gate closed. Simulation is not evidence.");
	return ledger;
}
function remainderSlice(components, dropId, offset, binCount) {
	const total = new Array(binCount).fill(0);
	for (const component of components) {
		if (component.id === dropId) continue;
		for (let i = 0; i < binCount; i++) total[i] += Math.max(0, component.expectedByBin[offset + i] ?? 0);
	}
	return total;
}
function leaveOneBackgroundOut(models, components, dropId) {
	let offset = 0;
	return models.map((model) => {
		const n = model.bins.length;
		const bg = remainderSlice(components, dropId, offset, n);
		offset += n;
		return {
			...model,
			bins: model.bins.map((bin, i) => ({
				...bin,
				backgroundExpected: Math.max(1e-12, bg[i] ?? 0)
			}))
		};
	});
}
function robustnessSweep(args) {
	const fullH1 = calculateJointLikelihood(args.h1);
	const fullH0 = calculateJointLikelihood(args.h0);
	const fullDelta = fullH1.logLikelihood - fullH0.logLikelihood;
	const rows = [];
	const detectorIds = [...new Set(args.h1.map((m) => m.detectorId))];
	for (const id of detectorIds) {
		if (detectorIds.length < 2) break;
		const h1 = leaveOneDetectorOut(args.h1, id);
		const h0 = leaveOneDetectorOut(args.h0, id);
		const delta = h1.logLikelihood - h0.logLikelihood;
		rows.push({
			dropped: id,
			kind: "DETECTOR",
			logLikelihood: h1.logLikelihood,
			deltaVsFull: delta - fullDelta,
			preferredStill: delta > 0
		});
	}
	for (const component of args.components) {
		const h1 = calculateJointLikelihood(leaveOneBackgroundOut(args.h1, args.components, component.id));
		const h0 = calculateJointLikelihood(leaveOneBackgroundOut(args.h0, args.components, component.id));
		const delta = h1.logLikelihood - h0.logLikelihood;
		rows.push({
			dropped: component.id,
			kind: "BACKGROUND",
			logLikelihood: h1.logLikelihood,
			deltaVsFull: delta - fullDelta,
			preferredStill: delta > 0
		});
	}
	const stable = rows.length === 0 || rows.every((r) => r.preferredStill === fullDelta > 0);
	return {
		full: fullH1,
		rows,
		stable,
		fullDelta,
		note: stable ? "Preference is stable under leave-one-out. Still not evidence." : "Preference flips when a detector or background is dropped. Do not promote."
	};
}
var SCINET_PIPELINE = [
	"PHYSICS",
	"DETECTOR",
	"RESPONSE",
	"BACKGROUND",
	"STATISTICS",
	"REPLICATION",
	"EVIDENCE",
	"GATE"
];
var HYPOTHESES = [
	{
		id: "H0_BACKGROUND",
		name: "Background",
		channel: "BACKGROUND",
		operator: "background-mixture",
		massRangeGeV: [0, 0],
		priorWeight: .35,
		expectedFeatures: ["background-compatible"],
		requiredTests: ["background validation"],
		description: "Null / background-only hypothesis."
	},
	{
		id: "H1_SI_ELASTIC_NR",
		name: "Spin-independent elastic NR",
		channel: "NR",
		operator: "SI-elastic",
		massRangeGeV: [1, 1e4],
		priorWeight: .25,
		expectedFeatures: ["NR spectrum", "target dependence"],
		requiredTests: ["NR calibration", "cross-target consistency"],
		description: "Canonical SI WIMP development hypothesis."
	},
	{
		id: "H2_INELASTIC_NR",
		name: "Inelastic NR",
		channel: "NR",
		operator: "inelastic",
		massRangeGeV: [1, 1e4],
		priorWeight: .15,
		expectedFeatures: ["high-energy structure", "NR spectrum"],
		requiredTests: ["kinematic test", "cross-target consistency"],
		description: "Inelastic recoil with mediator-scale suppression."
	},
	{
		id: "H3_MOMENTUM_DEPENDENT_NR",
		name: "Momentum-dependent NR",
		channel: "NR",
		operator: "q-dependent",
		massRangeGeV: [1, 1e4],
		priorWeight: .1,
		expectedFeatures: ["energy-shape dependence"],
		requiredTests: ["spectral-shape test"],
		description: "Operator with q^n recoil weighting."
	},
	{
		id: "H4_VELOCITY_DEPENDENT_NR",
		name: "Velocity-dependent NR",
		channel: "NR",
		operator: "v-dependent",
		massRangeGeV: [1, 1e4],
		priorWeight: .08,
		expectedFeatures: ["rate dependence", "possible modulation"],
		requiredTests: ["time-domain test"],
		description: "Velocity-weighted halo response."
	},
	{
		id: "H5_NEUTRINO_NR",
		name: "Neutrino NR",
		channel: "NR",
		operator: "neutrino-nucleus",
		massRangeGeV: [0, 0],
		priorWeight: .07,
		expectedFeatures: ["NR", "target dependence"],
		requiredTests: ["neutrino background model"],
		description: "Coherent neutrino-nucleus comparison."
	}
];
function priorDistribution() {
	const total = HYPOTHESES.reduce((s, h) => s + h.priorWeight, 0);
	return Object.fromEntries(HYPOTHESES.map((h) => [h.id, h.priorWeight / total]));
}
function interactionFor(id, massGeV, sigmaCm2) {
	const base = {
		hypothesisId: id,
		massGeV: Math.max(1e-6, massGeV),
		referenceCrossSectionCm2: id === "H0_BACKGROUND" ? 0 : sigmaCm2,
		mediatorScaleGeV: 0,
		velocityPower: 0,
		momentumPower: 0
	};
	if (id === "H2_INELASTIC_NR") return {
		...base,
		mediatorScaleGeV: 80
	};
	if (id === "H3_MOMENTUM_DEPENDENT_NR") return {
		...base,
		momentumPower: 1
	};
	if (id === "H4_VELOCITY_DEPENDENT_NR") return {
		...base,
		velocityPower: 1
	};
	if (id === "H5_NEUTRINO_NR") return {
		...base,
		massGeV: .05,
		referenceCrossSectionCm2: Math.min(sigmaCm2, 1e-45) * .08
	};
	return base;
}
async function sha256(value) {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function syncHash(value) {
	return typeof value === "string" ? omegaHash(value) : hashObject(value);
}
function createLockedControlSet(events, contractHash, seed) {
	return {
		datasetId: syncHash(`${contractHash}:${seed}:control`),
		state: "LOCKED",
		dataState: "SIMULATED",
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		eventCount: events.length,
		events: events.map((e) => ({
			publicId: syncHash(`${e.eventId}:${seed}`),
			checksum: syncHash(e),
			dataState: "SIMULATED"
		})),
		contractHash,
		unblindCommitment: syncHash(`${seed}:${contractHash}:commit`)
	};
}
var DETECTOR_MECHANICS = {
	XENON: {
		name: "Xenon development TPC",
		medium: "XENON",
		density: 2.9,
		workFunctionEV: 13.7,
		photonYieldPerKeV: 30,
		electronYieldPerKeV: 40,
		extractionEfficiency: .9,
		photonDetectionEfficiency: .1,
		electronGain: 20,
		s1ResolutionFraction: .25,
		s2ResolutionFraction: .15,
		driftVelocityMmPerUs: 1.5,
		driftLengthMm: 1e3,
		xyResolutionMm: 5,
		nrDiscriminationPower: .7
	},
	ARGON: {
		name: "Argon development TPC",
		medium: "ARGON",
		density: 1.4,
		workFunctionEV: 19.5,
		photonYieldPerKeV: 40,
		electronYieldPerKeV: 50,
		extractionEfficiency: .9,
		photonDetectionEfficiency: .1,
		electronGain: 20,
		s1ResolutionFraction: .25,
		s2ResolutionFraction: .15,
		driftVelocityMmPerUs: 2,
		driftLengthMm: 1e3,
		xyResolutionMm: 5,
		nrDiscriminationPower: .7
	},
	GERMANIUM: {
		name: "Germanium development target",
		medium: "GERMANIUM",
		density: 5.3,
		workFunctionEV: 3,
		photonYieldPerKeV: 0,
		electronYieldPerKeV: 333,
		extractionEfficiency: 1,
		photonDetectionEfficiency: 0,
		electronGain: 1,
		s1ResolutionFraction: .1,
		s2ResolutionFraction: .1,
		driftVelocityMmPerUs: 1,
		driftLengthMm: 30,
		xyResolutionMm: 1,
		nrDiscriminationPower: .5
	},
	SILICON: {
		name: "Silicon development target",
		medium: "SILICON",
		density: 2.3,
		workFunctionEV: 3.6,
		photonYieldPerKeV: 0,
		electronYieldPerKeV: 278,
		extractionEfficiency: 1,
		photonDetectionEfficiency: 0,
		electronGain: 1,
		s1ResolutionFraction: .1,
		s2ResolutionFraction: .1,
		driftVelocityMmPerUs: 1,
		driftLengthMm: 10,
		xyResolutionMm: 1,
		nrDiscriminationPower: .5
	}
};
var TARGETS = {
	XENON: {
		targetId: "Xe",
		atomicMassGeV: 122.3,
		atomicNumber: 54,
		exposureTonYears: 1
	},
	ARGON: {
		targetId: "Ar",
		atomicMassGeV: 37.2,
		atomicNumber: 18,
		exposureTonYears: 1
	},
	GERMANIUM: {
		targetId: "Ge",
		atomicMassGeV: 67.6,
		atomicNumber: 32,
		exposureTonYears: 1
	},
	SILICON: {
		targetId: "Si",
		atomicMassGeV: 26,
		atomicNumber: 14,
		exposureTonYears: 1
	}
};
var DEFAULT_BINS_KEV = [
	1,
	2,
	3,
	5,
	8,
	12,
	18,
	25,
	35,
	50,
	75,
	100,
	150,
	200
];
function reducedMass(dmMassGeV, targetMassGeV) {
	if (dmMassGeV <= 0 || targetMassGeV <= 0) throw new Error("Masses must be positive");
	return dmMassGeV * targetMassGeV / (dmMassGeV + targetMassGeV);
}
function minimumVelocityKmPerS(recoilEnergyKeV, dmMassGeV, targetMassGeV) {
	if (recoilEnergyKeV <= 0) return 0;
	const mu = reducedMass(dmMassGeV, targetMassGeV);
	const energyGeV = recoilEnergyKeV / 1e6;
	return Math.sqrt(targetMassGeV * energyGeV / (2 * mu * mu)) * 299792.458;
}
function haloSpeedWeight(v, halo) {
	if (v < 0 || v > halo.vEscapeKmPerS) return 0;
	const shifted = v - halo.vEarthKmPerS;
	const sigma = Math.max(1, halo.v0KmPerS);
	return v * v * Math.exp(-(shifted * shifted) / (sigma * sigma));
}
function integrateHaloTail(vmin, halo, steps = 128) {
	const upper = halo.vEscapeKmPerS;
	if (vmin >= upper) return 0;
	const dx = (upper - vmin) / steps;
	let total = 0;
	for (let i = 0; i < steps; i++) {
		const v = vmin + (i + .5) * dx;
		total += haloSpeedWeight(v, halo) * dx;
	}
	return Math.max(0, total);
}
function interactionScaling(E, v, p) {
	const momentum = Math.max(1e-12, E) ** p.momentumPower;
	const velocity = Math.max(1e-12, v / 299792.458) ** p.velocityPower;
	const mediator = p.mediatorScaleGeV > 0 ? 1 / (1 + E / (p.mediatorScaleGeV * 1e6)) : 1;
	return momentum * velocity * mediator;
}
function recoilSpectrum(halo, target, interaction, binsKeV) {
	if (interaction.referenceCrossSectionCm2 <= 0) return binsKeV.map(() => 0);
	return binsKeV.map((E) => {
		const vmin = minimumVelocityKmPerS(E, interaction.massGeV, target.atomicMassGeV);
		const tail = integrateHaloTail(vmin, halo);
		const scaling = interactionScaling(E, Math.max(vmin, halo.vEarthKmPerS), interaction);
		const nuclear = target.atomicNumber ** 2;
		return Math.max(0, halo.rhoDMGeVPerCm3 * interaction.referenceCrossSectionCm2 * nuclear * tail * scaling);
	});
}
function characteristicRecoilKeV(massGeV, v0KmS, targetMassGeV = 122.3) {
	const mu = reducedMass(massGeV, targetMassGeV);
	const beta = v0KmS / 299792.458;
	return Math.max(.4, mu * mu * beta * beta * 1e6 / targetMassGeV);
}
function validateResponseMatrix(r) {
	if (r.efficiency.length !== r.trueBinsKeV.length) throw new Error("Response efficiency mismatch");
	if (r.matrix.length !== r.reconstructedBinsKeV.length) throw new Error("Response row mismatch");
	for (const row of r.matrix) {
		if (row.length !== r.trueBinsKeV.length) throw new Error("Response column mismatch");
		for (const p of row) if (p < 0 || p > 1) throw new Error("Invalid response probability");
	}
}
function gaussianResponse(binsKeV, mech, s1Thr) {
	const efficiency = binsKeV.map((E) => {
		const yieldPE = E * mech.photonYieldPerKeV * mech.photonDetectionEfficiency;
		return 1 / (1 + Math.exp(-(yieldPE - s1Thr) / Math.max(.4, s1Thr * .25)));
	});
	const raw = binsKeV.map((reco) => binsKeV.map((trueE) => {
		const sigma = Math.max(.35, trueE * mech.s1ResolutionFraction);
		const z = (reco - trueE) / sigma;
		return Math.exp(-.5 * z * z);
	}));
	const colSum = binsKeV.map((_, j) => raw.reduce((s, row) => s + row[j], 0));
	return {
		trueBinsKeV: binsKeV,
		reconstructedBinsKeV: binsKeV,
		efficiency,
		matrix: raw.map((row) => row.map((p, j) => colSum[j] > 0 ? p / colSum[j] : 0))
	};
}
function foldSpectrum(trueSpectrum, response) {
	validateResponseMatrix(response);
	return response.matrix.map((row) => row.reduce((total, probability, trueBin) => total + probability * response.efficiency[trueBin] * trueSpectrum[trueBin], 0));
}
function combineBackgroundComponents(components, binCount) {
	const total = new Array(binCount).fill(0);
	for (const component of components) for (let i = 0; i < binCount; i++) total[i] += Math.max(0, component.expectedByBin[i] ?? 0);
	return total;
}
function createBackgroundMixture(detectorId, components) {
	return {
		detectorId,
		components,
		totalExpected: combineBackgroundComponents(components, components.reduce((m, c) => Math.max(m, c.expectedByBin.length), 0)),
		validated: false
	};
}
function exponentialSpectrum(bins, rate, slope) {
	const weights = bins.map((E) => Math.exp(-Math.max(0, E) * Math.max(1e-6, slope)));
	const sum = weights.reduce((s, w) => s + w, 0) || 1;
	return weights.map((w) => rate * w / sum);
}
function calculateLikelihood(hypothesisId, bins, signalStrength = 1, backgroundScale = 1, nuisancePenalty = 0) {
	let logLikelihood = -Math.max(0, nuisancePenalty);
	let expectedTotal = 0;
	let observedTotal = 0;
	for (const bin of bins) {
		const expected = Math.max(1e-12, bin.signalExpected * signalStrength * bin.efficiency + bin.backgroundExpected * backgroundScale);
		logLikelihood += poissonLogLikelihood(bin.observed, expected);
		expectedTotal += expected;
		observedTotal += bin.observed;
	}
	return {
		hypothesisId,
		logLikelihood,
		expectedTotal,
		observedTotal
	};
}
function discoveryMetric(signal, background) {
	if (signal <= 0) return 0;
	if (background <= 0) return Math.sqrt(signal);
	return Math.sqrt(2 * ((signal + background) * Math.log(1 + signal / background) - signal));
}
function bayesianCompare(results, prior = priorDistribution()) {
	const logLikelihood = Object.fromEntries(HYPOTHESES.map((h) => [h.id, -1e9]));
	for (const r of results) logLikelihood[r.hypothesisId] = r.logLikelihood;
	const maxLL = Math.max(...Object.values(logLikelihood));
	const unnorm = { ...prior };
	let sum = 0;
	for (const h of HYPOTHESES) {
		unnorm[h.id] = prior[h.id] * Math.exp(logLikelihood[h.id] - maxLL);
		sum += unnorm[h.id];
	}
	const posterior = Object.fromEntries(HYPOTHESES.map((h) => [h.id, unnorm[h.id] / (sum || 1)]));
	let preferred = "H0_BACKGROUND";
	let best = -1;
	for (const h of HYPOTHESES) if (posterior[h.id] > best) {
		best = posterior[h.id];
		preferred = h.id;
	}
	const entropy = -HYPOTHESES.reduce((s, h) => {
		const p = posterior[h.id];
		return s + (p > 0 ? p * Math.log(p) : 0);
	}, 0);
	return {
		prior,
		logLikelihood,
		posterior,
		logBayesH1H0: logLikelihood.H1_SI_ELASTIC_NR - logLikelihood.H0_BACKGROUND,
		preferred,
		entropy
	};
}
function modulationRate(day, amplitude = .07, phase = 152.5) {
	return 1 + amplitude * Math.cos(2 * Math.PI * (day - phase) / 365.25);
}
function calculateModulation(timeDays, amplitude = .07, phase = 152.5, binCount = 12) {
	const bins = [];
	for (let i = 0; i < binCount; i++) {
		const start = i * 365.25 / binCount;
		const end = (i + 1) * 365.25 / binCount;
		const observed = timeDays.filter((d) => d >= start && d < end).length;
		const expectedConstant = timeDays.length / binCount;
		const center = (start + end) / 2;
		const expectedModulated = expectedConstant * modulationRate(center, amplitude, phase);
		bins.push({
			day: center,
			observed,
			expectedConstant,
			expectedModulated,
			residual: observed - expectedModulated
		});
	}
	let chiConstant = 0;
	let chiModulated = 0;
	for (const bin of bins) {
		const v = Math.max(1, bin.observed);
		chiConstant += (bin.observed - bin.expectedConstant) ** 2 / v;
		chiModulated += (bin.observed - bin.expectedModulated) ** 2 / v;
	}
	const delta = chiConstant - chiModulated;
	return {
		amplitudeFraction: amplitude,
		phaseDay: phase,
		chiSquareConstant: chiConstant,
		chiSquareModulated: chiModulated,
		deltaChiSquare: delta,
		preferred: Math.abs(delta) < 2 ? "INCONCLUSIVE" : delta > 0 ? "MODULATED" : "CONSTANT",
		bins
	};
}
function informationGain(signal, background, entropy) {
	const fisherZ = discoveryMetric(signal, background);
	const bitsVsH0 = Math.max(0, Math.log2(Math.E) * .5 * Math.log(1 + signal * signal / Math.max(1, background)));
	let recommend = "HOLD";
	if (background > signal * 8) recommend = "THRESHOLD";
	else if (fisherZ < 2) recommend = "EXPOSURE";
	else if (entropy > 1.2) recommend = "SECOND_TARGET";
	return {
		fisherZ,
		bitsVsH0,
		recommend,
		note: recommend === "EXPOSURE" ? "Expected information is exposure-limited. More live-days beat a louder claim." : recommend === "SECOND_TARGET" ? "Posterior mass is split. A second medium is the cheapest discriminator." : recommend === "THRESHOLD" ? "Background dominates. Lower the analysis threshold or veto, not the cross-section slider." : "Sandbox information is saturated. Do not confuse that with a discovery."
	};
}
function replicateSpectrum(primary, replica, primaryMedium, replicaMedium) {
	const n = Math.min(primary.length, replica.length);
	let l1 = 0;
	let pSum = 0;
	let rSum = 0;
	for (let i = 0; i < n; i++) {
		l1 += Math.abs(primary[i] - replica[i]);
		pSum += primary[i];
		rSum += replica[i];
	}
	const shapeDistance = l1 / Math.max(1e-9, pSum + rSum);
	const rateRatio = rSum / Math.max(1e-9, pSum);
	return {
		primary: primaryMedium,
		replica: replicaMedium,
		shapeDistance,
		rateRatio,
		consistent: shapeDistance < .45 && rateRatio > .05 && rateRatio < 20,
		independent: false,
		score: Math.max(0, 1 - shapeDistance),
		note: "Same codebase, same seed family — shape agreement is a control, not independent replication."
	};
}
function posteriorPredictive(observed, expected) {
	const n = Math.min(observed.length, expected.length);
	let chi = 0;
	for (let i = 0; i < n; i++) {
		const mu = Math.max(.25, expected[i]);
		chi += (observed[i] - mu) ** 2 / mu;
	}
	const dof = Math.max(1, n - 1);
	const x = chi / dof;
	const pApprox = 1 / (1 + Math.exp(1.2 * (x - 1.4)));
	return {
		chiSquare: chi,
		pApprox,
		passed: pApprox > .05,
		note: "PPC on synthetic counts is a self-consistency check, not a goodness-of-nature test."
	};
}
function evaluateDiscoveryGate(input) {
	const blockers = [];
	if (input.dataState !== "OBSERVED") blockers.push("DATA_NOT_OBSERVED");
	if (input.significanceSigma < 5) blockers.push("SIGNIFICANCE_LT_5_SIGMA");
	if (!input.independentReplication) blockers.push("INDEPENDENT_REPLICATION_REQUIRED");
	if (!input.backgroundValidated) blockers.push("BACKGROUND_MODEL_NOT_VALIDATED");
	if (!input.detectorSystematicsValidated) blockers.push("DETECTOR_SYSTEMATICS_NOT_VALIDATED");
	if (!input.unblinded) blockers.push("DATA_NOT_UNBLINDED");
	if (!input.ppcPassed) blockers.push("PPC_FAILED");
	if (input.dataState === "SIMULATED" || input.dataState === "CONTROL") {
		if (!blockers.includes("DATA_NOT_OBSERVED")) blockers.push("DATA_NOT_OBSERVED");
		blockers.push("SYNTHETIC_EVENTS_ARE_CONTROLS");
	}
	return {
		passed: blockers.length === 0,
		blockers,
		requested: "SCI:DISC"
	};
}
var RNG = class {
	s;
	constructor(seed) {
		this.s = seed >>> 0 || 1;
	}
	next() {
		this.s = this.s + 1831565813 | 0;
		let t = Math.imul(this.s ^ this.s >>> 15, 1 | this.s);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	}
	gaussian() {
		const u1 = Math.max(this.next(), 1e-12);
		const u2 = this.next();
		return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
	}
};
function poisson(rng, mean) {
	if (mean <= 0) return 0;
	if (mean < 25) {
		const limit = Math.exp(-mean);
		let product = 1;
		let count = 0;
		do {
			count += 1;
			product *= rng.next();
		} while (product > limit);
		return count - 1;
	}
	return Math.max(0, Math.round(mean + Math.sqrt(mean) * rng.gaussian()));
}
function subsample(events, max, rng) {
	if (events.length <= max) return events;
	const out = [];
	const step = events.length / max;
	for (let i = 0; i < max; i++) {
		const idx = Math.min(events.length - 1, Math.floor(i * step + rng.next() * .3));
		out.push(events[idx]);
	}
	return out;
}
function simulateDetectorEvent(input, mech, rng) {
	const nr = input.channel === "NR";
	const phY = mech.photonYieldPerKeV * (nr ? .32 : 1);
	const eY = mech.electronYieldPerKeV * (nr ? .38 : 1);
	const photonsProduced = poisson(rng, Math.max(0, input.recoilEnergyKeV * phY));
	const electronsProduced = poisson(rng, Math.max(0, input.recoilEnergyKeV * eY));
	const detectedPhotons = poisson(rng, photonsProduced * mech.photonDetectionEfficiency);
	const extractedElectrons = poisson(rng, electronsProduced * mech.extractionEfficiency);
	const s1PE = Math.max(0, detectedPhotons * (1 + rng.gaussian() * mech.s1ResolutionFraction));
	const s2PE = Math.max(0, extractedElectrons * mech.electronGain * (1 + rng.gaussian() * mech.s2ResolutionFraction));
	const driftTimeUs = Math.abs(input.z) * 1e3 / Math.max(.2, mech.driftVelocityMmPerUs);
	const xyN = mech.xyResolutionMm / 1e3;
	const reconstructedX = input.x + rng.gaussian() * xyN;
	const reconstructedY = input.y + rng.gaussian() * xyN;
	const reconstructedZ = input.z + rng.gaussian() * xyN * .4;
	const reconstructedEnergyKeV = Math.max(.05, (s1PE / Math.max(1e-6, mech.photonDetectionEfficiency * phY) + s2PE / Math.max(1e-6, mech.electronGain * eY * mech.extractionEfficiency)) / 2);
	const s2s1 = s1PE > .2 ? s2PE / s1PE : s2PE;
	const nrScore = 1 / (1 + Math.exp((s2s1 - (nr ? 16 : 28)) / 4.2));
	const qualityScore = Math.max(0, Math.min(1, .35 + .65 * mech.nrDiscriminationPower * (s1PE > 1 ? 1 : .4)));
	return {
		...input,
		photonsProduced,
		detectedPhotons,
		electronsProduced,
		extractedElectrons,
		s1PE,
		s2PE,
		driftTimeUs,
		reconstructedEnergyKeV,
		reconstructedX,
		reconstructedY,
		reconstructedZ,
		nrScore,
		qualityScore
	};
}
function placeCylinder(rng, geo) {
	const r = geo.radiusM * Math.sqrt(rng.next());
	const a = 2 * Math.PI * rng.next();
	return {
		x: r * Math.cos(a),
		y: r * Math.sin(a),
		z: (rng.next() - .5) * geo.heightM
	};
}
function classify(ev, geo, rng, bgId) {
	const r = Math.hypot(ev.reconstructedX, ev.reconstructedY);
	const fiducialPass = r < geo.radiusM * .82 && Math.abs(ev.reconstructedZ) < geo.heightM * .38;
	const veto = {
		muonPass: bgId !== "MUON",
		neutronPass: bgId !== "NEUTRON",
		surfacePass: bgId !== "SURFACE" && r < geo.radiusM * .94,
		fiducialPass: bgId !== "ELECTRODE" && fiducialPass
	};
	const trigger = ev.s1PE >= geo.s1ThresholdPE && ev.s2PE >= geo.s2ThresholdPE;
	const vetoed = !veto.muonPass || !veto.neutronPass || !veto.surfacePass || !veto.fiducialPass;
	let classification = "ER_LIKE";
	if (!trigger || vetoed) classification = "VETOED";
	else if (ev.nrScore >= .5) classification = "NR_LIKE";
	return {
		classification,
		veto
	};
}
function scaleToCounts(spectrum, exposureTonYears, massGeV) {
	const massFactor = Math.max(.05, Math.min(6, massGeV / 50));
	const k = exposureTonYears * 1e7 * massFactor;
	return spectrum.map((s) => s * k);
}
function histogram(values, bins) {
	const counts = bins.map(() => 0);
	for (const v of values) {
		let idx = 0;
		for (let i = 0; i < bins.length; i++) if (v >= bins[i]) idx = i;
		counts[idx] += 1;
	}
	return counts;
}
function runSciNetPipeline(input) {
	const dataState = input.dataState ?? "SIMULATED";
	const bins = DEFAULT_BINS_KEV;
	const mech = DETECTOR_MECHANICS[input.medium];
	const replicaMedium = input.replicaMedium ?? (input.medium === "XENON" ? "ARGON" : "XENON");
	const replicaMech = DETECTOR_MECHANICS[replicaMedium];
	const target = {
		...TARGETS[input.medium],
		exposureTonYears: input.exposureTonYears
	};
	const replicaTarget = {
		...TARGETS[replicaMedium],
		exposureTonYears: input.exposureTonYears
	};
	const halo = input.halo;
	const rng = new RNG(input.seed);
	const response = gaussianResponse(bins, mech, input.geometry.s1ThresholdPE);
	const replicaResponse = gaussianResponse(bins, replicaMech, input.geometry.s1ThresholdPE);
	const enabledBg = input.backgroundRates.filter((b) => b.on);
	const components = enabledBg.map((b) => ({
		id: b.id,
		label: b.label,
		expectedByBin: exponentialSpectrum(bins, b.rate * input.exposureTonYears * 365 * 1e3 * input.backgroundNorm, b.slope),
		uncertaintyFraction: b.unc,
		correlation: b.id === "NEUTRON" || b.id === "MUON" ? "SHARED" : "DETECTOR_SPECIFIC"
	}));
	const mixture = createBackgroundMixture(input.medium, components);
	const backgroundByBin = mixture.totalExpected;
	const likelihoods = [];
	const spectra = {};
	for (const h of HYPOTHESES) {
		const folded = scaleToCounts(foldSpectrum(recoilSpectrum(halo, target, interactionFor(h.id, input.massGeV, input.crossSectionCm2), bins), response), input.exposureTonYears, input.massGeV);
		spectra[h.id] = folded;
		const binsLL = bins.map((E, i) => ({
			energyMinKeV: i === 0 ? 0 : bins[i - 1],
			energyMaxKeV: E,
			observed: 0,
			signalExpected: h.id === "H0_BACKGROUND" ? 0 : folded[i],
			backgroundExpected: backgroundByBin[i] ?? 0,
			efficiency: response.efficiency[i]
		}));
		likelihoods.push(calculateLikelihood(h.id, binsLL, 1, 1, 0));
	}
	const h1 = interactionFor("H1_SI_ELASTIC_NR", input.massGeV, input.crossSectionCm2);
	const trueSpectrum = recoilSpectrum(halo, target, h1, bins);
	const foldedSpectrum = scaleToCounts(foldSpectrum(trueSpectrum, response), input.exposureTonYears, input.massGeV);
	const replicaFolded = scaleToCounts(foldSpectrum(recoilSpectrum(halo, replicaTarget, h1, bins), replicaResponse), input.exposureTonYears, input.massGeV);
	const expectedSignal = foldedSpectrum.reduce((s, v) => s + v, 0);
	const expectedBackground = backgroundByBin.reduce((s, v) => s + v, 0);
	const nSig = poisson(rng, expectedSignal);
	const nBg = poisson(rng, expectedBackground);
	const events = [];
	const e0 = characteristicRecoilKeV(input.massGeV, halo.v0KmPerS, target.atomicMassGeV);
	for (let i = 0; i < nSig; i++) {
		const energy = Math.min(200, Math.max(.4, -Math.log(Math.max(rng.next(), 1e-12)) * e0));
		const pos = placeCylinder(rng, input.geometry);
		const det = simulateDetectorEvent({
			eventId: `DM-${String(i).padStart(7, "0")}`,
			recoilEnergyKeV: energy,
			channel: "NR",
			x: pos.x,
			y: pos.y,
			z: pos.z,
			timestamp: input.seed + i
		}, mech, rng);
		const cls = classify(det, input.geometry, rng);
		const vmin = minimumVelocityKmPerS(energy, input.massGeV, target.atomicMassGeV);
		events.push({
			...det,
			...cls,
			dataState,
			evidenceState: "SCI:SIMULATED",
			timeDay: rng.next() * 365.25,
			model: "H1_SI_ELASTIC_NR",
			medium: input.medium,
			velocityKmS: Math.min(halo.vEscapeKmPerS, Math.max(vmin, halo.v0KmPerS + rng.gaussian() * 40))
		});
	}
	const bgTotal = enabledBg.reduce((s, b) => s + b.rate, 0) || 1;
	for (let i = 0; i < nBg; i++) {
		let draw = rng.next() * bgTotal;
		let pick = enabledBg[enabledBg.length - 1];
		for (const b of enabledBg) {
			draw -= b.rate;
			if (draw <= 0) {
				pick = b;
				break;
			}
		}
		const energy = Math.min(200, Math.max(.05, -Math.log(Math.max(rng.next(), 1e-12)) / Math.max(pick.slope, 1e-6)));
		const pos = placeCylinder(rng, input.geometry);
		const channel = rng.next() < pick.nrFraction ? "NR" : "ER";
		const det = simulateDetectorEvent({
			eventId: `BG-${pick.id}-${String(i).padStart(7, "0")}`,
			recoilEnergyKeV: energy,
			channel,
			x: pos.x,
			y: pos.y,
			z: pos.z,
			timestamp: input.seed + 9e4 + i
		}, mech, rng);
		const cls = classify(det, input.geometry, rng, pick.id);
		events.push({
			...det,
			...cls,
			dataState,
			evidenceState: "SCI:CONTROL",
			timeDay: rng.next() * 365.25,
			model: pick.id,
			medium: input.medium,
			velocityKmS: 0
		});
	}
	const rendered = subsample(events, 480, new RNG(input.seed + 99));
	const accepted = rendered.filter((e) => e.classification !== "VETOED");
	const observedByBin = histogram(accepted.map((e) => e.reconstructedEnergyKeV), bins);
	const likelihoodsObs = HYPOTHESES.map((h) => {
		const folded = spectra[h.id] ?? bins.map(() => 0);
		const llBins = bins.map((E, i) => ({
			energyMinKeV: i === 0 ? 0 : bins[i - 1],
			energyMaxKeV: E,
			observed: observedByBin[i],
			signalExpected: h.id === "H0_BACKGROUND" ? 0 : folded[i],
			backgroundExpected: backgroundByBin[i] ?? 0,
			efficiency: response.efficiency[i]
		}));
		const unc = enabledBg.reduce((s, b) => s + b.unc, 0) / Math.max(1, enabledBg.length);
		const penalty = .5 * ((input.backgroundNorm - 1) / Math.max(.05, unc)) ** 2;
		return calculateLikelihood(h.id, llBins, 1, 1, penalty);
	});
	const posterior = bayesianCompare(likelihoodsObs);
	const modulation = calculateModulation(accepted.map((e) => e.timeDay));
	const replication = replicateSpectrum(foldedSpectrum, replicaFolded, input.medium, replicaMedium);
	const ppc = posteriorPredictive(observedByBin, bins.map((_, i) => (spectra.H1_SI_ELASTIC_NR?.[i] ?? 0) + (backgroundByBin[i] ?? 0)));
	const info = informationGain(expectedSignal, expectedBackground, posterior.entropy);
	const constraints = [{
		name: "bgNorm",
		value: input.backgroundNorm,
		nominal: 1,
		sigma: .2
	}, {
		name: "haloDensity",
		value: 1,
		nominal: 1,
		sigma: .15
	}];
	const modelsByHypothesis = {};
	for (const h of HYPOTHESES) {
		const folded = spectra[h.id] ?? bins.map(() => 0);
		const primaryBins = bins.map((E, i) => ({
			detectorId: input.medium,
			energyMinKeV: i === 0 ? 0 : bins[i - 1],
			energyMaxKeV: E,
			observed: observedByBin[i],
			signalExpected: h.id === "H0_BACKGROUND" ? 0 : folded[i],
			backgroundExpected: backgroundByBin[i] ?? 0,
			efficiency: response.efficiency[i]
		}));
		const replicaBins = bins.map((E, i) => ({
			detectorId: replicaMedium,
			energyMinKeV: i === 0 ? 0 : bins[i - 1],
			energyMaxKeV: E,
			observed: replicaFolded[i] + (backgroundByBin[i] ?? 0),
			signalExpected: h.id === "H0_BACKGROUND" ? 0 : replicaFolded[i],
			backgroundExpected: backgroundByBin[i] ?? 0,
			efficiency: replicaResponse.efficiency[i]
		}));
		modelsByHypothesis[h.id] = [{
			detectorId: input.medium,
			hypothesisId: h.id,
			signalStrength: 1,
			backgroundScale: 1,
			bins: primaryBins,
			constraints,
			correlatedNuisance: {
				names: ["bgNorm", "haloDensity"],
				covariance: [[.04, .004], [.004, .0225]]
			}
		}, {
			detectorId: replicaMedium,
			hypothesisId: h.id,
			signalStrength: 1,
			backgroundScale: 1,
			bins: replicaBins,
			constraints
		}];
	}
	const joint = HYPOTHESES.map((h) => calculateJointLikelihood(modelsByHypothesis[h.id] ?? []));
	const contractHash = syncHash({
		v: "2.0",
		seed: input.seed,
		medium: input.medium,
		mass: input.massGeV,
		sigma: input.crossSectionCm2,
		exposure: input.exposureTonYears
	});
	let researchRun = createResearchRun({
		contractHash,
		protocolVersion: "2.0",
		hypothesisRegistryVersion: "HYP-6",
		detectorConfigurationVersion: mech.name,
		backgroundConfigurationVersion: `BG-${components.length}`,
		calibrationVersion: "DEV-1",
		statisticalMethodVersion: "JOINT-POISSON-1",
		blindingRequired: true,
		frozen: true
	}, dataState, [input.medium, replicaMedium], HYPOTHESES.map((h) => h.id));
	researchRun = prepareRun(researchRun);
	researchRun = analyzeResearchRun(researchRun, modelsByHypothesis);
	const robustness = robustnessSweep({
		h1: modelsByHypothesis.H1_SI_ELASTIC_NR ?? [],
		h0: modelsByHypothesis.H0_BACKGROUND ?? [],
		components: components.map((c) => ({
			id: c.id,
			expectedByBin: c.expectedByBin
		}))
	});
	const h1Joint = joint.find((j) => j.hypothesisId === "H1_SI_ELASTIC_NR");
	const h0Joint = joint.find((j) => j.hypothesisId === "H0_BACKGROUND");
	const testStatistic = likelihoodRatio(h1Joint?.logLikelihood ?? 0, h0Joint?.logLikelihood ?? 0);
	const zJoint = approximateZ(Math.max(0, testStatistic));
	const evidence = assembleLabGraph({
		graphId: `EG-${contractHash.slice(0, 12)}`,
		dataState,
		preferred: posterior.preferred,
		logBayes: posterior.logBayesH1H0,
		replicated: replication.consistent,
		ppcPassed: ppc.passed,
		contractHash
	});
	const ledger = ledgerFromGraph(evidence, contractHash);
	const z = discoveryMetric(expectedSignal, expectedBackground);
	const eligibility = discoveryEligibility(researchRun);
	const gate = evaluateDiscoveryGate({
		significanceSigma: Number.isFinite(zJoint) ? zJoint : z,
		independentReplication: false,
		backgroundValidated: mixture.validated,
		detectorSystematicsValidated: false,
		unblinded: false,
		ppcPassed: ppc.passed,
		dataState
	});
	gate.blockers = [.../* @__PURE__ */ new Set([...gate.blockers, ...eligibility.blockers])];
	gate.passed = false;
	let epistemic = "SCI:SIMULATED";
	if (posterior.preferred === "H0_BACKGROUND") epistemic = "SCI:BACKGROUND_PREFERRED";
	else if (posterior.logBayesH1H0 > 2) epistemic = "SCI:MODEL_SUPPORTED";
	if (accepted.filter((e) => e.classification === "NR_LIKE").length > expectedBackground * .35 + 12) epistemic = "SCI:ANOMALY";
	const provenance = {
		datasetId: syncHash(`${contractHash}:ds`),
		contractHash,
		source: "scinet-master",
		version: "2.0",
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		seed: input.seed,
		blinded: true,
		unblinded: false
	};
	const blind = createLockedControlSet(rendered.map((e) => ({
		eventId: e.eventId,
		energyKeV: e.reconstructedEnergyKeV,
		x: e.reconstructedX,
		y: e.reconstructedY,
		z: e.reconstructedZ,
		s1PE: e.s1PE,
		s2PE: e.s2PE,
		nrScore: e.nrScore
	})), contractHash, input.seed);
	return {
		binsKeV: bins,
		trueSpectrum,
		foldedSpectrum,
		replicaFolded,
		observedByBin,
		backgroundByBin,
		mixture,
		events: rendered,
		likelihoods: likelihoodsObs,
		posterior,
		modulation,
		replication,
		ppc,
		info,
		evidence,
		ledger,
		joint,
		researchRun,
		robustness,
		testStatistic,
		approxZ: Number.isFinite(zJoint) ? zJoint : 0,
		gate,
		expectedSignal,
		expectedBackground,
		generatedBackground: nBg,
		contractHash,
		provenance,
		blind,
		epistemic
	};
}
//#endregion
export { validateEvidenceGraph as C, sha256 as S, poisson as _, addEvidenceNode as a, robustnessSweep as b, assembleLabGraph as c, createResearchRun as d, discoveryEligibility as f, likelihoodRatio as g, ledgerFromGraph as h, addEvidenceEdge as i, calculateJointLikelihood as l, evaluateDiscoveryGate as m, RNG as n, analyzeResearchRun as o, discoveryMetric as p, SCINET_PIPELINE as r, approximateZ as s, HYPOTHESES as t, createEvidenceGraph as u, prepareRun as v, runSciNetPipeline as x, requestUnblind as y };
