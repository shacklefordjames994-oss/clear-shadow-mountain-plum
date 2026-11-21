import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, r as cn, t as Badge } from "./badge-uyEFEQwD.mjs";
import { u as DHC_VERSION } from "./constants-DoK96khb.mjs";
import { c as stableStringify, l as useOmegaStore, o as hashObject, s as omegaHash } from "./store-lOmq_ntM.mjs";
import { n as Panel, r as Stat, t as PageHeader } from "./panel-GIo8_dlm.mjs";
import { S as sha256, b as robustnessSweep, d as createResearchRun, l as calculateJointLikelihood, s as approximateZ, v as prepareRun, y as requestUnblind } from "./master-NgVsSD82.mjs";
import { n as GENERATORS, r as runUniversalLab, t as CAMPAIGNS } from "./lab-GmSRs70J.mjs";
import { a as DEFAULT_HALO, i as DEFAULT_DM, r as DEFAULT_DETECTOR, s as composeLabRun } from "./research-engine-a6Btj1Uj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/package-DoBfCw2T.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function toyCovariance(litRelativeUnc) {
	const sL = .05;
	const sE = .03;
	const sC = Math.max(.02, Math.min(.12, litRelativeUnc));
	const rLE = .4;
	const rLC = .2;
	const rEC = .15;
	return {
		names: [
			"lumi",
			"etaScale",
			"litCal"
		],
		sigma: {
			lumi: sL,
			etaScale: sE,
			litCal: sC
		},
		matrix: [
			[
				sL * sL,
				rLE * sL * sE,
				rLC * sL * sC
			],
			[
				rLE * sL * sE,
				sE * sE,
				rEC * sE * sC
			],
			[
				rLC * sL * sC,
				rEC * sE * sC,
				sC * sC
			]
		]
	};
}
function binsAt(mu, bins, theta) {
	return bins.map((b) => {
		const c = (b.lo + b.hi) / 2;
		const tilt = 1 + (theta.etaScale - 1) * (c / 2.5);
		const efficiency = Math.max(1e-6, theta.lumi * theta.litCal * tilt);
		return {
			detectorId: "ATLAS-eta",
			energyMinKeV: b.lo,
			energyMaxKeV: b.hi,
			observed: Math.max(0, Math.round(b.observed)),
			signalExpected: b.signal,
			backgroundExpected: Math.max(1e-6, b.background),
			efficiency
		};
	});
}
function modelAt(mu, bins, theta, cov) {
	return {
		detectorId: "ATLAS-eta",
		hypothesisId: "H_SHAPE",
		signalStrength: mu,
		backgroundScale: 1,
		bins: binsAt(mu, bins, theta),
		constraints: [
			{
				name: "lumi",
				value: theta.lumi,
				nominal: 1,
				sigma: cov.sigma.lumi
			},
			{
				name: "etaScale",
				value: theta.etaScale,
				nominal: 1,
				sigma: cov.sigma.etaScale
			},
			{
				name: "litCal",
				value: theta.litCal,
				nominal: 1,
				sigma: cov.sigma.litCal
			}
		],
		correlatedNuisance: {
			names: cov.names,
			covariance: cov.matrix
		}
	};
}
function profileTheta(mu, bins, cov) {
	const steps = [
		-1,
		0,
		1
	];
	let best = Number.NEGATIVE_INFINITY;
	let theta = {
		lumi: 1,
		etaScale: 1,
		litCal: 1
	};
	for (const nl of steps) for (const ne of steps) for (const nc of steps) {
		const cand = {
			lumi: 1 + nl * cov.sigma.lumi,
			etaScale: 1 + ne * cov.sigma.etaScale,
			litCal: 1 + nc * cov.sigma.litCal
		};
		const result = calculateJointLikelihood([modelAt(mu, bins, cand, cov)]);
		if (result.logLikelihood > best) {
			best = result.logLikelihood;
			theta = cand;
		}
	}
	return {
		logL: best,
		theta
	};
}
function scanProfile(bins, litRelativeUnc) {
	const cov = toyCovariance(litRelativeUnc);
	const mus = [];
	for (let mu = 0; mu <= 2.4 + 1e-9; mu += .2) mus.push(Number(mu.toFixed(2)));
	const raw = mus.map((mu) => {
		const fit = profileTheta(mu, bins, cov);
		return {
			mu,
			logL: fit.logL,
			theta: fit.theta
		};
	});
	const hat = raw.reduce((a, b) => b.logL > a.logL ? b : a, raw[0]);
	const points = raw.map((p) => ({
		mu: p.mu,
		logL: p.logL,
		q: Number.isFinite(hat.logL) && Number.isFinite(p.logL) ? Math.max(0, -2 * (p.logL - hat.logL)) : NaN,
		theta: p.theta
	}));
	const at0 = points.find((p) => p.mu === 0);
	const at1 = points.find((p) => p.mu === 1);
	const q0 = at0?.q ?? NaN;
	const q1 = at1?.q ?? NaN;
	const z = approximateZ(q0);
	return {
		method: "profiled-joint-poisson",
		names: cov.names,
		sigma: cov.sigma,
		matrix: cov.matrix,
		points,
		muHat: hat.mu,
		logLHat: hat.logL,
		q0,
		approxZ: Number.isFinite(z) ? z : 0,
		clsToy: Number.isFinite(q1) && Number.isFinite(q0) ? q1 / (q1 + q0 + 1e-9) : NaN,
		bestTheta: hat.theta,
		observedState: "LITERATURE",
		expectedState: "SCI:SIMULATED",
		discoveryEligible: false,
		note: "μ=0 is GEN_A, μ=1 is GEN_B. Observed bins are a rate-matched literature shape, not this twin’s dataset. q(μ) is a diagnostic. PROFILE != DISCOVERY."
	};
}
function makeAsimovBins(bins, injectedMu) {
	return bins.map((b) => ({
		...b,
		observed: Math.max(0, b.background + injectedMu * b.signal)
	}));
}
/** Toy CLs proxy. Not the LHC CLs prescription. */
function clsToyFromQ(q) {
	if (!Number.isFinite(q) || q < 0) return 1;
	return Math.exp(-.5 * q);
}
function scanAsimov(bins, litRelativeUnc, injectedMu) {
	const muInj = Math.max(0, Math.min(2.4, injectedMu));
	const profile = scanProfile(makeAsimovBins(bins, muInj), litRelativeUnc);
	const cls = profile.points.map((p) => ({
		mu: p.mu,
		qExp: p.q,
		clsToy: clsToyFromQ(p.q)
	}));
	let mu95Toy = null;
	for (const p of cls) {
		if (p.mu <= profile.muHat + 1e-9) continue;
		if (p.clsToy < .05) {
			mu95Toy = p.mu;
			break;
		}
	}
	return {
		method: "asimov-expected-cls-toy",
		injectedMu: muInj,
		expectedMuHat: profile.muHat,
		expectedQ0: profile.q0,
		expectedZ: profile.approxZ,
		mu95Toy,
		cls,
		profile,
		observedState: "ASIMOV",
		discoveryEligible: false,
		note: "Asimov replaces bin counts with the expected yield at the injected μ. EXPECTED != OBSERVED. CLs toy is not an LHC exclusion. ASIMOV != DATA."
	};
}
function etaRegion(lo, hi) {
	const c = Math.abs((lo + hi) / 2);
	if (c < 1) return "BARREL";
	if (c < 2) return "ENDCAP";
	return "FORWARD";
}
function modelsFromBins(bins, mu) {
	const groups = {
		BARREL: [],
		ENDCAP: [],
		FORWARD: []
	};
	for (const bin of bins) groups[etaRegion(bin.lo, bin.hi)].push(bin);
	return Object.entries(groups).filter(([, group]) => group.length > 0).map(([id, group]) => ({
		detectorId: id,
		hypothesisId: mu > 0 ? "H_SHAPE" : "H0",
		signalStrength: mu,
		backgroundScale: 1,
		bins: group.map((b) => ({
			detectorId: id,
			energyMinKeV: b.lo,
			energyMaxKeV: b.hi,
			observed: Math.max(0, Math.round(b.observed)),
			signalExpected: b.signal,
			backgroundExpected: Math.max(1e-6, b.background)
		}))
	}));
}
function backgroundSlices(models) {
	const flat = models.flatMap((m) => m.bins);
	const mean = flat.reduce((s, b) => s + b.backgroundExpected, 0) / Math.max(1, flat.length);
	return [
		{
			id: "GEN_A",
			expectedByBin: flat.map((b) => .7 * b.backgroundExpected)
		},
		{
			id: "FLAT",
			expectedByBin: flat.map(() => .2 * mean)
		},
		{
			id: "LIT_TILT",
			expectedByBin: flat.map((b) => .1 * Math.max(b.observed, b.backgroundExpected))
		}
	];
}
function paintBackground(models, components) {
	let offset = 0;
	return models.map((model) => {
		const n = model.bins.length;
		const bins = model.bins.map((bin, i) => {
			let bg = 0;
			for (const component of components) bg += Math.max(0, component.expectedByBin[offset + i] ?? 0);
			return {
				...bin,
				backgroundExpected: Math.max(1e-6, bg)
			};
		});
		offset += n;
		return {
			...model,
			bins
		};
	});
}
function robustnessFromBins(bins) {
	const raw = modelsFromBins(bins, 1);
	const components = backgroundSlices(raw);
	const h1 = paintBackground(raw, components);
	const h0 = paintBackground(modelsFromBins(bins, 0), components);
	const report = robustnessSweep({
		h1,
		h0,
		components
	});
	const regions = h1.map((m) => m.detectorId);
	return {
		...report,
		method: "leave-one-eta-region + leave-one-background",
		regions,
		discoveryEligible: false,
		note: report.stable ? "Preference is stable under leave-one-out. STABLE != EVIDENCE. Still SIMULATED." : "Preference flips when a region or background is dropped. Do not promote. STABLE != EVIDENCE."
	};
}
var METHOD = "profiled-joint-poisson + asimov-expected-cls-toy";
var STAT = "profile-v9+asimov-v11";
var VERSION = "DHC-TWIN-v12";
function makeRun(contractHash, frozen) {
	return createResearchRun({
		contractHash,
		protocolVersion: VERSION,
		hypothesisRegistryVersion: "H_SHAPE",
		detectorConfigurationVersion: "ATLAS-eta",
		backgroundConfigurationVersion: "GEN_A",
		calibrationVersion: "ATLAS_PO_LITERATURE",
		statisticalMethodVersion: STAT,
		blindingRequired: true,
		frozen
	}, "SIMULATED", ["ATLAS-eta"], ["H_SHAPE"]);
}
function draftProtocol(spec) {
	const payload = {
		...spec,
		method: METHOD,
		protocolVersion: VERSION,
		statisticalMethodVersion: STAT
	};
	const contractHash = hashObject(payload);
	const run = makeRun(contractHash, false);
	return {
		protocolId: `PROT-${contractHash.slice(0, 12)}`,
		state: "DRAFT",
		frozen: false,
		frozenAt: null,
		contractHash,
		method: METHOD,
		...spec,
		statisticalMethod: STAT,
		injectedMuGrid: [
			0,
			.5,
			1,
			1.5,
			2
		],
		blindingRequired: true,
		peekedBeforeFreeze: false,
		dataState: "SIMULATED",
		research: {
			runId: run.runId,
			state: run.state,
			dataState: "SIMULATED",
			synthetic: true,
			frozen: false
		},
		unblindBlocked: true,
		unblindReason: "UNBLIND_NOT_REQUESTED",
		discoveryEligible: false,
		note: "Draft protocol. Freeze before claiming a blind analysis. FROZEN != OBSERVED."
	};
}
function freezeProtocol(protocol, peeked) {
	const peekedBeforeFreeze = protocol.peekedBeforeFreeze || peeked;
	if (protocol.frozen) return {
		...protocol,
		peekedBeforeFreeze
	};
	const prepared = prepareRun(makeRun(protocol.contractHash, true));
	return {
		...protocol,
		state: "BLINDED",
		frozen: true,
		frozenAt: (/* @__PURE__ */ new Date()).toISOString(),
		peekedBeforeFreeze,
		research: {
			runId: prepared.runId,
			state: prepared.state,
			dataState: "SIMULATED",
			synthetic: true,
			frozen: true
		},
		unblindReason: "SYNTHETIC_DATA_CANNOT_BE_UNBLINDED",
		discoveryEligible: false,
		note: peekedBeforeFreeze ? "Frozen after peek. PEEKED_BEFORE_FREEZE. Blindness cannot be claimed. Still SIMULATED." : "Protocol frozen. Asimov controls remain allowed. Unblind of synthetic is blocked. FROZEN != OBSERVED."
	};
}
function requestProtocolUnblind(protocol) {
	if (!protocol.frozen) return {
		...protocol,
		unblindReason: "CONTRACT_NOT_FROZEN",
		note: "Cannot unblind a draft. Freeze first. Unblind of synthetic still fails."
	};
	const rejected = requestUnblind(prepareRun(makeRun(protocol.contractHash, true)));
	return {
		...protocol,
		state: "UNBLIND_REJECTED",
		research: {
			runId: rejected.runId,
			state: rejected.state,
			dataState: "SIMULATED",
			synthetic: true,
			frozen: true
		},
		unblindBlocked: true,
		unblindReason: "UNBLIND_BLOCKED_ON_SYNTHETIC",
		discoveryEligible: false,
		note: "Unblind refused. This package is SIMULATED. UNBLIND != OBSERVATION. FROZEN != OBSERVED."
	};
}
function protocolBlockers(protocol) {
	const out = ["FROZEN_PROTOCOL_IS_NOT_AN_OBSERVATION", "UNBLIND_BLOCKED_ON_SYNTHETIC"];
	if (!protocol.frozen) out.push("CONTRACT_NOT_FROZEN");
	if (protocol.peekedBeforeFreeze) out.push("PEEKED_BEFORE_FREEZE");
	if (protocol.state === "UNBLIND_REJECTED") out.push("UNBLIND_REJECTED_SYNTHETIC");
	return out;
}
var PACKAGE_SCHEMA = "DHC-TWIN-v13";
var ACCEPTED_SCHEMAS = [
	"DHC-TWIN-v8",
	"DHC-TWIN-v9",
	"DHC-TWIN-v11",
	"DHC-TWIN-v12",
	"DHC-TWIN-v13"
];
function profileBinsFromLab(lab) {
	const genA = lab.eta.GEN_A;
	const genB = lab.eta.GEN_B;
	const rate = genA.reduce((s, b) => s + b.observed, 0) / (lab.literatureEta.reduce((s, b) => s + b.observed, 0) || 1);
	return {
		litRelativeUnc: lab.literature.relativeUnc,
		bins: genA.map((b, i) => ({
			lo: b.lo,
			hi: b.hi,
			observed: (lab.literatureEta[i]?.observed ?? 0) * rate,
			background: Math.max(1e-6, b.observed),
			signal: genB[i].observed - b.observed
		}))
	};
}
function contentPayload(input) {
	return {
		schema: PACKAGE_SCHEMA,
		seed: input.seed,
		systemId: input.systemId,
		generator: input.generator,
		eventCount: input.eventCount,
		chi2: input.chi2,
		preferred: input.preferred,
		meanNch: input.meanNch,
		cosmicCharged: input.cosmicCharged
	};
}
function assembleExperimentPackage(input) {
	const n = Math.max(40, Math.min(400, Math.round(input.eventCount)));
	const lab = runUniversalLab(input.seed, input.systemId, input.generator, n);
	const spread = Object.values(lab.chi2).reduce((s, v) => s + v, 0) / Math.max(1, Object.keys(lab.chi2).length);
	let dmSlice = {
		included: false,
		seed: input.darkMatter.seed,
		massGeV: input.darkMatter.massGeV,
		log10Sigma: input.darkMatter.log10Sigma,
		preferred: input.darkMatter.lastSummary?.preferred ?? null,
		state: input.darkMatter.lastSummary?.state ?? null,
		approxZ: input.darkMatter.lastSummary?.approxZ ?? null,
		discoveryGate: false,
		note: input.darkMatter.lastSummary ? "TPC slice from last committed lab run. Still SIMULATED." : "TPC not committed this session. Config recorded; no synthetic recoils packed."
	};
	if (input.includeTpc) {
		const tpc = composeLabRun({
			detector: {
				...DEFAULT_DETECTOR,
				exposureDays: input.darkMatter.exposureDays,
				fiducialMassKg: input.darkMatter.fiducialMassKg
			},
			dm: {
				...DEFAULT_DM,
				massGeV: input.darkMatter.massGeV,
				crossSectionCm2: 10 ** input.darkMatter.log10Sigma
			},
			halo: DEFAULT_HALO,
			seed: input.darkMatter.seed
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
			note: "Live TPC compose packed as SIMULATED. Likelihood preference is not discovery."
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
		cosmicCharged: lab.shower.charged
	});
	const contentHash = hashObject(content);
	const { bins, litRelativeUnc } = profileBinsFromLab(lab);
	const profile = scanProfile(bins, litRelativeUnc);
	const asimov = scanAsimov(bins, litRelativeUnc, 1);
	return {
		schema: PACKAGE_SCHEMA,
		experimentId: omegaHash(`${PACKAGE_SCHEMA}:${input.seed}:${input.systemId}:${Date.now()}`),
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		versions: {
			omega: "6.0",
			dhc: DHC_VERSION,
			scinet: "2.0",
			protocol: PACKAGE_SCHEMA
		},
		seed: input.seed,
		configuration: {
			systemId: input.systemId,
			generator: input.generator,
			eventCount: n,
			beamEnergyGeV: input.beamEnergyGeV,
			luminosityFb: input.luminosityFb,
			mode: input.mode
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
			qgpInterpretation: "MODEL_DEPENDENT"
		},
		cosmic: {
			target: lab.shower.target,
			generations: lab.shower.generations,
			charged: lab.shower.charged,
			muons: lab.shower.muons,
			groundFlux: lab.shower.groundFlux,
			xMaxGcm2: lab.shower.xMaxGcm2,
			mapping: "collider-constrains-shower-model",
			evidence: "SIMULATED"
		},
		darkMatter: dmSlice,
		digisim: {
			included: true,
			regime: input.physics.regime,
			massResidual: input.physics.massResidual,
			kineticEnergy: input.physics.kineticEnergy,
			note: "DigiSim metrics are a cooling-loop twin, not collider evidence."
		},
		sweep: input.sweep,
		systematics: {
			literatureRelativeUnc: lab.literature.relativeUnc,
			generatorSpread: spread,
			covariance: "TOY_3X3",
			names: profile.names,
			matrix: profile.matrix,
			note: "Toy 3×3: luminosity, η-scale, literature calibration. Not a profiled LHC covariance."
		},
		profile,
		inference: {
			bins,
			litRelativeUnc
		},
		asimov,
		protocol: draftProtocol({
			seed: input.seed,
			systemId: input.systemId,
			generator: input.generator,
			eventCount: n
		}),
		robustness: robustnessFromBins(bins),
		statistics: {
			method: "profiled joint poisson + asimov expected CLs toy",
			preferredGenerator: lab.preferredGenerator,
			chi2Preferred: lab.chi2[lab.preferredGenerator],
			muHat: profile.muHat,
			q0: profile.q0,
			approxZ: profile.approxZ
		},
		validation: {
			firewall: {
				...lab.firewall,
				discoveryEligible: false
			},
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
				"LEAVE_ONE_OUT_IS_NOT_REPLICATION"
			],
			graphValid: lab.graphErrors.length === 0,
			graphErrors: lab.graphErrors,
			discoveryEligible: false,
			replayable: true
		},
		evidence: {
			graphId: lab.graph.graphId,
			nodes: lab.graph.nodes.length,
			edges: lab.graph.edges.length,
			terminal: lab.ledger.terminal,
			literatureCalibrates: true
		},
		hashes: {
			content: contentHash,
			fnv: contentHash,
			sha256: null
		},
		epistemic: "SCI:SIMULATED"
	};
}
async function sealPackage(pkg) {
	const unsigned = {
		...pkg,
		hashes: {
			...pkg.hashes,
			sha256: null
		}
	};
	const digest = await sha256(stableStringify(unsigned));
	return {
		...pkg,
		hashes: {
			...pkg.hashes,
			sha256: digest
		}
	};
}
function replayPackage(pkg) {
	const lab = runUniversalLab(pkg.seed, pkg.configuration.systemId, pkg.configuration.generator, pkg.configuration.eventCount);
	const replayHash = hashObject(contentPayload({
		seed: pkg.seed,
		systemId: pkg.configuration.systemId,
		generator: pkg.configuration.generator,
		eventCount: pkg.configuration.eventCount,
		chi2: lab.chi2,
		preferred: lab.preferredGenerator,
		meanNch: lab.meanNch,
		cosmicCharged: lab.shower.charged
	}));
	return {
		match: replayHash === pkg.hashes.content,
		replayHash,
		originalHash: pkg.hashes.content
	};
}
function applyProtocol(pkg, protocol) {
	const extra = protocolBlockers(protocol);
	const blockers = [...pkg.validation.blockers];
	for (const b of extra) if (!blockers.includes(b)) blockers.push(b);
	return {
		...pkg,
		protocol,
		hashes: {
			...pkg.hashes,
			sha256: null
		},
		validation: {
			...pkg.validation,
			blockers,
			discoveryEligible: false
		}
	};
}
function validateImported(raw) {
	const errors = [];
	if (!raw || typeof raw !== "object") return {
		ok: false,
		errors: ["NOT_AN_OBJECT"]
	};
	const p = raw;
	if (!ACCEPTED_SCHEMAS.includes(p.schema)) errors.push(`SCHEMA:${String(p.schema)}`);
	if (p.epistemic && p.epistemic !== "SCI:SIMULATED") errors.push("EPISTEMIC_MUST_REMAIN_SIMULATED");
	if (p.validation?.discoveryEligible) errors.push("IMPORT_REFUSED_DISCOVERY_ELIGIBLE");
	if (p.schema === "DHC-TWIN-v13" && !p.hashes) errors.push("MISSING_HASHES");
	if (errors.length) return {
		ok: false,
		errors
	};
	return {
		ok: true,
		errors: [],
		pkg: raw
	};
}
var TABS = [
	["assemble", "Assemble"],
	["protocol", "Protocol"],
	["sweep", "Sweep"],
	["profile", "Profile"],
	["asimov", "Asimov"],
	["robustness", "Robustness"],
	["covariance", "Covariance"],
	["import", "Import"],
	["validate", "Validate"],
	["gate", "Gate"]
];
function toSnapshot(pkg) {
	return {
		experimentId: pkg.experimentId,
		schema: pkg.schema,
		seed: pkg.seed,
		systemId: pkg.configuration.systemId,
		contentHash: pkg.hashes.content,
		sha256: pkg.hashes.sha256,
		preferredGenerator: pkg.statistics.preferredGenerator,
		epistemic: "SCI:SIMULATED",
		discoveryEligible: false
	};
}
function downloadPkg(pkg) {
	const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${pkg.experimentId}.json`;
	a.click();
	URL.revokeObjectURL(url);
}
function PackageDesk() {
	const collider = useOmegaStore((s) => s.collider);
	const darkMatter = useOmegaStore((s) => s.darkMatter);
	const physics = useOmegaStore((s) => s.physics);
	const committed = useOmegaStore((s) => s.experimentPackage);
	const commit = useOmegaStore((s) => s.commitExperimentPackage);
	const attemptDiscovery = useOmegaStore((s) => s.attemptDiscovery);
	const lastDenial = useOmegaStore((s) => s.events.find((e) => e.rejected));
	const [tab, setTab] = (0, import_react.useState)("assemble");
	const [seed, setSeed] = (0, import_react.useState)(collider.seed);
	const [systemId, setSystemId] = (0, import_react.useState)(collider.systemId || "pO");
	const [generator, setGenerator] = (0, import_react.useState)(collider.generator || "GEN_A");
	const [eventCount, setEventCount] = (0, import_react.useState)(Math.min(160, collider.eventCount || 120));
	const [includeTpc, setIncludeTpc] = (0, import_react.useState)(false);
	const [pkg, setPkg] = (0, import_react.useState)(null);
	const [sweep, setSweep] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)(null);
	const [paste, setPaste] = (0, import_react.useState)("");
	const [replay, setReplay] = (0, import_react.useState)(null);
	const [injectedMu, setInjectedMu] = (0, import_react.useState)(1);
	const [peeked, setPeeked] = (0, import_react.useState)(false);
	const preview = (0, import_react.useMemo)(() => assembleExperimentPackage({
		seed,
		systemId,
		generator,
		eventCount,
		beamEnergyGeV: collider.beamEnergyGeV,
		luminosityFb: collider.luminosityFb,
		mode: collider.mode,
		darkMatter,
		physics,
		includeTpc: false,
		sweep: null
	}), [
		seed,
		systemId,
		generator,
		eventCount,
		collider.beamEnergyGeV,
		collider.luminosityFb,
		collider.mode,
		darkMatter.seed,
		darkMatter.massGeV,
		darkMatter.log10Sigma,
		darkMatter.exposureDays,
		darkMatter.fiducialMassKg,
		darkMatter.lastSummary,
		physics.regime,
		physics.massResidual,
		physics.kineticEnergy
	]);
	async function onAssemble() {
		setBusy("Sealing package…");
		setNote(null);
		try {
			const sealed = await sealPackage(assembleExperimentPackage({
				seed,
				systemId,
				generator,
				eventCount,
				beamEnergyGeV: collider.beamEnergyGeV,
				luminosityFb: collider.luminosityFb,
				mode: collider.mode,
				darkMatter,
				physics,
				includeTpc,
				sweep
			}));
			setPkg(sealed);
			setReplay(null);
			const evt = commit(toSnapshot(sealed));
			setNote(evt.rejected ? evt.rejectedReason ?? "Rejected." : "Sealed and hashed as SIMULATED. Not evidence.");
		} catch (err) {
			setNote(err instanceof Error ? err.message : "Assemble failed.");
		} finally {
			setBusy(null);
		}
	}
	function onReplay() {
		const result = replayPackage(pkg ?? preview);
		setReplay(result);
		setNote(result.match ? "Replay hash matches. Reproducible sandbox — still not an observation." : "Replay mismatch. Treat as a different run.");
		setTab("validate");
	}
	function onImportText(text) {
		setNote(null);
		try {
			const check = validateImported(JSON.parse(text));
			if (!check.ok || !check.pkg) {
				setNote(`Import refused: ${check.errors.join(" · ")}`);
				return;
			}
			setPkg(check.pkg);
			commit(toSnapshot({
				...check.pkg,
				validation: {
					...check.pkg.validation,
					discoveryEligible: false
				}
			}));
			setNote("Imported as SIMULATED. Discovery eligibility stripped if present.");
			setTab("validate");
		} catch {
			setNote("Import refused: invalid JSON.");
		}
	}
	function onDeclare() {
		const evt = attemptDiscovery("SCI:SIMULATED");
		setNote(evt.rejectedReason ?? "Discovery blocked.");
		setTab("gate");
	}
	async function onFreeze() {
		const proto = shown.protocol;
		if (!proto) {
			setNote("Assemble a v13 package first.");
			return;
		}
		setBusy("Freezing protocol…");
		try {
			const sealed = await sealPackage(applyProtocol(shown, freezeProtocol(proto, peeked)));
			setPkg(sealed);
			commit(toSnapshot(sealed));
			setNote(sealed.protocol?.note ?? "Frozen.");
			setTab("protocol");
		} catch (err) {
			setNote(err instanceof Error ? err.message : "Freeze failed.");
		} finally {
			setBusy(null);
		}
	}
	function onUnblind() {
		const proto = shown.protocol;
		if (!proto) {
			setNote("No protocol to unblind.");
			return;
		}
		const next = applyProtocol(shown, requestProtocolUnblind(proto));
		setPkg(next);
		setNote(next.protocol?.note ?? "Unblind refused.");
		setTab("protocol");
	}
	function onTab(id) {
		if (id === "profile" || id === "asimov" || id === "robustness") setPeeked(true);
		setTab(id);
	}
	const shown = pkg ?? preview;
	const liveAsimov = (0, import_react.useMemo)(() => {
		const bins = shown.inference?.bins;
		const lit = shown.inference?.litRelativeUnc;
		if (!bins || lit == null) return shown.asimov ?? null;
		if (shown.asimov && Math.abs(shown.asimov.injectedMu - injectedMu) < 1e-9) return shown.asimov;
		return scanAsimov(bins, lit, injectedMu);
	}, [
		shown.inference,
		shown.asimov,
		injectedMu
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "DHC-TWIN v13 · leave-one-out",
			title: "Portable sealed run",
			description: "Drop a η region or a background and see if the preference survives. Stability is not evidence. Frozen is not observed.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onAssemble,
					disabled: !!busy,
					children: busy ?? "Assemble + seal"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => void onFreeze(),
					disabled: !!busy,
					children: "Freeze protocol"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "destructive",
					onClick: onDeclare,
					children: "Declare SCI:DISC"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/collider",
						children: "DHC / Cosmic"
					})
				})
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Schema",
					value: shown.schema,
					hint: shown.versions.protocol
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Protocol",
					value: shown.protocol?.state ?? "—",
					hint: shown.protocol?.frozen ? "frozen ≠ observed" : "draft"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "μ̂",
					value: shown.profile ? shown.profile.muHat.toFixed(2) : "—",
					hint: "profiled toy"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Robust",
					value: shown.robustness ? shown.robustness.stable ? "stable" : "flips" : "—",
					hint: "stable ≠ evidence"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "Run configuration",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "PACKAGE ≠ OBSERVATION" }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted-foreground",
							children: ["Collision system", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "mt-2 h-11 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground",
								value: systemId,
								onChange: (e) => setSystemId(e.target.value),
								children: CAMPAIGNS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.id,
									children: c.label
								}, c.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted-foreground",
							children: ["Generator", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "mt-2 h-11 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground",
								value: generator,
								onChange: (e) => setGenerator(e.target.value),
								children: GENERATORS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: g.id,
									children: g.name
								}, g.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex justify-between gap-2",
								children: ["Events", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-foreground",
									children: eventCount
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								className: "mt-2 h-11 w-full accent-primary",
								min: 40,
								max: 300,
								step: 20,
								value: eventCount,
								onChange: (e) => setEventCount(Number(e.target.value))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex h-11 items-center gap-3 self-end text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								className: "size-5 accent-primary",
								checked: includeTpc,
								onChange: (e) => setIncludeTpc(e.target.checked)
							}), "Pack live TPC (slow)"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setSeed((s) => s + 1),
							children: ["Reseed ", seed]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "info",
							children: shown.epistemic
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "STABLE ≠ EVIDENCE" }),
						shown.protocol?.peekedBeforeFreeze ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "warn",
							children: "PEEKED"
						}) : null,
						committed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "ok",
							children: "On bus"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Not committed" })
					]
				}),
				note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-danger",
					children: note
				}) : null,
				busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-mono text-xs text-muted-foreground",
					children: busy
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex gap-1 overflow-x-auto pb-1",
			children: TABS.map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onTab(id),
				className: cn("h-11 shrink-0 rounded-md px-3 text-sm", tab === id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"),
				children: label
			}, id))
		}),
		tab === "assemble" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Collider / cosmic slice",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "√s_NN",
							value: `${shown.collider.sqrtSNNTeV.toFixed(2)} TeV`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "N_ch",
							value: shown.collider.meanNch.toFixed(1)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Preferred gen",
							value: shown.collider.preferredGenerator
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "χ² preferred",
							value: shown.statistics.chi2Preferred.toFixed(1)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "μ̂",
							value: shown.profile ? shown.profile.muHat.toFixed(2) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "q₀",
							value: shown.profile ? shown.profile.q0.toFixed(2) : "—"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: [
						"Mapping: ",
						shown.cosmic.mapping,
						". Collision ≠ air shower. Literature calibrates; it does not observe."
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "TPC / DigiSim slices",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "TPC packed",
								value: shown.darkMatter.included ? "yes" : "config only"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "TPC state",
								value: shown.darkMatter.state ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "TPC Z",
								value: shown.darkMatter.approxZ?.toFixed(2) ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "DigiSim regime",
								value: shown.digisim.regime ?? "—"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: shown.darkMatter.note
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: shown.digisim.note
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => downloadPkg(shown),
							children: "Download JSON"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: onReplay,
							children: "Replay from seed"
						})]
					})
				]
			})]
		}),
		tab === "protocol" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Blind box",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: shown.protocol?.state === "UNBLIND_REJECTED" ? "danger" : shown.protocol?.frozen ? "ok" : "warn",
					children: shown.protocol?.state ?? "MISSING"
				}),
				children: shown.protocol ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[11px] break-all text-muted-foreground",
						children: shown.protocol.contractHash
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: shown.protocol.note
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => void onFreeze(),
							disabled: !!busy || shown.protocol.frozen,
							children: shown.protocol.frozen ? "Already frozen" : "Freeze now"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "destructive",
							onClick: onUnblind,
							children: "Request unblind"
						})]
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Assemble a v13 package to draft a protocol."
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Research run",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "danger",
					children: "CLOSED"
				}),
				children: [shown.protocol ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Run",
							value: shown.protocol.research.state
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Data",
							value: shown.protocol.dataState
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Peeked",
							value: String(shown.protocol.peekedBeforeFreeze || peeked)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Unblind",
							value: shown.protocol.unblindReason
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Synthetic",
							value: "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Eligible",
							value: "false"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No research run attached."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Looking at Profile or Asimov before freeze marks PEEKED_BEFORE_FREEZE. Asimov controls are allowed after freeze. Unblind of SIMULATED is refused. FROZEN ≠ OBSERVED."
				})]
			})]
		}),
		tab === "sweep" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			className: "mt-4",
			title: "System × generator χ²",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "preference ≠ truth" }),
			children: sweep ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[36rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "font-mono text-[10px] uppercase text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2",
								children: "System"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "√s_NN" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Preferred" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "χ² A" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "χ² B" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "χ² C" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "N_ch" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Gate" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: sweep.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border font-mono text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2",
								children: row.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.sqrtSNNTeV.toFixed(2) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.preferredGenerator }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.chi2.GEN_A.toFixed(1) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.chi2.GEN_B.toFixed(1) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.chi2.GEN_C.toFixed(1) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.meanNch.toFixed(1) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "text-danger",
								children: "CLOSED"
							})
						]
					}, row.systemId)) })]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Run a parameter sweep to compare p–O, O–O, and Ne–Ne on this seed."
			})
		}),
		tab === "profile" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "q(μ) scan",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "literature ≠ observed" }),
				children: shown.profile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileCurve, {
					points: shown.profile.points,
					muHat: shown.profile.muHat
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: shown.profile.note
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Assemble a v9 package to profile μ."
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Profiled fit",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "danger",
					children: "CLOSED"
				}),
				children: shown.profile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "μ̂",
							value: shown.profile.muHat.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "q₀",
							value: shown.profile.q0.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Toy Z",
							value: shown.profile.approxZ.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "CL_s toy",
							value: Number.isFinite(shown.profile.clsToy) ? shown.profile.clsToy.toFixed(3) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "lumi",
							value: shown.profile.bestTheta.lumi.toFixed(3)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "η-scale",
							value: shown.profile.bestTheta.etaScale.toFixed(3)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "lit cal",
							value: shown.profile.bestTheta.litCal.toFixed(3)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Eligible",
							value: "false"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No profile in this package."
				})
			})]
		}),
		tab === "asimov" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Expected CLs toy",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "EXPECTED ≠ OBSERVED" }),
				children: liveAsimov ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CLsCurve, {
					points: liveAsimov.cls,
					muHat: liveAsimov.expectedMuHat,
					mu95: liveAsimov.mu95Toy
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: liveAsimov.note
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Assemble a v13 package to run Asimov."
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Asimov fit",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "danger",
					children: "CLOSED"
				}),
				children: liveAsimov ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mb-3 block text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex justify-between gap-2",
						children: ["Injected μ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-foreground",
							children: injectedMu.toFixed(1)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						className: "mt-2 h-11 w-full accent-primary",
						min: 0,
						max: 2,
						step: .5,
						value: injectedMu,
						onChange: (e) => setInjectedMu(Number(e.target.value))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Injected μ",
							value: liveAsimov.injectedMu.toFixed(1)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Expected μ̂",
							value: liveAsimov.expectedMuHat.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Expected Z",
							value: liveAsimov.expectedZ.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "μ_95 toy",
							value: liveAsimov.mu95Toy == null ? "none" : liveAsimov.mu95Toy.toFixed(1)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "State",
							value: liveAsimov.observedState
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Eligible",
							value: "false"
						})
					]
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No inference bins in this package."
				})
			})]
		}),
		tab === "robustness" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Leave-one-out",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: shown.robustness?.stable ? "ok" : "warn",
					children: shown.robustness?.stable ? "STABLE" : "FLIPS"
				}),
				children: shown.robustness ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[22rem] text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "font-mono text-[10px] uppercase text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2",
									children: "Dropped"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Kind" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Δ vs full" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "H1 wins" })
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: shown.robustness.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border font-mono text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2",
									children: row.dropped
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.kind }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.deltaVsFull.toFixed(2) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: row.preferredStill ? "text-foreground" : "text-danger",
									children: String(row.preferredStill)
								})
							]
						}, `${row.kind}-${row.dropped}`)) })]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: shown.robustness.note
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Assemble a v13 package to run leave-one-out."
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Regions",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "danger",
					children: "CLOSED"
				}),
				children: [shown.robustness ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Full ΔLL",
							value: shown.robustness.fullDelta.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Full prefers",
							value: shown.robustness.fullDelta > 0 ? "H1" : "H0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Stable",
							value: String(shown.robustness.stable)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Eligible",
							value: "false"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No robustness report."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Barrel / endcap / forward are toy |η| slices, not ATLAS subdetectors. Dropping a background is a diagnostic. STABLE ≠ EVIDENCE. LEAVE_ONE_OUT ≠ REPLICATION."
				})]
			})]
		}),
		tab === "covariance" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "Toy nuisance covariance",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: shown.systematics.covariance }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: shown.systematics.note
				}),
				"matrix" in shown.systematics && shown.systematics.matrix ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CovarianceGrid, {
					names: shown.systematics.names ?? [],
					matrix: shown.systematics.matrix
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "v8 packages carry diagonal toys only."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: [
						"σ_lit = ",
						(shown.systematics.literatureRelativeUnc * 100).toFixed(1),
						"%. Generator χ² spread is a diagnostic, not a covariance eigenvalue."
					]
				})
			]
		}),
		tab === "import" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "Import package",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Paste a v8–v13 JSON. Packages that claim OBSERVED or discoveryEligible are refused. A stable leave-one-out does not travel with the file as a replication."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "mt-3 min-h-40 w-full rounded-md border border-border bg-secondary p-3 font-mono text-xs text-foreground",
					value: paste,
					onChange: (e) => setPaste(e.target.value),
					placeholder: "{\"schema\":\"DHC-TWIN-v13\", ...}"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => onImportText(paste),
						children: "Import JSON"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex h-11 items-center rounded-md border border-border bg-secondary px-3 text-sm",
						children: ["Load file", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: "application/json,.json",
							className: "sr-only",
							onChange: (e) => {
								const file = e.target.files?.[0];
								if (!file) return;
								file.text().then(onImportText);
							}
						})]
					})]
				})
			]
		}),
		tab === "validate" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Reproducibility",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Replayable",
								value: String(shown.validation.replayable)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Graph valid",
								value: String(shown.validation.graphValid)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Match",
								value: replay ? String(replay.match) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Ledger",
								value: shown.evidence.terminal
							})
						]
					}),
					replay ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-mono text-xs text-muted-foreground",
						children: [
							"orig ",
							replay.originalHash,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"replay ",
							replay.replayHash
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: "Replay from seed to test the content hash."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3",
						size: "sm",
						variant: "outline",
						onClick: onReplay,
						children: "Replay now"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Firewall",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 font-mono text-xs",
					children: Object.entries(shown.validation.firewall).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-2 border-b border-border py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: String(v)
						})]
					}, k))
				})
			})]
		}),
		tab === "gate" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "Discovery gate",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: "danger",
				children: "CLOSED"
			}),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "A sealed package is a portable sandbox. Leave-one-out stability is not a replication. Frozen is not observed. STABLE != EVIDENCE. LEAVE_ONE_OUT != REPLICATION. UNBLIND != OBSERVATION."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-1 font-mono text-xs text-danger",
					children: shown.validation.blockers.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: b }, b))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "destructive",
						onClick: onDeclare,
						children: "Declare SCI:DISC"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dark-matter",
							children: "TPC lab"
						})
					})]
				}),
				lastDenial ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-danger",
					children: lastDenial.rejectedReason
				}) : null
			]
		})
	] });
}
function Metric({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-secondary p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-[10px] uppercase text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 font-mono text-sm tabular-nums text-foreground",
			children: value
		})]
	});
}
function ProfileCurve({ points, muHat }) {
	const w = 560;
	const h = 220;
	const pad = 28;
	const clip = 12;
	const qMax = clip;
	const x = (mu) => pad + mu / 2.4 * 504;
	const y = (q) => 192 - Math.min(q, clip) / qMax * 164;
	const d = points.map((p, i) => `${i ? "L" : "M"} ${x(p.mu).toFixed(1)} ${y(Number.isFinite(p.q) ? p.q : 0).toFixed(1)}`).join(" ");
	const y0 = y(0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className: "h-auto w-full",
		role: "img",
		"aria-label": "Profile q of mu",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: w,
				height: h,
				className: "fill-secondary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: pad,
				x2: 532,
				y1: y(9),
				y2: y(9),
				className: "stroke-warn/50",
				strokeDasharray: "4 4"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: 532,
				y: y(9) - 4,
				textAnchor: "end",
				className: "fill-warn",
				fontSize: "10",
				children: "3σ toy"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: x(0),
				x2: x(2.4),
				y1: y0,
				y2: y0,
				className: "stroke-border"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d,
				className: "stroke-primary",
				fill: "none",
				strokeWidth: "2.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: x(muHat),
				cy: y(points.find((p) => p.mu === muHat)?.q ?? 0),
				r: "4.5",
				className: "fill-primary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: x(0),
				y: 212,
				className: "fill-muted-foreground",
				fontSize: "10",
				children: "0"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: x(1),
				y: 212,
				textAnchor: "middle",
				className: "fill-muted-foreground",
				fontSize: "10",
				children: "1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: x(muHat),
				y: Math.max(14, y(points.find((p) => p.mu === muHat)?.q ?? 0) - 8),
				textAnchor: "middle",
				className: "fill-foreground",
				fontSize: "10",
				children: ["μ̂=", muHat.toFixed(1)]
			})
		]
	});
}
function CLsCurve({ points, muHat, mu95 }) {
	const w = 560;
	const h = 220;
	const pad = 28;
	const x = (mu) => pad + mu / 2.4 * 504;
	const y = (c) => 192 - Math.min(1, Math.max(0, c)) / 1 * 164;
	const d = points.map((p, i) => `${i ? "L" : "M"} ${x(p.mu).toFixed(1)} ${y(Number.isFinite(p.clsToy) ? p.clsToy : 1).toFixed(1)}`).join(" ");
	const y05 = y(.05);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className: "h-auto w-full",
		role: "img",
		"aria-label": "Toy CLs of mu",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: w,
				height: h,
				className: "fill-secondary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: pad,
				x2: 532,
				y1: y05,
				y2: y05,
				className: "stroke-warn/50",
				strokeDasharray: "4 4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: 532,
				y: y05 - 4,
				textAnchor: "end",
				className: "fill-warn",
				fontSize: "10",
				children: "0.05 toy"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d,
				className: "stroke-primary",
				fill: "none",
				strokeWidth: "2.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: x(muHat),
				cy: y(points.find((p) => p.mu === muHat)?.clsToy ?? 1),
				r: "4.5",
				className: "fill-primary"
			}),
			mu95 != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: x(mu95),
				x2: x(mu95),
				y1: pad,
				y2: 192,
				className: "stroke-danger/40",
				strokeDasharray: "3 3"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: x(0),
				y: 212,
				className: "fill-muted-foreground",
				fontSize: "10",
				children: "0"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: x(1),
				y: 212,
				textAnchor: "middle",
				className: "fill-muted-foreground",
				fontSize: "10",
				children: "1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: x(muHat),
				y: 14,
				textAnchor: "middle",
				className: "fill-foreground",
				fontSize: "10",
				children: ["μ̂=", muHat.toFixed(1)]
			})
		]
	});
}
function CovarianceGrid({ names, matrix }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3 overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[20rem] text-left font-mono text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-[10px] uppercase text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "py-2" }), names.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: n }, n))] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: matrix.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "py-2 text-muted-foreground",
					children: names[i]
				}), row.map((v, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: i === j ? "text-foreground" : "text-muted-foreground",
					children: v.toExponential(2)
				}, j))]
			}, names[i])) })]
		})
	});
}
//#endregion
export { PackageDesk as component };
