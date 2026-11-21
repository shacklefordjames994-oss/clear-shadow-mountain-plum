import { o as hashObject } from "./store-lOmq_ntM.mjs";
import { C as validateEvidenceGraph, a as addEvidenceNode, h as ledgerFromGraph, i as addEvidenceEdge, n as RNG, u as createEvidenceGraph } from "./master-NgVsSD82.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lab-GmSRs70J.js
var IONS = {
	p: {
		id: "p",
		name: "proton",
		A: 1,
		Z: 1,
		radiusFm: .84
	},
	He: {
		id: "He",
		name: "helium-4",
		A: 4,
		Z: 2,
		radiusFm: 1.68
	},
	N: {
		id: "N",
		name: "nitrogen-14",
		A: 14,
		Z: 7,
		radiusFm: 2.61
	},
	O: {
		id: "O",
		name: "oxygen-16",
		A: 16,
		Z: 8,
		radiusFm: 2.7
	},
	Ne: {
		id: "Ne",
		name: "neon-20",
		A: 20,
		Z: 10,
		radiusFm: 2.98
	},
	Xe: {
		id: "Xe",
		name: "xenon-129",
		A: 129,
		Z: 54,
		radiusFm: 5.56
	},
	Pb: {
		id: "Pb",
		name: "lead-208",
		A: 208,
		Z: 82,
		radiusFm: 6.62
	}
};
/** Ultra-relativistic √s_NN ≈ 2 √(E_A E_B) with E per nucleon. */
function sqrtSNN(sys) {
	return 2 * Math.sqrt(sys.energyAGeV * sys.energyBGeV);
}
var CAMPAIGNS = [
	{
		id: "pp",
		projectile: "p",
		target: "p",
		energyAGeV: 6800,
		energyBGeV: 6800,
		label: "p–p",
		campaign: "√s = 13.6 TeV"
	},
	{
		id: "pO",
		projectile: "p",
		target: "O",
		energyAGeV: 6800,
		energyBGeV: 3400,
		label: "p–O",
		campaign: "√s_NN = 9.62 TeV · July 2025"
	},
	{
		id: "OO",
		projectile: "O",
		target: "O",
		energyAGeV: 2680,
		energyBGeV: 2680,
		label: "O–O",
		campaign: "√s_NN = 5.36 TeV · July 2025"
	},
	{
		id: "NeNe",
		projectile: "Ne",
		target: "Ne",
		energyAGeV: 2680,
		energyBGeV: 2680,
		label: "Ne–Ne",
		campaign: "√s_NN = 5.36 TeV · July 2025"
	},
	{
		id: "pN",
		projectile: "p",
		target: "N",
		energyAGeV: 6800,
		energyBGeV: 3400,
		label: "p–N",
		campaign: "air analogue · not a 2025 LHC species"
	},
	{
		id: "pHe",
		projectile: "p",
		target: "He",
		energyAGeV: 6800,
		energyBGeV: 3400,
		label: "p–He",
		campaign: "light-ion analogue"
	},
	{
		id: "PbPb",
		projectile: "Pb",
		target: "Pb",
		energyAGeV: 2510,
		energyBGeV: 2510,
		label: "Pb–Pb",
		campaign: "√s_NN = 5.02 TeV · large-system analogue"
	}
];
function campaignById(id) {
	return CAMPAIGNS.find((c) => c.id === id) ?? CAMPAIGNS[1];
}
function sampleGlauber(projectile, target, u1, u2) {
	const a = IONS[projectile];
	const t = IONS[target];
	const bMax = a.radiusFm + t.radiusFm + 1.2;
	const bFm = bMax * Math.sqrt(Math.min(.999, u1));
	const overlap = Math.exp(-bFm * bFm / (2 * (a.radiusFm ** 2 + t.radiusFm ** 2 + .8)));
	const nColl = Math.max(1, Math.round(a.A * t.A * .018 * overlap * (.7 + .6 * u2)));
	return {
		bFm,
		nPart: Math.max(2, Math.min(a.A + t.A, Math.round((a.A + t.A) * .22 * overlap + (projectile === "p" ? 1 : 2)))),
		nColl,
		centrality: Math.min(100, (bFm / bMax) ** 2 * 100)
	};
}
/** Uniform-sphere toy nucleons. Replace with Woods-Saxon for production. */
function generateNucleus(id, jitter) {
	const cfg = IONS[id];
	const nucleus = [];
	const R = cfg.radiusFm;
	for (let i = 0; i < cfg.A; i++) {
		const u = (Math.sin((i + 1) * (12.9898 + jitter)) * 43758.5453 % 1 + 1) % 1;
		const v = (Math.sin((i + 1) * (78.233 + jitter)) * 24634.634 % 1 + 1) % 1;
		const w = (Math.sin((i + 1) * (39.425 + jitter)) * 18273.1 % 1 + 1) % 1;
		const theta = Math.acos(2 * v - 1);
		const phi = 2 * Math.PI * w;
		const radius = R * Math.cbrt(u);
		nucleus.push({
			nucleonId: i,
			type: i < cfg.Z ? "proton" : "neutron",
			x: radius * Math.sin(theta) * Math.cos(phi),
			y: radius * Math.sin(theta) * Math.sin(phi),
			z: radius * Math.cos(theta)
		});
	}
	return nucleus;
}
var FORWARD = {
	atlasIp: {
		x: 0,
		y: 0,
		z: 0
	},
	lhcfZm: 140,
	acceptanceMrad: 1,
	zdcZm: 140
};
var ATLAS_PO_LITERATURE = {
	sqrtSNNTeV: 9.62,
	luminosityUb: 634,
	selectedEvents: 246e6,
	pTminGeV: .5,
	etaMax: 2.5,
	sigmaFidMb: 396,
	sigmaFidUncExpMb: 6,
	sigmaFidUncLumiMb: 9,
	sigmaPairMb: 406,
	relativeUnc: .03,
	source: "ATLAS CERN-EP-2026-106 / Phys. Rev. Lett. — literature calibration, not an observation by this twin",
	caveat: "ATLAS measured charged-particle production in p–O. It did not reproduce an atmospheric air shower inside the LHC."
};
var GENERATORS = [
	{
		id: "GEN_A",
		name: "Generator A",
		note: "Higher central multiplicity. Toy stand-in — not a named air-shower code.",
		multScale: 1.18,
		pTSlope: .22,
		forwardBoost: .72,
		etaWidth: 1.85
	},
	{
		id: "GEN_B",
		name: "Generator B",
		note: "Harder pT, more forward energy. Toy stand-in — not a named air-shower code.",
		multScale: .92,
		pTSlope: .16,
		forwardBoost: 1.28,
		etaWidth: 2.35
	},
	{
		id: "GEN_C",
		name: "Generator C",
		note: "Softer spectrum, photon-rich forward. Toy stand-in — not a named air-shower code.",
		multScale: 1.05,
		pTSlope: .28,
		forwardBoost: 1.12,
		etaWidth: 2.1
	}
];
function generatorById(id) {
	return GENERATORS.find((g) => g.id === id) ?? GENERATORS[0];
}
var ETA_EDGES = [
	-2.5,
	-2,
	-1.5,
	-1,
	-.5,
	0,
	.5,
	1,
	1.5,
	2,
	2.5
];
var PT_EDGES = [
	.5,
	.8,
	1.2,
	1.8,
	2.6,
	4,
	6,
	9
];
var NCH_EDGES = [
	1,
	4,
	8,
	12,
	16,
	22,
	30,
	42
];
function meanNch(sys, g, gen) {
	const s = 2 * Math.sqrt(sys.energyAGeV * sys.energyBGeV);
	const aa = Math.pow(s / 9620, .11);
	return Math.max(1.2, 6.4 * Math.pow(g.nPart, .42) * aa * gen.multScale);
}
function sampleNuclearEvent(rng, sys, gen, glauber) {
	const mean = meanNch(sys, glauber, gen);
	const nCh = Math.max(1, Math.round(mean + rng.gaussian() * Math.sqrt(mean)));
	const tracks = [];
	let sumPT = 0;
	let forwardEnergyGeV = 0;
	let leadingEnergyGeV = 0;
	for (let i = 0; i < nCh; i++) {
		const eta = rng.gaussian() * gen.etaWidth;
		const inFid = Math.abs(eta) < ATLAS_PO_LITERATURE.etaMax;
		const pT = Math.max(.15, -Math.log(Math.max(1e-9, rng.next())) * gen.pTSlope * 4 + .35);
		const phi = rng.next() * 2 * Math.PI;
		const energy = pT * Math.cosh(eta);
		const forward = Math.abs(eta) > 4 || Math.abs(Math.atan(1 / Math.sinh(Math.max(.2, Math.abs(eta))))) < .02;
		if (inFid && pT >= ATLAS_PO_LITERATURE.pTminGeV) {
			tracks.push({
				eta,
				phi,
				pT,
				energy,
				charge: rng.next() < .5 ? 1 : -1,
				forward: false
			});
			sumPT += pT;
		} else if (forward || Math.abs(eta) > 2.5) forwardEnergyGeV += energy * gen.forwardBoost * .15;
		leadingEnergyGeV = Math.max(leadingEnergyGeV, energy);
	}
	const fid = tracks.filter((t) => Math.abs(t.eta) < ATLAS_PO_LITERATURE.etaMax && t.pT >= ATLAS_PO_LITERATURE.pTminGeV);
	return {
		id: `po-${(rng.next() * 1e9).toFixed(0)}`,
		system: sys.id,
		sqrtSNNGeV: 2 * Math.sqrt(sys.energyAGeV * sys.energyBGeV),
		glauber,
		generator: gen.id,
		tracks: fid,
		nCh: fid.length,
		sumPT,
		forwardEnergyGeV,
		leadingEnergyGeV,
		evidence: "SIMULATED"
	};
}
function emptyHist(edges) {
	const bins = [];
	for (let i = 0; i < edges.length - 1; i++) bins.push({
		lo: edges[i],
		hi: edges[i + 1],
		observed: 0
	});
	return bins;
}
function fillHist(bins, value) {
	for (const bin of bins) if (value >= bin.lo && value < bin.hi) {
		bin.observed += 1;
		return;
	}
	if (value >= bins[bins.length - 1].hi) bins[bins.length - 1].observed += 1;
}
/** Literature-inspired ATLAS-like dN/dη shape. Not the published histogram. */
function literatureEta(edges, nEvents) {
	const bins = emptyHist(edges);
	const mid = ATLAS_PO_LITERATURE.etaMax * 2 / (edges.length - 1);
	for (const bin of bins) {
		const c = (bin.lo + bin.hi) / 2;
		const shape = 1.05 - .08 * c * c;
		bin.observed = nEvents * 1.35 * Math.max(.2, shape) * ((bin.hi - bin.lo) / mid);
	}
	return bins;
}
function compareModelToData(data, model) {
	const n = Math.min(data.length, model.length);
	const out = [];
	for (let i = 0; i < n; i++) {
		const d = data[i].observed;
		const m = model[i].observed;
		out.push({
			bin: i,
			lo: data[i].lo,
			hi: data[i].hi,
			data: d,
			model: m,
			residual: d - m,
			ratio: m !== 0 ? d / m : null
		});
	}
	return out;
}
function modelDisagreement(models) {
	if (models.length < 2) return [];
	const bins = models[0].length;
	const out = [];
	for (let i = 0; i < bins; i++) {
		const values = models.map((m) => m[i]?.observed ?? 0);
		const mean = values.reduce((a, b) => a + b, 0) / values.length;
		const variance = values.reduce((s, x) => s + (x - mean) ** 2, 0) / values.length;
		out.push({
			bin: i,
			lo: models[0][i].lo,
			hi: models[0][i].hi,
			mean,
			spread: Math.sqrt(variance),
			models: values
		});
	}
	return out;
}
function chi2Ndf(compare, relUnc) {
	if (compare.length === 0) return 0;
	let s = 0;
	for (const row of compare) {
		const sigma = Math.max(1e-6, relUnc * row.data);
		s += (row.residual / sigma) ** 2;
	}
	return s / compare.length;
}
var ATMOSPHERE = {
	nitrogen: .7808,
	oxygen: .2095,
	argon: .0093,
	other: 4e-4
};
function interactProb(energyGeV, zKm, gen) {
	const density = Math.exp(-zKm / 7.5);
	const lambda = 85 / (.7 + .3 * gen.multScale);
	return Math.min(.92, density * (12 / lambda) * (1 + Math.log10(Math.max(10, energyGeV)) / 12));
}
function secondaries(parent, rng, gen) {
	if (parent.species === "muon" || parent.species === "neutrino") return [parent];
	if (parent.energyGeV < .4) {
		if (parent.species === "pion" && rng.next() < .35) return [{
			...parent,
			species: "muon",
			energyGeV: parent.energyGeV * .72,
			charged: true,
			generation: parent.generation + 1
		}];
		return [];
	}
	const n = Math.max(2, Math.min(7, Math.round(2.2 * gen.multScale + rng.next() * 3)));
	const out = [];
	let remain = parent.energyGeV * .92;
	for (let i = 0; i < n && remain > .05; i++) {
		const frac = rng.next() * (1.1 / n);
		const e = Math.max(.05, remain * frac);
		remain -= e;
		const roll = rng.next();
		let species = "pion";
		let charged = true;
		if (parent.species === "photon" || parent.species === "electron" || roll > .72) {
			species = roll > .86 ? "photon" : "electron";
			charged = species === "electron";
		} else if (roll < .08) species = "muon";
		else if (roll < .12) {
			species = "neutrino";
			charged = false;
		}
		const spread = (rng.next() - .5) * .18 * (1 + parent.generation * .08);
		out.push({
			species,
			energyGeV: e,
			xKm: parent.xKm + spread,
			yKm: parent.yKm + (rng.next() - .5) * .18,
			zKm: Math.max(0, parent.zKm - 1.4 - rng.next() * 1.2),
			generation: parent.generation + 1,
			charged
		});
	}
	return out;
}
function propagateCosmicRay(rng, gen, primaryEnergyGeV, altitudeKm) {
	const shower = {
		primaryEnergyGeV,
		primary: "proton",
		altitudeKm,
		target: rng.next() < ATMOSPHERE.oxygen / (ATMOSPHERE.oxygen + ATMOSPHERE.nitrogen) ? "oxygen" : "nitrogen",
		generator: gen.id,
		generations: 0,
		particles: [{
			species: "proton",
			energyGeV: primaryEnergyGeV,
			xKm: 0,
			yKm: 0,
			zKm: altitudeKm,
			generation: 0,
			charged: true
		}],
		history: [],
		charged: 0,
		photons: 0,
		electrons: 0,
		muons: 0,
		neutrinos: 0,
		groundFlux: 0,
		xMaxGcm2: 0,
		evidence: "SIMULATED",
		cascade: []
	};
	shower.cascade.push(shower.particles[0]);
	const MAX = 10;
	let xmax = 0;
	let xmaxN = 0;
	for (let generation = 0; generation < MAX; generation++) {
		const next = [];
		let genEnergy = 0;
		for (const particle of shower.particles) {
			if (particle.zKm <= .3) {
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
					energyGeV: particle.energyGeV
				});
			} else next.push({
				...particle,
				zKm: Math.max(0, particle.zKm - 1.6),
				generation: particle.generation + 1
			});
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
function node(id, type, epistemicState, label, metadata = {}) {
	return {
		id,
		type,
		epistemicState,
		label,
		provenance: ["dhc-twin-v7"],
		metadata
	};
}
function assembleCosmicGraph(input) {
	let graph = createEvidenceGraph(input.graphId);
	graph = addEvidenceNode(graph, node("atlas-po-literature", "CALIBRATION", "LITERATURE", "ATLAS p–O published", { caveat: ATLAS_PO_LITERATURE.caveat }));
	graph = addEvidenceNode(graph, node("sandbox-events", "DATASET", "SCI:SIMULATED", "Twin nuclear events"));
	graph = addEvidenceNode(graph, node("gen-a", "MODEL", "SCI:HYPOTHETICAL", "Generator A"));
	graph = addEvidenceNode(graph, node("gen-b", "MODEL", "SCI:HYPOTHETICAL", "Generator B"));
	graph = addEvidenceNode(graph, node("gen-c", "MODEL", "SCI:HYPOTHETICAL", "Generator C"));
	graph = addEvidenceNode(graph, node("reco-eta", "STATISTIC", "SCI:DERIVED", "dN/dη comparison"));
	graph = addEvidenceNode(graph, node("hadronic-constraint", "LIKELIHOOD", "SCI:INFERRED", `Least-disagreeing ${input.preferred}`));
	graph = addEvidenceNode(graph, node("air-shower", "EVENT", "SCI:SIMULATED", "Mapped air shower"));
	graph = addEvidenceNode(graph, node("source", "HYPOTHESIS", "SCI:HYPOTHETICAL", "Cosmic source"));
	graph = addEvidenceNode(graph, node("claim", "CLAIM", "SCI:REJECTED", "Discovery claim"));
	graph = addEvidenceEdge(graph, {
		id: "e1",
		from: "atlas-po-literature",
		to: "reco-eta",
		type: "CALIBRATED_BY",
		provenance: [input.packageHash],
		metadata: {}
	});
	graph = addEvidenceEdge(graph, {
		id: "e2",
		from: "sandbox-events",
		to: "reco-eta",
		type: "DERIVED_FROM",
		provenance: [],
		metadata: {}
	});
	graph = addEvidenceEdge(graph, {
		id: "e3",
		from: "gen-a",
		to: "hadronic-constraint",
		type: "PREDICTED_BY",
		provenance: [],
		metadata: {}
	});
	graph = addEvidenceEdge(graph, {
		id: "e4",
		from: "gen-b",
		to: "hadronic-constraint",
		type: "PREDICTED_BY",
		provenance: [],
		metadata: {}
	});
	graph = addEvidenceEdge(graph, {
		id: "e5",
		from: "gen-c",
		to: "hadronic-constraint",
		type: "PREDICTED_BY",
		provenance: [],
		metadata: {}
	});
	graph = addEvidenceEdge(graph, {
		id: "e6",
		from: "reco-eta",
		to: "hadronic-constraint",
		type: "TESTED_BY",
		provenance: [],
		metadata: { chi2: input.chi2 }
	});
	graph = addEvidenceEdge(graph, {
		id: "e7",
		from: "hadronic-constraint",
		to: "air-shower",
		type: "PREDICTED_BY",
		provenance: [],
		metadata: { mapping: "collider-constrains-shower-model" }
	});
	graph = addEvidenceEdge(graph, {
		id: "e8",
		from: "air-shower",
		to: "source",
		type: "DEPENDS_ON",
		provenance: [],
		metadata: {}
	});
	graph = addEvidenceEdge(graph, {
		id: "e9",
		from: "sandbox-events",
		to: "claim",
		type: "REJECTED_BY",
		provenance: ["simulation-cannot-support-claim"],
		metadata: {}
	});
	return graph;
}
function runUniversalLab(seed, systemId, generatorId, nEvents) {
	const rng = new RNG(seed);
	const system = campaignById(systemId);
	const gen = generatorById(generatorId);
	const n = Math.max(20, Math.min(500, Math.round(nEvents)));
	const sNN = sqrtSNN(system);
	const eta = {
		GEN_A: emptyHist(ETA_EDGES),
		GEN_B: emptyHist(ETA_EDGES),
		GEN_C: emptyHist(ETA_EDGES)
	};
	const nch = {
		GEN_A: emptyHist(NCH_EDGES),
		GEN_B: emptyHist(NCH_EDGES),
		GEN_C: emptyHist(NCH_EDGES)
	};
	const pt = {
		GEN_A: emptyHist(PT_EDGES),
		GEN_B: emptyHist(PT_EDGES),
		GEN_C: emptyHist(PT_EDGES)
	};
	const events = [];
	let geometry = sampleGlauber(system.projectile, system.target, .2, .4);
	for (const spec of GENERATORS) {
		const local = new RNG(seed + spec.id.charCodeAt(4) * 17);
		for (let i = 0; i < n; i++) {
			const g = sampleGlauber(system.projectile, system.target, local.next(), local.next());
			const ev = sampleNuclearEvent(local, system, spec, g);
			fillHist(nch[spec.id], ev.nCh);
			for (const tr of ev.tracks) {
				fillHist(eta[spec.id], tr.eta);
				fillHist(pt[spec.id], tr.pT);
			}
			if (spec.id === gen.id) {
				events.push(ev);
				if (i === n - 1) geometry = g;
			}
		}
	}
	const lit = literatureEta(ETA_EDGES, n);
	const tot = (h) => h.reduce((s, b) => s + b.observed, 0);
	const meanTot = (tot(eta.GEN_A) + tot(eta.GEN_B) + tot(eta.GEN_C)) / 3;
	const litTot = tot(lit);
	if (litTot > 0) {
		const scale = meanTot / litTot;
		for (const bin of lit) bin.observed *= scale;
	}
	const compare = {
		GEN_A: compareModelToData(lit, eta.GEN_A),
		GEN_B: compareModelToData(lit, eta.GEN_B),
		GEN_C: compareModelToData(lit, eta.GEN_C)
	};
	const chi2 = {
		GEN_A: chi2Ndf(compare.GEN_A, ATLAS_PO_LITERATURE.relativeUnc),
		GEN_B: chi2Ndf(compare.GEN_B, ATLAS_PO_LITERATURE.relativeUnc),
		GEN_C: chi2Ndf(compare.GEN_C, ATLAS_PO_LITERATURE.relativeUnc)
	};
	const preferredGenerator = Object.entries(chi2).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "GEN_A";
	const disagreement = modelDisagreement([
		eta.GEN_A,
		eta.GEN_B,
		eta.GEN_C
	]);
	const meanNch = events.reduce((s, e) => s + e.nCh, 0) / Math.max(1, events.length);
	const meanPT = events.reduce((s, e) => s + (e.nCh ? e.sumPT / e.nCh : 0), 0) / Math.max(1, events.length);
	const meanForwardGeV = events.reduce((s, e) => s + e.forwardEnergyGeV, 0) / Math.max(1, events.length);
	const primaryEnergyGeV = Math.max(1e5, sNN * 80);
	const shower = propagateCosmicRay(rng, generatorById(preferredGenerator), primaryEnergyGeV, 18);
	const nucleusA = generateNucleus(system.projectile, seed * .001);
	const nucleusB = generateNucleus(system.target, seed * .002 + 1);
	const aa = system.projectile !== "p" && system.target !== "p";
	const quench = aa ? Math.min(.35, .04 * geometry.nColl * .02) : 0;
	const heavyIon = {
		centrality: geometry.centrality,
		participantCount: geometry.nPart,
		binaryCollisionCount: geometry.nColl,
		chargedMultiplicity: meanNch,
		meanPt: meanPT,
		flow: aa ? Math.min(.12, .02 + geometry.centrality / 900) : 0,
		quenching: quench,
		qgpInterpretation: "MODEL_DEPENDENT"
	};
	const jet = {
		jetPtInitial: 80,
		jetPtFinal: 80 * (1 - quench),
		energyLoss: 80 * quench,
		referenceSystem: system.id === "OO" || system.id === "NeNe" || system.id === "PbPb" ? "p-p / p-O" : "none",
		interpretation: "DIAGNOSTIC"
	};
	const muonFrac = shower.muons / Math.max(1, shower.charged);
	const raw = [
		{
			id: "proton",
			likelihood: Math.exp(-((muonFrac - .18) ** 2) / .01)
		},
		{
			id: "helium",
			likelihood: Math.exp(-((muonFrac - .22) ** 2) / .012)
		},
		{
			id: "oxygen",
			likelihood: Math.exp(-((muonFrac - .28) ** 2) / .014)
		},
		{
			id: "iron",
			likelihood: Math.exp(-((muonFrac - .36) ** 2) / .02)
		}
	];
	const zsum = raw.reduce((s, h) => s + h.likelihood, 0);
	const composition = {
		hypotheses: raw.map((h) => ({
			...h,
			posterior: h.likelihood / zsum
		})),
		evidenceState: "INFERRED",
		warning: "Model-dependent inference. Shower observables are simulated. Composition is not observed."
	};
	const firewall = {
		observed: false,
		reconstructed: true,
		derived: true,
		simulated: true,
		inferred: true,
		hypothetical: true,
		discoveryEligible: false
	};
	const packageHash = hashObject({
		schema: "DHC-TWIN-v7",
		seed,
		system: system.id,
		generator: generatorId,
		n,
		sNN,
		preferredGenerator
	});
	const graph = assembleCosmicGraph({
		graphId: `dhc-v7-${seed}`,
		system: system.id,
		preferred: preferredGenerator,
		chi2: chi2[preferredGenerator],
		packageHash
	});
	const check = validateEvidenceGraph(graph);
	const ledger = ledgerFromGraph(graph, packageHash);
	const blockers = [
		"DATA_NOT_OBSERVED",
		"ATLAS_PO_IS_LITERATURE_CALIBRATION_NOT_THIS_TWINS_DATASET",
		"COLLIDER_EVENT_IS_NOT_AN_AIR_SHOWER",
		"GENERATOR_PREFERENCE_IS_NOT_A_HADRONIC_DISCOVERY",
		"SOURCE_INFERENCE_IS_HYPOTHETICAL",
		"TWIN_IS_NOT_THE_LHC",
		"QGP_INTERPRETATION_IS_MODEL_DEPENDENT",
		"SYNTHETIC_DATA_CANNOT_SUPPORT_DISCOVERY"
	];
	if (!check.valid) blockers.push(...check.errors.slice(0, 4));
	return {
		schema: "DHC-TWIN-v7",
		system,
		sqrtSNNGeV: sNN,
		sqrtSNNTeV: sNN / 1e3,
		generator: generatorId,
		events,
		last: events[events.length - 1] ?? null,
		meanNch,
		meanPT,
		meanForwardGeV,
		eta,
		nch,
		pt,
		literatureEta: lit,
		compare,
		disagreement,
		chi2,
		preferredGenerator,
		shower,
		nucleusA,
		nucleusB,
		geometry,
		heavyIon,
		jet,
		composition,
		atmosphere: ATMOSPHERE,
		forward: FORWARD,
		literature: ATLAS_PO_LITERATURE,
		graph,
		ledger,
		graphErrors: check.errors,
		firewall,
		packageHash,
		blockers,
		discoveryGate: false,
		state: "SCI:SIMULATED"
	};
}
//#endregion
export { GENERATORS as n, runUniversalLab as r, CAMPAIGNS as t };
