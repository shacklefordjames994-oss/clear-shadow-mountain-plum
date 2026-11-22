import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, t as Badge } from "./badge-uyEFEQwD.mjs";
import { n as Panel, r as Stat, t as PageHeader } from "./panel-GIo8_dlm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/synthesis-D6bm2mo6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function configurationPreview(domain, population, energy, seed) {
	return {
		schema: "SIMULATION_PLATFORM_V1",
		status: "NOT_EXECUTED",
		domain,
		population: clampInt(population, 1, 1e3),
		energy,
		seed: seed >>> 0,
		gaussianSolver: "UNTOUCHED",
		externalAdapters: [
			"Pythia",
			"Geant4",
			"ROOT",
			"LAMMPS"
		],
		adaptersInstalled: false
	};
}
var TOY_LIMITS = {
	momentumGeV: [0, 1e4],
	massGeV: [0, 1e3],
	bindingGeV: [0, 10],
	thresholdGeV: [0, 10],
	charge: [-5, 5],
	events: [1, 1e3],
	temperatureK: [1, 5e3],
	barrierEV: [0, 5],
	precursorMolar: [0, 10],
	timeMin: [0, 1e4],
	samples: [1, 1e3]
};
function runCollision(params) {
	const problem = collisionInputProblem(params);
	if (problem) return emptyCollision(problem);
	const rand = mulberry32(params.seed);
	const count = params.events;
	const momentum = Math.max(0, params.beamMomentumGeV);
	const massA = Math.max(0, params.massAGeV);
	const massB = Math.max(0, params.massBGeV);
	const cmEnergy = Math.hypot(momentum, massA) + Math.hypot(momentum, massB);
	const available = cmEnergy - massA - massB;
	const charge = params.chargeA + params.chargeB;
	const chargeAllowed = Math.abs(charge - Math.round(charge)) < 1e-6;
	const events = [];
	for (let id = 0; id < count; id += 1) {
		const angle = rand() * Math.PI * 2;
		if (available > params.thresholdGeV && chargeAllowed && rand() < .4) {
			const binding = Math.min(Math.max(0, params.bindingGeV), available * .5);
			const productMass = Math.max(1e-6, massA + massB - binding);
			const spark = (cmEnergy * cmEnergy - productMass * productMass) / (2 * cmEnergy);
			const productEnergy = cmEnergy - spark;
			const px = spark * Math.cos(angle);
			const py = spark * Math.sin(angle);
			events.push({
				id,
				evidence: "SIMULATED",
				channel: "SYNTHESIS",
				cmEnergyGeV: cmEnergy,
				energyResidualGeV: cmEnergy - (productEnergy + spark),
				momentumResidualGeV: Math.hypot(px + -px, py + -py),
				productMassGeV: productMass,
				pxGeV: px,
				pyGeV: py
			});
			continue;
		}
		events.push({
			id,
			evidence: "SIMULATED",
			channel: available <= 0 ? "FORBIDDEN" : "ELASTIC",
			cmEnergyGeV: cmEnergy,
			energyResidualGeV: 0,
			momentumResidualGeV: 0,
			productMassGeV: null,
			pxGeV: momentum * Math.cos(angle),
			pyGeV: momentum * Math.sin(angle)
		});
	}
	return {
		domain: "COLLISION",
		evidence: "SIMULATED",
		events,
		synthesisFraction: events.filter((event) => event.channel === "SYNTHESIS").length / events.length,
		meanEnergyResidualGeV: mean$1(events.map((event) => event.energyResidualGeV)),
		meanMomentumResidualGeV: mean$1(events.map((event) => event.momentumResidualGeV)),
		units: {
			synthesisFraction: "1",
			meanEnergyResidualGeV: "GeV"
		},
		inputStatus: "ACCEPTED",
		rejection: null
	};
}
function runMaterials(params) {
	const problem = materialsInputProblem(params);
	if (problem) return emptyMaterials(problem);
	const rand = mulberry32(params.seed + 101);
	const count = params.samples;
	const thermal = .15 + Math.max(0, params.temperatureK) / 2e3;
	const nucleation = Math.min(.9, Math.exp(-Math.max(0, params.barrierEV) / thermal) * Math.max(0, params.precursorMolar) * 2);
	const diameters = [];
	let nucleated = 0;
	for (let index = 0; index < count; index += 1) {
		if (rand() > Math.min(.95, nucleation)) {
			diameters.push(0);
			continue;
		}
		nucleated += 1;
		diameters.push(Math.sqrt(Math.max(0, params.timeMin)) * (.6 + rand()) * (1 + nucleation));
	}
	const formed = diameters.filter((value) => value > 0);
	const meanDiameter = formed.length ? mean$1(formed) : 0;
	const variance = formed.length ? mean$1(formed.map((value) => (value - meanDiameter) ** 2)) : 0;
	return {
		domain: "MATERIALS",
		evidence: "SIMULATED",
		diametersNm: diameters,
		meanDiameterNm: meanDiameter,
		stdDiameterNm: Math.sqrt(variance),
		nucleatedFraction: nucleated / count,
		massBalanceResidual: 0,
		units: {
			meanDiameterNm: "nm",
			nucleatedFraction: "1"
		},
		inputStatus: "ACCEPTED",
		rejection: null
	};
}
function compareToObservation(sim, observation) {
	if (observation.domain !== sim.domain) return {
		status: "NONCOMPARABLE",
		reason: "Collision and materials results do not share a domain."
	};
	if (observation.quantity !== sim.quantity || observation.units !== sim.units) return {
		status: "NONCOMPARABLE",
		reason: "Quantity or units differ. GeV is not compared with nm or K."
	};
	const residual = sim.value - observation.value;
	const uncertainty = observation.provenance.uncertainty;
	return {
		status: "DERIVED",
		residual,
		pull: uncertainty > 0 ? residual / uncertainty : null
	};
}
function parseObservations(text) {
	const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
	const errors = [];
	const rows = [];
	if (!lines.length) return {
		rows,
		errors: ["The file is empty."]
	};
	const header = lines[0].split(",").map((cell) => cell.trim());
	const expected = [
		"evidence",
		"domain",
		"quantity",
		"value",
		"uncertainty",
		"units",
		"source",
		"timestamp",
		"provenance"
	];
	if (expected.some((name, index) => header[index] !== name)) return {
		rows,
		errors: [`Header must be ${expected.join(",")}.`]
	};
	for (let index = 1; index < lines.length; index += 1) {
		const cells = lines[index].split(",").map((cell) => cell.trim());
		if (cells.length < 9) {
			errors.push(`Row ${index + 1} is short.`);
			continue;
		}
		if (cells[0] !== "OBSERVED") {
			errors.push(`Row ${index + 1} is ${cells[0] || "blank"}, not OBSERVED, so it was not imported.`);
			continue;
		}
		if (cells[1] !== "COLLISION" && cells[1] !== "MATERIALS") {
			errors.push(`Row ${index + 1} has an unknown domain.`);
			continue;
		}
		if (cells[5] === "") {
			errors.push(`Row ${index + 1} has no units.`);
			continue;
		}
		const value = Number(cells[3]);
		const uncertainty = Number(cells[4]);
		if (!Number.isFinite(value) || !Number.isFinite(uncertainty) || uncertainty < 0) {
			errors.push(`Row ${index + 1} has a bad value or uncertainty.`);
			continue;
		}
		const key = `${cells[1]}|${cells[2]}|${cells[6]}|${cells[7]}`;
		if (rows.some((row) => `${row.domain}|${row.quantity}|${row.provenance.source}|${row.provenance.timestamp}` === key)) {
			errors.push(`Row ${index + 1} duplicates an imported record.`);
			continue;
		}
		rows.push({
			evidence: "OBSERVED",
			domain: cells[1],
			quantity: cells[2],
			value,
			units: cells[5],
			provenance: {
				source: cells[6],
				timestamp: cells[7],
				uncertainty,
				note: cells[8]
			}
		});
	}
	return {
		rows,
		errors
	};
}
function mulberry32(seed) {
	let state = seed >>> 0;
	return () => {
		state = state + 1831565813 >>> 0;
		let next = Math.imul(state ^ state >>> 15, 1 | state);
		next = next + Math.imul(next ^ next >>> 7, 61 | next) ^ next;
		return ((next ^ next >>> 14) >>> 0) / 4294967296;
	};
}
function mean$1(values) {
	if (!values.length) return 0;
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}
function clampInt(value, lo, hi) {
	return Math.max(lo, Math.min(hi, Math.round(value)));
}
function inRange(value, bounds) {
	return Number.isFinite(value) && value >= bounds[0] && value <= bounds[1];
}
function collisionInputProblem(params) {
	if (!Number.isFinite(params.seed)) return "SEED";
	if (!Number.isInteger(params.events) || !inRange(params.events, TOY_LIMITS.events)) return "EVENT_COUNT";
	if (!inRange(params.beamMomentumGeV, TOY_LIMITS.momentumGeV)) return "MOMENTUM";
	if (!inRange(params.massAGeV, TOY_LIMITS.massGeV) || !inRange(params.massBGeV, TOY_LIMITS.massGeV)) return "MASS";
	if (!inRange(params.bindingGeV, TOY_LIMITS.bindingGeV)) return "BINDING";
	if (!inRange(params.thresholdGeV, TOY_LIMITS.thresholdGeV)) return "THRESHOLD";
	if (!inRange(params.chargeA, TOY_LIMITS.charge) || !inRange(params.chargeB, TOY_LIMITS.charge)) return "CHARGE";
	return null;
}
function materialsInputProblem(params) {
	if (!Number.isFinite(params.seed)) return "SEED";
	if (!Number.isInteger(params.samples) || !inRange(params.samples, TOY_LIMITS.samples)) return "SAMPLE_COUNT";
	if (!inRange(params.temperatureK, TOY_LIMITS.temperatureK)) return "TEMPERATURE";
	if (!inRange(params.barrierEV, TOY_LIMITS.barrierEV)) return "BARRIER";
	if (!inRange(params.precursorMolar, TOY_LIMITS.precursorMolar)) return "PRECURSOR";
	if (!inRange(params.timeMin, TOY_LIMITS.timeMin)) return "TIME";
	return null;
}
function emptyCollision(rejection) {
	return {
		domain: "COLLISION",
		evidence: "SIMULATED",
		events: [],
		synthesisFraction: 0,
		meanEnergyResidualGeV: 0,
		meanMomentumResidualGeV: 0,
		units: {
			synthesisFraction: "1",
			meanEnergyResidualGeV: "GeV"
		},
		inputStatus: "REJECTED",
		rejection
	};
}
function emptyMaterials(rejection) {
	return {
		domain: "MATERIALS",
		evidence: "SIMULATED",
		diametersNm: [],
		meanDiameterNm: 0,
		stdDiameterNm: 0,
		nucleatedFraction: 0,
		massBalanceResidual: 0,
		units: {
			meanDiameterNm: "nm",
			nucleatedFraction: "1"
		},
		inputStatus: "REJECTED",
		rejection
	};
}
var PEAK = 50;
function monteCarloComparison(seed, samples) {
	const count = Math.max(16, Math.min(4e3, Math.round(samples)));
	const analytic = Math.sqrt(Math.PI / PEAK) * erf(Math.sqrt(PEAK) / 2);
	const rand = mulberry32(seed);
	return {
		analytic,
		estimates: [
			crude(rand, count),
			antithetic(rand, count),
			stratified(rand, count, 8),
			importance(rand, count),
			vanDerCorput(count)
		],
		notInstalled: [
			"VEGAS",
			"VEGAS+",
			"MISER",
			"Sobol",
			"multi-channel",
			"cuVegas"
		]
	};
}
function integrand(x) {
	const shifted = x - .5;
	return Math.exp(-50 * shifted * shifted);
}
function crude(rand, count) {
	return finish("CRUDE", Array.from({ length: count }, () => integrand(rand())), count, "Uniform samples on [0, 1]. The error bar is the sample standard deviation over sqrt(N).");
}
function antithetic(rand, count) {
	const pairs = Math.floor(count / 2);
	const values = [];
	for (let index = 0; index < pairs; index += 1) {
		const draw = rand();
		values.push((integrand(draw) + integrand(1 - draw)) / 2);
	}
	return finish("ANTITHETIC", values, pairs * 2, "Each draw is paired with its reflection. The pair is the sample, so the error bar is not the crude one.");
}
function stratified(rand, count, bins) {
	const perBin = Math.floor(count / bins);
	const means = [];
	let variance = 0;
	for (let bin = 0; bin < bins; bin += 1) {
		const local = [];
		for (let index = 0; index < perBin; index += 1) local.push(integrand((bin + rand()) / bins));
		const mid = mean(local);
		means.push(mid / bins);
		variance += varianceOf(local) / (bins * bins * perBin);
	}
	const estimate = means.reduce((sum, value) => sum + value, 0);
	return {
		method: "STRATIFIED",
		estimate,
		error: Math.abs(estimate - analyticValue()),
		standardError: Math.sqrt(variance),
		samples: perBin * bins,
		note: "Eight equal strata. The error bar uses only within-stratum variance."
	};
}
function importance(rand, count) {
	const weights = [];
	let draws = 0;
	while (weights.length < count && draws < count * 20) {
		draws += 1;
		const x = rand();
		if (rand() > 4 * x * (1 - x)) continue;
		const density = 6 * x * (1 - x);
		if (density < 1e-12) continue;
		weights.push(integrand(x) / density);
	}
	return finish("IMPORTANCE", weights, weights.length, "Proposal is Beta(2, 2), chosen because the peak is at 0.5. Weights are f/g.");
}
function vanDerCorput(count) {
	const estimate = mean(Array.from({ length: count }, (_, index) => integrand(radicalInverse(index + 1, 2))));
	return {
		method: "VAN_DER_CORPUT",
		estimate,
		error: Math.abs(estimate - analyticValue()),
		standardError: null,
		samples: count,
		note: "Deterministic base-2 low-discrepancy points. A 1/sqrt(N) error bar does not apply."
	};
}
function finish(method, values, samples, note) {
	const estimate = mean(values);
	const standardError = values.length > 1 ? Math.sqrt(varianceOf(values) / values.length) : null;
	return {
		method,
		estimate,
		error: Math.abs(estimate - analyticValue()),
		standardError,
		samples,
		note
	};
}
function analyticValue() {
	return Math.sqrt(Math.PI / PEAK) * erf(Math.sqrt(PEAK) / 2);
}
function radicalInverse(index, base) {
	let result = 0;
	let factor = 1 / base;
	let current = index;
	while (current > 0) {
		result += current % base * factor;
		current = Math.floor(current / base);
		factor /= base;
	}
	return result;
}
function mean(values) {
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}
function varianceOf(values) {
	const mid = mean(values);
	return values.reduce((sum, value) => sum + (value - mid) ** 2, 0) / (values.length - 1);
}
function erf(x) {
	const sign = x < 0 ? -1 : 1;
	const t = 1 / (1 + .3275911 * Math.abs(x));
	return sign * (1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-x * x));
}
var PREREGISTERED_KS_D_MAX = .2;
var BASE = {
	seed: 7,
	beamMomentumGeV: 10,
	massAGeV: .938,
	massBGeV: .938,
	chargeA: 1,
	chargeB: -1,
	thresholdGeV: .2,
	bindingGeV: .05,
	events: 200
};
function runSynthesisProtocol() {
	const cases = [
		domainWall(),
		domainUnits(),
		repeatSameSeed(),
		differentSeed(),
		prefixStable(),
		energyIdentity(),
		massIdentity(),
		chargeBlocked(),
		cmEnergyIndependent(),
		elasticMomentum(),
		csvRejected(),
		hashMismatch(),
		propertyInvariants(),
		adversarialInputs(),
		ksStatistic(),
		referenceAbsent(),
		experimentAbsent()
	];
	const sampling = sampleEstimate();
	const internalIds = /* @__PURE__ */ new Set(["energy-identity", "mass-identity"]);
	const numericalIds = /* @__PURE__ */ new Set([
		"domain-wall",
		"domain-units",
		"repeat-seed",
		"different-seed",
		"prefix-stable",
		"charge-blocked",
		"cm-energy",
		"elastic-momentum",
		"property-invariants",
		"adversarial-inputs",
		"ks-statistic"
	]);
	return {
		protocol: "SYNTHESIS_VALIDATION_PROTOCOL_V1_1",
		release: "NOT_CERTIFIED",
		gaussianSolver: "UNTOUCHED",
		github: "NO_CHANGES",
		cases,
		gates: {
			internalConsistency: cases.filter((item) => internalIds.has(item.id)).every((item) => item.status === "PASS"),
			numericalValidation: cases.filter((item) => numericalIds.has(item.id)).every((item) => item.status === "PASS"),
			referenceDataAgreement: false,
			experimentalValidation: false
		},
		uncertainty: {
			sampling,
			numericalTolerance: "1e-9",
			modelUncertainty: "NOT_QUANTIFIED",
			parameterUncertainty: "NOT_ESTABLISHED",
			measurementUncertainty: "ABSENT",
			experimentalUncertainty: "NOT_AVAILABLE"
		},
		manifest: {
			configuration: BASE,
			seed: BASE.seed,
			datasetHash: null,
			preregisteredKsDMax: PREREGISTERED_KS_D_MAX,
			sourceFingerprint: fingerprint(JSON.stringify(BASE)),
			software: "synthesis-lab 1.1"
		}
	};
}
function domainWall() {
	const collision = runCollision(BASE);
	const materials = runMaterials({
		seed: 3,
		temperatureK: 500,
		precursorMolar: .4,
		timeMin: 30,
		barrierEV: .2,
		samples: 40
	});
	const isolated = compareToObservation({
		domain: collision.domain,
		quantity: "synthesisFraction",
		units: "1",
		value: collision.synthesisFraction
	}, {
		evidence: "OBSERVED",
		domain: materials.domain,
		quantity: "meanDiameterNm",
		value: materials.meanDiameterNm,
		units: "nm",
		provenance: {
			source: "protocol",
			timestamp: "2026-01-01T00:00:00Z",
			uncertainty: .1,
			note: "fixture"
		}
	}).status === "NONCOMPARABLE";
	return {
		id: "domain-wall",
		status: isolated ? "PASS" : "FAIL",
		highestGate: isolated ? "NUMERICAL_VALIDATION_PASS" : "NONE",
		detail: isolated ? "A collision fraction was not compared with a materials diameter." : "Domain wall failed."
	};
}
function domainUnits() {
	const collision = runCollision(BASE);
	const materials = runMaterials({
		seed: 3,
		temperatureK: 500,
		precursorMolar: .4,
		timeMin: 30,
		barrierEV: .2,
		samples: 40
	});
	const ok = collision.units.meanEnergyResidualGeV === "GeV" && materials.units.meanDiameterNm === "nm";
	return {
		id: "domain-units",
		status: ok ? "PASS" : "FAIL",
		highestGate: ok ? "NUMERICAL_VALIDATION_PASS" : "NONE",
		detail: ok ? "Collision stays in GeV. Materials stay in nm." : "Unit labels crossed."
	};
}
function repeatSameSeed() {
	const left = runCollision(BASE);
	const right = runCollision(BASE);
	const same = left.events.every((event, index) => event.channel === right.events[index]?.channel && event.pxGeV === right.events[index]?.pxGeV);
	return {
		id: "repeat-seed",
		status: same ? "PASS" : "FAIL",
		highestGate: same ? "NUMERICAL_VALIDATION_PASS" : "NONE",
		detail: same ? "Seed 7 repeated the same 200 channels and momenta." : "Same seed diverged."
	};
}
function differentSeed() {
	const left = runCollision(BASE);
	const right = runCollision({
		...BASE,
		seed: 8
	});
	const changed = left.events.some((event, index) => event.channel !== right.events[index]?.channel || event.pxGeV !== right.events[index]?.pxGeV);
	return {
		id: "different-seed",
		status: changed ? "PASS" : "FAIL",
		highestGate: changed ? "NUMERICAL_VALIDATION_PASS" : "NONE",
		detail: changed ? "Seed 8 changed the sequence." : "A different seed reproduced the same sequence."
	};
}
function prefixStable() {
	const short = runCollision({
		...BASE,
		events: 40
	});
	const long = runCollision(BASE);
	const same = short.events.every((event, index) => event.channel === long.events[index]?.channel && event.pxGeV === long.events[index]?.pxGeV);
	return {
		id: "prefix-stable",
		status: same ? "PASS" : "FAIL",
		highestGate: same ? "NUMERICAL_VALIDATION_PASS" : "NONE",
		detail: same ? "The first 40 events match the longer run." : "Event count changed earlier draws."
	};
}
function energyIdentity() {
	const run = runCollision(BASE);
	const closed = Math.abs(run.meanEnergyResidualGeV) === 0 && Math.abs(run.meanMomentumResidualGeV) === 0;
	return {
		id: "energy-identity",
		status: closed ? "PASS" : "FAIL",
		highestGate: closed ? "INTERNAL_CONSISTENCY_PASS" : "NONE",
		detail: closed ? "Residuals are zero because the outgoing energies are built from the same sum. This is not an independent conservation proof." : "The internal residual identity failed."
	};
}
function massIdentity() {
	const closed = runMaterials({
		seed: 3,
		temperatureK: 500,
		precursorMolar: .4,
		timeMin: 30,
		barrierEV: .2,
		samples: 40
	}).massBalanceResidual === 0;
	return {
		id: "mass-identity",
		status: closed ? "PASS" : "FAIL",
		highestGate: closed ? "INTERNAL_CONSISTENCY_PASS" : "NONE",
		detail: closed ? "The mass residual is defined to be zero. It does not weigh a sample." : "The accounting identity was not zero."
	};
}
function chargeBlocked() {
	const run = runCollision({
		...BASE,
		chargeA: .2,
		chargeB: .3,
		events: 120
	});
	const blocked = run.synthesisFraction === 0 && run.events.every((event) => event.channel !== "SYNTHESIS");
	return {
		id: "charge-blocked",
		status: blocked ? "PASS" : "FAIL",
		highestGate: blocked ? "NUMERICAL_VALIDATION_PASS" : "NONE",
		detail: blocked ? "Non-integer charge produced no synthesis channel." : "Synthesis ran without an integer charge sum."
	};
}
function cmEnergyIndependent() {
	const run = runCollision(BASE);
	const expected = Math.hypot(BASE.beamMomentumGeV, BASE.massAGeV) + Math.hypot(BASE.beamMomentumGeV, BASE.massBGeV);
	const matched = run.events.every((event) => Math.abs(event.cmEnergyGeV - expected) < 1e-9);
	return {
		id: "cm-energy",
		status: matched ? "PASS" : "FAIL",
		highestGate: matched ? "NUMERICAL_VALIDATION_PASS" : "NONE",
		detail: matched ? "Stored CM energy matches an outside hypot sum within 1e-9." : "CM energy disagreed with the outside sum."
	};
}
function elasticMomentum() {
	const elastic = runCollision(BASE).events.filter((event) => event.channel === "ELASTIC");
	const matched = elastic.length > 0 && elastic.every((event) => Math.abs(Math.hypot(event.pxGeV, event.pyGeV) - BASE.beamMomentumGeV) < 1e-9);
	return {
		id: "elastic-momentum",
		status: matched ? "PASS" : "FAIL",
		highestGate: matched ? "NUMERICAL_VALIDATION_PASS" : "NONE",
		detail: matched ? "Elastic momenta match the beam momentum within 1e-9." : "Elastic momentum check failed."
	};
}
function csvRejected() {
	const held = [
		"",
		"wrong,header",
		"evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance\nOBSERVED,COLLISION,synthesisFraction,0.2,0.1,,fixture,2026-01-01T00:00:00Z,blank-units",
		"evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance\nOBSERVED,COLLISION,synthesisFraction,NaN,0.1,1,fixture,2026-01-01T00:00:00Z,bad",
		"evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance\nOBSERVED,COLLISION,synthesisFraction,0.2,-1,1,fixture,2026-01-01T00:00:00Z,bad",
		"evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance\nSIMULATED,COLLISION,synthesisFraction,0.2,0.1,1,fixture,2026-01-01T00:00:00Z,class"
	].every((sample) => {
		const parsed = parseObservations(sample);
		return parsed.rows.length === 0 && parsed.errors.length > 0;
	});
	const duplicate = parseObservations("evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance\nOBSERVED,COLLISION,synthesisFraction,0.2,0.1,1,fixture,2026-01-01T00:00:00Z,a\nOBSERVED,COLLISION,synthesisFraction,0.3,0.1,1,fixture,2026-01-01T00:00:00Z,b");
	const duplicateHeld = duplicate.rows.length === 1 && duplicate.errors.some((error) => error.includes("duplicates"));
	const ok = held && duplicateHeld;
	return {
		id: "csv-rejected",
		status: ok ? "PASS" : "FAIL",
		highestGate: "NONE",
		detail: ok ? "Empty, bad header, blank units, nonfinite, negative uncertainty, and non-OBSERVED rows were refused. The duplicate was not imported." : "A bad row was imported."
	};
}
function hashMismatch() {
	const actual = fingerprint("evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance");
	const detected = actual !== "deadbeef";
	return {
		id: "hash-mismatch",
		status: detected ? "PASS" : "FAIL",
		highestGate: "NONE",
		detail: detected ? `Claimed hash deadbeef does not match fingerprint ${actual}. The source text was not rewritten.` : "Hash check failed."
	};
}
function referenceAbsent() {
	return {
		id: "reference-data",
		status: "NOT_RUN",
		highestGate: "NONE",
		detail: `Catalog is empty. The KS bound ${PREREGISTERED_KS_D_MAX} was fixed before any dataset. A synthetic file cannot open this gate.`
	};
}
function experimentAbsent() {
	return {
		id: "experiment",
		status: "NOT_RUN",
		highestGate: "NONE",
		detail: "No instrument is connected. A simulation cannot pass experimental validation."
	};
}
function sampleEstimate() {
	const values = Array.from({ length: 32 }, (_, index) => runCollision({
		...BASE,
		seed: index + 1,
		events: 80
	}).synthesisFraction);
	const stdAt16 = standardDeviation(values.slice(0, 16));
	const stdAt32 = standardDeviation(values);
	const ordered = [...values].sort((left, right) => left - right);
	return {
		count: values.length,
		mean: ordered.reduce((sum, value) => sum + value, 0) / ordered.length,
		standardDeviation: stdAt32,
		quantile05: quantile(ordered, .05),
		quantile50: quantile(ordered, .5),
		quantile95: quantile(ordered, .95),
		stdAt16,
		stdAt32,
		confidenceInterval: null
	};
}
function propertyInvariants() {
	const draw = mulberry(4401);
	let failures = 0;
	for (let index = 0; index < 24; index += 1) {
		const run = runCollision({
			seed: index + 1,
			beamMomentumGeV: draw() * 20,
			massAGeV: draw() * 2,
			massBGeV: draw() * 2,
			chargeA: Math.round(draw() * 4) - 2,
			chargeB: Math.round(draw() * 4) - 2,
			thresholdGeV: draw(),
			bindingGeV: draw(),
			events: 12 + Math.floor(draw() * 20)
		});
		const ids = new Set(run.events.map((event) => event.id));
		const finite = run.events.every((event) => Number.isFinite(event.cmEnergyGeV) && Number.isFinite(event.pxGeV) && Number.isFinite(event.pyGeV));
		if (run.inputStatus !== "ACCEPTED" || !finite || ids.size !== run.events.length || run.synthesisFraction < 0 || run.synthesisFraction > 1) failures += 1;
	}
	const invalid = runCollision({
		...BASE,
		beamMomentumGeV: NaN
	});
	const ok = failures === 0 && invalid.inputStatus === "REJECTED";
	return {
		id: "property-invariants",
		status: ok ? "PASS" : "FAIL",
		highestGate: ok ? "NUMERICAL_VALIDATION_PASS" : "NONE",
		detail: ok ? "24 random configurations stayed finite, unique, and inside the fraction bounds. A NaN momentum was rejected." : `${failures} random configurations broke an invariant.`
	};
}
function adversarialInputs() {
	const collisions = [
		runCollision({
			...BASE,
			beamMomentumGeV: Number.POSITIVE_INFINITY
		}),
		runCollision({
			...BASE,
			beamMomentumGeV: Number.MAX_VALUE
		}),
		runCollision({
			...BASE,
			massAGeV: NaN
		}),
		runCollision({
			...BASE,
			events: 0
		}),
		runCollision({
			...BASE,
			events: -4
		}),
		runCollision({
			...BASE,
			events: 0xe8d4a51000
		}),
		runCollision({
			...BASE,
			thresholdGeV: Number.NEGATIVE_INFINITY
		})
	];
	const materials = [runMaterials({
		seed: 1,
		temperatureK: 0,
		precursorMolar: .2,
		timeMin: 10,
		barrierEV: .2,
		samples: 10
	}), runMaterials({
		seed: NaN,
		temperatureK: 400,
		precursorMolar: -1,
		timeMin: 10,
		barrierEV: .2,
		samples: 10
	})];
	const underflow = runCollision({
		...BASE,
		beamMomentumGeV: 1e-12,
		events: 8
	});
	const boundary = runCollision({
		...BASE,
		beamMomentumGeV: 0,
		events: 8
	});
	const ids = new Set(boundary.events.map((event) => event.id));
	const ok = collisions.every((run) => run.inputStatus === "REJECTED" && run.events.length === 0) && materials.every((run) => run.inputStatus === "REJECTED" && run.diametersNm.length === 0) && underflow.inputStatus === "ACCEPTED" && boundary.inputStatus === "ACCEPTED" && ids.size === boundary.events.length;
	return {
		id: "adversarial-inputs",
		status: ok ? "PASS" : "FAIL",
		highestGate: ok ? "NUMERICAL_VALIDATION_PASS" : "NONE",
		detail: ok ? "Overflow, nonfinite values, empty and huge counts, and a negative precursor were rejected. Zero and 1e-12 GeV stayed finite. Event ids were unique." : "An extreme input was accepted or produced a duplicate id."
	};
}
function ksStatistic() {
	const sample = [
		.1,
		.4,
		.4,
		.9
	];
	const same = kolmogorovSmirnovD(sample, sample) === 0;
	const apart = kolmogorovSmirnovD(sample, [
		10,
		11,
		12,
		13
	]) > PREREGISTERED_KS_D_MAX;
	const ok = same && apart;
	return {
		id: "ks-statistic",
		status: ok ? "PASS" : "FAIL",
		highestGate: ok ? "NUMERICAL_VALIDATION_PASS" : "NONE",
		detail: ok ? `The KS function returns 0 on identical samples and exceeds the preregistered ${PREREGISTERED_KS_D_MAX} on a separated pair. That does not bind a reference dataset.` : "The KS function failed its self-check."
	};
}
function kolmogorovSmirnovD(left, right) {
	const points = [...left, ...right].sort((a, b) => a - b);
	let gap = 0;
	for (const point of points) {
		const leftCdf = left.filter((value) => value <= point).length / left.length;
		const rightCdf = right.filter((value) => value <= point).length / right.length;
		gap = Math.max(gap, Math.abs(leftCdf - rightCdf));
	}
	return gap;
}
function standardDeviation(values) {
	const mid = values.reduce((sum, value) => sum + value, 0) / values.length;
	return Math.sqrt(values.reduce((sum, value) => sum + (value - mid) ** 2, 0) / values.length);
}
function quantile(sorted, probability) {
	return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(probability * sorted.length) - 1))] ?? 0;
}
function mulberry(seed) {
	let state = seed >>> 0;
	return () => {
		state = state + 1831565813 >>> 0;
		let next = Math.imul(state ^ state >>> 15, 1 | state);
		next = next + Math.imul(next ^ next >>> 7, 61 | next) ^ next;
		return ((next ^ next >>> 14) >>> 0) / 4294967296;
	};
}
function fingerprint(text) {
	let hash = 2166136261;
	for (let index = 0; index < text.length; index += 1) {
		hash ^= text.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(16).padStart(8, "0");
}
var CSV_HEADER = "evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance";
function SynthesisPage() {
	const [domain, setDomain] = (0, import_react.useState)("COLLISION");
	const [population, setPopulation] = (0, import_react.useState)(240);
	const [energy, setEnergy] = (0, import_react.useState)(10);
	const [seed, setSeed] = (0, import_react.useState)(7);
	const [temperature, setTemperature] = (0, import_react.useState)(450);
	const [barrier, setBarrier] = (0, import_react.useState)(.35);
	const [minutes, setMinutes] = (0, import_react.useState)(20);
	const [collision, setCollision] = (0, import_react.useState)(null);
	const [materials, setMaterials] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)(0);
	const [observations, setObservations] = (0, import_react.useState)([]);
	const [importNote, setImportNote] = (0, import_react.useState)("No measured file loaded. A template is not an observation.");
	const [fingerprint, setFingerprint] = (0, import_react.useState)(null);
	const [protocol, setProtocol] = (0, import_react.useState)(null);
	const comparison = (0, import_react.useMemo)(() => monteCarloComparison(seed, 480), [seed]);
	const preview = configurationPreview(domain, population, domain === "COLLISION" ? energy : temperature, seed);
	const executed = domain === "COLLISION" ? collision : materials;
	const comparisons = (0, import_react.useMemo)(() => {
		if (!executed) return [];
		const sim = executed.domain === "COLLISION" ? {
			domain: executed.domain,
			quantity: "synthesisFraction",
			units: "1",
			value: executed.synthesisFraction
		} : {
			domain: executed.domain,
			quantity: "meanDiameterNm",
			units: "nm",
			value: executed.meanDiameterNm
		};
		return observations.map((observation) => ({
			observation,
			result: compareToObservation(sim, observation)
		}));
	}, [executed, observations]);
	function clearRun() {
		setCollision(null);
		setMaterials(null);
		setSelected(0);
	}
	function execute() {
		if (domain === "COLLISION") {
			const run = runCollision({
				seed,
				beamMomentumGeV: energy,
				massAGeV: .938,
				massBGeV: .938,
				chargeA: 1,
				chargeB: -1,
				thresholdGeV: .2,
				bindingGeV: .05,
				events: population
			});
			setCollision(run);
			setMaterials(null);
		} else {
			const run = runMaterials({
				seed,
				temperatureK: temperature,
				precursorMolar: .25,
				timeMin: minutes,
				barrierEV: barrier,
				samples: population
			});
			setMaterials(run);
			setCollision(null);
		}
		setSelected(0);
	}
	async function onFile(file) {
		const text = await file.text();
		const parsed = parseObservations(text);
		const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
		const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
		setFingerprint(hash);
		setObservations(parsed.rows);
		setImportNote(parsed.errors.length ? `${parsed.rows.length} observed rows kept. ${parsed.errors[0]}` : `${parsed.rows.length} observed rows imported. The file was not rewritten.`);
	}
	const event = collision?.events[selected];
	const bars = histogram(domain === "COLLISION" ? collision?.events.map((item) => item.pxGeV) ?? [] : materials?.diametersNm ?? []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				kicker: "Simulation platform v1",
				title: "Particle synthesis",
				description: "Two domain engines. Collision kinematics stay in GeV. Materials growth stays in nm, K, and eV. Neither result is a measurement, and neither touches the Gaussian eigenvalue solver."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Status",
						value: executed ? "SIMULATED" : "NOT EXECUTED",
						hint: executed ? "Seeded run in this browser." : "Configuration only."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Domain",
						value: domain === "COLLISION" ? "Particle physics" : "Materials",
						hint: "Engines do not share a state."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Gaussian solver",
						value: "Untouched",
						hint: "Archived energy is not an input."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Workbench",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: executed ? "info" : "warn",
					children: executed ? "SIMULATED" : preview.status
				}),
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: execute,
					children: executed ? "Run again" : "Run domain engine"
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								active: domain === "COLLISION",
								onClick: () => {
									setDomain("COLLISION");
									clearRun();
								},
								children: "Particle physics"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								active: domain === "MATERIALS",
								onClick: () => {
									setDomain("MATERIALS");
									clearRun();
								},
								children: "Materials"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Population",
									value: population,
									min: 1,
									max: 1e3,
									step: 1,
									onChange: (value) => {
										setPopulation(value);
										clearRun();
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Seed",
									value: seed,
									min: 0,
									max: 999999,
									step: 1,
									onChange: (value) => {
										setSeed(value);
										clearRun();
									}
								}),
								domain === "COLLISION" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Beam momentum GeV",
									value: energy,
									min: 0,
									max: 50,
									step: .1,
									onChange: (value) => {
										setEnergy(value);
										clearRun();
									}
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Temperature K",
									value: temperature,
									min: 250,
									max: 1200,
									step: 1,
									onChange: (value) => {
										setTemperature(value);
										clearRun();
									}
								})
							]
						}),
						domain === "MATERIALS" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Barrier eV",
								value: barrier,
								min: .05,
								max: 2,
								step: .01,
								onChange: (value) => {
									setBarrier(value);
									clearRun();
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Time min",
								value: minutes,
								min: 1,
								max: 240,
								step: 1,
								onChange: (value) => {
									setMinutes(value);
									clearRun();
								}
							})]
						}) : null,
						domain === "MATERIALS" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Growth is a seeded toy. The mass-balance residual is an accounting identity, not a weighed sample. It is not a calibrated nucleation law."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Fixed toy masses 0.938 GeV, charges +1 and −1, threshold 0.2 GeV. Labels are not identified particles."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-[11px] text-muted-foreground",
							children: [
								preview.schema,
								" · seed ",
								preview.seed,
								" · population ",
								preview.population,
								" · adapters installed ",
								String(preview.adaptersInstalled)
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: domain === "COLLISION" ? "Event sample" : "Size sample",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: executed ? "SIMULATED" : "EMPTY" }),
				children: [!executed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No physical simulation has run. Pythia, Geant4, ROOT, and LAMMPS are named candidates. They are not installed here."
				}) : domain === "COLLISION" && collision && event ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Synthesis fraction",
									value: collision.synthesisFraction.toFixed(3),
									hint: "dimensionless, simulated"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Energy residual",
									value: collision.meanEnergyResidualGeV.toExponential(2),
									hint: "internal identity, not a proof"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Momentum residual",
									value: collision.meanMomentumResidualGeV.toExponential(2),
									hint: "internal identity, not a proof"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MomentumPlot, {
							events: collision.events,
							selected
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-52 overflow-auto",
							children: collision.events.slice(0, 12).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSelected(item.id),
								className: item.id === selected ? "flex h-11 w-full items-center justify-between bg-accent px-2 text-left text-xs" : "flex h-11 w-full items-center justify-between px-2 text-left text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"#",
									item.id,
									" ",
									item.channel
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono",
									children: [
										"p ",
										item.pxGeV.toFixed(3),
										", ",
										item.pyGeV.toFixed(3)
									]
								})]
							}, item.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Event ",
								event.id,
								" is ",
								event.evidence,
								". Channel ",
								event.channel,
								". Product mass ",
								event.productMassGeV?.toFixed(4) ?? "none",
								" GeV. Residuals are computed, not observed."
							]
						})
					]
				}) : materials ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Mean diameter",
							value: materials.meanDiameterNm.toFixed(2),
							hint: "nm, simulated"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Nucleated",
							value: materials.nucleatedFraction.toFixed(3),
							hint: "fraction of the sample"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Mass balance",
							value: materials.massBalanceResidual.toFixed(0),
							hint: "internal identity only"
						})
					]
				}) : null, executed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bars, { values: bars }) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Measured rows",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "ok",
					children: "OBSERVED only"
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted-foreground",
							children: ["CSV import", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "mt-2 block w-full text-sm",
								type: "file",
								accept: ".csv,text/csv",
								onChange: (event) => {
									const file = event.target.files?.[0];
									if (file) onFile(file);
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: importNote
						}),
						fingerprint ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "break-all font-mono text-[11px] text-muted-foreground",
							children: ["SHA-256 ", fingerprint]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Header: ",
								CSV_HEADER,
								". HDF5, Parquet, and ROOT are not adapters in this build."
							]
						}),
						comparisons.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "grid gap-2 text-xs",
							children: comparisons.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "text-muted-foreground",
								children: [
									item.observation.domain,
									" ",
									item.observation.quantity,
									":",
									" ",
									item.result.status === "DERIVED" ? `DERIVED residual ${item.result.residual.toExponential(2)}${item.result.pull === null ? "" : `, pull ${item.result.pull.toFixed(2)}`}` : `NONCOMPARABLE. ${item.result.reason}`
								]
							}, `${item.observation.quantity}-${index}`))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Comparison waits for a run and an imported OBSERVED row with the same domain, quantity, and units."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Validation protocol v1.1",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "warn",
					children: protocol?.release ?? "NOT_CERTIFIED"
				}),
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => setProtocol(runSynthesisProtocol()),
					children: "Run protocol"
				}),
				children: !protocol ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "An internal identity check does not pass numerical validation. Numerical validation does not pass reference agreement. Reference agreement does not pass an experiment. Nothing here certifies a release."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Internal consistency",
									value: protocol.gates.internalConsistency ? "PASS" : "FAIL",
									hint: "does not imply the next gate"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Numerical validation",
									value: protocol.gates.numericalValidation ? "PASS" : "FAIL",
									hint: "tolerance 1e-9"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Reference agreement",
									value: "NOT RUN",
									hint: "no licensed dataset"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Experiment",
									value: "NOT RUN",
									hint: "no instrument"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Sampling uses ",
								protocol.uncertainty.sampling.count,
								" seeds. Mean ",
								protocol.uncertainty.sampling.mean.toFixed(3),
								", standard deviation ",
								protocol.uncertainty.sampling.standardDeviation.toFixed(3),
								", quantiles ",
								protocol.uncertainty.sampling.quantile05.toFixed(3),
								" / ",
								protocol.uncertainty.sampling.quantile50.toFixed(3),
								" / ",
								protocol.uncertainty.sampling.quantile95.toFixed(3),
								". The standard deviation moved from ",
								protocol.uncertainty.sampling.stdAt16.toFixed(3),
								" at 16 seeds to ",
								protocol.uncertainty.sampling.stdAt32.toFixed(3),
								" at 32. This is not a confidence interval. Model, parameter, measurement, and experimental uncertainty stay open."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "break-all font-mono text-[11px] text-muted-foreground",
							children: [
								protocol.protocol,
								" · seed ",
								protocol.manifest.seed,
								" · dataset ",
								String(protocol.manifest.datasetHash),
								" · KS bound ",
								protocol.manifest.preregisteredKsDMax,
								" fixed before data · fingerprint ",
								protocol.manifest.sourceFingerprint
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "grid gap-2",
							children: protocol.cases.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "min-w-0 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-foreground",
										children: item.status
									}),
									" ",
									item.id,
									item.highestGate !== "NONE" ? ` · ${item.highestGate}` : "",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block",
										children: item.detail
									})
								]
							}, item.id))
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Monte Carlo integration",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "NUMERICAL" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"The integral is a Gaussian bump on [0, 1]. The closed form is ",
							comparison.analytic.toFixed(6),
							". These estimates are quadrature, not collider events and not a measurement. VEGAS, VEGAS+, MISER, Sobol, and multi-channel integration are not installed."
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-2",
						children: comparison.estimates.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "min-w-0 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-foreground",
									children: item.method
								}),
								" ",
								item.estimate.toFixed(5),
								" · absolute error ",
								item.error.toExponential(2),
								item.standardError === null ? " · no 1/sqrt(N) bar" : ` · standard error ${item.standardError.toExponential(2)}`,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 block",
									children: item.note
								})
							]
						}, item.method))
					})]
				})
			})
		]
	});
}
function Choice({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: active ? "h-11 rounded-md bg-primary px-3 text-sm text-primary-foreground" : "h-11 rounded-md bg-secondary px-3 text-sm text-muted-foreground",
		children
	});
}
function Field({ label, value, min, max, step, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex justify-between",
			children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-foreground",
				children: Number.isInteger(step) ? value : value.toFixed(2)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: "mt-2 h-11 w-full accent-primary",
			type: "range",
			min,
			max,
			step,
			value,
			onChange: (event) => onChange(Number(event.target.value))
		})]
	});
}
function MomentumPlot({ events, selected }) {
	const width = 320;
	const height = 180;
	const scale = 28;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${width} ${height}`,
		className: "h-44 w-full rounded-lg bg-secondary",
		role: "img",
		"aria-label": "Simulated transverse momenta",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: width / 2,
				y1: 8,
				x2: width / 2,
				y2: 172,
				stroke: "currentColor",
				opacity: .25
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: 8,
				y1: height / 2,
				x2: 312,
				y2: height / 2,
				stroke: "currentColor",
				opacity: .25
			}),
			events.slice(0, 180).map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: width / 2 + event.pxGeV * scale,
				cy: height / 2 - event.pyGeV * scale,
				r: event.id === selected ? 4 : 2,
				fill: "currentColor",
				opacity: event.channel === "SYNTHESIS" ? .95 : .45
			}, event.id))
		]
	});
}
function Bars({ values }) {
	const peak = Math.max(1, ...values);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3 flex h-16 items-end gap-1",
		"aria-hidden": "true",
		children: values.map((value, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 flex-1 rounded-sm bg-primary/70",
			style: { height: `${Math.max(4, value / peak * 100)}%` }
		}, index))
	});
}
function histogram(values) {
	if (!values.length) return [];
	const finite = values.filter((value) => Number.isFinite(value));
	if (!finite.length) return [];
	const lo = Math.min(...finite);
	const hi = Math.max(...finite);
	const bins = Array.from({ length: 8 }, () => 0);
	const span = hi - lo || 1;
	for (const value of finite) {
		const index = Math.min(7, Math.floor((value - lo) / span * 8));
		bins[index] += 1;
	}
	return bins;
}
//#endregion
export { SynthesisPage as component };
