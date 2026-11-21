import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, r as cn, t as Badge } from "./badge-uyEFEQwD.mjs";
import { l as useOmegaStore, o as hashObject } from "./store-lOmq_ntM.mjs";
import { n as Panel, r as Stat, t as PageHeader } from "./panel-GIo8_dlm.mjs";
import { C as validateEvidenceGraph, c as assembleLabGraph, d as createResearchRun, f as discoveryEligibility, g as likelihoodRatio, h as ledgerFromGraph, n as RNG, o as analyzeResearchRun, s as approximateZ, v as prepareRun } from "./master-NgVsSD82.mjs";
import { n as GENERATORS, r as runUniversalLab, t as CAMPAIGNS } from "./lab-GmSRs70J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/collider-DACVR5LE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_ACCEL = {
	beamEnergyGeV: 6800,
	luminosityFb: 35,
	bunches: 2556,
	crossingNs: 25,
	inelasticMb: 80
};
var PDG = {
	electron: {
		mass: 511e-6,
		charge: -1
	},
	muon: {
		mass: .10566,
		charge: -1
	},
	photon: {
		mass: 0,
		charge: 0
	},
	jet: {
		mass: .14,
		charge: 0
	},
	neutrino: {
		mass: 0,
		charge: 0
	},
	dark: {
		mass: 100,
		charge: 0
	},
	proton: {
		mass: .938,
		charge: 1
	}
};
var B_FIELD = 2;
var FLAVORS = [
	"u",
	"d",
	"s",
	"c",
	"g"
];
function pT(v) {
	return Math.hypot(v.px, v.py);
}
function massOf(v) {
	return Math.sqrt(Math.max(0, v.E * v.E - v.px * v.px - v.py * v.py - v.pz * v.pz));
}
function etaOf(v) {
	const p = Math.hypot(v.px, v.py, v.pz);
	if (p === 0) return 0;
	const arg = (p + v.pz) / Math.max(1e-12, p - v.pz);
	return .5 * Math.log(Math.max(1e-12, arg));
}
function phiOf(v) {
	return Math.atan2(v.py, v.px);
}
function add4(a, b) {
	return {
		E: a.E + b.E,
		px: a.px + b.px,
		py: a.py + b.py,
		pz: a.pz + b.pz
	};
}
function fourFrom(mass, pt, eta, phi) {
	const px = pt * Math.cos(phi);
	const py = pt * Math.sin(phi);
	const pz = pt * Math.sinh(eta);
	return {
		E: Math.sqrt(Math.max(0, mass * mass + px * px + py * py + pz * pz)),
		px,
		py,
		pz
	};
}
function invariantMass(a, b) {
	return massOf(add4(a, b));
}
function boost(v, parent) {
	const m = Math.max(1e-9, massOf(parent));
	const g = parent.E / m;
	const bx = parent.px / parent.E;
	const by = parent.py / parent.E;
	const bz = parent.pz / parent.E;
	if (bx * bx + by * by + bz * bz < 1e-12) return v;
	const bp = bx * v.px + by * v.py + bz * v.pz;
	const g2 = g * g / (g + 1);
	return {
		E: g * (v.E + bp),
		px: v.px + g2 * bp * bx + g * bx * v.E,
		py: v.py + g2 * bp * by + g * by * v.E,
		pz: v.pz + g2 * bp * bz + g * bz * v.E
	};
}
function twoBody(parent, m1, m2, rng) {
	const M = Math.max(massOf(parent), m1 + m2 + 1e-6);
	const pStar = Math.sqrt(Math.max(0, (M * M - (m1 + m2) ** 2) * (M * M - (m1 - m2) ** 2))) / (2 * M);
	const cos = 2 * rng.next() - 1;
	const sin = Math.sqrt(Math.max(0, 1 - cos * cos));
	const phi = 2 * Math.PI * rng.next();
	const aRest = {
		E: Math.sqrt(m1 * m1 + pStar * pStar),
		px: pStar * sin * Math.cos(phi),
		py: pStar * sin * Math.sin(phi),
		pz: pStar * cos
	};
	const bRest = {
		E: Math.sqrt(m2 * m2 + pStar * pStar),
		px: -aRest.px,
		py: -aRest.py,
		pz: -aRest.pz
	};
	return [boost(aRest, parent), boost(bRest, parent)];
}
function bw(rng, M, width) {
	return M + width / 2 * Math.tan(Math.PI * (rng.next() - .5));
}
function particle(name, fv, charge = PDG[name].charge) {
	return {
		id: `${name}-${Math.abs(fv.px * 1e6).toFixed(0)}`,
		name,
		mass: PDG[name].mass,
		charge,
		pT: pT(fv),
		eta: etaOf(fv),
		phi: phiOf(fv),
		visible: name !== "neutrino" && name !== "dark",
		...fv
	};
}
function sampleParent(rng, mass, meanPt) {
	return fourFrom(mass, Math.max(1, Math.abs(rng.gaussian()) * meanPt * .55 + meanPt * .45), (rng.next() * 2 - 1) * 2.2, rng.next() * 2 * Math.PI);
}
function selectProcess(mode, rng) {
	if (mode === "dm") return "dark_matter_candidate";
	if (mode === "top") return "ttbar";
	if (mode === "z") return "Drell_Yan";
	if (mode === "higgs") return "higgs_like";
	if (mode === "entangled") return "quantum_correlated";
	const u = rng.next();
	if (u < .62) return "QCD_jets";
	if (u < .78) return "Drell_Yan";
	if (u < .88) return "ttbar";
	if (u < .95) return "diboson";
	return "higgs_like";
}
function generateFinalState(process, rng) {
	if (process === "Drell_Yan") {
		const z = sampleParent(rng, Math.max(60, Math.min(120, bw(rng, 91.1876, 2.495))), 28);
		const lepton = rng.next() < .5 ? "electron" : "muon";
		const [a, b] = twoBody(z, PDG[lepton].mass, PDG[lepton].mass, rng);
		return [particle(lepton, a, -1), particle(lepton, b, 1)];
	}
	if (process === "higgs_like") {
		const [a, b] = twoBody(sampleParent(rng, Math.max(120, Math.min(130, bw(rng, 125.25, .04))), 22), 0, 0, rng);
		return [particle("photon", a), particle("photon", b)];
	}
	if (process === "ttbar") {
		const out = [];
		for (let i = 0; i < 2; i++) {
			const [w, bjet] = twoBody(sampleParent(rng, 172.76, 80), 80.379, 5, rng);
			out.push(particle("jet", bjet));
			if (rng.next() < .45) {
				const lep = rng.next() < .5 ? "muon" : "electron";
				const [l, n] = twoBody(w, PDG[lep].mass, 0, rng);
				out.push(particle(lep, l, rng.next() < .5 ? -1 : 1), particle("neutrino", n));
			} else {
				const [j1, j2] = twoBody(w, .14, .14, rng);
				out.push(particle("jet", j1), particle("jet", j2));
			}
		}
		return out;
	}
	if (process === "dark_matter_candidate") {
		const [vis, inv] = twoBody(sampleParent(rng, 280, 60), 40, 200, rng);
		const [j1, j2] = twoBody(vis, .14, .14, rng);
		const [d1, d2] = twoBody(inv, PDG.dark.mass, PDG.dark.mass, rng);
		return [
			particle("jet", j1),
			particle("jet", j2),
			particle("dark", d1),
			particle("dark", d2)
		];
	}
	if (process === "quantum_correlated") {
		const [a, b] = twoBody(sampleParent(rng, Math.max(80, Math.min(100, bw(rng, 91.1876, 2.495))), 18), PDG.electron.mass, PDG.electron.mass, rng);
		return [particle("electron", a, -1), particle("electron", b, 1)];
	}
	if (process === "diboson") {
		const w = sampleParent(rng, 80.379, 40);
		const z = sampleParent(rng, 91.1876, 36);
		const [l, n] = twoBody(w, PDG.muon.mass, 0, rng);
		const [e1, e2] = twoBody(z, PDG.electron.mass, PDG.electron.mass, rng);
		return [
			particle("muon", l),
			particle("neutrino", n),
			particle("electron", e1, -1),
			particle("electron", e2, 1)
		];
	}
	const n = 2 + Math.floor(rng.next() * 4);
	const jets = [];
	for (let i = 0; i < n; i++) {
		const pt = 18 + Math.abs(rng.gaussian()) * 42;
		const eta = (rng.next() * 2 - 1) * 2.4;
		const phi = rng.next() * 2 * Math.PI;
		jets.push(particle("jet", fourFrom(.14, pt, eta, phi), rng.next() < .4 ? rng.next() < .5 ? -1 : 1 : 0));
	}
	return jets;
}
function smearPt(pT0, name, rng) {
	const rel = name === "muon" || name === "electron" ? .012 * (pT0 / 100) + .006 : name === "photon" ? .1 / Math.sqrt(Math.max(pT0, 1)) + .007 : .5 / Math.sqrt(Math.max(pT0, 1)) + .04;
	return Math.max(.2, pT0 * (1 + rng.gaussian() * rel));
}
function detectorResponse(particles, rng) {
	return particles.filter((p) => p.visible).map((p) => {
		const measuredPT = smearPt(p.pT, p.name, rng);
		const scale = measuredPT / Math.max(p.pT, 1e-6);
		const px = p.px * scale;
		const py = p.py * scale;
		const pz = p.pz * scale;
		const E = Math.sqrt(p.mass * p.mass + px * px + py * py + pz * pz);
		return {
			...p,
			px,
			py,
			pz,
			E,
			pT: measuredPT,
			measuredPT,
			trackerHit: p.charge !== 0 && Math.abs(p.eta) < 2.5,
			ecalHit: p.name === "electron" || p.name === "photon",
			hcalHit: p.name === "jet",
			muonHit: p.name === "muon",
			triggered: measuredPT > (p.name === "jet" ? 40 : 20)
		};
	});
}
function reconstruct(generated, detected) {
	const leptons = detected.filter((p) => p.name === "electron" || p.name === "muon");
	const photons = detected.filter((p) => p.name === "photon");
	const jets = detected.filter((p) => p.name === "jet");
	const masses = [];
	const pairs = leptons.length >= 2 ? leptons : photons;
	for (let i = 0; i < pairs.length; i++) for (let j = i + 1; j < pairs.length; j++) masses.push(invariantMass(pairs[i], pairs[j]));
	let sx = 0;
	let sy = 0;
	for (const p of detected) {
		sx += p.px;
		sy += p.py;
	}
	const MET = Math.hypot(sx, sy);
	let tx = 0;
	let ty = 0;
	let te = 0;
	let tpx = 0;
	let tpy = 0;
	let tpz = 0;
	for (const p of generated) {
		te += p.E;
		tpx += p.px;
		tpy += p.py;
		tpz += p.pz;
		if (!p.visible) {
			tx += p.px;
			ty += p.py;
		}
	}
	const conservationResidual = Math.hypot(tpx, tpy, tpz) / Math.max(1, te);
	return {
		leptonCount: leptons.length,
		jetCount: jets.length,
		photonCount: photons.length,
		invariantMasses: masses,
		maxMass: masses.length ? Math.max(...masses) : 0,
		MET,
		metPhi: Math.atan2(-sy, -sx),
		truthInvisiblePT: Math.hypot(tx, ty),
		conservationResidual,
		vertexZ: 0
	};
}
function dmScore(process, reco) {
	let s = 0;
	if (reco.MET > 120) s += .28;
	if (reco.MET > 220) s += .22;
	if (reco.jetCount >= 2) s += .14;
	if (process === "dark_matter_candidate") s += .22;
	if (reco.leptonCount === 0) s += .08;
	return Math.min(1, s);
}
function quantumDiagnostics(process, generated, rng) {
	if (process !== "quantum_correlated") return {
		correlation: (rng.next() - .5) * .24,
		purity: .78 + rng.next() * .18,
		entropy: .2 + rng.next() * .5,
		chsh: 1.1 + rng.next() * .4,
		classification: "CONTROL"
	};
	const a = generated[0];
	const b = generated[1];
	const dphi = a && b ? Math.abs((a.phi - b.phi + Math.PI) % (2 * Math.PI) - Math.PI) : Math.PI;
	const correlation = -Math.cos(dphi) * (.82 + rng.next() * .14);
	const purity = .72 + rng.next() * .22;
	const rho = Math.min(.999, Math.abs(correlation));
	const entropy = -rho * Math.log2(Math.max(1e-6, rho)) - (1 - rho) * Math.log2(Math.max(1e-6, 1 - rho));
	const chsh = 2 * Math.SQRT2 * purity * Math.abs(correlation);
	return {
		correlation,
		purity,
		entropy,
		chsh,
		classification: Math.abs(correlation) > .75 && chsh > 2 ? "STRONG_CORRELATION" : "CORRELATED"
	};
}
function classify(process) {
	if (process === "dark_matter_candidate") return "HYPOTHETICAL";
	if (process === "quantum_correlated") return "DERIVED";
	return "SIMULATED";
}
function generateCollision(rng, accel, mode) {
	const process = selectProcess(mode, rng);
	const generated = generateFinalState(process, rng);
	const detected = detectorResponse(generated, rng);
	const reconstruction = reconstruct(generated, detected);
	const partons = [{
		flavor: FLAVORS[Math.floor(rng.next() * FLAVORS.length)],
		x: Math.pow(rng.next(), 2.1)
	}, {
		flavor: FLAVORS[Math.floor(rng.next() * FLAVORS.length)],
		x: Math.pow(rng.next(), 2.1)
	}];
	return {
		id: `evt-${(rng.next() * 1e9).toFixed(0)}`,
		process,
		beamEnergyGeV: accel.beamEnergyGeV,
		luminosityFb: accel.luminosityFb,
		partons,
		generated,
		detected,
		reconstruction,
		dmScore: dmScore(process, reconstruction),
		quantum: quantumDiagnostics(process, generated, rng),
		evidence: classify(process),
		seed: rng.next()
	};
}
function collisionRateHz(accel) {
	return 2e34 * (accel.luminosityFb / 35) * (accel.inelasticMb * 1e-27);
}
function curvatureRadius(pTGeV) {
	return pTGeV / (.3 * B_FIELD);
}
var PROCESS_LABEL = {
	QCD_jets: "QCD jets",
	Drell_Yan: "Drell–Yan / Z",
	diboson: "Diboson",
	ttbar: "t tbar",
	higgs_like: "Higgs-like γγ",
	dark_matter_candidate: "Invisible (χχ)",
	quantum_correlated: "Spin-correlated ll"
};
var MODE_LABEL = {
	standard: "Standard Model mix",
	dm: "Dark-matter injection",
	top: "Top quark",
	z: "Z boson",
	higgs: "Higgs-like",
	entangled: "Quantum correlation"
};
var COLLIDER_HYPOTHESES = [
	"H0_QCD",
	"H1_Z",
	"H2_HIGGS",
	"H3_TTBAR",
	"H4_DM_MET",
	"H5_ENTANGLED"
];
var MASS_EDGES = [
	40,
	50,
	60,
	70,
	80,
	90,
	100,
	110,
	120,
	130,
	140,
	150,
	160
];
var MET_EDGES = [
	0,
	40,
	80,
	120,
	160,
	220,
	280,
	360,
	480
];
function emptyBins(edges) {
	const bins = [];
	for (let i = 0; i < edges.length - 1; i++) bins.push({
		lo: edges[i],
		hi: edges[i + 1],
		observed: 0
	});
	return bins;
}
function fill(bins, value) {
	for (const bin of bins) if (value >= bin.lo && value < bin.hi) {
		bin.observed += 1;
		return;
	}
	if (value >= bins[bins.length - 1].hi) bins[bins.length - 1].observed += 1;
}
function qcd(lo, hi, kind) {
	const c = (lo + hi) / 2;
	return kind === "mass" ? Math.exp(-c / 48) : Math.exp(-c / 55);
}
function signalShape(hyp, lo, hi, kind) {
	const c = (lo + hi) / 2;
	if (kind === "mass") {
		if (hyp === "H1_Z" || hyp === "H5_ENTANGLED") return 3.2 * Math.exp(-.5 * ((c - 91) / 5.5) ** 2);
		if (hyp === "H2_HIGGS") return 2.6 * Math.exp(-.5 * ((c - 125) / 2.8) ** 2);
		if (hyp === "H3_TTBAR") return .45 * Math.exp(-c / 90);
		return 0;
	}
	if (hyp === "H4_DM_MET") return 2.1 * Math.exp(-.5 * ((c - 240) / 70) ** 2);
	if (hyp === "H3_TTBAR") return .55 * Math.exp(-c / 90);
	return 0;
}
function modelsFor(hyp, mass, met, n, correlated) {
	const scale = Math.max(1, n);
	const massBins = mass.map((b) => ({
		detectorId: "mass",
		energyMinKeV: b.lo,
		energyMaxKeV: b.hi,
		observed: b.observed,
		signalExpected: signalShape(hyp, b.lo, b.hi, "mass") * scale * .12,
		backgroundExpected: qcd(b.lo, b.hi, "mass") * scale * .12,
		efficiency: 1
	}));
	const metBins = met.map((b) => ({
		detectorId: "met",
		energyMinKeV: b.lo,
		energyMaxKeV: b.hi,
		observed: b.observed,
		signalExpected: signalShape(hyp, b.lo, b.hi, "met") * scale * .12,
		backgroundExpected: qcd(b.lo, b.hi, "met") * scale * .12,
		efficiency: 1
	}));
	const constraint = {
		name: "lumi",
		value: 1,
		nominal: 1,
		sigma: .05
	};
	const quantumBins = [{
		detectorId: "spin",
		energyMinKeV: 0,
		energyMaxKeV: 1,
		observed: correlated,
		signalExpected: hyp === "H5_ENTANGLED" ? n * .72 : n * .08,
		backgroundExpected: n * .08,
		efficiency: 1
	}];
	return [
		{
			detectorId: "mass",
			hypothesisId: hyp,
			signalStrength: hyp === "H0_QCD" ? 0 : 1,
			backgroundScale: 1,
			bins: massBins,
			constraints: [constraint]
		},
		{
			detectorId: "met",
			hypothesisId: hyp,
			signalStrength: hyp === "H0_QCD" ? 0 : 1,
			backgroundScale: 1,
			bins: metBins
		},
		{
			detectorId: "spin",
			hypothesisId: hyp,
			signalStrength: hyp === "H5_ENTANGLED" ? 1 : 0,
			backgroundScale: 1,
			bins: quantumBins
		}
	];
}
function infer(mass, met, n, seed, correlated) {
	const contractHash = hashObject({
		protocol: "dhc-scinet-v2",
		seed,
		n,
		hypotheses: COLLIDER_HYPOTHESES
	});
	const byHyp = {};
	for (const hyp of COLLIDER_HYPOTHESES) byHyp[hyp] = modelsFor(hyp, mass, met, n, correlated);
	let run = createResearchRun({
		contractHash,
		protocolVersion: "DHC-6.5",
		hypothesisRegistryVersion: "collider-h0-h5",
		detectorConfigurationVersion: "tracker-ecal-hcal-muon-v1",
		backgroundConfigurationVersion: "qcd-continuum-v1",
		calibrationVersion: "toy-smear-v1",
		statisticalMethodVersion: "joint-poisson-v1",
		blindingRequired: true,
		frozen: true
	}, "SIMULATED", [
		"mass",
		"met",
		"spin"
	], [...COLLIDER_HYPOTHESES]);
	run = prepareRun(run);
	run = analyzeResearchRun(run, byHyp);
	const logL = {};
	for (const r of run.likelihoodResults) logL[r.hypothesisId] = r.logLikelihood;
	const preferred = run.likelihoodResults.slice().sort((a, b) => b.logLikelihood - a.logLikelihood)[0]?.hypothesisId ?? "H0_QCD";
	const delta = likelihoodRatio(logL[preferred] ?? 0, logL.H0_QCD ?? 0);
	const z = approximateZ(Math.max(0, delta));
	const graph = assembleLabGraph({
		graphId: `dhc-${seed}`,
		dataState: "SIMULATED",
		preferred,
		logBayes: delta / 2,
		replicated: false,
		ppcPassed: true,
		contractHash
	});
	const check = validateEvidenceGraph(graph);
	const ledger = ledgerFromGraph(graph, contractHash);
	const blockers = [
		...discoveryEligibility(run).blockers,
		"SYNTHETIC_EVENTS_ARE_CONTROLS",
		"COLLIDER_TWIN_IS_NOT_AN_EXPERIMENT",
		"MASS_PEAK_IN_SANDBOX_IS_NOT_A_RESONANCE_DISCOVERY"
	];
	if (!check.valid) blockers.push(...check.errors.slice(0, 4));
	const anomaly = Number.isFinite(z) && z >= 3 && preferred !== "H0_QCD";
	return {
		preferred,
		logL,
		deltaVsH0: delta,
		approxZ: Number.isFinite(z) ? z : 0,
		joint: run.likelihoodResults,
		researchRun: run,
		graph,
		ledger,
		graphErrors: check.errors,
		blockers,
		discoveryGate: false,
		state: anomaly ? "SCI:ANOMALY" : preferred === "H0_QCD" ? "SCI:BACKGROUND_PREFERRED" : "SCI:SIMULATED",
		contractHash
	};
}
function runColliderExperiment(seed, accel, mode, nEvents) {
	const rng = new RNG(seed);
	const n = Math.max(1, Math.min(2e3, Math.round(nEvents)));
	const events = [];
	const mass = emptyBins(MASS_EDGES);
	const met = emptyBins(MET_EDGES);
	const counts = {};
	for (let i = 0; i < n; i++) {
		const ev = generateCollision(rng, accel, mode);
		events.push(ev);
		counts[ev.process] = (counts[ev.process] ?? 0) + 1;
		if (ev.reconstruction.maxMass > 0) fill(mass, ev.reconstruction.maxMass);
		fill(met, ev.reconstruction.MET);
	}
	const signalCandidates = events.filter((e) => e.dmScore >= .5 || e.reconstruction.maxMass > 80).length;
	const background = Math.max(0, n - signalCandidates);
	const significance = background > 0 ? signalCandidates / Math.sqrt(background) : 0;
	const meanMass = events.reduce((s, e) => s + e.reconstruction.maxMass, 0) / n;
	const meanMET = events.reduce((s, e) => s + e.reconstruction.MET, 0) / n;
	const correlated = events.filter((e) => e.quantum.classification !== "CONTROL").length;
	return {
		events,
		last: events[events.length - 1] ?? null,
		mass,
		met,
		counts,
		signalCandidates,
		background,
		significance,
		meanMass,
		meanMET,
		inference: infer(mass, met, n, seed, correlated)
	};
}
var ATLAS_LAYERS = [
	{
		id: "BEAMPIPE",
		name: "Beam pipe",
		family: "BEAMPIPE",
		rMinM: .024,
		rMaxM: .036,
		zMaxM: 3.5,
		etaMax: 4.9,
		role: "Beryllium vacuum envelope. Not a tracker.",
		evidence: "LITERATURE"
	},
	{
		id: "IBL",
		name: "Insertable B-Layer",
		family: "PIXEL",
		rMinM: .033,
		rMaxM: .04,
		zMaxM: .33,
		etaMax: 2.5,
		role: "Innermost pixels, installed 2014. Vertexing.",
		evidence: "LITERATURE"
	},
	{
		id: "PIX0",
		name: "Pixel layer 0",
		family: "PIXEL",
		rMinM: .0505,
		rMaxM: .052,
		zMaxM: .4,
		etaMax: 2.5,
		role: "Original B-layer at 50.5 mm.",
		evidence: "LITERATURE"
	},
	{
		id: "PIX1",
		name: "Pixel layer 1",
		family: "PIXEL",
		rMinM: .0885,
		rMaxM: .09,
		zMaxM: .4,
		etaMax: 2.5,
		role: "Pixel barrel 88.5 mm.",
		evidence: "LITERATURE"
	},
	{
		id: "PIX2",
		name: "Pixel layer 2",
		family: "PIXEL",
		rMinM: .1225,
		rMaxM: .124,
		zMaxM: .4,
		etaMax: 2.5,
		role: "Pixel barrel 122.5 mm.",
		evidence: "LITERATURE"
	},
	{
		id: "SCT0",
		name: "SCT layer 0",
		family: "SCT",
		rMinM: .299,
		rMaxM: .305,
		zMaxM: .75,
		etaMax: 2.5,
		role: "Silicon-strip barrel 299 mm.",
		evidence: "LITERATURE"
	},
	{
		id: "SCT1",
		name: "SCT layer 1",
		family: "SCT",
		rMinM: .371,
		rMaxM: .377,
		zMaxM: .75,
		etaMax: 2.5,
		role: "Silicon-strip barrel 371 mm.",
		evidence: "LITERATURE"
	},
	{
		id: "SCT2",
		name: "SCT layer 2",
		family: "SCT",
		rMinM: .443,
		rMaxM: .449,
		zMaxM: .75,
		etaMax: 2.5,
		role: "Silicon-strip barrel 443 mm.",
		evidence: "LITERATURE"
	},
	{
		id: "SCT3",
		name: "SCT layer 3",
		family: "SCT",
		rMinM: .514,
		rMaxM: .52,
		zMaxM: .75,
		etaMax: 2.5,
		role: "Silicon-strip barrel 514 mm.",
		evidence: "LITERATURE"
	},
	{
		id: "TRT",
		name: "TRT barrel",
		family: "TRT",
		rMinM: .563,
		rMaxM: 1.066,
		zMaxM: .712,
		etaMax: 2,
		role: "Straw tubes. ~36 hits on a central track.",
		evidence: "LITERATURE"
	},
	{
		id: "SOLENOID",
		name: "Solenoid",
		family: "SOLENOID",
		rMinM: 1.23,
		rMaxM: 1.28,
		zMaxM: 2.9,
		etaMax: 2.5,
		role: "2 T axial field. Inner/outer 2.46 / 2.56 m diameter, 5.8 m long.",
		evidence: "LITERATURE"
	},
	{
		id: "EMB",
		name: "EM calorimeter barrel",
		family: "EMCAL",
		rMinM: 1.4,
		rMaxM: 2,
		zMaxM: 3.2,
		etaMax: 1.475,
		role: "LAr accordion. Electrons and photons. |η| < 1.475.",
		evidence: "LITERATURE"
	},
	{
		id: "TILE",
		name: "Tile calorimeter",
		family: "HCAL",
		rMinM: 2.28,
		rMaxM: 4.25,
		zMaxM: 2.9,
		etaMax: 1.7,
		role: "Steel / scintillator. 2.28–4.25 m. Central + extended barrels.",
		evidence: "LITERATURE"
	},
	{
		id: "MS_INNER",
		name: "Muon inner station",
		family: "MUON",
		rMinM: 4.5,
		rMaxM: 5.5,
		zMaxM: 6.5,
		etaMax: 2.7,
		role: "MDT tracking ~5 m. Independent of the Inner Detector.",
		evidence: "LITERATURE"
	},
	{
		id: "MS_MIDDLE",
		name: "Muon middle station",
		family: "MUON",
		rMinM: 7,
		rMaxM: 8,
		zMaxM: 10,
		etaMax: 2.7,
		role: "MDT + RPC ~7.5 m. Trigger in the barrel.",
		evidence: "LITERATURE"
	},
	{
		id: "MS_OUTER",
		name: "Muon outer station",
		family: "MUON",
		rMinM: 9.5,
		rMaxM: 11,
		zMaxM: 12,
		etaMax: 2.7,
		role: "MDT ~10 m. Spectrometer outer radius ~11 m.",
		evidence: "LITERATURE"
	},
	{
		id: "ZDC",
		name: "Zero Degree Calorimeter",
		family: "FORWARD",
		rMinM: 0,
		rMaxM: .1,
		zMaxM: 140,
		etaMax: 8,
		role: "At |z| ≈ 140 m. Neutral spectators in ion runs. Not drawn to scale.",
		evidence: "LITERATURE"
	}
];
var ATLAS_SCENE_SCALE = .38;
var ATLAS_SCENE = [
	{
		id: "PIXEL",
		rM: .124,
		zM: .65,
		color: 9413560,
		opacity: .28
	},
	{
		id: "SCT",
		rM: .52,
		zM: .75,
		color: 9413560,
		opacity: .22
	},
	{
		id: "TRT",
		rM: 1.066,
		zM: .71,
		color: 8034944,
		opacity: .18
	},
	{
		id: "SOLENOID",
		rM: 1.28,
		zM: 2.9,
		color: 6054768,
		opacity: .16
	},
	{
		id: "EMCAL",
		rM: 2,
		zM: 3.2,
		color: 8034944,
		opacity: .14
	},
	{
		id: "HCAL",
		rM: 4.25,
		zM: 3.1,
		color: 12887412,
		opacity: .12
	},
	{
		id: "MS_I",
		rM: 5,
		zM: 6.5,
		color: 9146780,
		opacity: .1
	},
	{
		id: "MS_M",
		rM: 7.5,
		zM: 8.5,
		color: 9146780,
		opacity: .09
	},
	{
		id: "MS_O",
		rM: 10,
		zM: 10,
		color: 9146780,
		opacity: .08
	}
];
function layersForEta(eta) {
	const a = Math.abs(eta);
	return ATLAS_LAYERS.filter((layer) => layer.family !== "FORWARD" && a <= layer.etaMax);
}
function censusTracks(etas) {
	const families = [
		"BEAMPIPE",
		"PIXEL",
		"SCT",
		"TRT",
		"SOLENOID",
		"EMCAL",
		"HCAL",
		"MUON",
		"FORWARD"
	];
	const familyTotals = Object.fromEntries(families.map((f) => [f, 0]));
	const perTrack = etas.map((eta) => {
		const hit = layersForEta(eta);
		const row = Object.fromEntries(families.map((f) => [f, 0]));
		for (const layer of hit) {
			row[layer.family] += 1;
			familyTotals[layer.family] += 1;
		}
		return {
			eta,
			families: row,
			layers: hit.map((l) => l.id),
			evidence: "SIMULATED"
		};
	});
	return {
		perTrack,
		familyTotals,
		meanLayers: perTrack.length ? perTrack.reduce((s, t) => s + t.layers.length, 0) / perTrack.length : 0
	};
}
function gauss(rng) {
	return rng.gaussian();
}
function smear(value, rel, rng) {
	return Math.max(0, value * (1 + gauss(rng) * rel));
}
/** σE/E = a/√E ⊕ b  — literature-shaped toys. */
function emRel(energy) {
	return Math.hypot(.1 / Math.sqrt(Math.max(energy, .3)), .007);
}
function hadRel(energy) {
	return Math.hypot(.5 / Math.sqrt(Math.max(energy, .5)), .03);
}
function idRel(pT) {
	return .015 * (pT / 100) + .01;
}
function splitTruth(probe) {
	const e = Math.max(probe.energy, probe.pT);
	if (probe.name === "neutrino" || probe.name === "dark") return {
		em: 0,
		had: 0,
		mip: 0
	};
	if (probe.name === "electron" || probe.name === "photon") return {
		em: .96 * e,
		had: .04 * e,
		mip: 0
	};
	if (probe.name === "muon") return {
		em: .2,
		had: 2.8,
		mip: e
	};
	return {
		em: .28 * e,
		had: .72 * e,
		mip: 0
	};
}
function guessId(args) {
	if (args.probe.name === "neutrino" || args.probe.name === "dark") return "INVISIBLE";
	const cal = args.em + args.had;
	const emFrac = cal > .2 ? args.em / cal : 0;
	const mipLike = cal < 6 && args.had < 4;
	if (args.probe.name === "muon" && args.muonStations >= 2 && args.trackerLayers >= 3) return "MUON";
	if (mipLike && args.probe.name === "muon") return "MUON";
	if (emFrac > .88 && args.trackerLayers >= 3 && (args.probe.name === "electron" || args.probe.charge !== 0)) return "ELECTRON";
	if (emFrac > .88 && args.trackerLayers === 0) return "PHOTON";
	if (args.trackerLayers >= 2 && args.had < 1.5 && args.muonStations === 0 && args.probe.charge !== 0) return "TRACK";
	return "JET";
}
function respondProbe(probe, rng, index) {
	const hit = layersForEta(probe.eta);
	const families = [...new Set(hit.map((l) => l.family))];
	const has = (f) => families.includes(f);
	const trackerLayers = hit.filter((l) => l.family === "PIXEL" || l.family === "SCT" || l.family === "TRT").length;
	const muonStations = hit.filter((l) => l.family === "MUON").length;
	const truth = splitTruth(probe);
	const emGeV = has("EMCAL") ? smear(truth.em, emRel(truth.em), rng) : 0;
	const hadGeV = has("HCAL") ? smear(truth.had, hadRel(truth.had), rng) : 0;
	const idGuess = guessId({
		probe,
		em: emGeV,
		had: hadGeV,
		muonStations,
		trackerLayers
	});
	let measuredPT = 0;
	if (idGuess === "INVISIBLE") measuredPT = 0;
	else if (idGuess === "MUON" && has("PIXEL")) {
		const id = smear(probe.pT, idRel(probe.pT), rng);
		const ms = smear(probe.pT, .03 + .01 * (probe.pT / 100), rng);
		measuredPT = .6 * id + .4 * ms;
	} else if ((idGuess === "ELECTRON" || idGuess === "PHOTON") && emGeV > 0) measuredPT = emGeV / Math.cosh(probe.eta);
	else if (idGuess === "JET") measuredPT = (emGeV + hadGeV) / Math.max(.001, Math.cosh(probe.eta));
	else if (trackerLayers >= 2) measuredPT = smear(probe.pT, idRel(probe.pT), rng);
	else measuredPT = (emGeV + hadGeV) / Math.max(.001, Math.cosh(probe.eta));
	return {
		id: `atlas-${index}`,
		idGuess,
		eta: probe.eta,
		phi: probe.phi,
		truthPT: probe.pT,
		measuredPT: Math.max(0, measuredPT),
		emGeV,
		hadGeV,
		muonStations,
		trackerLayers,
		families,
		triggered: measuredPT > (idGuess === "JET" ? 40 : 8),
		evidence: "SIMULATED"
	};
}
function tracksToProbes(tracks) {
	return tracks.map((t) => ({
		eta: t.eta,
		phi: t.phi,
		pT: t.pT,
		energy: t.energy,
		charge: t.charge,
		name: "pion"
	}));
}
function respondProbes(probes, seed) {
	const rng = new RNG(seed ^ 1096043603);
	const objects = probes.slice(0, 80).map((p, i) => respondProbe(p, rng, i));
	const visible = objects.filter((o) => o.idGuess !== "INVISIBLE");
	let sx = 0;
	let sy = 0;
	let sumET = 0;
	let em = 0;
	let had = 0;
	for (const o of visible) {
		sumET += o.measuredPT;
		em += o.emGeV;
		had += o.hadGeV;
		sx += o.measuredPT * Math.cos(o.phi);
		sy += o.measuredPT * Math.sin(o.phi);
	}
	const cal = em + had;
	return {
		objects,
		nMuon: objects.filter((o) => o.idGuess === "MUON").length,
		nElectron: objects.filter((o) => o.idGuess === "ELECTRON").length,
		nPhoton: objects.filter((o) => o.idGuess === "PHOTON").length,
		nJet: objects.filter((o) => o.idGuess === "JET").length,
		nTrack: objects.filter((o) => o.idGuess === "TRACK").length,
		sumET,
		met: Math.hypot(sx, sy),
		meanEmFrac: cal > 0 ? em / cal : 0,
		note: "Toy stochastic⊕constant smear on literature envelopes. Not a calibrated ATLAS config. RESPONSE != OBSERVATION.",
		discoveryEligible: false
	};
}
function useCanvas$1(draw, deps, cssH) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const parent = canvas.parentElement;
		if (!parent) return;
		const paint = () => {
			const w = Math.max(160, parent.clientWidth);
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			canvas.width = Math.floor(w * dpr);
			canvas.height = Math.floor(cssH * dpr);
			canvas.style.width = `${w}px`;
			canvas.style.height = `${cssH}px`;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			draw(ctx, w, cssH);
		};
		paint();
		const ro = new ResizeObserver(paint);
		ro.observe(parent);
		return () => ro.disconnect();
	}, deps);
	return ref;
}
var SPECIES_COLOR = {
	electron: "#8fa3b8",
	muon: "#c4a574",
	photon: "#d4d8df",
	jet: "#7a9a80",
	neutrino: "#8b919c",
	dark: "#c47a6a"
};
function speciesColor(name) {
	return SPECIES_COLOR[name] ?? "#8b919c";
}
function layers() {
	return [
		{
			r: .22,
			label: "TRK",
			kind: "tracker"
		},
		{
			r: .38,
			label: "ECAL",
			kind: "ecal"
		},
		{
			r: .55,
			label: "HCAL",
			kind: "hcal"
		},
		{
			r: .78,
			label: "MUON",
			kind: "muon"
		}
	];
}
function drawTrack(ctx, p, cx, cy, scale, reveal) {
	const R = Math.max(18, curvatureRadius(p.measuredPT) * 42);
	const steps = 28;
	ctx.beginPath();
	for (let i = 0; i <= steps; i++) {
		const t = i / steps * reveal;
		const rad = (.08 + t * .7) * scale;
		const bend = p.charge !== 0 ? (p.charge > 0 ? 1 : -1) * (t * t) * (scale / R) * 18 : 0;
		const phi = p.phi + bend;
		const x = cx + Math.cos(phi) * rad;
		const y = cy + Math.sin(phi) * rad;
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	}
	ctx.stroke();
}
function EventDisplayCanvas({ event }) {
	const [reveal, setReveal] = (0, import_react.useState)(1);
	(0, import_react.useEffect)(() => {
		if (!event) return;
		setReveal(0);
		const t0 = performance.now();
		let raf = 0;
		const loop = (t) => {
			const p = Math.min(1, (t - t0) / 780);
			setReveal(p);
			if (p < 1) raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [event?.id]);
	const ref = useCanvas$1((ctx, w, h) => {
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = "#111318";
		ctx.fillRect(0, 0, w, h);
		const cx = w * .5;
		const cy = h * .5;
		const scale = Math.min(w, h) * .46;
		for (const layer of layers()) {
			ctx.beginPath();
			ctx.strokeStyle = "rgba(232,234,238,0.16)";
			ctx.lineWidth = 1;
			ctx.arc(cx, cy, layer.r * scale, 0, Math.PI * 2);
			ctx.stroke();
		}
		ctx.fillStyle = "#8b919c";
		ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
		ctx.fillText("r–φ  ·  charged curves in B = 2 T", 10, 16);
		if (!event) {
			ctx.fillText("No collision yet.", 10, h - 12);
			return;
		}
		ctx.fillText(event.process.replaceAll("_", " "), 10, h - 12);
		const metR = Math.min(.72, .18 + event.reconstruction.MET / 900) * scale * reveal;
		ctx.strokeStyle = "rgba(196,122,106,0.85)";
		ctx.setLineDash([5, 4]);
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.lineTo(cx + Math.cos(event.reconstruction.metPhi) * metR, cy + Math.sin(event.reconstruction.metPhi) * metR);
		ctx.stroke();
		ctx.setLineDash([]);
		for (const p of event.detected) {
			ctx.strokeStyle = speciesColor(p.name);
			ctx.globalAlpha = .95;
			ctx.lineWidth = p.name === "jet" ? 2.6 : 1.8;
			if (p.name === "photon" || p.charge === 0) ctx.setLineDash([3, 3]);
			else ctx.setLineDash([]);
			drawTrack(ctx, p, cx, cy, scale, reveal);
			ctx.setLineDash([]);
			const rad = (.08 + reveal * .7) * scale;
			const R = Math.max(18, curvatureRadius(p.measuredPT) * 42);
			const bend = p.charge !== 0 ? (p.charge > 0 ? 1 : -1) * (reveal * reveal) * (scale / R) * 18 : 0;
			const phi = p.phi + bend;
			ctx.beginPath();
			ctx.fillStyle = speciesColor(p.name);
			ctx.arc(cx + Math.cos(phi) * rad, cy + Math.sin(phi) * rad, p.name === "jet" ? 3.2 : 2.2, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
	}, [event, reveal], 320);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		height: 320,
		className: "block w-full rounded-md",
		"aria-label": "Collision event display"
	});
}
function DetectorTwinCanvas({ event }) {
	const ref = useCanvas$1((ctx, w, h) => {
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = "#111318";
		ctx.fillRect(0, 0, w, h);
		const cx = w * .5;
		const cy = h * .52;
		const scale = Math.min(w, h) * .44;
		const ring = layers();
		ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
		ctx.fillStyle = "#8b919c";
		ctx.fillText("Detector twin  ·  tracker / ECAL / HCAL / muon", 10, 16);
		ring.forEach((layer, i) => {
			ctx.beginPath();
			ctx.strokeStyle = i === 0 ? "rgba(143,163,184,0.55)" : "rgba(232,234,238,0.22)";
			ctx.lineWidth = i === 3 ? 6 : 3;
			ctx.arc(cx, cy, layer.r * scale, 0, Math.PI * 2);
			ctx.stroke();
			ctx.fillStyle = "#8b919c";
			ctx.fillText(layer.label, cx + layer.r * scale * .72, cy - 8 - i * 2);
		});
		ctx.beginPath();
		ctx.fillStyle = "#d4d8df";
		ctx.arc(cx, cy, 3, 0, Math.PI * 2);
		ctx.fill();
		if (!event) return;
		for (const p of event.detected) {
			const hitR = p.muonHit ? .78 : p.hcalHit ? .55 : p.ecalHit ? .38 : p.trackerHit ? .22 : .12;
			const x = cx + Math.cos(p.phi) * hitR * scale;
			const y = cy + Math.sin(p.phi) * hitR * scale;
			ctx.beginPath();
			ctx.fillStyle = speciesColor(p.name);
			ctx.arc(x, y, p.ecalHit || p.hcalHit ? 4 : 2.4, 0, Math.PI * 2);
			ctx.fill();
		}
	}, [event], 320);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		height: 320,
		className: "block w-full rounded-md",
		"aria-label": "Detector twin"
	});
}
function SpectrumCanvas({ bins, unit, markers }) {
	const max = Math.max(1, ...bins.map((b) => b.observed));
	const ref = useCanvas$1((ctx, w, h) => {
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = "#111318";
		ctx.fillRect(0, 0, w, h);
		const left = 36;
		const bottom = h - 22;
		const top = 18;
		const width = w - left - 12;
		const height = bottom - top;
		ctx.strokeStyle = "rgba(232,234,238,0.18)";
		ctx.beginPath();
		ctx.moveTo(left, top);
		ctx.lineTo(left, bottom);
		ctx.lineTo(left + width, bottom);
		ctx.stroke();
		const span = bins[bins.length - 1].hi - bins[0].lo;
		bins.forEach((b) => {
			const x = left + (b.lo - bins[0].lo) / span * width;
			const bw = Math.max(2, (b.hi - b.lo) / span * width - 2);
			const bh = b.observed / max * height;
			ctx.fillStyle = "#8fa3b8";
			ctx.fillRect(x, bottom - bh, bw, bh);
		});
		ctx.fillStyle = "#8b919c";
		ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
		ctx.fillText(unit, left, 14);
		ctx.fillText(String(bins[0].lo), left, h - 6);
		ctx.fillText(String(bins[bins.length - 1].hi), left + width - 24, h - 6);
		for (const m of markers ?? []) {
			const x = left + (m.x - bins[0].lo) / span * width;
			ctx.strokeStyle = "rgba(196,165,116,0.9)";
			ctx.setLineDash([3, 3]);
			ctx.beginPath();
			ctx.moveTo(x, top);
			ctx.lineTo(x, bottom);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.fillStyle = "#c4a574";
			ctx.fillText(m.label, x + 4, 30);
		}
	}, [
		bins,
		unit,
		markers
	], 260);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		height: 260,
		className: "block w-full rounded-md",
		"aria-label": unit
	});
}
function QuantumCanvas({ event }) {
	const ref = useCanvas$1((ctx, w, h) => {
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = "#111318";
		ctx.fillRect(0, 0, w, h);
		const q = event?.quantum;
		ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
		ctx.fillStyle = "#8b919c";
		ctx.fillText("Correlation lab  ·  sandbox spin diagnostic", 10, 16);
		if (!q) return;
		const cx = w * .28;
		const cy = h * .55;
		const R = Math.min(w, h) * .28;
		ctx.strokeStyle = "rgba(232,234,238,0.25)";
		ctx.beginPath();
		ctx.arc(cx, cy, R, 0, Math.PI * 2);
		ctx.stroke();
		const ang = q.correlation * Math.PI * .5;
		ctx.strokeStyle = q.classification === "CONTROL" ? "#8b919c" : "#8fa3b8";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.lineTo(cx + Math.cos(ang) * R * q.purity, cy + Math.sin(ang) * R * q.purity);
		ctx.stroke();
		ctx.fillStyle = "#e8eaee";
		ctx.font = "12px IBM Plex Mono, ui-monospace, monospace";
		[
			`C = ${q.correlation.toFixed(3)}`,
			`purity ${q.purity.toFixed(3)}`,
			`S_CHSH ${q.chsh.toFixed(3)}`,
			q.classification
		].forEach((line, i) => ctx.fillText(line, w * .55, 48 + i * 22));
		ctx.fillStyle = "#8b919c";
		ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
		ctx.fillText("CHSH > 2 is a sandbox diagnostic, not a Bell test.", 10, h - 10);
	}, [event], 220);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		height: 220,
		className: "block w-full rounded-md",
		"aria-label": "Quantum correlation"
	});
}
function ColliderEvidenceSvg({ graph }) {
	const ids = graph.nodes.map((n) => n.id);
	const pos = {};
	ids.forEach((id, i) => {
		pos[id] = {
			x: 40 + i % 4 * 110,
			y: 28 + Math.floor(i / 4) * 72
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 460 220",
		className: "h-[220px] w-full min-w-0",
		role: "img",
		"aria-label": "Collider evidence graph",
		children: [graph.edges.map((e) => {
			const a = pos[e.from];
			const b = pos[e.to];
			if (!a || !b) return null;
			const reject = e.type === "REJECTED_BY" || e.type === "CONTRADICTED_BY";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: a.x + 40,
				y1: a.y + 10,
				x2: b.x + 40,
				y2: b.y + 10,
				stroke: reject ? "var(--color-danger)" : "rgb(232 234 238 / 0.2)",
				strokeDasharray: reject || e.type === "SUPPORTED_BY" ? "4 3" : void 0
			}, e.id);
		}), graph.nodes.map((n) => {
			const p = pos[n.id];
			if (!p) return null;
			const fill = n.epistemicState === "SCI:REJECTED" ? "var(--color-danger)" : n.type === "CLAIM" ? "var(--color-warn)" : "var(--color-info)";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: `translate(${p.x},${p.y})`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						width: "88",
						height: "36",
						rx: "6",
						fill: "#22262f",
						stroke: fill,
						strokeWidth: "1.4"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: "8",
						y: "15",
						fill: "#e8eaee",
						fontSize: "9",
						fontFamily: "IBM Plex Mono, monospace",
						children: n.type
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: "8",
						y: "28",
						fill: "#c4c9d2",
						fontSize: "8",
						fontFamily: "IBM Plex Mono, monospace",
						children: n.epistemicState.replace("SCI:", "")
					})
				]
			}, n.id);
		})]
	});
}
var SPECIES_HEX = {
	electron: 9413560,
	muon: 12887412,
	photon: 13949151,
	jet: 8034944,
	neutrino: 6054768,
	dark: 12876394,
	pion: 8034944,
	kaon: 10135674,
	proton: 12887412,
	nucleon: 12099728
};
function dirFromEtaPhi(eta, phi) {
	const theta = 2 * Math.atan(Math.exp(-eta));
	return {
		x: Math.sin(theta) * Math.cos(phi),
		y: Math.sin(theta) * Math.sin(phi),
		z: Math.cos(theta)
	};
}
function Event3D({ kind, nuclear, collision, shower, scrub, spinning }) {
	const hostRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const kindRef = (0, import_react.useRef)(kind);
	const nuclearRef = (0, import_react.useRef)(nuclear);
	const collisionRef = (0, import_react.useRef)(collision);
	const showerRef = (0, import_react.useRef)(shower);
	const scrubRef = (0, import_react.useRef)(scrub);
	const spinRef = (0, import_react.useRef)(spinning);
	const hudRef = (0, import_react.useRef)(null);
	kindRef.current = kind;
	nuclearRef.current = nuclear;
	collisionRef.current = collision;
	showerRef.current = shower;
	scrubRef.current = scrub;
	spinRef.current = spinning;
	(0, import_react.useEffect)(() => {
		const host = hostRef.current;
		const canvas = canvasRef.current;
		if (!host || !canvas) return;
		let disposed = false;
		let cleanup = null;
		(async () => {
			const THREE = await import("../_libs/three.mjs").then((n) => n.n);
			const { OrbitControls } = await import("../_libs/three.mjs").then((n) => n.t);
			if (disposed || !hostRef.current || !canvasRef.current) return;
			const renderer = new THREE.WebGLRenderer({
				canvas,
				antialias: true,
				alpha: false,
				powerPreference: "high-performance"
			});
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
			renderer.setClearColor(592396, 1);
			renderer.outputColorSpace = THREE.SRGBColorSpace;
			const scene = new THREE.Scene();
			scene.fog = new THREE.FogExp2(592396, .045);
			const camera = new THREE.PerspectiveCamera(50, 1, .05, 80);
			camera.position.set(6.4, 2.8, 7.2);
			const controls = new OrbitControls(camera, canvas);
			controls.enableDamping = true;
			controls.dampingFactor = .08;
			controls.target.set(0, 0, 0);
			controls.maxDistance = 28;
			controls.minDistance = 1.4;
			scene.add(new THREE.HemisphereLight(13160668, 1447966, .7));
			const key = new THREE.DirectionalLight(15264494, .5);
			key.position.set(4, 7, 3);
			scene.add(key);
			const barrel = new THREE.Group();
			scene.add(barrel);
			const layers = ATLAS_SCENE.map((layer) => ({
				r: layer.rM * ATLAS_SCENE_SCALE,
				l: Math.min(9.2, layer.zM * 2 * ATLAS_SCENE_SCALE),
				c: layer.color,
				o: layer.opacity
			}));
			const layerMeshes = [];
			for (const layer of layers) {
				const mesh = new THREE.Mesh(new THREE.CylinderGeometry(layer.r, layer.r, layer.l, 48, 1, true), new THREE.MeshBasicMaterial({
					color: layer.c,
					wireframe: true,
					transparent: true,
					opacity: layer.o
				}));
				mesh.rotation.x = Math.PI / 2;
				barrel.add(mesh);
				layerMeshes.push(mesh);
			}
			const beam = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 8.4, 8), new THREE.MeshBasicMaterial({
				color: 9413560,
				transparent: true,
				opacity: .55
			}));
			beam.rotation.x = Math.PI / 2;
			barrel.add(beam);
			const trackMax = 160;
			const trackPos = /* @__PURE__ */ new Float32Array(960);
			const trackCol = /* @__PURE__ */ new Float32Array(960);
			const trackGeo = new THREE.BufferGeometry();
			trackGeo.setAttribute("position", new THREE.BufferAttribute(trackPos, 3));
			trackGeo.setAttribute("color", new THREE.BufferAttribute(trackCol, 3));
			const tracks = new THREE.LineSegments(trackGeo, new THREE.LineBasicMaterial({
				vertexColors: true,
				transparent: true,
				opacity: .92
			}));
			scene.add(tracks);
			const showerMax = 800;
			const dummy = new THREE.Object3D();
			const sphereGeo = new THREE.SphereGeometry(.07, 8, 8);
			const sphereMat = new THREE.MeshBasicMaterial({
				color: 16777215,
				transparent: true,
				opacity: .95
			});
			const showerMesh = new THREE.InstancedMesh(sphereGeo, sphereMat, showerMax);
			showerMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
			const showerColors = new Float32Array(showerMax * 3);
			showerMesh.instanceColor = new THREE.InstancedBufferAttribute(showerColors, 3);
			scene.add(showerMesh);
			const ground = new THREE.GridHelper(10, 16, 2764856, 1447966);
			ground.position.y = -2.2;
			scene.add(ground);
			const axes = new THREE.AxesHelper(.7);
			axes.position.set(-2.8, -2.05, -2.8);
			scene.add(axes);
			const clock = new THREE.Clock();
			const resize = () => {
				const w = Math.max(160, host.clientWidth);
				const h = Math.max(240, host.clientHeight);
				renderer.setSize(w, h, false);
				camera.aspect = w / h;
				camera.updateProjectionMatrix();
			};
			const ro = new ResizeObserver(resize);
			ro.observe(host);
			resize();
			const colorOf = (name) => {
				const hex = SPECIES_HEX[name] ?? 9146780;
				return new THREE.Color(hex);
			};
			const loop = () => {
				if (disposed) return;
				clock.getDelta();
				if (!document.hidden) {
					const reveal = Math.max(.08, Math.min(1, scrubRef.current));
					const isShower = kindRef.current === "shower";
					barrel.visible = !isShower;
					beam.visible = !isShower;
					tracks.visible = !isShower;
					showerMesh.visible = isShower;
					ground.position.y = isShower ? -2.35 : -2.2;
					controls.autoRotate = spinRef.current;
					controls.autoRotateSpeed = isShower ? .9 : 1.4;
					controls.target.set(0, isShower ? .15 : 0, 0);
					controls.update();
					let ti = 0;
					const pushTrack = (eta, phi, charge, name, pT) => {
						if (ti + 1 >= trackMax) return;
						const d = dirFromEtaPhi(eta, phi);
						const r = .2 + reveal * (1.9 + Math.min(.7, pT / 8));
						const bend = charge !== 0 ? charge * .22 * reveal : 0;
						const c = colorOf(name);
						const a = ti * 2;
						trackPos[a * 3] = 0;
						trackPos[a * 3 + 1] = 0;
						trackPos[a * 3 + 2] = 0;
						trackPos[(a + 1) * 3] = (d.x + bend) * r;
						trackPos[(a + 1) * 3 + 1] = d.y * r;
						trackPos[(a + 1) * 3 + 2] = d.z * r * 1.35;
						for (let k = 0; k < 2; k++) {
							trackCol[(a + k) * 3] = c.r;
							trackCol[(a + k) * 3 + 1] = c.g;
							trackCol[(a + k) * 3 + 2] = c.b;
						}
						ti += 1;
					};
					if (!isShower) {
						const nuc = nuclearRef.current;
						const col = collisionRef.current;
						if (nuc) {
							const nShow = Math.ceil(nuc.tracks.length * reveal);
							for (let i = 0; i < nShow; i++) {
								const t = nuc.tracks[i];
								pushTrack(t.eta, t.phi, t.charge, t.charge ? "pion" : "photon", t.pT);
							}
						} else if (col) {
							const nShow = Math.ceil(col.detected.length * reveal);
							for (let i = 0; i < nShow; i++) {
								const p = col.detected[i];
								pushTrack(p.eta, p.phi, p.charge, p.name, p.measuredPT);
							}
						}
					}
					trackGeo.setDrawRange(0, ti * 2);
					trackGeo.getAttribute("position").needsUpdate = true;
					trackGeo.getAttribute("color").needsUpdate = true;
					tracks.visible = !isShower;
					const sh = showerRef.current;
					let si = 0;
					if (isShower && sh) {
						const cloud = sh.cascade ?? sh.particles;
						const genCut = reveal * Math.max(1, sh.generations || 10);
						for (const p of cloud) {
							if (si >= showerMax) break;
							if (p.generation > genCut) continue;
							const c = colorOf(p.species);
							const scale = (p.charged ? 1.15 : .7) * (.7 + Math.min(1.8, Math.log10(Math.max(1, p.energyGeV)) * .45));
							dummy.position.set(p.xKm * 1.4, p.zKm * .24 - 2.1, p.yKm * 1.4);
							dummy.scale.setScalar(scale);
							dummy.updateMatrix();
							showerMesh.setMatrixAt(si, dummy.matrix);
							showerMesh.setColorAt(si, c);
							si += 1;
						}
					}
					showerMesh.count = si;
					showerMesh.instanceMatrix.needsUpdate = true;
					if (showerMesh.instanceColor) showerMesh.instanceColor.needsUpdate = true;
					showerMesh.computeBoundingSphere();
					showerMesh.visible = isShower;
					const nPart = isShower ? si : ti;
					if (hudRef.current) hudRef.current.textContent = isShower ? `shower gen ≤ ${genLabel(reveal, sh)} · ${nPart} particles · SCI:SIMULATED` : `tracks ${nPart} · t=${reveal.toFixed(2)} · picture, not evidence`;
				}
				renderer.render(scene, camera);
			};
			renderer.setAnimationLoop(loop);
			cleanup = () => {
				renderer.setAnimationLoop(null);
				ro.disconnect();
				trackGeo.dispose();
				sphereGeo.dispose();
				sphereMat.dispose();
				showerMesh.dispose();
				for (const obj of layerMeshes) {
					const mesh = obj;
					mesh.geometry.dispose();
					mesh.material.dispose();
				}
				beam.geometry.dispose();
				beam.material.dispose();
				renderer.dispose();
				controls.dispose();
			};
		})();
		return () => {
			disposed = true;
			cleanup?.();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: hostRef,
		className: "relative h-[22rem] min-h-56 w-full overflow-hidden rounded-lg bg-secondary sm:h-[28rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "block h-full w-full touch-none"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			ref: hudRef,
			className: "pointer-events-none absolute bottom-2 left-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
			children: "orbit · picture of a simulation"
		})]
	});
}
function genLabel(reveal, shower) {
	if (!shower) return "—";
	return (reveal * Math.max(1, shower.generations)).toFixed(1);
}
var FAMILY_STROKE = {
	BEAMPIPE: "#5c6370",
	PIXEL: "#8fa3b8",
	SCT: "#8fa3b8",
	TRT: "#7a9a80",
	SOLENOID: "#6b7280",
	EMCAL: "#7a9a80",
	HCAL: "#c4a574",
	MUON: "#8b919c",
	FORWARD: "#c47a6a"
};
function AtlasRzCanvas({ selectedId, eta }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const parent = canvas.parentElement;
		if (!parent) return;
		const paint = () => {
			const w = Math.max(200, parent.clientWidth);
			const h = 320;
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			canvas.width = Math.floor(w * dpr);
			canvas.height = Math.floor(h * dpr);
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.fillStyle = "#12151a";
			ctx.fillRect(0, 0, w, h);
			const padL = 44;
			const padT = 16;
			const padR = 12;
			const zMax = 12.5;
			const rMax = 11.2;
			const xOf = (z) => padL + z / zMax * (w - padL - padR);
			const yOf = (r) => 292 - r / rMax * 276;
			ctx.strokeStyle = "#2a3038";
			ctx.lineWidth = 1;
			for (const r of [
				2,
				4,
				6,
				8,
				10
			]) {
				ctx.beginPath();
				ctx.moveTo(padL, yOf(r));
				ctx.lineTo(w - padR, yOf(r));
				ctx.stroke();
				ctx.fillStyle = "#8b919c";
				ctx.font = "10px ui-monospace, monospace";
				ctx.fillText(`${r} m`, 6, yOf(r) + 3);
			}
			for (const z of [
				0,
				2,
				5,
				8,
				12
			]) ctx.fillText(`${z}`, xOf(z) - 4, 312);
			ctx.fillText("z (m)", w - 36, 312);
			ctx.fillText("R", 10, 20);
			const drawable = ATLAS_LAYERS.filter((l) => l.family !== "FORWARD");
			for (const layer of drawable) {
				const x0 = xOf(0);
				const x1 = xOf(Math.min(zMax, layer.zMaxM));
				const y0 = yOf(layer.rMaxM);
				const y1 = yOf(layer.rMinM);
				ctx.fillStyle = layer.id === selectedId ? "rgba(196,165,116,0.28)" : "rgba(143,163,184,0.08)";
				ctx.strokeStyle = FAMILY_STROKE[layer.family];
				ctx.lineWidth = layer.id === selectedId ? 2 : 1;
				ctx.beginPath();
				ctx.rect(x0, y0, Math.max(2, x1 - x0), Math.max(1, y1 - y0));
				ctx.fill();
				ctx.stroke();
			}
			const theta = 2 * Math.atan(Math.exp(-Math.abs(eta)));
			ctx.strokeStyle = "#c4a574";
			ctx.setLineDash([4, 3]);
			ctx.beginPath();
			ctx.moveTo(xOf(0), yOf(0));
			const s = 14;
			ctx.lineTo(xOf(Math.min(zMax, s * Math.cos(theta))), yOf(Math.min(rMax, s * Math.sin(theta))));
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.fillStyle = "#c4a574";
			ctx.fillText(`η=${eta.toFixed(1)}`, xOf(2.2), yOf(Math.min(10.799999999999999, 2.2 * Math.tan(theta))) - 4);
			ctx.strokeStyle = "#8fa3b8";
			ctx.beginPath();
			ctx.moveTo(xOf(0), yOf(0));
			ctx.lineTo(xOf(zMax), yOf(0));
			ctx.stroke();
			const iw = Math.min(220, w * .38);
			const ih = 132;
			const ix = w - padR - iw;
			const iy = padT;
			ctx.fillStyle = "#0e1116";
			ctx.strokeStyle = "#2a3038";
			ctx.lineWidth = 1;
			ctx.fillRect(ix, iy, iw, ih);
			ctx.strokeRect(ix, iy, iw, ih);
			ctx.fillStyle = "#8b919c";
			ctx.font = "10px ui-monospace, monospace";
			ctx.fillText("ID inset  R≤1.3 m", ix + 6, 28);
			const zId = 3.6;
			const rId = 1.32;
			const xI = (z) => ix + 8 + z / zId * (iw - 16);
			const yI = (r) => 140 - r / rId * 108;
			for (const layer of drawable.filter((l) => l.rMaxM <= 1.3)) {
				const x0 = xI(0);
				const x1 = xI(Math.min(zId, layer.zMaxM));
				const y0 = yI(layer.rMaxM);
				const y1 = yI(Math.max(0, layer.rMinM));
				ctx.fillStyle = layer.id === selectedId ? "rgba(196,165,116,0.35)" : "rgba(143,163,184,0.12)";
				ctx.strokeStyle = FAMILY_STROKE[layer.family];
				ctx.lineWidth = layer.id === selectedId ? 2 : 1;
				ctx.beginPath();
				ctx.rect(x0, y0, Math.max(1.5, x1 - x0), Math.max(1.2, y1 - y0));
				ctx.fill();
				ctx.stroke();
			}
			ctx.strokeStyle = "#c4a574";
			ctx.setLineDash([3, 2]);
			ctx.beginPath();
			ctx.moveTo(xI(0), yI(0));
			ctx.lineTo(xI(Math.min(zId, 4 * Math.cos(theta))), yI(Math.min(rId, 4 * Math.sin(theta))));
			ctx.stroke();
			ctx.setLineDash([]);
		};
		paint();
		const ro = new ResizeObserver(paint);
		ro.observe(parent);
		return () => ro.disconnect();
	}, [selectedId, eta]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "w-full",
		role: "img",
		"aria-label": "ATLAS R-z literature cutaway"
	});
}
function AtlasLayerTable({ selectedId, onSelect, hits }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[28rem] text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "font-mono text-[10px] uppercase text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2",
						children: "Layer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "R (m)" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "|z| (m)" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "|η|" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Ray" })
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: ATLAS_LAYERS.map((layer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: `cursor-pointer border-t border-border font-mono text-xs ${selectedId === layer.id ? "bg-secondary" : ""}`,
				onClick: () => onSelect(layer.id),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2",
						children: layer.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
						layer.rMinM.toFixed(2),
						"–",
						layer.rMaxM.toFixed(2)
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: layer.zMaxM < 20 ? layer.zMaxM.toFixed(2) : "140*" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: layer.etaMax.toFixed(2) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: hits.has(layer.id) ? "text-foreground" : "text-muted-foreground",
						children: hits.has(layer.id) ? "hit" : "—"
					})
				]
			}, layer.id)) })]
		})
	});
}
function describeLayer(id) {
	return ATLAS_LAYERS.find((l) => l.id === id);
}
function AtlasDepositCanvas({ objects }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const parent = canvas.parentElement;
		if (!parent) return;
		const paint = () => {
			const w = Math.max(200, parent.clientWidth);
			const rows = Math.min(12, objects.length);
			const h = Math.max(160, 28 + rows * 22);
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			canvas.width = Math.floor(w * dpr);
			canvas.height = Math.floor(h * dpr);
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.fillStyle = "#12151a";
			ctx.fillRect(0, 0, w, h);
			const maxE = Math.max(1, ...objects.slice(0, rows).map((o) => o.emGeV + o.hadGeV));
			const barW = w - 92;
			objects.slice(0, rows).forEach((o, i) => {
				const y = 10 + i * 22;
				ctx.fillStyle = "#8b919c";
				ctx.font = "10px ui-monospace, monospace";
				ctx.fillText(o.idGuess.slice(0, 3), 6, y + 12);
				const emW = o.emGeV / maxE * barW;
				const hadW = o.hadGeV / maxE * barW;
				ctx.fillStyle = "#7a9a80";
				ctx.fillRect(56, y + 4, Math.max(0, emW), 12);
				ctx.fillStyle = "#c4a574";
				ctx.fillRect(56 + emW, y + 4, Math.max(0, hadW), 12);
			});
		};
		paint();
		const ro = new ResizeObserver(paint);
		ro.observe(parent);
		return () => ro.disconnect();
	}, [objects]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "w-full",
		role: "img",
		"aria-label": "EM versus hadronic deposits"
	});
}
function useCanvas(draw, deps, cssH) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const parent = canvas.parentElement;
		if (!parent) return;
		const paint = () => {
			const w = Math.max(160, parent.clientWidth);
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			canvas.width = Math.floor(w * dpr);
			canvas.height = Math.floor(cssH * dpr);
			canvas.style.width = `${w}px`;
			canvas.style.height = `${cssH}px`;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			draw(ctx, w, cssH);
		};
		paint();
		const ro = new ResizeObserver(paint);
		ro.observe(parent);
		return () => ro.disconnect();
	}, deps);
	return ref;
}
function NucleusGeometryCanvas({ a, b, geometry, labelA, labelB }) {
	const ref = useCanvas((ctx, w, h) => {
		ctx.fillStyle = "#12151c";
		ctx.fillRect(0, 0, w, h);
		const cx = w / 2;
		const cy = h / 2;
		const scale = Math.min(w, h) / 18;
		const shift = geometry.bFm * scale / 2;
		const drawN = (list, dx, proton, neutron) => {
			for (const n of list) {
				ctx.fillStyle = n.type === "proton" ? proton : neutron;
				ctx.beginPath();
				ctx.arc(cx + dx + n.x * scale, cy + n.y * scale, 3.2, 0, Math.PI * 2);
				ctx.fill();
			}
		};
		drawN(a, -shift, "#c4a574", "#8fa3b8");
		drawN(b, shift, "#d27a70", "#6e8b9a");
		ctx.strokeStyle = "rgb(232 234 238 / 0.25)";
		ctx.setLineDash([4, 4]);
		ctx.beginPath();
		ctx.moveTo(cx, 12);
		ctx.lineTo(cx, h - 12);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.fillStyle = "#c4c9d2";
		ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
		ctx.fillText(`${labelA}  b=${geometry.bFm.toFixed(2)} fm  N_part=${geometry.nPart}`, 10, 16);
		ctx.fillText(`${labelB}  N_coll=${geometry.nColl}  cent ${geometry.centrality.toFixed(0)}%`, 10, h - 10);
	}, [
		a,
		b,
		geometry,
		labelA,
		labelB
	], 220);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		height: 220,
		className: "block w-full rounded-md",
		"aria-label": "Nuclear geometry"
	});
}
function AirShowerCanvas({ shower }) {
	const ref = useCanvas((ctx, w, h) => {
		ctx.fillStyle = "#12151c";
		ctx.fillRect(0, 0, w, h);
		const ground = h - 18;
		const top = 18;
		const x0 = w / 2;
		ctx.fillStyle = "rgb(110 139 154 / 0.15)";
		ctx.fillRect(0, ground, w, 18);
		ctx.strokeStyle = "rgb(232 234 238 / 0.2)";
		ctx.beginPath();
		ctx.moveTo(0, ground);
		ctx.lineTo(w, ground);
		ctx.stroke();
		const zMax = Math.max(1, shower.altitudeKm);
		const color = {
			proton: "#e8eaee",
			pion: "#c4a574",
			kaon: "#b08d57",
			photon: "#8fa3b8",
			electron: "#6ea8a0",
			muon: "#d27a70",
			neutrino: "#5a6270",
			nucleon: "#c4c9d2"
		};
		for (const p of shower.particles) {
			const x = x0 + p.xKm * 28;
			const y = top + (zMax - p.zKm) / zMax * (ground - top);
			ctx.fillStyle = color[p.species] ?? "#8b919c";
			ctx.globalAlpha = p.charged ? .9 : .45;
			ctx.beginPath();
			ctx.arc(x, y, p.species === "muon" ? 2.8 : 1.7, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
		ctx.fillStyle = "#c4c9d2";
		ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
		ctx.fillText(`E=${shower.primaryEnergyGeV.toExponential(1)} GeV  μ=${shower.muons}  e=${shower.electrons}  γ=${shower.photons}`, 10, 16);
		ctx.fillText(`ground flux ${shower.groundFlux}  Xmax ${shower.xMaxGcm2.toFixed(0)} g/cm²  ${shower.evidence}`, 10, h - 6);
	}, [shower], 240);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		height: 240,
		className: "block w-full rounded-md",
		"aria-label": "Air shower"
	});
}
function DataVsModelCanvas({ literature, models, labels }) {
	const ref = useCanvas((ctx, w, h) => {
		ctx.fillStyle = "#12151c";
		ctx.fillRect(0, 0, w, h);
		const pad = {
			l: 36,
			r: 10,
			t: 18,
			b: 28
		};
		const innerW = w - pad.l - pad.r;
		const innerH = h - pad.t - pad.b;
		const all = [...literature, ...models.flat()];
		const max = Math.max(1, ...all.map((b) => b.observed));
		const bw = innerW / literature.length;
		const cols = [
			"#e8eaee",
			"#c4a574",
			"#6ea8a0",
			"#d27a70"
		];
		literature.forEach((b, i) => {
			const x = pad.l + i * bw;
			const bh = b.observed / max * innerH;
			ctx.fillStyle = cols[0];
			ctx.globalAlpha = .22;
			ctx.fillRect(x + 2, pad.t + innerH - bh, bw - 4, bh);
			ctx.globalAlpha = 1;
			ctx.strokeStyle = cols[0];
			ctx.strokeRect(x + 2, pad.t + innerH - bh, bw - 4, bh);
		});
		models.forEach((hist, mi) => {
			ctx.strokeStyle = cols[mi + 1] ?? "#8fa3b8";
			ctx.lineWidth = 1.6;
			ctx.beginPath();
			hist.forEach((b, i) => {
				const x = pad.l + (i + .5) * bw;
				const y = pad.t + innerH - b.observed / max * innerH;
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			});
			ctx.stroke();
		});
		ctx.fillStyle = "#8b919c";
		ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
		ctx.fillText("η", w / 2, h - 6);
		ctx.fillText("lit.", pad.l, 12);
		labels.forEach((lb, i) => {
			ctx.fillStyle = cols[i + 1] ?? "#8fa3b8";
			ctx.fillText(lb, pad.l + 40 + i * 56, 12);
		});
	}, [
		literature,
		models,
		labels
	], 220);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		height: 220,
		className: "block w-full rounded-md",
		"aria-label": "Data versus model"
	});
}
function DisagreementCanvas({ bins }) {
	const ref = useCanvas((ctx, w, h) => {
		ctx.fillStyle = "#12151c";
		ctx.fillRect(0, 0, w, h);
		if (bins.length === 0) return;
		const pad = {
			l: 36,
			r: 10,
			t: 16,
			b: 24
		};
		const innerW = w - pad.l - pad.r;
		const innerH = h - pad.t - pad.b;
		const max = Math.max(1, ...bins.map((b) => b.mean + b.spread));
		const bw = innerW / bins.length;
		bins.forEach((b, i) => {
			const x = pad.l + i * bw + bw / 2;
			const y = pad.t + innerH - b.mean / max * innerH;
			const s = b.spread / max * innerH;
			ctx.strokeStyle = "#c4a574";
			ctx.beginPath();
			ctx.moveTo(x, y - s);
			ctx.lineTo(x, y + s);
			ctx.stroke();
			ctx.fillStyle = "#e8eaee";
			ctx.beginPath();
			ctx.arc(x, y, 2.4, 0, Math.PI * 2);
			ctx.fill();
		});
		ctx.fillStyle = "#8b919c";
		ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
		ctx.fillText("model spread vs η  (toy generators, not named codes)", 10, h - 6);
	}, [bins], 180);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		height: 180,
		className: "block w-full rounded-md",
		"aria-label": "Model disagreement"
	});
}
function LhcfGeometryCanvas() {
	const ref = useCanvas((ctx, w, h) => {
		ctx.fillStyle = "#12151c";
		ctx.fillRect(0, 0, w, h);
		const y = h / 2;
		ctx.strokeStyle = "rgb(232 234 238 / 0.35)";
		ctx.beginPath();
		ctx.moveTo(20, y);
		ctx.lineTo(w - 16, y);
		ctx.stroke();
		ctx.fillStyle = "#c4a574";
		ctx.beginPath();
		ctx.arc(48, y, 8, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#e8eaee";
		ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
		ctx.fillText("ATLAS IP", 38, y - 16);
		const lhcfX = w - 70;
		ctx.strokeStyle = "#6ea8a0";
		ctx.strokeRect(lhcfX, y - 18, 36, 36);
		ctx.fillStyle = "#6ea8a0";
		ctx.fillText("LHCf", lhcfX + 4, y + 4);
		ctx.fillStyle = "#8b919c";
		ctx.fillText("140 m  ·  ~1 mrad  ·  forward neutrals", 48, h - 12);
		ctx.fillText("ZDC / near-beam neutrons", 48, 18);
	}, [], 160);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		height: 160,
		className: "block w-full rounded-md",
		"aria-label": "LHCf geometry"
	});
}
function PoEventCanvas({ event }) {
	const ref = useCanvas((ctx, w, h) => {
		ctx.fillStyle = "#12151c";
		ctx.fillRect(0, 0, w, h);
		const cx = w / 2;
		const cy = h / 2;
		ctx.strokeStyle = "rgb(232 234 238 / 0.12)";
		for (const r of [
			.25,
			.5,
			.75
		]) {
			ctx.beginPath();
			ctx.arc(cx, cy, Math.min(cx, cy) * r * .92, 0, Math.PI * 2);
			ctx.stroke();
		}
		if (!event) return;
		for (const t of event.tracks) {
			const R = Math.min(cx, cy) * .9 * (.25 + Math.min(1, t.pT / 6) * .7);
			const ang = t.phi;
			ctx.strokeStyle = Math.abs(t.eta) < 1 ? "#e8eaee" : "#c4a574";
			ctx.globalAlpha = .85;
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
		ctx.fillStyle = "#c4c9d2";
		ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
		ctx.fillText(`N_ch (fiducial) ${event.nCh}  ·  SIMULATED`, 10, 16);
	}, [event], 220);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		height: 220,
		className: "block w-full rounded-md",
		"aria-label": "p-O charged tracks"
	});
}
function CompareTable({ rows, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[28rem] text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "font-mono text-[10px] uppercase text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2",
						children: "η"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Lit." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: label }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Residual" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Data/MC" })
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border font-mono text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "py-2",
						children: [
							r.lo.toFixed(1),
							"–",
							r.hi.toFixed(1)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.data.toFixed(0) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.model.toFixed(0) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.residual.toFixed(0) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.ratio == null ? "—" : r.ratio.toFixed(2) })
				]
			}, r.bin)) })]
		})
	});
}
var TABS = [
	["overview", "Overview"],
	["display", "3D / 4D"],
	["systems", "Systems"],
	["geometry", "Geometry"],
	["collision", "Collision"],
	["detector", "Detector"],
	["atlas", "ATLAS"],
	["forward", "Forward"],
	["shower", "Shower"],
	["models", "Models"],
	["sources", "Sources"],
	["heavy", "Heavy ion"],
	["reconstruct", "Reco"],
	["spectrum", "Spectrum"],
	["quantum", "Quantum"],
	["missing", "MET / DM"],
	["evidence", "Evidence"],
	["ledger", "Ledger"],
	["gate", "Gate"]
];
var MODES = [
	"standard",
	"z",
	"higgs",
	"top",
	"dm",
	"entangled"
];
function ColliderLab() {
	const commit = useOmegaStore((s) => s.commitColliderRun);
	const attemptDiscovery = useOmegaStore((s) => s.attemptDiscovery);
	const attemptBeam = useOmegaStore((s) => s.attemptBeamActuation);
	const lastDenial = useOmegaStore((s) => s.events.find((e) => e.rejected));
	const [tab, setTab] = (0, import_react.useState)("overview");
	const [seed, setSeed] = (0, import_react.useState)(13600);
	const [beamEnergyGeV, setBeam] = (0, import_react.useState)(DEFAULT_ACCEL.beamEnergyGeV);
	const [luminosityFb, setLumi] = (0, import_react.useState)(DEFAULT_ACCEL.luminosityFb);
	const [eventCount, setCount] = (0, import_react.useState)(220);
	const [mode, setMode] = (0, import_react.useState)("z");
	const [systemId, setSystemId] = (0, import_react.useState)("pO");
	const [generator, setGenerator] = (0, import_react.useState)("GEN_A");
	const [note, setNote] = (0, import_react.useState)(null);
	const [focusId, setFocusId] = (0, import_react.useState)(null);
	const [viewKind, setViewKind] = (0, import_react.useState)("barrel");
	const [scrub, setScrub] = (0, import_react.useState)(.72);
	const [spinning, setSpinning] = (0, import_react.useState)(true);
	const [atlasId, setAtlasId] = (0, import_react.useState)("TILE");
	const [atlasEta, setAtlasEta] = (0, import_react.useState)(.8);
	const accel = (0, import_react.useMemo)(() => ({
		...DEFAULT_ACCEL,
		beamEnergyGeV,
		luminosityFb
	}), [beamEnergyGeV, luminosityFb]);
	const run = (0, import_react.useMemo)(() => runColliderExperiment(seed, accel, mode, Math.min(400, eventCount)), [
		seed,
		accel,
		mode,
		eventCount
	]);
	const lab = (0, import_react.useMemo)(() => runUniversalLab(seed, systemId, generator, eventCount), [
		seed,
		systemId,
		generator,
		eventCount
	]);
	const focus = run.events.find((e) => e.id === focusId) ?? run.last;
	const inf = run.inference;
	collisionRateHz(accel);
	const nuclear = systemId !== "pp";
	const atlasHits = (0, import_react.useMemo)(() => new Set(layersForEta(atlasEta).map((l) => l.id)), [atlasEta]);
	const atlasCensus = (0, import_react.useMemo)(() => {
		return censusTracks((lab.last?.tracks ?? []).map((t) => t.eta).slice(0, 80));
	}, [lab.last]);
	const atlasPicked = describeLayer(atlasId);
	const atlasReco = (0, import_react.useMemo)(() => {
		if (nuclear) return respondProbes(tracksToProbes(lab.last?.tracks ?? []), seed);
		return respondProbes((focus?.generated ?? []).map((p) => ({
			eta: p.eta,
			phi: p.phi,
			pT: p.pT,
			energy: p.E,
			charge: p.charge,
			name: p.name === "proton" ? "proton" : p.name
		})), seed);
	}, [
		nuclear,
		lab.last,
		focus,
		seed
	]);
	function onCommit() {
		const evt = commit({
			seed,
			beamEnergyGeV,
			luminosityFb,
			eventCount,
			mode,
			systemId,
			generator,
			summary: {
				process: nuclear ? lab.system.label : focus?.process ?? "QCD_jets",
				preferred: nuclear ? lab.preferredGenerator : inf.preferred,
				approxZ: inf.approxZ,
				state: nuclear ? lab.state : inf.state,
				blockers: nuclear ? lab.blockers : inf.blockers,
				discoveryGate: false,
				events: nuclear ? lab.events.length : run.events.length,
				meanMass: run.meanMass,
				meanMET: run.meanMET,
				systemId,
				sqrtSNNTeV: lab.sqrtSNNTeV,
				preferredGenerator: lab.preferredGenerator
			}
		});
		setNote(evt.rejected ? evt.rejectedReason ?? "Rejected." : "Hashed as SIMULATED. Not evidence.");
	}
	function onDeclare() {
		const evt = attemptDiscovery(nuclear ? lab.state : inf.state);
		setNote(evt.rejectedReason ?? "Discovery blocked.");
	}
	function onActuate() {
		const evt = attemptBeam();
		setNote(evt.rejectedReason ?? "Beam actuation blocked.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "DHC-TWIN v15 · ATLAS response",
			title: "Universal collider + cosmic-ray twin",
			description: "Literature envelopes now smear. A ray through TileCal is not a cluster. Stochastic ⊕ constant is not a calibration.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onCommit,
					children: "Commit run to bus"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "destructive",
					onClick: onDeclare,
					children: "Declare SCI:DISC"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: onActuate,
					children: "Actuate beam"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/package",
						children: "Package v13"
					})
				})
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "System",
					value: lab.system.label,
					hint: lab.system.campaign
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "√s_NN",
					value: `${lab.sqrtSNNTeV.toFixed(2)} TeV`,
					hint: "per nucleon pair, not the nucleus total"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "N_ch mean",
					value: lab.meanNch.toFixed(1),
					hint: "fiducial |η|<2.5, pT>0.5 GeV (toy)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Epistemic",
					value: "SIMULATED",
					hint: "firewall closed"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "Beam and generator",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "TWIN ≠ MACHINE" }),
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
								children: CAMPAIGNS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: c.id,
									children: [
										c.label,
										" · ",
										c.campaign
									]
								}, c.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted-foreground",
							children: ["Hadronic generator (toy)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "mt-2 h-11 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground",
								value: generator,
								onChange: (e) => setGenerator(e.target.value),
								children: GENERATORS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: g.id,
									children: g.name
								}, g.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							label: "Monte Carlo events",
							value: eventCount,
							min: 40,
							max: 500,
							step: 20,
							format: (v) => v.toFixed(0),
							onChange: setCount
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted-foreground",
							children: ["p–p signal overlay", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "mt-2 h-11 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground",
								value: mode,
								onChange: (e) => setMode(e.target.value),
								children: MODES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: m,
									children: MODE_LABEL[m]
								}, m))
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "p–p beam energy / beam",
						value: beamEnergyGeV,
						min: 4500,
						max: 7e3,
						step: 50,
						format: (v) => `${v.toFixed(0)} GeV`,
						onChange: setBeam
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Integrated luminosity (p–p overlay)",
						value: luminosityFb,
						min: 1,
						max: 140,
						step: 1,
						format: (v) => `${v.toFixed(0)} fb⁻¹`,
						onChange: setLumi
					})]
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
							children: lab.state
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "COLLISION ≠ AIR SHOWER" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "LITERATURE ≠ THIS TWIN" })
					]
				}),
				note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-danger",
					children: note
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex gap-1 overflow-x-auto pb-1",
			children: TABS.map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(id),
				className: cn("h-11 shrink-0 rounded-md px-3 text-sm", tab === id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"),
				children: label
			}, id))
		}),
		tab === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					title: "Collider event",
					meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "info",
						children: "SIMULATED"
					}),
					children: [nuclear ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PoEventCanvas, { event: lab.last }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventDisplayCanvas, { event: focus }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-mono text-xs text-muted-foreground",
						children: nuclear ? `${lab.system.label} · N_ch ${lab.last?.nCh ?? 0} · mapping, not a shower` : `${focus ? PROCESS_LABEL[focus.process] : "—"} · MET ${focus ? focus.reconstruction.MET.toFixed(1) : "—"} GeV`
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: "Detector / geometry",
					meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "TWIN" }),
					children: nuclear ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NucleusGeometryCanvas, {
						a: lab.nucleusA,
						b: lab.nucleusB,
						geometry: lab.geometry,
						labelA: lab.system.projectile,
						labelB: lab.system.target
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetectorTwinCanvas, { event: focus })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					title: "Air shower (mapped)",
					meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "warn",
						children: "MAPPING ≠ IDENTITY"
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AirShowerCanvas, { shower: lab.shower }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: "First interaction uses the hadronic toy constrained by the collider desk. This is a separate cascade, not an ATLAS event replayed in the sky."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					title: "Literature vs generators",
					meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "few-% cal. · model spread" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataVsModelCanvas, {
						literature: lab.literatureEta,
						models: [
							lab.eta.GEN_A,
							lab.eta.GEN_B,
							lab.eta.GEN_C
						],
						labels: [
							"A",
							"B",
							"C"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: "White bars are a literature-inspired ATLAS p–O shape, not this twin’s observation. Lines are toy generators. ATLAS reports models disagree with each other; the measurement is at the few-percent level."
					})]
				})
			]
		}),
		tab === "display" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid gap-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: viewKind === "shower" ? "Air-shower 4D (generation slab)" : "ATLAS-like barrel",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "PICTURE ≠ EVIDENCE" }),
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: viewKind === "barrel" ? "default" : "outline",
							onClick: () => setViewKind("barrel"),
							children: "Barrel"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: viewKind === "shower" ? "default" : "outline",
							onClick: () => setViewKind("shower"),
							children: "Shower 4D"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setSpinning((v) => !v),
							children: spinning ? "Hold orbit" : "Auto orbit"
						})
					]
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Event3D, {
					kind: viewKind,
					nuclear: nuclear ? lab.last : null,
					collision: nuclear ? null : focus,
					shower: lab.shower,
					scrub,
					spinning
				}, `${viewKind}-${seed}-${systemId}`), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: viewKind === "shower" ? "Generation time" : "Track reveal",
						value: scrub,
						min: .08,
						max: 1,
						step: .02,
						format: (v) => v.toFixed(2),
						onChange: setScrub
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "self-end text-xs text-muted-foreground",
						children: "Drag to orbit. Time is a slider, not a clock on nature. A mapped shower is not an ATLAS event in the sky."
					})]
				})]
			})
		}),
		tab === "systems" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Campaigns",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2 text-sm",
					children: CAMPAIGNS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start justify-between gap-3 border-b border-border py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: c.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block font-mono text-[11px] text-muted-foreground",
							children: c.campaign
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: systemId === c.id ? "default" : "outline",
							onClick: () => setSystemId(c.id),
							children: systemId === c.id ? "Active" : "Select"
						})]
					}, c.id))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Energy contract",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Beam A / nucleon",
							value: `${lab.system.energyAGeV.toFixed(0)} GeV`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Beam B / nucleon",
							value: `${lab.system.energyBGeV.toFixed(0)} GeV`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "√s_NN",
							value: `${lab.sqrtSNNTeV.toFixed(3)} TeV`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "√s (p–p overlay)",
							value: `${(2 * beamEnergyGeV / 1e3).toFixed(2)} TeV`
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "For nuclei the relevant collision energy is per nucleon pair. July 2025 p–O used a 6.8 TeV proton against 3.4 TeV/nucleon oxygen → √s_NN = 9.62 TeV. O–O / Ne–Ne sat at 5.36 TeV."
				})]
			})]
		}),
		tab === "geometry" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Nuclear overlap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NucleusGeometryCanvas, {
					a: lab.nucleusA,
					b: lab.nucleusB,
					geometry: lab.geometry,
					labelA: lab.system.projectile,
					labelB: lab.system.target
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Glauber diagnostics",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "toy overlap" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "b",
							value: `${lab.geometry.bFm.toFixed(2)} fm`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "N_part",
							value: String(lab.geometry.nPart)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "N_coll",
							value: String(lab.geometry.nColl)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Centrality",
							value: `${lab.geometry.centrality.toFixed(0)}%`
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Uniform-sphere nucleons, not Woods-Saxon. Participants and binary collisions are estimates for the visual twin. Replace with a validated Glauber / T_A T_B sampler for production."
				})]
			})]
		}),
		tab === "collision" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "Monte Carlo event display",
			children: [nuclear ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PoEventCanvas, { event: lab.last }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventDisplayCanvas, { event: focus }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "System",
						value: lab.system.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "N_ch",
						value: String(lab.last?.nCh ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Σ pT",
						value: `${(lab.last?.sumPT ?? 0).toFixed(1)} GeV`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Forward E",
						value: `${(lab.last?.forwardEnergyGeV ?? 0).toFixed(1)} GeV`
					})
				]
			})]
		}),
		tab === "detector" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Layer hits (p–p overlay)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetectorTwinCanvas, { event: focus })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "ATLAS-like fiducial (literature)",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "pT min",
								value: `${lab.literature.pTminGeV} GeV`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "|η| max",
								value: String(lab.literature.etaMax)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "σ_fid (lit.)",
								value: `${lab.literature.sigmaFidMb} mb`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "L_int (lit.)",
								value: `${lab.literature.luminosityUb} μb⁻¹`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: lab.literature.source
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: lab.literature.caveat
					})
				]
			})]
		}),
		tab === "atlas" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "R–z literature cutaway",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "GEOMETRY ≠ DETECTOR" }),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtlasRzCanvas, {
						selectedId: atlasId,
						eta: atlasEta
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 block text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex justify-between gap-2",
							children: ["Probe η", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-foreground",
								children: atlasEta.toFixed(1)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							className: "mt-2 h-11 w-full accent-primary",
							min: 0,
							max: 4.5,
							step: .1,
							value: atlasEta,
							onChange: (e) => setAtlasEta(Number(e.target.value))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: "Quarter-cylinder envelopes, not a cavern survey. ZDC at 140 m is off-scale. ITk is not this layout."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Published envelopes",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "danger",
					children: "LITERATURE"
				}),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtlasLayerTable, {
						selectedId: atlasId,
						onSelect: setAtlasId,
						hits: atlasHits
					}),
					atlasPicked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-medium text-foreground",
								children: [atlasPicked.name, "."]
							}),
							" ",
							atlasPicked.role
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Mean layers / track",
								value: atlasCensus.meanLayers.toFixed(1)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "PIXEL hits",
								value: String(atlasCensus.familyTotals.PIXEL)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "MUON hits",
								value: String(atlasCensus.familyTotals.MUON)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Eligible",
								value: "false"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: "Hits are |η| ≤ layer η_max, not GEANT4. Toy tracks from the nuclear event. LITERATURE_ENVELOPE ≠ SURVEY."
					})
				]
			})]
		}),
		tab === "forward" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "LHCf · 140 m from IP",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LhcfGeometryCanvas, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: "LHCf sits along the beamline to measure near-zero-angle neutrals. That is the collider’s cosmic-ray calibration channel — still not an air shower inside the LHC."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Forward observables",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Mean forward E",
							value: `${lab.meanForwardGeV.toFixed(1)} GeV`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Acceptance",
							value: `${lab.forward.acceptanceMrad} mrad`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "ZDC z",
							value: `${lab.forward.zdcZm} m`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Evidence",
							value: "SIMULATED"
						})
					]
				})
			})]
		}),
		tab === "shower" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Atmospheric cascade",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AirShowerCanvas, { shower: lab.shower })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Ground / composition inputs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Target",
							value: lab.shower.target
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Generations",
							value: String(lab.shower.generations)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Charged",
							value: String(lab.shower.charged)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Muons",
							value: String(lab.shower.muons)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Ground flux",
							value: String(lab.shower.groundFlux)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Xmax",
							value: `${lab.shower.xMaxGcm2.toFixed(0)} g/cm²`
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: [
						"Atmosphere N₂ ",
						lab.atmosphere.nitrogen,
						" · O₂ ",
						lab.atmosphere.oxygen,
						" · Ar ",
						lab.atmosphere.argon,
						". Toy cascade, not CORSIKA. Primary ",
						lab.shower.primaryEnergyGeV.toExponential(1),
						" GeV."
					]
				})]
			})]
		}),
		tab === "models" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "dN/dη · literature vs toys",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataVsModelCanvas, {
					literature: lab.literatureEta,
					models: [
						lab.eta.GEN_A,
						lab.eta.GEN_B,
						lab.eta.GEN_C
					],
					labels: [
						"A",
						"B",
						"C"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisagreementCanvas, { bins: lab.disagreement })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Model quality",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "preference ≠ truth" }),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-3",
						children: GENERATORS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: `${g.name} χ²/ndf`,
							value: lab.chi2[g.id].toFixed(1)
						}, g.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm",
						children: [
							"Least-disagreeing toy: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: lab.preferredGenerator }),
							". That is not a hadronic discovery."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompareTable, {
						rows: lab.compare[lab.preferredGenerator],
						label: lab.preferredGenerator
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: "Generators A/B/C are pedagogical stand-ins, not EPOS, QGSJET, or SIBYLL. The published ATLAS result is that those real codes disagree with each other while the measurement reaches few-percent precision."
					})
				]
			})]
		}),
		tab === "sources" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Primary composition (inferred)",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "warn",
					children: "INFERRED"
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: lab.composition.hypotheses.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "capitalize",
							children: h.id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono tabular-nums text-muted-foreground",
							children: ["P = ", h.posterior.toFixed(3)]
						})]
					}, h.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: lab.composition.warning
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Source hypotheses",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "HYPOTHETICAL" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 font-mono text-xs text-muted-foreground",
					children: [
						"SUPERNOVA_REMNANT",
						"ACTIVE_GALACTIC_NUCLEUS",
						"BLACK_HOLE_ENVIRONMENT",
						"GALACTIC_ACCELERATOR",
						"EXTRAGALACTIC_SOURCE",
						"UNKNOWN"
					].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: s }, s))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Source classes stay hypothetical until the collision and shower models are constrained by real observations — not by this sandbox agreeing with itself."
				})]
			})]
		}),
		tab === "heavy" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Small-system / heavy-ion diagnostics",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Centrality",
							value: `${lab.heavyIon.centrality.toFixed(0)}%`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "N_part",
							value: String(lab.heavyIon.participantCount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "N_coll",
							value: String(lab.heavyIon.binaryCollisionCount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "⟨pT⟩",
							value: `${lab.heavyIon.meanPt.toFixed(2)} GeV`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "v2 (toy)",
							value: lab.heavyIon.flow.toFixed(3)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Quench frac",
							value: lab.heavyIon.quenching.toFixed(3)
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: [
						"qgpInterpretation = ",
						lab.heavyIon.qgpInterpretation,
						". One simulated number is not “QGP detected.” 2026 small-system jet-quenching papers are the literature path; this slider is a diagnostic."
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Jet energy-loss branch",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "DIAGNOSTIC" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Jet pT init",
							value: `${lab.jet.jetPtInitial.toFixed(0)} GeV`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Jet pT final",
							value: `${lab.jet.jetPtFinal.toFixed(1)} GeV`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "ΔE",
							value: `${lab.jet.energyLoss.toFixed(1)} GeV`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Reference",
							value: lab.jet.referenceSystem
						})
					]
				})
			})]
		}),
		tab === "reconstruct" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Literature response",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "GEOMETRY ≠ RESPONSE" }),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "μ",
								value: String(atlasReco.nMuon)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "e",
								value: String(atlasReco.nElectron)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "γ",
								value: String(atlasReco.nPhoton)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "jets",
								value: String(atlasReco.nJet)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Σ ET",
								value: `${atlasReco.sumET.toFixed(0)} GeV`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Fake MET",
								value: `${atlasReco.met.toFixed(1)} GeV`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "⟨EM frac⟩",
								value: atlasReco.meanEmFrac.toFixed(2)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Eligible",
								value: "false"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: atlasReco.note
					}),
					focus && !nuclear ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: [
							"Overlay reco still reports ",
							focus.reconstruction.leptonCount,
							" leptons / ",
							focus.reconstruction.jetCount,
							" ",
							"jets. That older 4-boolean cartoon is not this smear."
						]
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "EM vs hadronic deposits",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "danger",
					children: "SIMULATED"
				}),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtlasDepositCanvas, { objects: atlasReco.objects }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[22rem] text-left text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "font-mono text-[10px] uppercase text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2",
										children: "ID"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "pT truth" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "pT meas." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "EM" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "HAD" })
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: atlasReco.objects.slice(0, 8).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border font-mono text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2",
										children: o.idGuess
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: o.truthPT.toFixed(1) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: o.measuredPT.toFixed(1) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: o.emGeV.toFixed(1) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: o.hadGeV.toFixed(1) })
								]
							}, o.id)) })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: "Fake MET is residual of smearing, not missing energy from a new particle. RESPONSE ≠ OBSERVATION. SMEARING ≠ CALIBRATION."
					})
				]
			})]
		}),
		tab === "spectrum" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Invariant mass",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "info",
					children: "DERIVED"
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpectrumCanvas, {
					bins: run.mass,
					unit: "m_ll / m_γγ  [GeV]",
					markers: [{
						x: 91.2,
						label: "Z"
					}, {
						x: 125.3,
						label: "H"
					}]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Joint likelihood",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "not discovery" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "font-mono text-[10px] uppercase text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2",
							children: "Hypothesis"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "log L" })] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: COLLIDER_HYPOTHESES.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border font-mono text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: cn("py-2", h === inf.preferred && "text-foreground"),
							children: h
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: (inf.logL[h] ?? 0).toFixed(2) })]
					}, h)) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: [
						"Likelihood preference inside a sandbox is not a resonance discovery. Run state ",
						inf.researchRun.state,
						"."
					]
				})]
			})]
		}),
		tab === "quantum" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Spin correlation",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuantumCanvas, { event: focus })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Density diagnostics",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Correlation",
							value: focus ? focus.quantum.correlation.toFixed(4) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Purity",
							value: focus ? focus.quantum.purity.toFixed(4) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Entropy",
							value: focus ? focus.quantum.entropy.toFixed(4) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "CHSH S",
							value: focus ? focus.quantum.chsh.toFixed(4) : "—"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: [
						"Entangled mode plants a spin-singlet-like pair. CHSH above 2 here is a drawing, not a loophole-free Bell test. The biphoton holography prototype is a separate lab —",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/qcorr",
							className: "underline",
							children: "open QCORR"
						}),
						". It does not replace this spin panel, and it does not image a hadron wavefunction."
					]
				})]
			})]
		}),
		tab === "missing" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Missing transverse momentum",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpectrumCanvas, {
					bins: run.met,
					unit: "MET [GeV]"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Invisible search",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "warn",
					children: "HYPOTHETICAL"
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Mean MET",
							value: `${run.meanMET.toFixed(1)} GeV`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "S / √B",
							value: run.significance.toFixed(3)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "H4_DM_MET log L",
							value: (inf.logL.H4_DM_MET ?? 0).toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "H0_QCD log L",
							value: (inf.logL.H0_QCD ?? 0).toFixed(2)
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Dark-matter injection adds invisible four-vectors. The TPC lab is a different search — this MET channel does not duplicate it."
				})]
			})]
		}),
		tab === "evidence" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Cosmic evidence chain",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "danger",
					children: "CLAIM REJECTED"
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColliderEvidenceSvg, { graph: lab.graph }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-1 font-mono text-xs text-muted-foreground",
					children: [lab.graphErrors.slice(0, 6).map((err) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: err }, err)), lab.graphErrors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Graph intact. Literature calibrates. Simulation still cannot support a claim." }) : null]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Firewall",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 font-mono text-xs",
					children: Object.entries(lab.firewall).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-2 border-b border-border py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: v && k === "discoveryEligible" ? "text-danger" : "text-muted-foreground",
							children: String(v)
						})]
					}, k))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "SIMULATED cannot automatically become OBSERVED. Only an external experimental dataset creates an OBSERVED node."
				})]
			})]
		}),
		tab === "ledger" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "Experiment package",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-xs text-muted-foreground",
				children: [
					lab.schema,
					" · ",
					lab.packageHash,
					" · ledger ",
					lab.ledger.terminal
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[36rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "font-mono text-[10px] uppercase text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2",
								children: "Seq"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Kind" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Ref" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "State" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Note" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: lab.ledger.entries.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border font-mono text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2",
								children: e.seq
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.kind }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.ref }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.state }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "max-w-[16rem] truncate",
								children: e.note
							})
						]
					}, e.seq)) })]
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Nuclear lab ",
						lab.state,
						" · p–p overlay ",
						inf.researchRun.state,
						" / ",
						inf.researchRun.dataState,
						". Approximate Z is a development diagnostic. ANOMALY != DISCOVERY. A p–O literature calibration does not unblind this twin."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-1 font-mono text-xs text-danger",
					children: lab.blockers.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: b }, b))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "destructive",
						onClick: onDeclare,
						children: "Declare SCI:DISC"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: onActuate,
						children: "Actuate beam"
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
function Slider({ label, value, min, max, step, format, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex justify-between gap-2",
			children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-foreground",
				children: format(value)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			className: "mt-2 h-11 w-full accent-primary",
			min,
			max,
			step,
			value,
			onChange: (e) => onChange(Number(e.target.value))
		})]
	});
}
//#endregion
export { ColliderLab as component };
