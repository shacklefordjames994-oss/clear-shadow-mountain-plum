import { m as evaluateDiscoveryGate$1, p as discoveryMetric, x as runSciNetPipeline } from "./master-NgVsSD82.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/research-engine-a6Btj1Uj.js
var DEFAULT_DETECTOR = {
	name: "OMEGA Xe TPC (software twin)",
	target: "Xe",
	radiusM: .72,
	heightM: 1.46,
	fiducialMassKg: 1e3,
	exposureDays: 365,
	s1ThresholdPE: 2,
	s2ThresholdPE: 80,
	highEnergyMaxKeV: 250,
	photonYieldNr: 8,
	photonYieldEr: 22,
	electronYieldNr: 6,
	electronYieldEr: 32
};
var DEFAULT_DM = {
	name: "SI WIMP",
	massGeV: 50,
	crossSectionCm2: 1e-46,
	coupling: "SI"
};
var DEFAULT_HALO = {
	localDensityGeVcm3: .3,
	v0KmS: 220,
	vescKmS: 544,
	vEarthKmS: 232,
	modulationAmplitude: .07,
	modulationPhase: 152.5
};
function targetToMedium(target) {
	if (target === "Ar") return "ARGON";
	if (target === "Ge") return "GERMANIUM";
	return "XENON";
}
function mediumToTarget(medium) {
	if (medium === "ARGON") return "Ar";
	if (medium === "GERMANIUM") return "Ge";
	return "Xe";
}
function asSimulated(ev, detector) {
	const trigger = ev.s1PE >= detector.s1ThresholdPE && ev.s2PE >= detector.s2ThresholdPE;
	return {
		truth: {
			id: ev.eventId,
			state: "SCI:SIMULATED",
			model: ev.model,
			energyKeV: ev.recoilEnergyKeV,
			xM: ev.x,
			yM: ev.y,
			zM: ev.z,
			velocityKmS: ev.velocityKmS,
			timeDay: ev.timeDay,
			recoilType: ev.channel,
			target: mediumToTarget(ev.medium)
		},
		quanta: {
			photons: ev.photonsProduced,
			electrons: ev.electronsProduced,
			recombination: ev.channel === "NR" ? .62 : .34
		},
		signal: {
			s1PE: ev.s1PE,
			s2PE: ev.s2PE,
			xM: ev.reconstructedX,
			yM: ev.reconstructedY,
			zM: ev.reconstructedZ,
			energyKeV: ev.reconstructedEnergyKeV,
			s2s1: ev.s1PE > .2 ? ev.s2PE / ev.s1PE : ev.s2PE,
			nrProbability: ev.nrScore,
			trigger
		},
		veto: ev.veto,
		classification: ev.classification
	};
}
var DEFAULT_BACKGROUNDS = [
	{
		name: "RADON",
		ratePerKgDay: 2e-4,
		spectralSlope: .03,
		nrFraction: .02,
		uncertaintyFraction: .15,
		enabled: true
	},
	{
		name: "KRYPTON",
		ratePerKgDay: 12e-5,
		spectralSlope: .025,
		nrFraction: .01,
		uncertaintyFraction: .2,
		enabled: true
	},
	{
		name: "GAMMA_BETA",
		ratePerKgDay: .001,
		spectralSlope: .045,
		nrFraction: .005,
		uncertaintyFraction: .1,
		enabled: true
	},
	{
		name: "NEUTRON",
		ratePerKgDay: 8e-5,
		spectralSlope: .012,
		nrFraction: .75,
		uncertaintyFraction: .25,
		enabled: true
	},
	{
		name: "MUON",
		ratePerKgDay: 3e-5,
		spectralSlope: .01,
		nrFraction: .6,
		uncertaintyFraction: .3,
		enabled: true
	},
	{
		name: "ACCIDENTAL",
		ratePerKgDay: 1e-4,
		spectralSlope: .02,
		nrFraction: .15,
		uncertaintyFraction: .25,
		enabled: true
	},
	{
		name: "SURFACE",
		ratePerKgDay: 7e-5,
		spectralSlope: .06,
		nrFraction: .1,
		uncertaintyFraction: .3,
		enabled: true
	},
	{
		name: "ELECTRODE",
		ratePerKgDay: 5e-5,
		spectralSlope: .05,
		nrFraction: .08,
		uncertaintyFraction: .35,
		enabled: true
	}
];
var DEFAULT_CALIBRATION = {
	energyScale: 1,
	energyResolutionScale: 1,
	photonEfficiencyScale: 1,
	electronGainScale: 1,
	electronLifetimeMs: 2,
	positionScale: 1,
	triggerEfficiency: .98,
	nrClassificationBias: 0
};
var DEFAULT_NUISANCE = {
	backgroundNormalization: 1,
	detectorEfficiency: 1,
	energyScale: 1,
	resolutionScale: 1,
	haloDensityScale: 1,
	velocityScale: 1
};
function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
function expectedBackground(detector, components = DEFAULT_BACKGROUNDS, nuisance = DEFAULT_NUISANCE) {
	let totalRate = 0;
	for (const component of components) {
		if (!component.enabled) continue;
		totalRate += component.ratePerKgDay;
	}
	return totalRate * detector.fiducialMassKg * detector.exposureDays * nuisance.backgroundNormalization;
}
function calibrateEvent(event, calibration) {
	const output = structuredClone(event);
	output.signal.energyKeV *= calibration.energyScale;
	output.signal.s1PE *= calibration.photonEfficiencyScale;
	output.signal.s2PE *= calibration.electronGainScale;
	output.signal.xM *= calibration.positionScale;
	output.signal.yM *= calibration.positionScale;
	output.signal.zM *= calibration.positionScale;
	output.signal.s1PE *= 1 + .02 * (calibration.energyResolutionScale - 1);
	output.signal.nrProbability = clamp(output.signal.nrProbability + calibration.nrClassificationBias, 0, 1);
	if (calibration.triggerEfficiency < 1 && output.signal.trigger) {
		if (!(Math.abs(output.truth.energyKeV * 1e3) % 100 / 100 < calibration.triggerEfficiency)) {
			output.signal.trigger = false;
			output.classification = "VETOED";
		}
	}
	if (output.signal.s1PE > .2) output.signal.s2s1 = output.signal.s2PE / output.signal.s1PE;
	return output;
}
function generateSensitivityCurve(detector, dm) {
	const background = expectedBackground(detector);
	const points = [];
	for (const crossSection of [
		1e-39,
		1e-41,
		1e-43,
		1e-45,
		1e-47,
		1e-49
	]) {
		const massFactor = Math.max(.05, Math.min(5, dm.massGeV / 100));
		const signal = detector.exposureDays * detector.fiducialMassKg * (crossSection / 1e-45) * massFactor * .002;
		points.push({
			crossSectionCm2: crossSection,
			expectedSignal: signal,
			expectedBackground: background,
			discoveryMetric: discoveryMetric(signal, background)
		});
	}
	return {
		massGeV: dm.massGeV,
		points
	};
}
function evaluateDiscoveryGate(significanceSigma, independentReplication, backgroundValidated, detectorSystematicsValidated, unblinded, dataState) {
	return evaluateDiscoveryGate$1({
		significanceSigma,
		independentReplication,
		backgroundValidated,
		detectorSystematicsValidated,
		unblinded,
		ppcPassed: false,
		dataState
	});
}
function composeLabRun(opts) {
	const backgrounds = opts.backgrounds ?? DEFAULT_BACKGROUNDS;
	const nuisance = opts.nuisance ?? DEFAULT_NUISANCE;
	const calibration = opts.calibration ?? DEFAULT_CALIBRATION;
	const exposureTonYears = opts.detector.fiducialMassKg / 1e3 * (opts.detector.exposureDays / 365);
	const run = runSciNetPipeline({
		seed: opts.seed,
		medium: targetToMedium(opts.detector.target),
		halo: {
			rhoDMGeVPerCm3: opts.halo.localDensityGeVcm3 * nuisance.haloDensityScale,
			v0KmPerS: opts.halo.v0KmS * nuisance.velocityScale,
			vEarthKmPerS: opts.halo.vEarthKmS,
			vEscapeKmPerS: opts.halo.vescKmS
		},
		geometry: {
			radiusM: opts.detector.radiusM,
			heightM: opts.detector.heightM,
			s1ThresholdPE: opts.detector.s1ThresholdPE,
			s2ThresholdPE: opts.detector.s2ThresholdPE
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
			on: b.enabled
		})),
		backgroundNorm: nuisance.backgroundNormalization,
		dataState: "SIMULATED"
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
				expectedBackground: run.expectedBackground
			},
			epistemic: {
				state: run.epistemic,
				discoveryGate: run.gate.passed,
				blockers: run.gate.blockers
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
				approxZ: run.approxZ
			}
		}
	};
}
//#endregion
export { DEFAULT_HALO as a, evaluateDiscoveryGate as c, DEFAULT_DM as i, DEFAULT_CALIBRATION as n, DEFAULT_NUISANCE as o, DEFAULT_DETECTOR as r, composeLabRun as s, DEFAULT_BACKGROUNDS as t };
