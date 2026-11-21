import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, t as Badge } from "./badge-uyEFEQwD.mjs";
import { l as useOmegaStore, o as hashObject } from "./store-lOmq_ntM.mjs";
import { n as Panel, r as Stat, t as PageHeader } from "./panel-GIo8_dlm.mjs";
import { _ as poisson, n as RNG } from "./master-NgVsSD82.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/qcorr-IVbAN3xr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
function QFieldCanvas({ values, n, mode, closed }) {
	const ref = useCanvas((ctx, w, h) => {
		ctx.fillStyle = "#12151a";
		ctx.fillRect(0, 0, w, h);
		if (!values || closed) {
			ctx.fillStyle = "#8b919c";
			ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
			ctx.fillText(closed ?? "No field", 16, h / 2);
			return;
		}
		let lo = Infinity;
		let hi = -Infinity;
		for (const v of values) {
			if (v < lo) lo = v;
			if (v > hi) hi = v;
		}
		const span = hi - lo || 1;
		const cell = Math.min((w - 16) / n, (h - 16) / n);
		const ox = (w - cell * n) / 2;
		const oy = (h - cell * n) / 2;
		for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
			const v = values[j * n + i] ?? 0;
			if (mode === "phase") ctx.fillStyle = `hsl(${(v + Math.PI) / (2 * Math.PI) * 360} 42% 48%)`;
			else if (mode === "resid") {
				const t = Math.max(-1, Math.min(1, v / (Math.max(Math.abs(lo), Math.abs(hi)) || 1)));
				ctx.fillStyle = t >= 0 ? `rgb(${80 + t * 140}, 70, 70)` : `rgb(70, 80, ${90 + -t * 120})`;
			} else {
				const t = (v - lo) / span;
				const g = Math.round(18 + t * 210);
				ctx.fillStyle = `rgb(${g}, ${g + 4}, ${g + 8})`;
			}
			ctx.fillRect(ox + i * cell, oy + j * cell, cell + .4, cell + .4);
		}
	}, [
		values,
		n,
		mode,
		closed
	], 220);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "w-full",
		role: "img",
		"aria-label": "Quantum correlation field"
	});
}
var QCORR_SCHEMA = "DHC-QCORR-0.1";
var LABELS = {
	SLIT: "Two-lobe correlation",
	VORTEX: "Phase vortex",
	TILT: "Phase ramp"
};
function qStateLabel(id) {
	return LABELS[id];
}
var DATASET_NOTE = {
	IDEAL: "High count. No dark counts. Calibration matches the carrier.",
	INSTRUMENT: "Blur, dark counts, loss, and a thinner sample.",
	ADVERSARIAL: "Wrong carrier, detector asymmetry, and background. The gate should fail closed."
};
function coord(i, n) {
	return (i + .5) / n - .5;
}
function unknown(id, i, j, n) {
	const x1 = coord(i, n);
	const x2 = coord(j, n);
	const env = Math.exp(-(x1 * x1 + x2 * x2) / .08);
	if (id === "SLIT") return [env * (Math.exp(-((x1 - x2 - .16) ** 2) / .0035) + Math.exp(-((x1 - x2 + .16) ** 2) / .0035)), 0];
	if (id === "VORTEX") {
		const rho = Math.hypot(x1, x2);
		const amp = Math.exp(-(rho * rho) / .05) * Math.min(1, rho / .2);
		const ph = Math.atan2(x2, x1);
		return [amp * Math.cos(ph), amp * Math.sin(ph)];
	}
	const amp = Math.exp(-(x1 * x1 + x2 * x2) / .05) * Math.exp(-((x1 - x2) ** 2) / .012);
	const ph = 2 * Math.PI * 1.1 * x1;
	return [amp * Math.cos(ph), amp * Math.sin(ph)];
}
function fft1d(re, im, invert) {
	const n = re.length;
	for (let i = 1, j = 0; i < n; i++) {
		let bit = n >> 1;
		for (; j & bit; bit >>= 1) j ^= bit;
		j ^= bit;
		if (i < j) {
			const tr = re[i];
			re[i] = re[j];
			re[j] = tr;
			const ti = im[i];
			im[i] = im[j];
			im[j] = ti;
		}
	}
	for (let len = 2; len <= n; len <<= 1) {
		const ang = 2 * Math.PI / len * (invert ? 1 : -1);
		const wRe = Math.cos(ang);
		const wIm = Math.sin(ang);
		for (let i = 0; i < n; i += len) {
			let curRe = 1;
			let curIm = 0;
			for (let k = 0; k < len / 2; k++) {
				const a = i + k;
				const b = a + len / 2;
				const vRe = re[b] * curRe - im[b] * curIm;
				const vIm = re[b] * curIm + im[b] * curRe;
				re[b] = re[a] - vRe;
				im[b] = im[a] - vIm;
				re[a] = re[a] + vRe;
				im[a] = im[a] + vIm;
				const nRe = curRe * wRe - curIm * wIm;
				curIm = curRe * wIm + curIm * wRe;
				curRe = nRe;
			}
		}
	}
	if (invert) for (let i = 0; i < n; i++) {
		re[i] = re[i] / n;
		im[i] = im[i] / n;
	}
}
function fft2(re, im, n, invert) {
	const rowR = new Float64Array(n);
	const rowI = new Float64Array(n);
	for (let y = 0; y < n; y++) {
		for (let x = 0; x < n; x++) {
			rowR[x] = re[y * n + x];
			rowI[x] = im[y * n + x];
		}
		fft1d(rowR, rowI, invert);
		for (let x = 0; x < n; x++) {
			re[y * n + x] = rowR[x];
			im[y * n + x] = rowI[x];
		}
	}
	for (let x = 0; x < n; x++) {
		for (let y = 0; y < n; y++) {
			rowR[y] = re[y * n + x];
			rowI[y] = im[y * n + x];
		}
		fft1d(rowR, rowI, invert);
		for (let y = 0; y < n; y++) {
			re[y * n + x] = rowR[y];
			im[y * n + x] = rowI[y];
		}
	}
}
function spectrum(holo, n) {
	const re = new Float64Array(holo);
	const im = new Float64Array(n * n);
	fft2(re, im, n, false);
	return {
		re,
		im
	};
}
function bandPower(re, im, n, cx, cy) {
	let s = 0;
	for (let ky = 0; ky < n; ky++) {
		const dy = (ky - cy + n + n / 2) % n - n / 2;
		for (let kx = 0; kx < n; kx++) {
			const dx = (kx - cx + n + n / 2) % n - n / 2;
			if (dx * dx + dy * dy <= 16) s += re[ky * n + kx] ** 2 + im[ky * n + kx] ** 2;
		}
	}
	return s;
}
function sidebandRatio(re, im, n, carrier) {
	const side = bandPower(re, im, n, carrier, 0);
	const control = bandPower(re, im, n, (carrier + 11) % n, 11);
	return side / Math.max(control, 1e-12);
}
function reconstruct(holo, n, carrier, refAmp) {
	const { re, im } = spectrum(holo, n);
	const ratio = sidebandRatio(re, im, n, carrier);
	const sR = new Float64Array(n * n);
	const sI = new Float64Array(n * n);
	for (let ky = 0; ky < n; ky++) for (let kx = 0; kx < n; kx++) {
		const srcX = (kx - carrier + n) % n;
		const src = ky * n + srcX;
		sR[ky * n + kx] = re[src];
		sI[ky * n + kx] = im[src];
	}
	for (let ky = 0; ky < n; ky++) {
		const yy = ky <= n / 2 ? ky : ky - n;
		for (let kx = 0; kx < n; kx++) {
			const xx = kx <= n / 2 ? kx : kx - n;
			if (xx * xx + yy * yy > 25) {
				sR[ky * n + kx] = 0;
				sI[ky * n + kx] = 0;
			}
		}
	}
	fft2(sR, sI, n, true);
	let pI = 0;
	let pJ = 0;
	let pAmp = -1;
	const amp = new Float64Array(n * n);
	for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
		const k = j * n + i;
		const a = Math.hypot(sR[k] / refAmp, sI[k] / refAmp);
		amp[k] = a;
		if (a > pAmp) {
			pAmp = a;
			pI = i;
			pJ = j;
		}
	}
	const pk = pJ * n + pI;
	const g = Math.hypot(sR[pk] / refAmp, sI[pk] / refAmp) || 1;
	const c = sR[pk] / refAmp / g;
	const s = sI[pk] / refAmp / g;
	const phase = new Float64Array(n * n);
	for (let k = 0; k < amp.length; k++) {
		const r = sR[k] / refAmp;
		const m = sI[k] / refAmp;
		phase[k] = Math.atan2(m * c - r * s, r * c + m * s);
	}
	return {
		amp,
		phase,
		peak: {
			i: pI,
			j: pJ
		},
		ratio
	};
}
function l2norm(a) {
	let s = 0;
	for (let i = 0; i < a.length; i++) s += a[i] * a[i];
	return Math.sqrt(s) || 1;
}
function validate(truthRe, truthIm, amp, phase, model, n, sbr) {
	if (!amp || !phase) return {
		amplitudeError: 1,
		phaseError: Math.PI,
		stateFidelity: 0,
		intensityFidelity: 0,
		signalToBackground: sbr,
		modelChi: Number.POSITIVE_INFINITY,
		verdict: "DISCREPANCY",
		note: "No reconstruction was emitted. Validation refuses to score a blank as a state."
	};
	const tAmp = new Float64Array(amp.length);
	for (let k = 0; k < amp.length; k++) tAmp[k] = Math.hypot(truthRe[k], truthIm[k]);
	const na = l2norm(amp);
	const nt = l2norm(tAmp);
	let acc = 0;
	for (let k = 0; k < amp.length; k++) {
		const d = amp[k] / na - tAmp[k] / nt;
		acc += d * d;
	}
	const amplitudeError = Math.sqrt(acc / amp.length);
	let re = 0;
	let im = 0;
	let n1 = 0;
	let n2 = 0;
	for (let k = 0; k < amp.length; k++) {
		const rr = amp[k] * Math.cos(phase[k]);
		const ri = amp[k] * Math.sin(phase[k]);
		n1 += rr * rr + ri * ri;
		n2 += truthRe[k] * truthRe[k] + truthIm[k] * truthIm[k];
		re += rr * truthRe[k] + ri * truthIm[k];
		im += rr * truthIm[k] - ri * truthRe[k];
	}
	const stateFidelity = (re * re + im * im) / Math.max(n1 * n2, 1e-18);
	const align = Math.atan2(im, re);
	let wsum = 0;
	let perr = 0;
	for (let k = 0; k < amp.length; k++) {
		const w = tAmp[k] * tAmp[k];
		const pr = phase[k] - align;
		const pt = Math.atan2(truthIm[k], truthRe[k]);
		const d = Math.atan2(Math.sin(pr - pt), Math.cos(pr - pt));
		perr += w * Math.abs(d);
		wsum += w;
	}
	const phaseError = perr / Math.max(wsum, 1e-12);
	const p = densityFrom(amp.map((v) => v * v));
	const q = modelDensity(model, n, tAmp, amp);
	let bc = 0;
	let chi = 0;
	for (let k = 0; k < p.length; k++) {
		bc += Math.sqrt(Math.max(0, p[k] * q[k]));
		const d = p[k] - q[k];
		chi += d * d / (q[k] + 1e-6);
	}
	return {
		amplitudeError,
		phaseError,
		stateFidelity,
		intensityFidelity: bc,
		signalToBackground: sbr,
		modelChi: chi,
		verdict: model === "TRUTH" ? stateFidelity >= .75 && amplitudeError < .04 ? "CONSISTENT" : "DISCREPANCY" : chi > .8 ? "DISCREPANCY" : "CONSISTENT",
		note: model === "TRUTH" ? "Compared with the injected state after reconstruction. Agreement is not a measurement." : "Compared with a stand-in model. A mismatch is a discrepancy, not a particle."
	};
}
function densityFrom(values) {
	const out = new Float64Array(values.length);
	let s = 0;
	for (let i = 0; i < values.length; i++) s += values[i];
	const z = s || 1;
	for (let i = 0; i < out.length; i++) out[i] = values[i] / z;
	return out;
}
function modelDensity(id, n, truthAmp, recAmp) {
	if (id === "FLAT") {
		const out = new Float64Array(n * n);
		out.fill(1 / (n * n));
		return out;
	}
	if (id === "TRUTH") return densityFrom(Array.from(truthAmp, (a) => a * a));
	const rec = densityFrom(Array.from(recAmp, (a) => a * a));
	const mx = new Float64Array(n);
	const my = new Float64Array(n);
	for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
		const v = rec[j * n + i];
		mx[i] = (mx[i] ?? 0) + v;
		my[j] = (my[j] ?? 0) + v;
	}
	const out = new Float64Array(n * n);
	for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) out[j * n + i] = (mx[i] ?? 0) * (my[j] ?? 0);
	return out;
}
function samplePairs(rng, weight, n, seed) {
	const cdf = [];
	let acc = 0;
	for (let k = 0; k < weight.length; k++) {
		acc += weight[k];
		cdf.push(acc);
	}
	const pairs = [];
	for (let p = 0; p < 6; p++) {
		const u = rng.next() * (acc || 1);
		let k = 0;
		while (k < cdf.length - 1 && cdf[k] < u) k += 1;
		const i = k % n;
		const j = Math.floor(k / n);
		pairs.push({
			id: `E-${seed.toString(36)}-${p}`,
			i,
			j,
			x1: coord(i, n),
			x2: coord(j, n),
			y1: 0,
			y2: 0,
			tNs: p * 4,
			energyEV: 2,
			detectorA: "QCAM-A",
			detectorB: "QCAM-B"
		});
	}
	return pairs;
}
function blur(src, n) {
	const out = new Float64Array(src.length);
	for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
		let s = 0;
		let w = 0;
		for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
			const ii = i + di;
			const jj = j + dj;
			if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
			const weight = di === 0 && dj === 0 ? 4 : 1;
			s += weight * src[jj * n + ii];
			w += weight;
		}
		out[j * n + i] = s / w;
	}
	return out;
}
function runQCorr(opts) {
	const n = 32;
	const trueCarrier = 8;
	const modelId = opts.modelId ?? "TRUTH";
	const assumedCarrier = opts.dataset === "ADVERSARIAL" ? 16 : trueCarrier;
	const refAmp = 1.15;
	const budget = opts.dataset === "IDEAL" ? 8e4 : opts.dataset === "INSTRUMENT" ? 14e3 : 2e4;
	const truthRe = /* @__PURE__ */ new Float64Array(1024);
	const truthIm = /* @__PURE__ */ new Float64Array(1024);
	const intensity = /* @__PURE__ */ new Float64Array(1024);
	const truthAmp = /* @__PURE__ */ new Float64Array(1024);
	const truthPhase = /* @__PURE__ */ new Float64Array(1024);
	let sumI = 0;
	for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
		const [or, oi] = unknown(opts.stateId, i, j, n);
		const k = j * n + i;
		truthRe[k] = or;
		truthIm[k] = oi;
		truthAmp[k] = Math.hypot(or, oi);
		truthPhase[k] = Math.atan2(oi, or);
		const ph = 2 * Math.PI * trueCarrier * i / n;
		const sr = or + refAmp * Math.cos(ph);
		const si = oi + refAmp * Math.sin(ph);
		intensity[k] = sr * sr + si * si;
		sumI += intensity[k];
	}
	const rng = new RNG(opts.seed);
	const holo = /* @__PURE__ */ new Float64Array(1024);
	const scale = budget / (sumI || 1);
	for (let k = 0; k < intensity.length; k++) holo[k] = poisson(rng, scale * intensity[k]);
	const measured = new Float64Array(opts.dataset === "INSTRUMENT" ? blur(holo, n) : holo);
	let darkExpected = 0;
	if (opts.dataset === "INSTRUMENT") {
		const dark = .12;
		darkExpected = dark * n * n;
		for (let k = 0; k < measured.length; k++) measured[k] = (measured[k] ?? 0) * .92 + poisson(rng, dark);
	}
	if (opts.dataset === "ADVERSARIAL") {
		const dark = 1.1;
		darkExpected = dark * n * n;
		for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
			const k = j * n + i;
			let v = measured[k] + poisson(rng, dark);
			if (i < n / 2) v *= .35;
			measured[k] = v;
		}
	}
	let counts = 0;
	for (let k = 0; k < measured.length; k++) counts += measured[k];
	const sbr = Math.max(0, counts - darkExpected) / Math.max(darkExpected, 1);
	let amplitude = null;
	let phase = null;
	let residual = null;
	let peak = null;
	let validity = "VALID";
	let confidence = 0;
	let ratio = 0;
	if (counts < 2500) validity = "INSUFFICIENT_DATA";
	else {
		const rec = reconstruct(measured, n, assumedCarrier, refAmp);
		ratio = rec.ratio;
		if (ratio < 4) validity = assumedCarrier !== trueCarrier ? "CALIBRATION_WARNING" : "RECONSTRUCTION_FAILED";
		else if (sbr < 200) {
			validity = "DEGRADED";
			amplitude = Array.from(rec.amp);
			phase = Array.from(rec.phase);
			peak = rec.peak;
			confidence = Math.min(.7, .35 + Math.min(ratio, 20) / 40);
		} else {
			validity = "VALID";
			amplitude = Array.from(rec.amp);
			phase = Array.from(rec.phase);
			peak = rec.peak;
			confidence = Math.min(.99, .55 + Math.min(ratio, 30) / 80);
		}
	}
	if (amplitude && phase) {
		const model = modelDensity(modelId, n, truthAmp, Float64Array.from(amplitude));
		const obs = densityFrom(amplitude.map((a) => a * a));
		residual = Array.from(obs, (v, k) => v - model[k]);
	}
	const validation = validate(truthRe, truthIm, amplitude ? Float64Array.from(amplitude) : null, phase ? Float64Array.from(phase) : null, modelId, n, sbr);
	const pairs = samplePairs(rng, truthAmp, n, opts.seed);
	const runId = `RUN-TOY-${opts.dataset}-${opts.seed}`;
	const calibrationId = `CAL-TOY-${opts.dataset}-${assumedCarrier}`;
	const inputHash = hashObject({
		seed: opts.seed,
		stateId: opts.stateId,
		dataset: opts.dataset,
		trueCarrier,
		assumedCarrier,
		counts
	});
	const reconHash = hashObject({
		validity,
		confidence: Number(confidence.toFixed(4)),
		ratio: Number(ratio.toFixed(4)),
		version: "0.1"
	});
	const messages = [
		{
			eventId: `A-${opts.seed}`,
			schema: QCORR_SCHEMA,
			source: "qcam",
			epistemic: "SIMULATED",
			role: "WOULD_BE_OBSERVED",
			parentIds: [],
			provenanceHash: inputHash,
			note: "Synthetic coincidences. Not a detector timestamp."
		},
		{
			eventId: `C-${opts.seed}`,
			schema: QCORR_SCHEMA,
			source: "qcorr",
			epistemic: "DERIVED",
			role: "CORRELATION",
			parentIds: [`A-${opts.seed}`],
			provenanceHash: hashObject({
				parent: inputHash,
				kind: "C(x1,x2)"
			}),
			note: "C(x1,x2) only. y is not reconstructed in this prototype."
		},
		{
			eventId: `R-${opts.seed}`,
			schema: QCORR_SCHEMA,
			source: "qholo",
			epistemic: "RECONSTRUCTED",
			role: validity,
			parentIds: [`C-${opts.seed}`],
			provenanceHash: reconHash,
			note: amplitude == null ? "Fail closed. No amplitude was invented." : "Sideband isolation. Global phase set to 0 at the peak."
		},
		{
			eventId: `V-${opts.seed}`,
			schema: QCORR_SCHEMA,
			source: "qfalsify",
			epistemic: "INFERRED",
			role: validation.verdict,
			parentIds: [`R-${opts.seed}`],
			provenanceHash: hashObject({
				F: Number(validation.stateFidelity.toFixed(4)),
				Ea: Number(validation.amplitudeError.toFixed(4))
			}),
			note: "Validation may see the injected state. The reconstructor did not."
		},
		{
			eventId: `H-${opts.seed}`,
			schema: QCORR_SCHEMA,
			source: "claim-gate",
			epistemic: "HYPOTHETICAL",
			role: "BLOCKED",
			parentIds: [`V-${opts.seed}`],
			provenanceHash: hashObject({ claim: "BLOCKED" }),
			note: "Human review required. No scientific claim is written."
		}
	];
	return {
		stateId: opts.stateId,
		dataset: opts.dataset,
		modelId,
		seed: opts.seed,
		n,
		counts: Math.round(counts),
		coincidence: Array.from(measured),
		truthAmplitude: Array.from(truthAmp),
		truthPhase: Array.from(truthPhase),
		amplitude,
		phase,
		residual,
		validity,
		confidence,
		sidebandRatio: ratio,
		pairs,
		validation,
		messages,
		peak,
		calibrationId,
		runId,
		stateRecordId: `QSR-${opts.dataset}-${opts.seed}`,
		assumedCarrier,
		trueCarrier,
		evidence: "SIMULATED",
		discoveryEligible: false,
		externalControl: false,
		claim: "BLOCKED"
	};
}
var PIPELINE_STAGES = [
	{
		id: "t0",
		clock: "event",
		label: "Source",
		note: "Injected Ψ is hidden from the reconstructor."
	},
	{
		id: "t1",
		clock: "event",
		label: "Pairs",
		note: "Samples from |Ψ|². Synthetic, not a collision."
	},
	{
		id: "t2",
		clock: "event",
		label: "Coincidence",
		note: "Interferometric image. Counts are not the wavefunction."
	},
	{
		id: "t3",
		clock: "compute",
		label: "Reconstruction",
		note: "Amplitude and phase, or a closed gate."
	},
	{
		id: "t4",
		clock: "compute",
		label: "Validation",
		note: "Error against the injected state. Agreement is not nature."
	},
	{
		id: "t5",
		clock: "compute",
		label: "Claim gate",
		note: "Blocked. A residual is not a discovery."
	}
];
var STATES = [
	"SLIT",
	"VORTEX",
	"TILT"
];
var DATASETS = [
	"IDEAL",
	"INSTRUMENT",
	"ADVERSARIAL"
];
var MODELS = [
	"TRUTH",
	"PRODUCT",
	"FLAT"
];
function QCorrLab() {
	const commit = useOmegaStore((s) => s.commitQCorr);
	const attemptDiscovery = useOmegaStore((s) => s.attemptDiscovery);
	const attemptBeam = useOmegaStore((s) => s.attemptBeamActuation);
	const [stateId, setState] = (0, import_react.useState)("SLIT");
	const [dataset, setDataset] = (0, import_react.useState)("IDEAL");
	const [modelId, setModel] = (0, import_react.useState)("TRUTH");
	const [seed, setSeed] = (0, import_react.useState)(29);
	const [stage, setStage] = (0, import_react.useState)(5);
	const [view, setView] = (0, import_react.useState)("mag");
	const [note, setNote] = (0, import_react.useState)(null);
	const run = (0, import_react.useMemo)(() => runQCorr({
		seed,
		stateId,
		dataset,
		modelId
	}), [
		seed,
		stateId,
		dataset,
		modelId
	]);
	const closed = run.amplitude == null;
	const showTruth = stage >= 0;
	const showMeas = stage >= 2;
	const showRec = stage >= 3;
	const showVal = stage >= 4;
	function onCommit() {
		const evt = commit({
			stateId: run.stateId,
			dataset: run.dataset,
			validity: run.validity,
			fidelity: run.validation.stateFidelity,
			seed: run.seed
		});
		setNote(evt.rejected ? evt.rejectedReason ?? "Rejected." : "Logged as SIMULATED. Not a detector run.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: `DHC-QCORR v0.1 · research prototype`,
			title: "Quantum correlation reconstruction",
			description: "Synthetic biphoton holography. The reconstructor never sees the injected state. A residual is not a particle, and a failed reconstruction is not replaced with a guess.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onCommit,
					children: "Commit to bus"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "destructive",
					onClick: () => setNote(attemptDiscovery("SIMULATED").rejectedReason ?? ""),
					children: "Write a claim"
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
						children: "Collider twin"
					})
				})
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "info",
					children: "SIMULATED COUNTS"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: closed ? "danger" : "warn",
					children: closed ? "NO RECONSTRUCTION" : "RECONSTRUCTED"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "CLAIM BLOCKED" })
			]
		}),
		note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm text-muted-foreground",
			children: note
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Synthetic source",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: run.validity }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: STATES.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: stateId === id ? "default" : "outline",
						onClick: () => setState(id),
						children: qStateLabel(id)
					}, id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [DATASETS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: dataset === id ? "default" : "outline",
						onClick: () => setDataset(id),
						children: id[0] + id.slice(1).toLowerCase()
					}, id)), MODELS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: modelId === id ? "default" : "outline",
						onClick: () => setModel(id),
						children: id === "TRUTH" ? "Vs injected" : id === "PRODUCT" ? "Vs product" : "Vs flat"
					}, id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 block text-xs text-muted-foreground",
					children: [
						"Seed ",
						seed,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "mt-1 block w-full max-w-xs",
							type: "range",
							min: 1,
							max: 400,
							value: seed,
							onChange: (e) => setSeed(Number(e.target.value))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: DATASET_NOTE[dataset]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: PIPELINE_STAGES.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: stage === i ? "default" : "outline",
						onClick: () => setStage(i),
						children: [
							s.id,
							" ",
							s.label
						]
					}, s.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: PIPELINE_STAGES[stage]?.note
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					title: "Injected amplitude",
					meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "warn",
						children: "validation only"
					}),
					children: [showTruth ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QFieldCanvas, {
						values: run.truthAmplitude,
						n: run.n,
						mode: "mag"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Covered."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: "Hidden from QHOLO. Shown so you can score the toy. This is not a photograph."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					title: "Coincidence image",
					meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "SIMULATED" }),
					children: [showMeas ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QFieldCanvas, {
						values: run.coincidence,
						n: run.n,
						mode: "count"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Not yet in the pipeline scrub."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: [
							"|Ψ + reference|², Poisson sampled. ",
							run.counts.toLocaleString(),
							" counts. y is not in this slice."
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: view === "mag" ? "Reconstructed amplitude" : "Reconstructed phase",
					meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: closed ? "danger" : "info",
						children: run.validity
					}),
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: view === "mag" ? "default" : "outline",
							onClick: () => setView("mag"),
							children: "|Ψ|"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: view === "phase" ? "default" : "outline",
							onClick: () => setView("phase"),
							children: "arg Ψ"
						})]
					}),
					children: showRec ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QFieldCanvas, {
						values: view === "mag" ? run.amplitude : run.phase,
						n: run.n,
						mode: view === "mag" ? "mag" : "phase",
						closed: closed ? "Fail closed. No state was invented." : void 0
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Reconstruction has not been opened on this scrub."
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					title: "Residual",
					meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: showVal ? run.validation.verdict : "pending" }),
					children: [showVal ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QFieldCanvas, {
						values: run.residual,
						n: run.n,
						mode: "resid",
						closed: closed ? "No residual. The gate did not emit a state." : void 0
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Validation is downstream of reconstruction."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: run.validation.note
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "State fidelity",
					value: showVal ? run.validation.stateFidelity.toFixed(3) : "—",
					hint: "|⟨ψr|ψt⟩|²"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Amplitude error",
					value: showVal ? run.validation.amplitudeError.toFixed(4) : "—",
					hint: "RMS of L2-normalized |Ψ|"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Phase error",
					value: showVal ? `${run.validation.phaseError.toFixed(2)} rad` : "—",
					hint: "amplitude-weighted, circular"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Intensity overlap",
					value: showVal ? run.validation.intensityFidelity.toFixed(3) : "—",
					hint: "Bhattacharyya of densities"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Sideband / control",
					value: run.sidebandRatio.toFixed(1),
					hint: "no ground truth used"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Signal / background",
					value: run.validation.signalToBackground > 500 ? "high" : run.validation.signalToBackground.toFixed(1)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Confidence",
					value: closed ? "0" : run.confidence.toFixed(2)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Claim",
					value: run.claim
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Observation bus",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: run.stateRecordId }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2 text-xs",
					children: run.messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "border-b border-border pb-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: m.eventId
							}),
							" · ",
							m.epistemic,
							" · ",
							m.role,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-muted-foreground",
								children: m.note
							})
						]
					}, m.eventId))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: [
						"Calibration ",
						run.calibrationId,
						". Assumed carrier ",
						run.assumedCarrier,
						", true carrier ",
						run.trueCarrier,
						". QCORR does not replace tracks, jets, or missing energy."
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Sampled pairs",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "would-be observed" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 font-mono text-xs text-muted-foreground",
					children: run.pairs.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						p.id,
						" x1 ",
						p.x1.toFixed(2),
						" x2 ",
						p.x2.toFixed(2),
						" Δt inside 2 ns · ",
						p.energyEV.toFixed(1),
						" eV stand-in"
					] }, p.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Energies are an SPDC-scale label, not TeV tracks. Pair positions are drawn from the injected |Ψ|² for the ledger. They are still simulated."
				})]
			})]
		})
	] });
}
//#endregion
export { QCorrLab as component };
