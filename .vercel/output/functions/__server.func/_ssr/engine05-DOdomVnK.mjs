import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, t as Badge } from "./badge-uyEFEQwD.mjs";
import { n as Panel, r as Stat, t as PageHeader } from "./panel-GIo8_dlm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/engine05-DOdomVnK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function adaptiveEigenvalue(solveEnergy, options) {
	const relativeTolerance = options.relativeTolerance ?? 1e-6;
	const energyScale = options.energyScale ?? 1;
	const safety = options.safety ?? .9;
	const minStep = options.minStep ?? 1e-6;
	const maxIterations = options.maxIterations ?? 20;
	const maxRefinementFactor = options.maxRefinementFactor ?? 2;
	if (options.initialStep <= 0 || minStep <= 0 || minStep >= options.initialStep) throw new Error("Invalid adaptive step settings");
	let h = options.initialStep;
	let previous = 2 * h;
	let coarse = solveEnergy(previous);
	const history = [];
	for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
		const fine = solveEnergy(h);
		if (!Number.isFinite(coarse) || !Number.isFinite(fine)) throw new Error("Solver returned a non-finite eigenvalue");
		const q = previous / h;
		if (q <= 1) throw new Error("New grid is not finer than the previous grid");
		const denominator = q ** 4 - 1;
		const estimatedError = Math.abs(fine - coarse) / denominator;
		const extrapolated = (q ** 4 * fine - coarse) / denominator;
		const relativeError = estimatedError / Math.max(Math.abs(extrapolated), energyScale);
		history.push({
			iteration,
			stepSize: h,
			q,
			coarseEnergy: coarse,
			fineEnergy: fine,
			richardsonEnergy: extrapolated,
			estimatedError,
			relativeError
		});
		if (relativeError <= relativeTolerance) return {
			energy: extrapolated,
			estimatedError,
			relativeError,
			stepSize: h,
			iterations: iteration,
			converged: true,
			history
		};
		let factor = safety * (relativeTolerance / relativeError) ** .25;
		factor = Math.min(1, Math.max(1 / maxRefinementFactor, factor));
		let next = h * factor;
		if (next >= h) next = h / 2;
		if (next < minStep) throw new Error("Minimum grid spacing reached before convergence");
		coarse = fine;
		previous = h;
		h = next;
	}
	throw new Error("Adaptive refinement did not converge");
}
var ledger_default = {
	record_id: "SQRT-D02-GAUSS-001",
	engine: "SQRT-01-ENGINE-05",
	solver: "numerov-fixed-step-v1",
	adaptive_solver: "richardson-global-fourth-order-v1",
	method_order_global: 4,
	controller_exponent: .25,
	local_step_doubling_implemented: false,
	variable_step_recurrence_implemented: false,
	mesh_frozen_during_each_root_search: true,
	experimental_validation: false,
	repository_publication: false,
	epistemic_status: {
		"fixed_step_numerov": "TESTED",
		"global_richardson_refinement": "TESTED",
		"pytest": "TESTED",
		"experimental_measurement": "NOT_VALIDATED"
	},
	constants: {
		"hbar_J_s": 1054571817e-43,
		"u_kg": 16605390666e-37,
		"eV_J": 1602176634e-28,
		"Es_eV": .0041801592804967215,
		"g": 1196.1266699401604
	},
	potential: {
		"form": "V(r)=-V0*exp(-(r/a)^2)",
		"mu_u": .5,
		"V0_eV": 5,
		"a_pm": 100,
		"ell": 0
	},
	boundary_conditions: {
		"origin": "u(0)=0 with u(h)=h for ell=0",
		"outer": "inward decaying exp(-sqrt(-epsilon)*x), constant kappa",
		"match": "corrected logarithmic derivatives at match/a=0.17",
		"rmax_over_a": 6
	},
	archived_reference_energy_eV: -4.5741727208,
	grid_convergence: [
		{
			"h_over_a": .01,
			"energy_eV": -4.574172807425034,
			"archived_energy_eV": -4.57417280742503,
			"absolute_difference_eV": -4440892098500626e-30,
			"norm": .9999999999999999,
			"nodes": 0,
			"mean_radius_pm": 19.529641993494515,
			"tail_probability": .11571577730846237,
			"truncated_tail_probability": 18792604563251902e-170,
			"matching_residual": 8263112416528884e-28,
			"potential_evaluations": 13823,
			"residual_evaluations": 23,
			"n_points": 601,
			"root_bracket_eV": [-4.591111320754717, -4.559666037735849]
		},
		{
			"h_over_a": .005,
			"energy_eV": -4.574172726218458,
			"archived_energy_eV": -4.574172726218435,
			"absolute_difference_eV": -23092638912203256e-30,
			"norm": .9999999999999999,
			"nodes": 0,
			"mean_radius_pm": 19.529644998642457,
			"tail_probability": .11555597803520556,
			"truncated_tail_probability": 1892738965615252e-169,
			"matching_residual": -3499978085130806e-29,
			"potential_evaluations": 27623,
			"residual_evaluations": 23,
			"n_points": 1201,
			"root_bracket_eV": [-4.591111320754717, -4.559666037735849]
		},
		{
			"h_over_a": .0025,
			"energy_eV": -4.574172721145459,
			"archived_energy_eV": -4.574172721145481,
			"absolute_difference_eV": 2220446049250313e-29,
			"norm": 1.0000000000000002,
			"nodes": 0,
			"mean_radius_pm": 19.529645186466336,
			"tail_probability": .1155160134197469,
			"truncated_tail_probability": 1893587855119147e-169,
			"matching_residual": -10850764731173967e-28,
			"potential_evaluations": 55223,
			"residual_evaluations": 23,
			"n_points": 2401,
			"root_bracket_eV": [-4.591111320754717, -4.559666037735849]
		},
		{
			"h_over_a": .00125,
			"energy_eV": -4.574172720828622,
			"archived_energy_eV": -4.574172720828307,
			"absolute_difference_eV": -31441516057384433e-29,
			"norm": 1.0000000000000002,
			"nodes": 0,
			"mean_radius_pm": 19.529645198207014,
			"tail_probability": .11550598478154266,
			"truncated_tail_probability": 18936409830068483e-170,
			"matching_residual": 6845274347355712e-27,
			"potential_evaluations": 110423,
			"residual_evaluations": 23,
			"n_points": 4801,
			"root_bracket_eV": [-4.591111320754717, -4.559666037735849]
		},
		{
			"h_over_a": 625e-6,
			"energy_eV": -4.57417272080905,
			"archived_energy_eV": -4.574172720808557,
			"absolute_difference_eV": -4929390229335695e-28,
			"norm": 1,
			"nodes": 0,
			"mean_radius_pm": 19.52964519892723,
			"tail_probability": .11550346554626906,
			"truncated_tail_probability": 18936443046634625e-170,
			"matching_residual": 2323535808201882e-26,
			"potential_evaluations": 220823,
			"residual_evaluations": 23,
			"n_points": 9601,
			"root_bracket_eV": [-4.591111320754717, -4.559666037735849]
		}
	],
	domain_convergence_h_over_a_0_0025: [
		{
			"rmax_over_a": 4,
			"energy_eV": -4.57417272114547,
			"matching_residual": 5085099008539373e-28,
			"truncated_tail_probability": 5.525745717402879e-97
		},
		{
			"rmax_over_a": 5,
			"energy_eV": -4.574172721145476,
			"matching_residual": 32804314820111813e-29,
			"truncated_tail_probability": 10229120296701643e-141
		},
		{
			"rmax_over_a": 6,
			"energy_eV": -4.574172721145459,
			"matching_residual": -10850764731173967e-28,
			"truncated_tail_probability": 1893587855119147e-169
		},
		{
			"rmax_over_a": 8,
			"energy_eV": -4.574172721145497,
			"matching_residual": 1803834859259723e-27,
			"truncated_tail_probability": 6489030364474638e-227
		},
		{
			"rmax_over_a": 10,
			"energy_eV": -4.574172721145471,
			"matching_residual": -17888468484272835e-29,
			"truncated_tail_probability": 22236895403277565e-285
		}
	],
	reference_h_over_a_0_0025: {
		"h_over_a": .0025,
		"energy_eV": -4.574172721145459,
		"archived_energy_eV": -4.574172721145481,
		"absolute_difference_eV": 2220446049250313e-29,
		"norm": 1.0000000000000002,
		"nodes": 0,
		"mean_radius_pm": 19.529645186466336,
		"tail_probability": .1155160134197469,
		"truncated_tail_probability": 1893587855119147e-169,
		"matching_residual": -10850764731173967e-28,
		"potential_evaluations": 55223,
		"residual_evaluations": 23,
		"n_points": 2401,
		"root_bracket_eV": [-4.591111320754717, -4.559666037735849]
	},
	adaptive: {
		"energy_eV": -4.574172720795858,
		"estimated_error_eV": 2.995650661588019e-8,
		"relative_error": 6.549054538252783e-9,
		"step_size": .00766843507346135,
		"iterations": 3,
		"converged": true,
		"history": [
			{
				"iteration": 1,
				"step_size": .02,
				"previous_step_size": .04,
				"q": 2,
				"coarse_energy": -4.57419510073992,
				"fine_energy": -4.574174109232857,
				"richardson_energy": -4.574172709799053,
				"estimated_error": 13994338042166987e-22,
				"relative_error": 3.059424934302878e-7
			},
			{
				"iteration": 2,
				"step_size": .01,
				"previous_step_size": .02,
				"q": 2,
				"coarse_energy": -4.574174109232857,
				"fine_energy": -4.574172807425034,
				"richardson_energy": -4.574172720637846,
				"estimated_error": 8.678718816194456e-8,
				"relative_error": 1.8973308062980734e-8
			},
			{
				"iteration": 3,
				"step_size": .00766843507346135,
				"previous_step_size": .01,
				"q": 1.3040470323088016,
				"coarse_energy": -4.574172807425034,
				"fine_energy": -4.574172750752364,
				"richardson_energy": -4.574172720795858,
				"estimated_error": 2.995650661588019e-8,
				"relative_error": 6.549054538252783e-9
			}
		],
		"potential_evaluations": 42228,
		"calls": [
			{
				"h_over_a": .04,
				"energy_eV": -4.57419510073992,
				"potential_evaluations": 3473
			},
			{
				"h_over_a": .02,
				"energy_eV": -4.574174109232857,
				"potential_evaluations": 6923
			},
			{
				"h_over_a": .01,
				"energy_eV": -4.574172807425034,
				"potential_evaluations": 13823
			},
			{
				"h_over_a": .00766843507346135,
				"energy_eV": -4.574172750752364,
				"potential_evaluations": 18009
			}
		],
		"comparison": {
			"fixed_h_0_000625_potential_evaluations": 220823,
			"adaptive_potential_evaluations": 42228,
			"ratio_adaptive_over_fine_fixed": .19123008019997917,
			"note": "Measured on this benchmark only. ratio_adaptive_over_fine_fixed compares one adaptive run (relative tolerance 1e-8, initial step 0.02) with one fixed-step solve at h/a=0.000625. It is not a general 3-5x guarantee. Global refinement still performs several complete eigenvalue solves."
		}
	},
	variational: {
		"recomputed": {
			"sigma_pm": 17.32126772249442,
			"energy_eV": -4.574143873272051,
			"archived_energy_eV": -4.574143873272,
			"archived_sigma_pm": 17.32126735,
			"is_upper_bound": true
		},
		"at_archived_width": {
			"sigma_pm": 17.32126735,
			"energy_eV": -4.574143873272052,
			"archived_energy_eV": -4.574143873272,
			"archived_sigma_pm": 17.32126735,
			"is_upper_bound": true
		},
		"note": "Variational energy is an upper bound on the computation, not an exact eigenvalue and not a measurement."
	},
	runtime: {
		"python": "3.10.21",
		"numpy": "2.2.6"
	},
	limitations: [
		"Synthetic Gaussian well, not a QCD or experimental spectrum.",
		"Fixed-step Numerov is the reference recurrence.",
		"05-B refines the global spacing; it is not a variable-step Numerov.",
		"Elliptic centrifugal start for ell>0 is implemented but not part of this certified benchmark.",
		"Excited-state brackets are not certified.",
		"No experimental validation and no repository publication."
	],
	pytest: {
		"exit_code": 0,
		"passed": true,
		"summary": "16 passed in 1.03s"
	},
	content_sha256: "de4481a2f479a28cf81e00364f0bd191288535fb3a5cbd6756302b43aa1241a1"
};
/** Browser port of the fixed-step SQRT-01 Numerov reference. Not a measurement. */
var HBAR_J_S = 1054571817e-43;
var U_KG = 16605390666e-37;
var EV_J = 1602176634e-28;
var ENGINE05_NAME = "SQRT-01 Engine 05";
var ENGINE05_VERSION = "05-B";
var GAUSSIAN_BENCHMARK = {
	muU: .5,
	v0Ev: 5,
	aPm: 100,
	ell: 0
};
function energyScales(model) {
	const mu = model.muU * U_KG;
	const a = model.aPm * 1e-12;
	const esEv = HBAR_J_S ** 2 / (2 * mu * a * a) / EV_J;
	return {
		esEv,
		g: model.v0Ev / esEv
	};
}
function logDerivative(u, k, i, h) {
	if (Math.abs(u[i]) < 1e-30) return null;
	const kPrime = (k[i + 1] - k[i - 1]) / (2 * h);
	const numer = (u[i + 1] - u[i - 1]) / (2 * h * u[i]) + h * h * kPrime / 6;
	const denom = 1 - h * h * k[i] / 6;
	if (Math.abs(denom) < 1e-14) return null;
	const value = numer / denom;
	return Number.isFinite(value) ? value : null;
}
function trapezoidOfSquares(y, x) {
	let acc = 0;
	for (let i = 0; i < y.length - 1; i += 1) acc += .5 * (y[i] * y[i] + y[i + 1] * y[i + 1]) * (x[i + 1] - x[i]);
	return acc;
}
function countNodes(u) {
	let previous = 0;
	let count = 0;
	for (let i = 1; i < u.length; i += 1) {
		const sign = Math.sign(u[i]);
		if (sign === 0) continue;
		if (previous !== 0 && sign !== previous) count += 1;
		previous = sign;
	}
	return count;
}
function solveBoundState(model, hOverA, rmaxOverA = 6, matchOverA = .17) {
	if (hOverA <= 0) throw new Error("hOverA must be positive");
	if (model.ell !== 0) throw new Error("Browser reference certifies ell = 0 only");
	const n = Math.round(rmaxOverA / hOverA);
	const m = Math.round(matchOverA / hOverA);
	if (n < 8 || m < 2 || m > n - 2) throw new Error("Grid cannot host the matching point");
	const { esEv, g } = energyScales(model);
	const x = new Float64Array(n + 1);
	for (let i = 0; i <= n; i += 1) x[i] = i * hOverA;
	let evaluations = 0;
	const integrate = (energyEv) => {
		const left = new Float64Array(n + 1);
		const right = new Float64Array(n + 1);
		const eps = energyEv / esEv;
		if (eps >= 0) return {
			mismatch: NaN,
			ok: false,
			left,
			right
		};
		const k = new Float64Array(n + 1);
		const f = new Float64Array(n + 1);
		for (let i = 0; i <= n; i += 1) {
			evaluations += 1;
			k[i] = eps + g * Math.exp(-x[i] * x[i]);
			f[i] = 1 + hOverA * hOverA * k[i] / 12;
		}
		left[1] = hOverA;
		for (let i = 1; i <= m; i += 1) {
			const denom = f[i + 1];
			if (Math.abs(denom) < 1e-14) return {
				mismatch: NaN,
				ok: false,
				left,
				right
			};
			const next = ((12 - 10 * f[i]) * left[i] - f[i - 1] * left[i - 1]) / denom;
			if (!Number.isFinite(next)) return {
				mismatch: NaN,
				ok: false,
				left,
				right
			};
			left[i + 1] = next;
		}
		const kappa = Math.sqrt(-eps);
		right[n] = 1;
		right[n - 1] = Math.exp(kappa * hOverA);
		for (let i = n - 1; i >= m; i -= 1) {
			const denom = f[i - 1];
			if (Math.abs(denom) < 1e-14) return {
				mismatch: NaN,
				ok: false,
				left,
				right
			};
			const next = ((12 - 10 * f[i]) * right[i] - f[i + 1] * right[i + 1]) / denom;
			if (!Number.isFinite(next)) return {
				mismatch: NaN,
				ok: false,
				left,
				right
			};
			right[i - 1] = next;
			if (Math.abs(next) > 1e8) for (let j = i - 1; j <= n; j += 1) right[j] *= 1e-8;
		}
		const dLeft = logDerivative(left, k, m, hOverA);
		const dRight = logDerivative(right, k, m, hOverA);
		if (dLeft === null || dRight === null) return {
			mismatch: NaN,
			ok: false,
			left,
			right
		};
		let peak = 1e-30;
		for (let i = 1; i <= m + 1; i += 1) peak = Math.max(peak, Math.abs(left[i]));
		if (Math.abs(left[m]) < 1e-12 * peak) return {
			mismatch: NaN,
			ok: false,
			left,
			right
		};
		return {
			mismatch: dLeft - dRight,
			ok: true,
			left,
			right
		};
	};
	let previousEnergy = null;
	let previousMismatch = null;
	let bracket = null;
	const samples = 160;
	for (let s = 0; s < samples; s += 1) {
		const energy = -model.v0Ev + 1e-4 + (-1e-4 - (-model.v0Ev + 1e-4)) * s / 159;
		const shot = integrate(energy);
		if (!shot.ok || !Number.isFinite(shot.mismatch)) {
			previousEnergy = null;
			previousMismatch = null;
			continue;
		}
		if (previousMismatch !== null && previousEnergy !== null && previousMismatch * shot.mismatch < 0) {
			bracket = [previousEnergy, energy];
			break;
		}
		previousEnergy = energy;
		previousMismatch = shot.mismatch;
	}
	if (!bracket) throw new Error("No bracketed ground-state sign change");
	let lo = bracket[0];
	let hi = bracket[1];
	let loMismatch = integrate(lo).mismatch;
	for (let iter = 0; iter < 70; iter += 1) {
		const mid = .5 * (lo + hi);
		const shot = integrate(mid);
		const mismatch = shot.ok && Number.isFinite(shot.mismatch) ? shot.mismatch : loMismatch > 0 ? -1e6 : 1e6;
		if (loMismatch * mismatch <= 0) hi = mid;
		else {
			lo = mid;
			loMismatch = mismatch;
		}
		if (hi - lo < 1e-14) break;
	}
	const energyEv = .5 * (lo + hi);
	const finalShot = integrate(energyEv);
	if (!finalShot.ok || Math.abs(finalShot.right[m]) < 1e-30) throw new Error("Eigenvalue root landed on an invalid matching point");
	const scale = finalShot.left[m] / finalShot.right[m];
	const radial = new Float64Array(n + 1);
	for (let i = 0; i < m; i += 1) radial[i] = finalShot.left[i];
	for (let i = m; i <= n; i += 1) radial[i] = finalShot.right[i] * scale;
	const aM = model.aPm * 1e-12;
	const radius = new Float64Array(n + 1);
	for (let i = 0; i <= n; i += 1) radius[i] = x[i] * aM;
	const normSq = trapezoidOfSquares(radial, radius);
	if (!Number.isFinite(normSq) || normSq <= 0) throw new Error("Wavefunction norm is not positive");
	const normFactor = Math.sqrt(normSq);
	for (let i = 0; i <= n; i += 1) radial[i] /= normFactor;
	const norm = trapezoidOfSquares(radial, radius);
	let mean = 0;
	for (let i = 0; i < n; i += 1) {
		const weight = .5 * (radial[i] * radial[i] + radial[i + 1] * radial[i + 1]) * (radius[i + 1] - radius[i]);
		mean += .5 * (radius[i] + radius[i + 1]) * weight;
	}
	const ratio = -energyEv / model.v0Ev;
	const turning = ratio > 0 && ratio < 1 ? Math.sqrt(-Math.log(ratio)) : rmaxOverA;
	const tail = probabilityBeyond(x, radial, radius, turning);
	const step = Math.max(1, Math.floor(n / 240));
	const plotX = [];
	const plotU = [];
	const plotV = [];
	for (let i = 0; i <= n; i += step) {
		plotX.push(x[i]);
		plotU.push(radial[i]);
		plotV.push(-model.v0Ev * Math.exp(-x[i] * x[i]));
	}
	return {
		energyEv,
		epsilon: energyEv / esEv,
		g,
		esEv,
		norm,
		meanRadiusPm: mean * 0xe8d4a51000,
		tailProbability: tail,
		nodes: countNodes(radial),
		matchingResidual: finalShot.mismatch,
		hOverA,
		turningOverA: turning,
		potentialEvaluations: evaluations,
		nPoints: n + 1,
		x: plotX,
		u: plotU,
		potentialEv: plotV
	};
}
function probabilityBeyond(x, radial, radius, turning) {
	if (turning <= x[0]) return trapezoidOfSquares(radial, radius);
	if (turning >= x[x.length - 1]) return 0;
	let index = 0;
	while (index < x.length && x[index] < turning) index += 1;
	const left = index - 1;
	const span = x[index] - x[left];
	const weight = span === 0 ? 0 : (turning - x[left]) / span;
	const uTurn = radial[left] + weight * (radial[index] - radial[left]);
	const rTurn = radius[left] + weight * (radius[index] - radius[left]);
	const sampleU = [uTurn];
	const sampleR = [rTurn];
	for (let i = index; i < radial.length; i += 1) {
		sampleU.push(radial[i]);
		sampleR.push(radius[i]);
	}
	return trapezoidOfSquares(sampleU, sampleR);
}
var LEDGER = ledger_default;
function Engine05Page() {
	const [tick, setTick] = (0, import_react.useState)(0);
	const [browserAdaptive, setBrowserAdaptive] = (0, import_react.useState)(null);
	const [adaptiveError, setAdaptiveError] = (0, import_react.useState)(null);
	const live = (0, import_react.useMemo)(() => solveBoundState(GAUSSIAN_BENCHMARK, .0025), [tick]);
	const ledgerEnergy = LEDGER.reference_h_over_a_0_0025.energy_eV;
	const browserDelta = live.energyEv - ledgerEnergy;
	const agrees = Math.abs(browserDelta) < 1e-9;
	function runAdaptive() {
		setAdaptiveError(null);
		try {
			const result = adaptiveEigenvalue((step) => solveBoundState(GAUSSIAN_BENCHMARK, step).energyEv, {
				initialStep: .02,
				relativeTolerance: 1e-6,
				energyScale: 1,
				minStep: 1e-4,
				maxIterations: 8
			});
			setBrowserAdaptive(result);
		} catch (error) {
			setBrowserAdaptive(null);
			setAdaptiveError(error instanceof Error ? error.message : "Refinement failed");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: `${ENGINE05_NAME} · ${ENGINE05_VERSION}`,
			title: "Bound-state Numerov",
			description: "Gaussian two-body ground state. The fixed-step solver is the reference. Richardson refinement only changes the global spacing. This is a calculation, not a measurement.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => setTick((value) => value + 1),
				children: "Recompute ground state"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: runAdaptive,
				children: "Run browser refinement"
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: LEDGER.pytest?.passed ? "ok" : "warn",
					children: LEDGER.pytest?.passed ? `Pytest ${LEDGER.pytest.summary}` : "Pytest not recorded"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: agrees ? "ok" : "danger",
					children: agrees ? "Browser matches ledger" : "Browser disagrees"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "warn",
					children: "Not experimentally validated"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "No repository claim" })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Browser eigenvalue",
					value: `${live.energyEv.toFixed(10)} eV`,
					hint: "h/a = 0.0025"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Ledger difference",
					value: `${browserDelta.toExponential(1)} eV`,
					hint: "browser minus Python record"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Archived prototype",
					value: `${LEDGER.archived_reference_energy_eV.toFixed(10)} eV`,
					hint: "not a measurement"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Coupling g",
					value: live.g.toFixed(8),
					hint: `Es ${live.esEv.toExponential(4)} eV`
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Radial wavefunction",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: "info",
					children: [live.nodes, " nodes"]
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveCanvas, { state: live }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: [
						"Solid curve is the normalized radial function u(r). Dashed curve is V/V0. The mark is the classical turning point. Mean radius ",
						live.meanRadiusPm.toFixed(3),
						" pm. Probability beyond the turning point ",
						live.tailProbability.toFixed(4),
						"."
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "What this is not",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-2 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Computation is not observation." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "The archived eigenvalue is a cited numerical prototype, left unchanged." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "The variational Gaussian is an upper bound, not the exact level." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "A finer grid is not experimental confirmation." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Variable-step Numerov, coordinate mapping, and the WKB hybrid are not in this build." })
					]
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid min-w-0 gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Python grid ledger",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "executed" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-max text-left font-mono text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 pr-3 font-medium",
									children: "h/a"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 pr-3 font-medium",
									children: "Energy eV"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 pr-3 font-medium",
									children: "Minus archive"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 font-medium",
									children: "V calls"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: LEDGER.grid_convergence.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 pr-3 tabular-nums",
									children: row.h_over_a
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 pr-3 tabular-nums",
									children: row.energy_eV.toFixed(12)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 pr-3 tabular-nums",
									children: row.absolute_difference_eV.toExponential(1)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 tabular-nums",
									children: row.potential_evaluations.toLocaleString()
								})
							]
						}, row.h_over_a)) })]
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Richardson refinement",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: LEDGER.adaptive.converged ? "ok" : "warn",
					children: "05-B"
				}),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Extrapolated",
							value: `${LEDGER.adaptive.energy_eV.toFixed(10)} eV`,
							hint: `${LEDGER.adaptive.iterations} iterations`
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Counted V-call ratio",
							value: LEDGER.adaptive.comparison.ratio_adaptive_over_fine_fixed.toFixed(3),
							hint: "adaptive / fixed h/a=0.000625"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-sm text-muted-foreground",
						children: "That ratio is one measured comparison. It is not a guaranteed 3–5× saving. The controller exponent is 1/4 because the error being controlled is global and fourth order."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-max text-left font-mono text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 font-medium",
										children: "Step"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 font-medium",
										children: "q"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 font-medium",
										children: "Relative error"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: LEDGER.adaptive.history.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 pr-3 tabular-nums",
										children: row.step_size.toFixed(5)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 pr-3 tabular-nums",
										children: row.q.toFixed(3)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 tabular-nums",
										children: row.relative_error.toExponential(2)
									})
								]
							}, row.iteration)) })]
						})
					}),
					browserAdaptive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-foreground",
						children: [
							"Browser refinement: ",
							browserAdaptive.energy.toFixed(10),
							" eV, relative error ",
							browserAdaptive.relativeError.toExponential(2),
							", converged."
						]
					}) : null,
					adaptiveError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-destructive",
						children: adaptiveError
					}) : null
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid min-w-0 gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Variational upper bound",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Recomputed optimum",
						value: `${LEDGER.variational.recomputed.energy_eV.toFixed(10)} eV`,
						hint: `σ ${LEDGER.variational.recomputed.sigma_pm.toFixed(5)} pm`
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "At archived width",
						value: `${LEDGER.variational.at_archived_width.energy_eV.toFixed(10)} eV`,
						hint: `cited σ ${LEDGER.variational.at_archived_width.sigma_pm} pm`
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "Both sit above the Numerov eigenvalue. The archived variational energy was not replaced."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Record",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "break-all font-mono text-xs text-muted-foreground",
					children: ["SHA-256 ", LEDGER.content_sha256]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2 text-sm text-muted-foreground",
					children: LEDGER.limitations.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
				})]
			})]
		})
	] });
}
function WaveCanvas({ state }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		const parent = canvas?.parentElement;
		if (!canvas || !parent) return;
		const paint = () => {
			const width = Math.max(280, parent.clientWidth);
			const height = 280;
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			canvas.width = Math.floor(width * dpr);
			canvas.height = Math.floor(height * dpr);
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			const style = getComputedStyle(document.documentElement);
			const fg = style.getPropertyValue("--color-foreground").trim();
			const muted = style.getPropertyValue("--color-muted-foreground").trim();
			const card = style.getPropertyValue("--color-card").trim();
			const info = style.getPropertyValue("--color-info").trim();
			const warn = style.getPropertyValue("--color-warn").trim();
			ctx.fillStyle = card;
			ctx.fillRect(0, 0, width, height);
			const xMax = 1.2;
			const pad = 28;
			const plotW = width - 56;
			const plotH = 224;
			const xs = state.x;
			const us = state.u;
			let uMax = 1e-12;
			for (let i = 0; i < xs.length; i += 1) if (xs[i] <= xMax) uMax = Math.max(uMax, Math.abs(us[i]));
			const xOf = (x) => pad + x / xMax * plotW;
			const yOfU = (u) => 140 - u / uMax * plotH * .42;
			const yOfV = (vOverV0) => 211.67999999999998 - (vOverV0 + 1) * plotH * .28;
			ctx.strokeStyle = muted;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(pad, pad);
			ctx.lineTo(pad, 252);
			ctx.lineTo(width - pad, 252);
			ctx.stroke();
			ctx.setLineDash([4, 4]);
			ctx.beginPath();
			let started = false;
			for (let i = 0; i < xs.length; i += 1) {
				if (xs[i] > xMax) break;
				const y = yOfV(state.potentialEv[i] / GAUSSIAN_BENCHMARK.v0Ev);
				if (!started) {
					ctx.moveTo(xOf(xs[i]), y);
					started = true;
				} else ctx.lineTo(xOf(xs[i]), y);
			}
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.strokeStyle = fg;
			ctx.lineWidth = 1.6;
			ctx.beginPath();
			started = false;
			for (let i = 0; i < xs.length; i += 1) {
				if (xs[i] > xMax) break;
				const y = yOfU(us[i]);
				if (!started) {
					ctx.moveTo(xOf(xs[i]), y);
					started = true;
				} else ctx.lineTo(xOf(xs[i]), y);
			}
			ctx.stroke();
			const turnX = xOf(Math.min(state.turningOverA, xMax));
			ctx.strokeStyle = warn;
			ctx.beginPath();
			ctx.moveTo(turnX, pad);
			ctx.lineTo(turnX, 252);
			ctx.stroke();
			ctx.fillStyle = info;
			ctx.font = "12px IBM Plex Mono, ui-monospace, monospace";
			ctx.fillText("u(r)", 36, 42);
			ctx.fillStyle = muted;
			ctx.fillText("V/V0", 36, 58);
			ctx.fillText("r/a", width - pad - 28, 270);
		};
		paint();
		const observer = new ResizeObserver(paint);
		observer.observe(parent);
		return () => observer.disconnect();
	}, [state]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "block w-full rounded-md"
	});
}
//#endregion
export { Engine05Page as component };
