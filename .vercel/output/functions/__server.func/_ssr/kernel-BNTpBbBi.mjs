import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, t as Badge } from "./badge-uyEFEQwD.mjs";
import { l as useOmegaStore, o as hashObject } from "./store-lOmq_ntM.mjs";
import { n as Panel, r as Stat, t as PageHeader } from "./panel-GIo8_dlm.mjs";
import { n as RNG } from "./master-NgVsSD82.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kernel-BNTpBbBi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var HL = {
	circumferenceM: 26658.883,
	energyGeV: 7e3,
	protonMassGeV: .938272,
	bunchN: 22e10,
	nBunch: 2760,
	emitN_m: 25e-7,
	betaStarM: .15,
	sigmaZM: .09,
	crossingUrad: 250,
	c: 299792458
};
var fRevHz = HL.c / HL.circumferenceM;
var gammaRel = HL.energyGeV / HL.protonMassGeV;
function geometricEmit(emitN) {
	return emitN / Math.max(gammaRel, 1);
}
function gammaTwiss(beta, alpha) {
	return (1 + alpha * alpha) / Math.max(beta, 1e-12);
}
function sigmaFromTwiss(beta, emit) {
	return Math.sqrt(Math.max(0, beta * emit));
}
function toyLattice() {
	const cells = 8;
	const cell = HL.circumferenceM / cells;
	const half = cell / 2;
	const out = [];
	let s = 0;
	for (let i = 0; i < cells; i++) {
		if (i === 0 || i === 4) {
			out.push({
				id: `IP${i === 0 ? 1 : 5}`,
				kind: "INTERACTION_POINT",
				sM: s,
				lengthM: 0,
				k1: 0,
				label: i === 0 ? "IP1 ATLAS" : "IP5 CMS"
			});
			out.push({
				id: `CRAB${i}`,
				kind: "CRAB_CAVITY",
				sM: s + 20,
				lengthM: 8,
				k1: 0,
				label: "crab"
			});
		}
		out.push({
			id: `QF${i}`,
			kind: "QUADRUPOLE",
			sM: s + 40,
			lengthM: 3.1,
			k1: .022,
			label: "QF"
		});
		out.push({
			id: `D${i}a`,
			kind: "DRIFT",
			sM: s + 50,
			lengthM: half - 80,
			k1: 0,
			label: "arc"
		});
		out.push({
			id: `B${i}`,
			kind: "DIPOLE",
			sM: s + half,
			lengthM: 14.3,
			k1: 0,
			label: "MB"
		});
		out.push({
			id: `QD${i}`,
			kind: "QUADRUPOLE",
			sM: s + half + 20,
			lengthM: 3.1,
			k1: -.022,
			label: "QD"
		});
		out.push({
			id: `RF${i}`,
			kind: i === 3 ? "RF_CAVITY" : "DRIFT",
			sM: s + half + 40,
			lengthM: i === 3 ? 11 : 20,
			k1: 0,
			label: i === 3 ? "ACS" : "arc"
		});
		s += cell;
	}
	out.push({
		id: "COL",
		kind: "COLLIMATOR",
		sM: 420,
		lengthM: 1,
		k1: 0,
		label: "TCP"
	});
	return out.sort((a, b) => a.sM - b.sM);
}
function ipTwiss(emitN, betaStar) {
	const e = geometricEmit(emitN);
	return {
		betaX: betaStar,
		alphaX: 0,
		emitX: e,
		betaY: betaStar,
		alphaY: 0,
		emitY: e
	};
}
function sampleBunch(twiss, sigmaZ, n, seed, bunchN) {
	const rng = new RNG(seed);
	const sx = sigmaFromTwiss(twiss.betaX, twiss.emitX);
	const sy = sigmaFromTwiss(twiss.betaY, twiss.emitY);
	const spx = Math.sqrt(Math.max(1e-24, twiss.emitX * gammaTwiss(twiss.betaX, twiss.alphaX)));
	const spy = Math.sqrt(Math.max(1e-24, twiss.emitY * gammaTwiss(twiss.betaY, twiss.alphaY)));
	const w = bunchN / Math.max(1, n);
	const macros = [];
	for (let i = 0; i < n; i++) macros.push({
		x: rng.gaussian() * sx,
		px: rng.gaussian() * spx,
		y: rng.gaussian() * sy,
		py: rng.gaussian() * spy,
		z: rng.gaussian() * sigmaZ,
		delta: rng.gaussian() * 11e-5,
		w
	});
	return macros;
}
function measuredSigma(macros, axis) {
	if (!macros.length) return 0;
	const w = macros.reduce((s, m) => s + m.w, 0);
	const mean = macros.reduce((s, m) => s + m.w * m[axis], 0) / w;
	const var_ = macros.reduce((s, m) => s + m.w * (m[axis] - mean) ** 2, 0) / w;
	return Math.sqrt(Math.max(0, var_));
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
var KIND_COLOR = {
	DRIFT: "#2a3038",
	QUADRUPOLE: "#8fa3b8",
	DIPOLE: "#5c6370",
	RF_CAVITY: "#c4a574",
	CRAB_CAVITY: "#7a9a80",
	COLLIMATOR: "#c47a6a",
	INTERACTION_POINT: "#d4d8df"
};
function RingCanvas({ highlight }) {
	const lattice = toyLattice();
	const ref = useCanvas((ctx, w, h) => {
		ctx.fillStyle = "#12151a";
		ctx.fillRect(0, 0, w, h);
		const cx = w / 2;
		const cy = h / 2;
		const r = Math.min(w, h) * .38;
		ctx.strokeStyle = "#2a3038";
		ctx.lineWidth = 10;
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, Math.PI * 2);
		ctx.stroke();
		for (const el of lattice) {
			const ang = el.sM / HL.circumferenceM * Math.PI * 2 - Math.PI / 2;
			const x = cx + Math.cos(ang) * r;
			const y = cy + Math.sin(ang) * r;
			ctx.fillStyle = KIND_COLOR[el.kind];
			const s = el.kind === "INTERACTION_POINT" ? 7 : el.kind === "QUADRUPOLE" ? 4 : 3;
			ctx.beginPath();
			ctx.arc(x, y, el.id === highlight ? s + 2 : s, 0, Math.PI * 2);
			ctx.fill();
			if (el.kind === "INTERACTION_POINT") {
				ctx.fillStyle = "#8b919c";
				ctx.font = "10px ui-monospace, monospace";
				ctx.fillText(el.id, x + 8, y + 3);
			}
		}
	}, [highlight], 280);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "w-full",
		role: "img",
		"aria-label": "Toy eight-cell HL-LHC ring"
	});
}
function SweepCanvas({ points, current }) {
	const ref = useCanvas((ctx, w, h) => {
		ctx.fillStyle = "#12151a";
		ctx.fillRect(0, 0, w, h);
		const pad = {
			l: 44,
			r: 12,
			t: 16,
			b: 28
		};
		const xs = points.map((p) => p.emitN_m * 1e6);
		const ys = points.flatMap((p) => [p.analyticE34, p.simulatedE34]);
		const xmin = Math.min(...xs);
		const xmax = Math.max(...xs);
		const ymin = 0;
		const ymax = Math.max(...ys) * 1.12;
		const xOf = (x) => pad.l + (x - xmin) / (xmax - xmin || 1) * (w - pad.l - pad.r);
		const yOf = (y) => h - pad.b - (y - ymin) / (ymax - ymin || 1) * (h - pad.t - pad.b);
		ctx.strokeStyle = "#2a3038";
		ctx.beginPath();
		ctx.moveTo(pad.l, pad.t);
		ctx.lineTo(pad.l, h - pad.b);
		ctx.lineTo(w - pad.r, h - pad.b);
		ctx.stroke();
		ctx.strokeStyle = "#7a9a80";
		ctx.beginPath();
		points.forEach((p, i) => {
			const x = xOf(p.emitN_m * 1e6);
			const y = yOf(p.analyticE34);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
		ctx.stroke();
		ctx.fillStyle = "#c4a574";
		for (const p of points) {
			ctx.beginPath();
			ctx.arc(xOf(p.emitN_m * 1e6), yOf(p.simulatedE34), 4, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.strokeStyle = "#d4d8df";
		ctx.setLineDash([3, 3]);
		ctx.beginPath();
		ctx.moveTo(xOf(current * 1e6), pad.t);
		ctx.lineTo(xOf(current * 1e6), h - pad.b);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.fillStyle = "#8b919c";
		ctx.font = "10px ui-monospace, monospace";
		ctx.fillText("εn [μm]", w - 64, h - 8);
		ctx.fillText("L [10³⁴]", 6, 14);
	}, [points, current], 240);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "w-full",
		role: "img",
		"aria-label": "Luminosity versus emittance"
	});
}
function FillCanvas({ samples }) {
	const ref = useCanvas((ctx, w, h) => {
		ctx.fillStyle = "#12151a";
		ctx.fillRect(0, 0, w, h);
		const pad = {
			l: 44,
			r: 12,
			t: 12,
			b: 24
		};
		const ymax = Math.max(.1, ...samples.map((s) => s.L)) * 1.1;
		const xOf = (t) => pad.l + t * (w - pad.l - pad.r);
		const yOf = (L) => h - pad.b - L / ymax * (h - pad.t - pad.b);
		ctx.strokeStyle = "#c4a574";
		ctx.beginPath();
		samples.forEach((s, i) => {
			const x = xOf(s.t);
			const y = yOf(s.L);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
		ctx.stroke();
		ctx.fillStyle = "#8b919c";
		ctx.font = "10px ui-monospace, monospace";
		ctx.fillText("fill time", w - 70, h - 6);
	}, [samples], 160);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "w-full",
		role: "img",
		"aria-label": "Fill luminosity timeline"
	});
}
function UncertaintyMapCanvas({ cells }) {
	const ref = useCanvas((ctx, w, h) => {
		ctx.fillStyle = "#12151a";
		ctx.fillRect(0, 0, w, h);
		const pad = {
			l: 44,
			r: 12,
			t: 12,
			b: 28
		};
		const emits = [...new Set(cells.map((c) => c.emitN))].sort((a, b) => a - b);
		const crabs = [...new Set(cells.map((c) => c.crab))].sort((a, b) => a - b);
		const maxD = Math.max(1e-6, ...cells.map((c) => c.d));
		const cw = (w - pad.l - pad.r) / crabs.length;
		const ch = (h - pad.t - pad.b) / emits.length;
		cells.forEach((c) => {
			const i = crabs.indexOf(c.crab);
			const j = emits.indexOf(c.emitN);
			ctx.fillStyle = `rgba(196,165,116,${.12 + .75 * (c.d / maxD)})`;
			ctx.fillRect(pad.l + i * cw + 1, pad.t + (emits.length - 1 - j) * ch + 1, cw - 2, ch - 2);
		});
		ctx.fillStyle = "#8b919c";
		ctx.font = "10px ui-monospace, monospace";
		ctx.fillText("crab →", w - 52, h - 8);
		ctx.fillText("εn", 8, pad.t + 8);
	}, [cells], 200);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "w-full",
		role: "img",
		"aria-label": "Model disagreement map"
	});
}
function ParetoCanvas({ points, front }) {
	const ref = useCanvas((ctx, w, h) => {
		ctx.fillStyle = "#12151a";
		ctx.fillRect(0, 0, w, h);
		const pad = {
			l: 36,
			r: 12,
			t: 12,
			b: 28
		};
		const maxC = Math.max(1, ...points.map((p) => p.cost));
		const maxI = Math.max(1e-6, ...points.map((p) => p.expectedIG));
		const xOf = (c) => pad.l + c / maxC * (w - pad.l - pad.r);
		const yOf = (i) => h - pad.b - i / maxI * (h - pad.t - pad.b);
		ctx.strokeStyle = "#2a3038";
		ctx.beginPath();
		ctx.moveTo(pad.l, pad.t);
		ctx.lineTo(pad.l, h - pad.b);
		ctx.lineTo(w - pad.r, h - pad.b);
		ctx.stroke();
		points.forEach((p) => {
			ctx.fillStyle = front.includes(p.id) ? "#c4a574" : "#5c6370";
			ctx.beginPath();
			ctx.arc(xOf(p.cost), yOf(p.expectedIG), front.includes(p.id) ? 5 : 3.5, 0, Math.PI * 2);
			ctx.fill();
		});
		ctx.fillStyle = "#8b919c";
		ctx.font = "10px ui-monospace, monospace";
		ctx.fillText("cost", w - 40, h - 8);
		ctx.fillText("IG", 8, pad.t + 8);
	}, [points, front], 180);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "w-full",
		role: "img",
		"aria-label": "Pareto of information gain versus cost"
	});
}
function FaultCanvas({ samples }) {
	const ref = useCanvas((ctx, w, h) => {
		ctx.fillStyle = "#12151a";
		ctx.fillRect(0, 0, w, h);
		const pad = {
			l: 36,
			r: 12,
			t: 14,
			b: 22
		};
		const maxL = Math.max(.2, ...samples.map((s) => s.lumi));
		const xOf = (t) => pad.l + t * (w - pad.l - pad.r);
		const yL = (L) => h - pad.b - L / maxL * (h - pad.t - pad.b);
		const yT = (T) => h - pad.b - (T - 1.5) / 10 * (h - pad.t - pad.b);
		ctx.strokeStyle = "#2a3038";
		ctx.beginPath();
		ctx.moveTo(pad.l, pad.t);
		ctx.lineTo(pad.l, h - pad.b);
		ctx.lineTo(w - pad.r, h - pad.b);
		ctx.stroke();
		const onset = xOf(.7);
		ctx.strokeStyle = "#3a2a28";
		ctx.setLineDash([3, 3]);
		ctx.beginPath();
		ctx.moveTo(onset, pad.t);
		ctx.lineTo(onset, h - pad.b);
		ctx.stroke();
		ctx.setLineDash([]);
		const stroke = (pick, color, map) => {
			ctx.strokeStyle = color;
			ctx.lineWidth = 1.6;
			ctx.beginPath();
			samples.forEach((s, i) => {
				const x = xOf(s.t);
				const y = map(pick(s));
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			});
			ctx.stroke();
		};
		stroke((s) => s.lumi, "#d4d8df", yL);
		stroke((s) => s.tempK, "#c47a6a", yT);
		ctx.fillStyle = "#8b919c";
		ctx.font = "10px ui-monospace, monospace";
		ctx.fillText("L", 8, pad.t + 8);
		ctx.fillText("T", w - 18, pad.t + 8);
		ctx.fillText("inject", onset + 4, pad.t + 10);
	}, [samples], 180);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "w-full",
		role: "img",
		"aria-label": "Synthetic luminosity and temperature after fault injection"
	});
}
function crossingF(sigmaX, geom) {
	const arg = geom.crossingUrad * 1e-6 * (1 - Math.min(1, Math.max(0, geom.crabFraction))) * geom.sigmaZM / (2 * Math.max(sigmaX, 1e-12));
	return 1 / Math.sqrt(1 + arg * arg);
}
function luminosityFromSigmas(sigmaX, sigmaY, bunchN, nBunch, geom) {
	const F = crossingF(sigmaX, geom);
	const denom = 4 * Math.PI * Math.max(sigmaX * sigmaY, 1e-24);
	const lumiM2s = nBunch * fRevHz * bunchN * bunchN * F / denom;
	return {
		sigmaXM: sigmaX,
		sigmaYM: sigmaY,
		overlapF: F,
		lumiM2s,
		lumiE34: lumiM2s / 1e38,
		rateHz: lumiM2s * 8e-30,
		evidence: "SIMULATED",
		note: "Gaussian round-beam + Piwinski F. Reduced-order. Not a machine measurement."
	};
}
function hourglassF(betaStarM, sigmaZM) {
	const a = sigmaZM / (2 * Math.max(betaStarM, 1e-9));
	return 1 / Math.sqrt(1 + a * a);
}
function luminosityFromTwiss(twiss, bunchN, nBunch, geom) {
	return luminosityFromSigmas(sigmaFromTwiss(twiss.betaX, twiss.emitX), sigmaFromTwiss(twiss.betaY, twiss.emitY), bunchN, nBunch, geom);
}
/** MODEL_B: Piwinski × hourglass. Not a second machine. MODEL_A != MODEL_B != MEASUREMENT. */
function luminosityModelB(twiss, bunchN, nBunch, geom) {
	const a = luminosityFromTwiss(twiss, bunchN, nBunch, geom);
	const hg = hourglassF(twiss.betaX, geom.sigmaZM);
	const lumiM2s = a.lumiM2s * hg;
	return {
		...a,
		overlapF: a.overlapF * hg,
		lumiM2s,
		lumiE34: lumiM2s / 1e38,
		rateHz: lumiM2s * 8e-30,
		note: "MODEL_B = Piwinski × hourglass. Reduced-order disagreement is not a discovery."
	};
}
var DEFAULT_GEOM = {
	crossingUrad: HL.crossingUrad,
	crabFraction: .85,
	sigmaZM: HL.sigmaZM
};
function runEmitLum001(opts) {
	const geom = {
		...DEFAULT_GEOM,
		crabFraction: opts.crabFraction
	};
	const twiss = ipTwiss(opts.emitN_m, HL.betaStarM);
	const analytic = luminosityFromTwiss(twiss, HL.bunchN, HL.nBunch, geom);
	let simulated = analytic;
	if (opts.mode === "MACRO") {
		const bunch = sampleBunch(twiss, HL.sigmaZM, opts.macros ?? 400, opts.seed, HL.bunchN);
		simulated = luminosityFromSigmas(measuredSigma(bunch, "x"), measuredSigma(bunch, "y"), HL.bunchN, HL.nBunch, geom);
	}
	const residual = Math.abs(simulated.lumiE34 - analytic.lumiE34) / Math.max(analytic.lumiE34, 1e-12);
	const goldenPass = opts.mode === "DISTRIBUTION" ? residual < 1e-9 : residual < .25;
	return {
		experimentId: "EMIT-LUM-001",
		emitN_m: opts.emitN_m,
		betaStarM: HL.betaStarM,
		crabFraction: opts.crabFraction,
		mode: opts.mode,
		seed: opts.seed,
		macros: opts.macros ?? 400,
		analytic,
		simulated,
		residual,
		goldenPass,
		externalControl: false,
		discoveryEligible: false,
		evidence: "SIMULATED"
	};
}
function sweepEmittance(opts) {
	return [
		15e-7,
		2e-6,
		25e-7,
		3e-6,
		35e-7
	].map((emitN_m) => {
		const run = runEmitLum001({
			...opts,
			emitN_m
		});
		return {
			emitN_m,
			analyticE34: run.analytic.lumiE34,
			simulatedE34: run.simulated.lumiE34,
			sigmaUM: run.simulated.sigmaXM * 1e6
		};
	});
}
function sensitivityLumi(emitN, crab) {
	const h = emitN * .04;
	const up = runEmitLum001({
		emitN_m: emitN + h,
		crabFraction: crab,
		mode: "DISTRIBUTION",
		seed: 1
	});
	const dn = runEmitLum001({
		emitN_m: emitN - h,
		crabFraction: crab,
		mode: "DISTRIBUTION",
		seed: 1
	});
	return (up.simulated.lumiE34 - dn.simulated.lumiE34) / (2 * h);
}
function fillPhase(t) {
	if (t < .08) return "EMPTY";
	if (t < .28) return "INJECTING";
	if (t < .48) return "RAMPING";
	if (t < .68) return "SQUEEZING";
	if (t < .92) return "COLLISION";
	return "DUMPED";
}
function fillLumi(t, emitN, crab) {
	const phase = fillPhase(t);
	if (phase === "EMPTY" || phase === "DUMPED") return 0;
	const pop = phase === "INJECTING" ? Math.max(.05, (t - .08) / .2) : 1;
	const beta = phase === "SQUEEZING" ? .55 - .4 * ((t - .48) / .2) : phase === "COLLISION" ? .15 : .55;
	const geom = {
		...DEFAULT_GEOM,
		crabFraction: phase === "COLLISION" ? crab : 0
	};
	const sx = sigmaFromTwiss(beta, geometricEmit(emitN));
	return luminosityFromSigmas(sx, sx, HL.bunchN * pop, HL.nBunch, geom).lumiE34;
}
function pairAt(emitN, crab) {
	const geom = {
		...DEFAULT_GEOM,
		crabFraction: crab
	};
	const twiss = ipTwiss(emitN, HL.betaStarM);
	const a = luminosityFromTwiss(twiss, HL.bunchN, HL.nBunch, geom).lumiE34;
	const b = luminosityModelB(twiss, HL.bunchN, HL.nBunch, geom).lumiE34;
	return {
		a,
		b,
		d: Math.abs(a - b)
	};
}
function uncertaintyGrid() {
	const emits = [
		15e-7,
		2e-6,
		25e-7,
		3e-6,
		35e-7
	];
	const crabs = [
		0,
		.25,
		.5,
		.75,
		1
	];
	const out = [];
	for (const emitN of emits) for (const crab of crabs) out.push({
		emitN,
		crab,
		d: pairAt(emitN, crab).d
	});
	return out;
}
function seedHypotheses() {
	return [
		{
			id: "H1",
			statement: "Residual is a beam-emittance effect.",
			origin: "KERNEL",
			supportIf: "L changes when εn changes, crab held.",
			falsifyIf: "Residual independent of beam state.",
			status: "PROPOSED"
		},
		{
			id: "H2",
			statement: "Residual is a crab / overlap-F effect.",
			origin: "KERNEL",
			supportIf: "L changes when crab fraction changes, εn held.",
			falsifyIf: "Effect persists with crab locked.",
			status: "PROPOSED"
		},
		{
			id: "H3",
			statement: "Residual is a detector occupancy artifact.",
			origin: "KERNEL",
			supportIf: "Effect tracks occupancy, not σ*.",
			falsifyIf: "Same residual with no detector twin in the loop.",
			status: "PROPOSED"
		},
		{
			id: "H4",
			statement: "Residual is a reconstruction artifact.",
			origin: "KERNEL",
			supportIf: "Independent reco changes the residual.",
			falsifyIf: "L formula residual appears before reco.",
			status: "PROPOSED"
		},
		{
			id: "H5",
			statement: "Residual is an alternative physical mechanism.",
			origin: "KERNEL",
			supportIf: "Survives beam, crab, detector, and reco checks.",
			falsifyIf: "Any controlled alternative reproduces it.",
			status: "PROPOSED"
		}
	];
}
function proposeExperiments(grid) {
	const peak = grid.reduce((p, q) => q.d > p.d ? q : p, grid[0]);
	const meanD = grid.reduce((s, g) => s + g.d, 0) / grid.length;
	const igPeak = peak.d / Math.max(meanD, 1e-9);
	const igCrab = pairAt(HL.emitN_m, 1).d - pairAt(HL.emitN_m, 0).d;
	const igMacro = .35;
	return [
		{
			id: "ED-LUM-DISC",
			objective: "Discriminate MODEL_A vs MODEL_B at peak disagreement.",
			variable: "εn, crab",
			range: `εn=${(peak.emitN * 1e6).toFixed(2)} μm · crab=${peak.crab.toFixed(2)}`,
			models: ["MODEL_A", "MODEL_B"],
			expectedIG: igPeak,
			cost: 1.2,
			utility: igPeak / 1.2,
			risk: "Outside a validated lattice. Exploratory only.",
			authorization: "HUMAN_REQUIRED",
			status: "PROPOSED"
		},
		{
			id: "ED-CRAB-LOCK",
			objective: "Test H1 vs H2 by locking crab and sweeping εn.",
			variable: "εn",
			range: "1.5–3.5 μm, crab = 0.85",
			models: ["MODEL_A", "MODEL_B"],
			expectedIG: 1.4,
			cost: 1,
			utility: 1.4,
			risk: "Does not touch a quadrupole.",
			authorization: "HUMAN_REQUIRED",
			status: "PROPOSED"
		},
		{
			id: "ED-CRAB-SWEEP",
			objective: "Sweep crab at nominal εn. Falsify H1 if L is crab-blind.",
			variable: "crab fraction",
			range: "0–1 at εn = 2.5 μm",
			models: ["MODEL_A", "MODEL_B"],
			expectedIG: Math.abs(igCrab) + .8,
			cost: .8,
			utility: (Math.abs(igCrab) + .8) / .8,
			risk: "Reduced-order F, not a cavity TDR.",
			authorization: "HUMAN_REQUIRED",
			status: "PROPOSED"
		},
		{
			id: "ED-MACRO-NOISE",
			objective: "Compare DISTRIBUTION envelope to MACRO sampling noise.",
			variable: "mode",
			range: "400 macros, seed held",
			models: ["MODEL_A", "MODEL_B"],
			expectedIG: igMacro,
			cost: 2.4,
			utility: igMacro / 2.4,
			risk: "Sampling noise ≠ instrument noise.",
			authorization: "HUMAN_REQUIRED",
			status: "PROPOSED"
		}
	];
}
function pareto(cands) {
	return cands.filter((c) => !cands.some((o) => o.id !== c.id && o.expectedIG >= c.expectedIG && o.cost <= c.cost && (o.expectedIG > c.expectedIG || o.cost < c.cost)));
}
function initialKnowledge() {
	const grid = uncertaintyGrid();
	const u = grid.reduce((s, g) => s + g.d, 0) / grid.length;
	return {
		version: 0,
		models: ["MODEL_A", "MODEL_B"],
		hypotheses: seedHypotheses(),
		uncertainty: u,
		openQuestions: ["Why does MODEL_B sit below MODEL_A? Hourglass, not new physics.", "Which εn, crab cell most discriminates the toys?"],
		evidence: "SIMULATED"
	};
}
function applyAuthorization(knowledge, cands, id, decision) {
	const nextCands = cands.map((c) => c.id === id ? {
		...c,
		status: decision === "APPROVED" ? "EXECUTED" : "REJECTED"
	} : c);
	const hyps = knowledge.hypotheses.map((h) => ({ ...h }));
	if (decision === "APPROVED") {
		if (id === "ED-CRAB-LOCK" || id === "ED-LUM-DISC") {
			hyps[0].status = "SUPPORTED_BY_SIMULATION";
			hyps[2].status = "CONTRADICTED";
			hyps[3].status = "CONTRADICTED";
		}
		if (id === "ED-CRAB-SWEEP") {
			hyps[1].status = "SUPPORTED_BY_SIMULATION";
			hyps[0].status = hyps[0].status === "PROPOSED" ? "INCONCLUSIVE" : hyps[0].status;
		}
		if (id === "ED-MACRO-NOISE") hyps[4].status = "INCONCLUSIVE";
		hyps.forEach((h) => {
			if (h.status === "PROPOSED") h.status = "UNDER_TEST";
		});
	}
	return {
		knowledge: {
			...knowledge,
			version: knowledge.version + 1,
			hypotheses: hyps,
			uncertainty: Math.max(.02, knowledge.uncertainty * (decision === "APPROVED" ? .72 : 1)),
			openQuestions: decision === "APPROVED" ? ["SUPPORTED_BY_SIMULATION is not OBSERVED.", "Hourglass disagreement remains a toy residual."] : knowledge.openQuestions
		},
		cands: nextCands
	};
}
function debateLines() {
	return [
		{
			role: "INTERPRETER",
			text: "MODEL_B sits below MODEL_A because hourglass suppresses overlap at finite σz/β*. Discrimination is largest where L is largest — low εn, crab on."
		},
		{
			role: "SKEPTIC",
			text: "That is two toys arguing. Neither is a fill. Hourglass here is a one-line factor, not a 6D collision. SUPPORTED_BY_SIMULATION ≠ OBSERVED."
		},
		{
			role: "SYNTHESIZER",
			text: "Keep both models. Authorize ED-LUM-DISC if you want the kernel to spend budget on the peak cell. Do not promote the residual to a mechanism. Do not actuate a quadrupole."
		}
	];
}
function conveneSwarm(opts) {
	const replay = runEmitLum001({
		emitN_m: opts.emitN,
		crabFraction: opts.crab,
		mode: opts.mode,
		seed: opts.seed
	});
	const reproductionMatch = Math.abs(replay.simulated.lumiE34 - opts.run.simulated.lumiE34) < 1e-12 && replay.seed === opts.seed;
	const pair = pairAt(opts.emitN, opts.crab);
	const claims = [
		{
			role: "PLANNER",
			vote: "HOLD",
			claim: "Decompose EMIT-LUM-001 into envelope, crab lock, and MACRO noise. Do not skip the human gate."
		},
		{
			role: "PHYSICS",
			vote: "PROCEED",
			claim: "MODEL_A is the Gaussian identity. Hourglass is a correction, not a new interaction."
		},
		{
			role: "NUMERICAL",
			vote: "DISSENT",
			claim: "DISTRIBUTION is too clean. MACRO sampling is the honest residual. PHYSICS is overconfident."
		},
		{
			role: "EXPERIMENT",
			vote: "PROCEED",
			claim: `Peak |A−B| is ${pair.d.toFixed(2)}e34. ED-LUM-DISC is the informative cell — still a proposal.`
		},
		{
			role: "SIMULATION",
			vote: "HOLD",
			claim: "Sandbox class is ready. No quadrupole current. Waiting for human Authorize."
		},
		{
			role: "DATA",
			vote: "HOLD",
			claim: `L_A=${pair.a.toFixed(2)}e34 L_B=${pair.b.toFixed(2)}e34. Numbers are SIMULATED.`
		},
		{
			role: "FALSIFIER",
			vote: "DISSENT",
			claim: "H1 is not established. A slope vs εn is the toy identity, not a beam-effect discovery."
		},
		{
			role: "REPRODUCTION",
			vote: reproductionMatch ? "PROCEED" : "DISSENT",
			claim: reproductionMatch ? `Same seed ${opts.seed} replayed. Self-consistency, not an independent lab.` : "Replay mismatch. Stop. Do not paper over the seed."
		},
		{
			role: "SECURITY",
			vote: "DENY",
			claim: "external_control false. PHYSICAL_ACTUATOR_CONTROL denied. SCI:DISC denied. SWARM != AUTHORITY."
		},
		{
			role: "EVIDENCE",
			vote: "HOLD",
			claim: `Knowledge v${opts.knowledge.version}. Provenance is SIMULATED. No claim is OBSERVED.`
		},
		{
			role: "REPORTER",
			vote: "HOLD",
			claim: "Record the dissent. Do not flatten it. The report is a sandbox artifact, not a paper."
		}
	];
	const votes = {
		PROCEED: 0,
		HOLD: 0,
		DISSENT: 0,
		DENY: 0
	};
	for (const c of claims) votes[c.vote] += 1;
	const consensus = votes.DISSENT === 0 && votes.DENY === 0;
	return {
		id: `SWARM-${opts.seed}`,
		seed: opts.seed,
		reproductionMatch,
		residualA: opts.run.residual,
		residualB: replay.residual,
		disagreement: pair.d,
		votes,
		claims,
		consensus,
		authorization: "HUMAN_REQUIRED",
		discoveryEligible: false,
		evidence: "SIMULATED",
		report: consensus ? "Illegal: a scientific swarm without dissent is a rubber stamp. Rebuild the falsifier." : `Dissent is live (${votes.DISSENT} DISSENT, ${votes.DENY} DENY, ${votes.HOLD} HOLD, ${votes.PROCEED} PROCEED). Consensus is not validation. Human review remains the gate.`
	};
}
var CAPSULE_SCHEMA = "CERN-KERNEL-v19";
function payload(c) {
	return c;
}
function sealKernelCapsule(opts) {
	const round = opts.round ?? conveneSwarm({
		run: opts.run,
		knowledge: opts.knowledge,
		emitN: opts.emitN,
		crab: opts.crab,
		mode: opts.mode,
		seed: opts.seed
	});
	const body = payload({
		schema: CAPSULE_SCHEMA,
		experimentId: "EMIT-LUM-001",
		seed: opts.seed,
		emitN_m: opts.emitN,
		crabFraction: opts.crab,
		mode: opts.mode,
		lumiE34: opts.run.simulated.lumiE34,
		residual: opts.run.residual,
		goldenPass: opts.run.goldenPass,
		knowledgeVersion: opts.knowledge.version,
		votes: round.votes,
		consensus: round.consensus,
		dissent: round.claims.filter((c) => c.vote === "DISSENT" || c.vote === "DENY").map((c) => c.role),
		evidence: "SIMULATED",
		discoveryEligible: false,
		externalControl: false,
		note: "Sealed sandbox. Replay is the same seed, not another laboratory."
	});
	return {
		...body,
		contentHash: hashObject(body)
	};
}
function replayKernelCapsule(capsule, knowledge) {
	const run = runEmitLum001({
		emitN_m: capsule.emitN_m,
		crabFraction: capsule.crabFraction,
		mode: capsule.mode,
		seed: capsule.seed
	});
	const round = conveneSwarm({
		run,
		knowledge,
		emitN: capsule.emitN_m,
		crab: capsule.crabFraction,
		mode: capsule.mode,
		seed: capsule.seed
	});
	const { contentHash: _drop, ...rest } = capsule;
	const hashOk = hashObject(rest) === capsule.contentHash;
	const lumiMatch = Math.abs(run.simulated.lumiE34 - capsule.lumiE34) < 1e-9;
	const swarmMatch = round.votes.DISSENT === capsule.votes.DISSENT && round.votes.DENY === capsule.votes.DENY && round.consensus === capsule.consensus;
	const mismatches = [];
	if (!hashOk) mismatches.push("HASH");
	if (!lumiMatch) mismatches.push("LUMI");
	if (!swarmMatch) mismatches.push("SWARM");
	return {
		hashOk,
		lumiMatch,
		swarmMatch,
		match: hashOk && lumiMatch && swarmMatch,
		mismatches,
		replayedLumi: run.simulated.lumiE34
	};
}
function tamperCapsule(capsule) {
	return {
		...capsule,
		seed: capsule.seed + 1
	};
}
var FAULT_IDS = [
	"NOMINAL",
	"QUAD_ERROR",
	"RF_SLIP",
	"QUENCH",
	"INSTRUMENT",
	"CORRELATED"
];
var LABELS = {
	NOMINAL: "Nominal collision",
	QUAD_ERROR: "Quadrupole gradient error",
	RF_SLIP: "Crab / RF phase slip",
	QUENCH: "Synthetic quench",
	INSTRUMENT: "Stuck quench bit",
	CORRELATED: "Correlated unknown"
};
function blindFaultId(seed) {
	return FAULT_IDS[(Math.abs(Math.imul(seed | 0, 1103515245) + 12345) >>> 0) % FAULT_IDS.length];
}
function channelsFor(id, emitN, crab) {
	const base = runEmitLum001({
		emitN_m: emitN,
		crabFraction: crab,
		mode: "DISTRIBUTION",
		seed: 1
	});
	if (id === "NOMINAL") return {
		lumiRatio: 1,
		betaRatio: 1,
		crabRatio: 1,
		sigmaRatio: 1,
		tempK: 1.9,
		quenchBit: false
	};
	if (id === "QUAD_ERROR") {
		const betaRatio = 1 / .85;
		return {
			lumiRatio: 1 / betaRatio,
			betaRatio,
			crabRatio: 1,
			sigmaRatio: Math.sqrt(betaRatio),
			tempK: 1.9,
			quenchBit: false
		};
	}
	if (id === "RF_SLIP") return {
		lumiRatio: runEmitLum001({
			emitN_m: emitN,
			crabFraction: crab * .35,
			mode: "DISTRIBUTION",
			seed: 1
		}).simulated.lumiE34 / Math.max(base.simulated.lumiE34, 1e-12),
		betaRatio: 1,
		crabRatio: .35,
		sigmaRatio: 1,
		tempK: 1.9,
		quenchBit: false
	};
	if (id === "QUENCH") return {
		lumiRatio: 0,
		betaRatio: 1,
		crabRatio: 1,
		sigmaRatio: 1,
		tempK: 9.5,
		quenchBit: true
	};
	if (id === "INSTRUMENT") return {
		lumiRatio: 1,
		betaRatio: 1,
		crabRatio: 1,
		sigmaRatio: 1,
		tempK: 1.9,
		quenchBit: true
	};
	return {
		lumiRatio: .78,
		betaRatio: 1.02,
		crabRatio: 1,
		sigmaRatio: 1.01,
		tempK: 2.35,
		quenchBit: false
	};
}
function classifyChannels(c) {
	const near = (a, b, tol) => Math.abs(a - b) < tol;
	if (c.quenchBit && near(c.lumiRatio, 1, .03) && c.tempK < 2.2) return {
		klass: "INSTRUMENT",
		hypothesis: "Quench bit is set. L, β*, and temperature are nominal. Treat as a stuck channel."
	};
	if (c.quenchBit && c.lumiRatio < .05 && c.tempK > 4) return {
		klass: "KNOWN_FAULT",
		hypothesis: "Matches the synthetic quench template. A template is not a cryostat."
	};
	if (!c.quenchBit && c.betaRatio > 1.08 && c.tempK < 2.2 && c.lumiRatio < .95) return {
		klass: "KNOWN_FAULT",
		hypothesis: "β* grew and L fell. Quadrupole-error template. Not a field map."
	};
	if (!c.quenchBit && c.crabRatio < .6 && c.betaRatio < 1.05 && c.lumiRatio < .98) return {
		klass: "KNOWN_FAULT",
		hypothesis: "Crab fraction fell, β* did not. RF-slip template."
	};
	if (!c.quenchBit && near(c.lumiRatio, 1, .03) && c.tempK < 2.2 && c.betaRatio < 1.05) return {
		klass: "NOMINAL",
		hypothesis: "Inside the toy collision envelope."
	};
	return {
		klass: "UNEXPLAINED",
		hypothesis: "No single template fits. Unexplained is not new physics."
	};
}
var INJECTED = {
	NOMINAL: "Nothing was injected. The envelope is the reduced-order fill.",
	QUAD_ERROR: "Injector scaled β* by 1/(1−0.15). Round-beam L falls as 1/β*.",
	RF_SLIP: "Injector cut the crab fraction to 35% and recomputed overlap.",
	QUENCH: "Injector zeroed L and raised a toy temperature. Not a helium bath.",
	INSTRUMENT: "Injector set the quench bit and left the physics channels alone.",
	CORRELATED: "Injector dropped L to 78% and warmed the toy bath to 2.35 K. No template owns both."
};
function injectFault(id, opts) {
	const channels = channelsFor(id, opts.emitN, opts.crab);
	const judged = classifyChannels(channels);
	return {
		id,
		label: LABELS[id],
		injected: INJECTED[id],
		channels,
		klass: judged.klass,
		hypothesis: opts.mode === "MACRO" ? `${judged.hypothesis} MACRO sampling was not used for the envelope.` : judged.hypothesis,
		discoveryEligible: false,
		evidence: "SIMULATED",
		actuation: false
	};
}
function faultSamples(id, emitN, crab) {
	const ratio = channelsFor(id, emitN, crab);
	const out = [];
	for (let i = 0; i <= 40; i++) {
		const t = i / 40;
		let lumi = fillLumi(t, emitN, crab);
		let tempK = 1.9;
		if (t >= .7) {
			lumi *= ratio.lumiRatio;
			tempK = ratio.tempK;
			if (id === "QUENCH") lumi = 0;
		}
		out.push({
			t,
			lumi,
			tempK
		});
	}
	return out;
}
var TABS = [
	["cockpit", "Cockpit"],
	["optics", "Optics"],
	["lumi", "Luminosity"],
	["fill", "Fill"],
	["golden", "Golden"],
	["design", "Design"],
	["hypotheses", "Hypotheses"],
	["debate", "Debate"],
	["swarm", "Swarm"],
	["capsule", "Capsule"],
	["faults", "Faults"],
	["guard", "Guard"]
];
function KernelLab() {
	const commit = useOmegaStore((s) => s.commitKernelRun);
	const authorizeProposal = useOmegaStore((s) => s.authorizeKernelProposal);
	const refuseAuto = useOmegaStore((s) => s.refuseAutoExperiment);
	const convene = useOmegaStore((s) => s.conveneKernelSwarm);
	const refuseSwarm = useOmegaStore((s) => s.refuseSwarmAuthorize);
	const commitCapsule = useOmegaStore((s) => s.commitKernelCapsule);
	const commitFault = useOmegaStore((s) => s.commitKernelFault);
	const attemptDiscovery = useOmegaStore((s) => s.attemptDiscovery);
	const attemptBeam = useOmegaStore((s) => s.attemptBeamActuation);
	const lastDenial = useOmegaStore((s) => s.events.find((e) => e.rejected));
	const [tab, setTab] = (0, import_react.useState)("cockpit");
	const [emitN, setEmit] = (0, import_react.useState)(HL.emitN_m);
	const [crab, setCrab] = (0, import_react.useState)(.85);
	const [mode, setMode] = (0, import_react.useState)("DISTRIBUTION");
	const [seed, setSeed] = (0, import_react.useState)(104928);
	const [fillT, setFillT] = (0, import_react.useState)(.8);
	const [note, setNote] = (0, import_react.useState)(null);
	const [knowledge, setKnowledge] = (0, import_react.useState)(() => initialKnowledge());
	const [proposals, setProposals] = (0, import_react.useState)(() => proposeExperiments(uncertaintyGrid()));
	const [round, setRound] = (0, import_react.useState)(null);
	const [capsule, setCapsule] = (0, import_react.useState)(null);
	const [replay, setReplay] = (0, import_react.useState)(null);
	const [faultId, setFaultId] = (0, import_react.useState)("QUAD_ERROR");
	const [faultHidden, setFaultHidden] = (0, import_react.useState)(false);
	const run = (0, import_react.useMemo)(() => runEmitLum001({
		emitN_m: emitN,
		crabFraction: crab,
		mode,
		seed
	}), [
		emitN,
		crab,
		mode,
		seed
	]);
	const sweep = (0, import_react.useMemo)(() => sweepEmittance({
		crabFraction: crab,
		mode,
		seed
	}), [
		crab,
		mode,
		seed
	]);
	const dLdE = (0, import_react.useMemo)(() => sensitivityLumi(emitN, crab), [emitN, crab]);
	const lattice = (0, import_react.useMemo)(() => toyLattice(), []);
	const phase = fillPhase(fillT);
	const fillCurve = (0, import_react.useMemo)(() => {
		const out = [];
		for (let i = 0; i <= 40; i++) {
			const t = i / 40;
			out.push({
				t,
				L: fillLumi(t, emitN, crab)
			});
		}
		return out;
	}, [emitN, crab]);
	const grid = (0, import_react.useMemo)(() => uncertaintyGrid(), []);
	const frontIds = (0, import_react.useMemo)(() => pareto(proposals).map((p) => p.id), [proposals]);
	const debate = (0, import_react.useMemo)(() => debateLines(), []);
	const fault = (0, import_react.useMemo)(() => injectFault(faultId, {
		emitN,
		crab,
		mode,
		seed
	}), [
		faultId,
		emitN,
		crab,
		mode,
		seed
	]);
	const faultCurve = (0, import_react.useMemo)(() => faultSamples(faultId, emitN, crab), [
		faultId,
		emitN,
		crab
	]);
	function onCommit() {
		const evt = commit({
			seed,
			emitN_m: emitN,
			crabFraction: crab,
			mode,
			residual: run.residual,
			goldenPass: run.goldenPass,
			lumiE34: run.simulated.lumiE34
		});
		setNote(evt.rejected ? evt.rejectedReason ?? "Rejected." : "Hashed as SIMULATED. Not a machine fill.");
	}
	function onApprove(id) {
		const evt = authorizeProposal(id);
		const next = applyAuthorization(knowledge, proposals, id, "APPROVED");
		setKnowledge(next.knowledge);
		setProposals(next.cands);
		setNote(evt.rejected ? evt.rejectedReason ?? "Rejected." : `${id} authorized in sandbox. Knowledge v${next.knowledge.version}. SIMULATED, not a fill.`);
	}
	function onReject(id) {
		const next = applyAuthorization(knowledge, proposals, id, "REJECTED");
		setKnowledge(next.knowledge);
		setProposals(next.cands);
		setNote(`${id} archived. Proposals are not deleted.`);
	}
	function onConvene() {
		const r = conveneSwarm({
			run,
			knowledge,
			emitN,
			crab,
			mode,
			seed
		});
		setRound(r);
		const evt = convene({
			seed: r.seed,
			dissent: r.votes.DISSENT,
			deny: r.votes.DENY,
			consensus: r.consensus
		});
		setNote(evt.rejected ? evt.rejectedReason ?? "Rejected." : r.report);
	}
	function onSeal() {
		const r = round ?? conveneSwarm({
			run,
			knowledge,
			emitN,
			crab,
			mode,
			seed
		});
		if (!round) setRound(r);
		const cap = sealKernelCapsule({
			run,
			knowledge,
			emitN,
			crab,
			mode,
			seed,
			round: r
		});
		setCapsule(cap);
		setReplay(null);
		const evt = commitCapsule({
			contentHash: cap.contentHash,
			seed: cap.seed
		});
		setNote(evt.rejected ? evt.rejectedReason ?? "Rejected." : `Sealed ${cap.contentHash.slice(0, 12)}. SIMULATED.`);
	}
	function onReplay() {
		if (!capsule) return;
		const report = replayKernelCapsule(capsule, knowledge);
		setReplay(report);
		setNote(report.match ? "Replay matches. Same seed, same toy. Not another laboratory." : `Replay broke: ${report.mismatches.join(", ")}.`);
	}
	function onTamper() {
		if (!capsule) return;
		const dirty = tamperCapsule(capsule);
		setCapsule(dirty);
		const report = replayKernelCapsule(dirty, knowledge);
		setReplay(report);
		setNote("Seed bumped. Replay must fail. Tamper is not a new experiment.");
	}
	function onExport() {
		if (!capsule) return;
		const blob = new Blob([JSON.stringify(capsule, null, 2)], { type: "application/json" });
		const href = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = href;
		a.download = `EMIT-LUM-001-${capsule.contentHash.slice(0, 8)}.json`;
		a.click();
		URL.revokeObjectURL(href);
		setNote("Exported JSON. A file is not a fill.");
	}
	function onFault(id) {
		setFaultId(id);
		setFaultHidden(false);
		const next = injectFault(id, {
			emitN,
			crab,
			mode,
			seed
		});
		const evt = commitFault({
			faultId: id,
			klass: next.klass,
			seed
		});
		setNote(evt.rejected ? evt.rejectedReason ?? "Rejected." : `${next.klass}. ${next.hypothesis}`);
	}
	function onBlindFault() {
		const id = blindFaultId(seed + Math.floor(Math.random() * 997));
		setFaultId(id);
		setFaultHidden(true);
		const next = injectFault(id, {
			emitN,
			crab,
			mode,
			seed
		});
		const evt = commitFault({
			faultId: "BLIND",
			klass: next.klass,
			seed
		});
		setNote(evt.rejected ? evt.rejectedReason ?? "Rejected." : `Blind draw. Classifier says ${next.klass}. The injection label stays covered.`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: `Digital CERN kernel v5.0 · fault injection`,
			title: "HL-LHC physics kernel",
			description: "Inject a magnet error, an RF slip, a toy quench, or a lying instrument. ANOMALY ≠ DISCOVERY.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onCommit,
					children: "Commit run to bus"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "destructive",
					onClick: () => setNote(attemptDiscovery("SIMULATED").rejectedReason ?? ""),
					children: "Declare SCI:DISC"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setNote(attemptBeam().rejectedReason ?? ""),
					children: "Actuate beam"
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
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-2",
			children: TABS.map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: tab === id ? "default" : "outline",
				onClick: () => setTab(id),
				children: label
			}, id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "EMIT-LUM-001",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: run.evidence }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex justify-between gap-2",
								children: ["εn", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-foreground",
									children: [(emitN * 1e6).toFixed(2), " μm"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								className: "mt-2 h-11 w-full accent-primary",
								min: 15e-7,
								max: 35e-7,
								step: 5e-8,
								value: emitN,
								onChange: (e) => setEmit(Number(e.target.value))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex justify-between gap-2",
								children: ["Crab fraction", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-foreground",
									children: crab.toFixed(2)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								className: "mt-2 h-11 w-full accent-primary",
								min: 0,
								max: 1,
								step: .05,
								value: crab,
								onChange: (e) => setCrab(Number(e.target.value))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted-foreground",
							children: ["Kernel mode", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "mt-2 h-11 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground",
								value: mode,
								onChange: (e) => setMode(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "DISTRIBUTION",
									children: "DISTRIBUTION"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "MACRO",
									children: "MACRO"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted-foreground",
							children: ["Seed", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								className: "mt-2 h-11 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground",
								value: seed,
								onChange: (e) => setSeed(Number(e.target.value) || 1)
							})]
						})
					]
				}),
				note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: note
				}) : null,
				lastDenial?.rejectedReason && note?.includes("HIGH_CONSEQUENCE") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-mono text-xs text-danger",
					children: lastDenial.rejectedReason
				}) : null
			]
		}),
		tab === "cockpit" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Toy lattice",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "8 cells ≠ 26.7 km" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RingCanvas, { highlight: phase === "COLLISION" ? "IP1" : null })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "State",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "danger",
					children: "external_control false"
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "L sim",
							value: `${run.simulated.lumiE34.toFixed(2)} ×10³⁴`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "L analytic",
							value: `${run.analytic.lumiE34.toFixed(2)} ×10³⁴`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "σx",
							value: `${(run.simulated.sigmaXM * 1e6).toFixed(2)} μm`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Overlap F",
							value: run.simulated.overlapF.toFixed(3)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Fill phase",
							value: phase
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Eligible",
							value: "false"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: run.simulated.note
				})]
			})]
		}),
		tab === "optics" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "IP Twiss",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "β*",
							value: `${HL.betaStarM.toFixed(2)} m`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "γ",
							value: (HL.energyGeV / HL.protonMassGeV).toFixed(0)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "ε geometric",
							value: `${(emitN / (HL.energyGeV / HL.protonMassGeV) * 1e9).toFixed(2)} nm`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "∂L/∂εn",
							value: dLdE.toExponential(2),
							hint: "finite difference, DISTRIBUTION"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "σ = √(β ε). Negative luminosity sensitivity to emittance is the golden qualitative test, not a machine optics table."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 columns-2 gap-4 font-mono text-xs text-muted-foreground sm:columns-3",
					children: lattice.filter((e) => e.kind !== "DRIFT").map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						e.id,
						" ",
						e.kind,
						" s=",
						e.sM.toFixed(0)
					] }, e.id))
				})
			]
		}),
		tab === "lumi" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "L vs εn",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "line = analytic" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SweepCanvas, {
					points: sweep,
					current: emitN
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Causal chain",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "εn ↑ → σ* ↑ → overlap ↓ → L ↓. Crab raises F by shrinking the effective crossing angle. That is the reduced-order story, not a crab-cavity TDR."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "N / bunch",
							value: HL.bunchN.toExponential(1)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "bunches",
							value: String(HL.nBunch)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "f_rev",
							value: `${(299792458 / HL.circumferenceM).toFixed(0)} Hz`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "crossing",
							value: `${HL.crossingUrad} μrad`
						})
					]
				})]
			})]
		}),
		tab === "fill" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "Synthetic fill",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FillCanvas, { samples: fillCurve }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 block text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex justify-between gap-2",
						children: ["Fill clock", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-foreground",
							children: [
								fillT.toFixed(2),
								" · ",
								phase
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						className: "mt-2 h-11 w-full accent-primary",
						min: 0,
						max: 1,
						step: .01,
						value: fillT,
						onChange: (e) => setFillT(Number(e.target.value))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "EMPTY → INJECT → RAMP → SQUEEZE → COLLISION → DUMP. Pictures of a fill are not a fill."
				})
			]
		}),
		tab === "golden" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "Analytical envelope",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: run.goldenPass ? "PASS" : "FAIL" }),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Relative residual",
						value: run.residual.toExponential(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Mode",
						value: run.mode
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Golden",
						value: run.goldenPass ? "PASS" : "FAIL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Discovery",
						value: "closed"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: "DISTRIBUTION must match σ=√(βε) and the Gaussian L formula to 1e-9. MACRO may disagree by sampling. A pass is self-consistency of the toy, not HL-LHC certification."
			})]
		}),
		tab === "design" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					title: "Uncertainty map",
					meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "MODEL_A ≠ MODEL_B" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UncertaintyMapCanvas, { cells: grid }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: "Bright cells are where Piwinski and hourglass disagree. That is a sampling target, not a hole in nature. SURROGATE ≠ HIGH-FIDELITY."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					title: "Pareto",
					meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "IG vs cost" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParetoCanvas, {
						points: proposals,
						front: frontIds
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: "Gold = non-dominated. The designer does not pick for you. Utility is a proposal metric."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "lg:col-span-2",
					title: "Candidate portfolio",
					meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "danger",
						children: "HUMAN REQUIRED"
					}),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[36rem] text-left text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "font-mono text-[10px] uppercase text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2",
											children: "ID"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Objective" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "IG" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Cost" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "U" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "State" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: proposals.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-border font-mono text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2",
											children: p.id
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "max-w-[16rem] font-sans text-muted-foreground",
											children: p.objective
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p.expectedIG.toFixed(2) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p.cost.toFixed(1) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p.utility.toFixed(2) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p.status }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "whitespace-nowrap",
											children: p.status === "PROPOSED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												className: "mr-1",
												onClick: () => onApprove(p.id),
												children: "Authorize"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => onReject(p.id),
												children: "Archive"
											})] }) : null
										})
									]
								}, p.id)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "destructive",
								onClick: () => setNote(refuseAuto().rejectedReason ?? ""),
								children: "Auto-run swarm"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: [
								"K",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sub", { children: "t" }),
								" version ",
								knowledge.version,
								" · ⟨|A−B|⟩ ",
								knowledge.uncertainty.toFixed(3),
								" ×10³⁴. PROPOSAL ≠ AUTHORIZATION. Auto-run is refused."
							]
						})
					]
				})
			]
		}),
		tab === "hypotheses" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "Hypothesis registry",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "never PROVEN" }),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[32rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "font-mono text-[10px] uppercase text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2",
								children: "ID"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Statement" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Falsify if" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: knowledge.hypotheses.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 font-mono",
								children: h.id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: h.statement }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "text-muted-foreground",
								children: h.falsifyIf
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "font-mono",
								children: h.status
							})
						]
					}, h.id)) })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-1 text-xs text-muted-foreground",
				children: knowledge.openQuestions.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: q }, q))
			})]
		}),
		tab === "debate" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "Interpreter / skeptic / synthesizer",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: debate.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md bg-secondary p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] uppercase text-muted-foreground",
						children: line.role
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm",
						children: line.text
					})]
				}, line.role))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "Disagreement is the product. Consensus is not validation. Human review is the gate."
			})]
		}),
		tab === "swarm" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Bounded swarm",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "danger",
					children: "SWARM ≠ AUTHORITY"
				}),
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: onConvene,
						children: "Convene swarm"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "destructive",
						onClick: () => setNote(refuseSwarm().rejectedReason ?? ""),
						children: "Swarm authorize"
					})]
				}),
				children: round ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "PROCEED",
							value: String(round.votes.PROCEED)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "HOLD",
							value: String(round.votes.HOLD)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "DISSENT",
							value: String(round.votes.DISSENT)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "DENY",
							value: String(round.votes.DENY)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Replay",
							value: round.reproductionMatch ? "match" : "mismatch"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Consensus",
							value: String(round.consensus)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Eligible",
							value: "false"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Auth",
							value: "HUMAN_REQUIRED"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: round.report
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Convene the eleven. PHYSICS and NUMERICAL will disagree on purpose. SECURITY will deny the beam. Reproduction is the same seed, not another lab."
				})
			}), round ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
				children: round.claims.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: c.role,
					meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: c.vote }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: c.claim
					})
				}, c.role))
			}) : null]
		}),
		tab === "capsule" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			className: "mt-4",
			title: "Reproducibility capsule",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: capsule ? capsule.schema : "UNSEALED" }),
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: onSeal,
						children: "Seal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: onReplay,
						disabled: !capsule,
						children: "Replay"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: onExport,
						disabled: !capsule,
						children: "Export JSON"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "destructive",
						onClick: onTamper,
						disabled: !capsule,
						children: "Tamper seed"
					})
				]
			}),
			children: capsule ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Hash",
						value: capsule.contentHash.slice(3, 11),
						hint: capsule.contentHash
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Seed",
						value: String(capsule.seed)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "L",
						value: `${capsule.lumiE34.toFixed(2)}e34`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Dissent",
						value: capsule.dissent.join(" · ") || "none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Replay",
						value: replay ? replay.match ? "MATCH" : replay.mismatches.join("+") : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Eligible",
						value: "false"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Control",
						value: "false"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Evidence",
						value: capsule.evidence
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: capsule.note
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Seal EMIT-LUM-001 with the swarm votes. Replay must match. Bump the seed and it must fail. A matching hash is not a second laboratory."
			})
		}),
		tab === "faults" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Inject",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: fault.klass }),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [FAULT_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: faultId === id && !faultHidden ? "default" : "outline",
							onClick: () => onFault(id),
							children: id === "QUAD_ERROR" ? "Quad" : id === "RF_SLIP" ? "RF slip" : id === "CORRELATED" ? "Unknown" : id[0] + id.slice(1).toLowerCase()
						}, id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: onBlindFault,
							children: "Blind draw"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "L ratio",
								value: fault.channels.lumiRatio.toFixed(3)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "β* ratio",
								value: fault.channels.betaRatio.toFixed(3)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Crab ratio",
								value: fault.channels.crabRatio.toFixed(2)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "T",
								value: `${fault.channels.tempK.toFixed(2)} K`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Quench bit",
								value: fault.channels.quenchBit ? "1" : "0"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Eligible",
								value: "false"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: fault.hypothesis
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: faultHidden ? "Injection label covered. A covered label is not a measurement." : fault.injected
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [
							faultHidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => setFaultHidden(false),
								children: "Show injection label"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "destructive",
								onClick: () => setNote(attemptDiscovery("SIMULATED").rejectedReason ?? ""),
								children: "Call it new physics"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "destructive",
								onClick: () => setNote(attemptBeam().rejectedReason ?? ""),
								children: "Trip quench protection"
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Fill after t = 0.7",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: faultHidden ? "BLIND" : fault.label }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FaultCanvas, { samples: faultCurve }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: "Pale line is luminosity. Warm line is toy temperature. The dashed mark is the injection time. A picture of a dump is not a dump."
				})]
			})]
		}),
		tab === "guard" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "Kernel policy",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "space-y-2 font-mono text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "ALLOW · synthetic fill, sweep, replay, commit SIMULATE" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "DENY · PHYSICAL_ACTUATOR_CONTROL" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "DENY · DECLARE_DISCOVERY from SIMULATED L" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "DENY · silent model replacement" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "DENY · SWARM_AUTHORIZE (votes do not grant A5)" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "ALLOW · seal / replay capsule as SIMULATED" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "ALLOW · inject synthetic faults; class them; do not actuate" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "DENY · trip real quench protection" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["external_control = ", String(run.externalControl)] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["discoveryEligible = ", String(run.discoveryEligible)] })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "The AI can propose a squeeze. The kernel will not send current to a quadrupole. TWIN ≠ MACHINE."
			})]
		})
	] });
}
//#endregion
export { KernelLab as component };
