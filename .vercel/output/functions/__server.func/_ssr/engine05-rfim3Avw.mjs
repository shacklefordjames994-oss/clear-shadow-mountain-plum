import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, t as Badge } from "./badge-uyEFEQwD.mjs";
import { n as Panel, r as Stat, t as PageHeader } from "./panel-GIo8_dlm.mjs";
import { t as ledger_default } from "./ledger-pcbEal5L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/engine05-rfim3Avw.js
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
var validation_status_default = {
	classification: "COMPUTED",
	experimental_validation: false,
	scientific_release_status: "NOT_CERTIFIED",
	generated_at_utc: "2026-11-21T19:09:11+00:00",
	python: "3.10.21",
	platform: "Linux-6.12.8+-x86_64-with-glibc2.36",
	numpy: "2.2.6",
	model: {
		"model_version": "gaussian-v1",
		"h_J_s": 662607015e-42,
		"hbar_J_s": 1054571817e-43,
		"hbar_source": "engine constant 1.054571817e-34 J s; sibling h/(2*pi) is recorded and not substituted",
		"u_kg": 16605390666e-37,
		"u_source": "CODATA 2018 atomic mass constant",
		"ev_J": 1602176634e-28,
		"ev_source": "exact SI electronvolt",
		"mu_u": .5,
		"V0_eV": 5,
		"a_pm": 100,
		"ell": 0,
		"origin_boundary": "u(0)=0 for ell=0",
		"outer_boundary": "decaying real exponential for E<0 on a finite domain",
		"K_eV": .0041801592804967215,
		"g": 1196.1266699401604,
		"historical_K_eV": [
			.004180159277260055,
			.004180159279778997,
			.0041801592804967215
		],
		"historical_K_status": "HISTORICAL_NOT_SELECTED",
		"manifest_sha256": "e9f5e892b385c722e5f4dc79d5ad0ea2564e8abf937915ab5961f9721f68400e",
		"codata_2022_u_kg": 166053906892e-38,
		"codata_2022_K_eV": .004180159274656468,
		"hbar_from_exact_h_J_s": 10545718176461565e-50,
		"note": "Active K uses the engine hbar 1.054571817e-34 J s and CODATA 2018 u. h/(2*pi) and CODATA 2022 u are recorded and are not substituted. The three historical K values are not used as inputs."
	},
	reference_numerov: {
		"energy_eV": -4.574172721145459,
		"nodes": 0,
		"matching_residual": -10850764731173967e-28,
		"h_over_a": .0025,
		"status": "COMPUTED"
	},
	ode: {
		"energy_eV": -4.574172720843906,
		"residual": 1.9408882834248686e-9,
		"match_over_a": .17,
		"difference_from_numerov_eV": 3015525606997471e-25,
		"status": "COMPUTED"
	},
	matrix: {
		"h_0_02_eV": -4.574758393953335,
		"h_0_01_eV": -4.574318961152364,
		"residual_inf_h_0_01": 2347633198951371e-26,
		"nodes": 0,
		"status": "COMPUTED"
	},
	wavefunction: {
		"nodes": 0,
		"norm": .9999999999999999,
		"matching_residual": 8263112416528884e-28,
		"relative_differential_residual": .004768006385312172,
		"overlap_with_matrix": .9999976068424176,
		"density_discrepancy": .003625421837504014,
		"tail_probability": .11571577730846237
	},
	sweep: [
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 4,
			"match_over_a": .17,
			"classification": "COMPUTED",
			"energy_eV": -4.574174109232857,
			"root_residual": 34638958368304884e-30,
			"nodes": 0,
			"n_points": 201,
			"tail_probability": .11635422394434618,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 4,
			"match_over_a": 1.5,
			"classification": "COMPUTED",
			"energy_eV": -.7040129073591689,
			"root_residual": 1908695423935569e-27,
			"nodes": 9,
			"n_points": 201,
			"tail_probability": .0786831972558477,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 4,
			"match_over_a": 2,
			"classification": "COMPUTED",
			"energy_eV": -.07819364775301352,
			"root_residual": -6421529974431905e-28,
			"nodes": 12,
			"n_points": 201,
			"tail_probability": .13033710005881635,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 4,
			"match_over_a": 2.5,
			"classification": "COMPUTED",
			"energy_eV": -.0007728891304733064,
			"root_residual": 1290287321431549e-28,
			"nodes": 13,
			"n_points": 201,
			"tail_probability": .617556768101603,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 4,
			"match_over_a": 3,
			"classification": "COMPUTED",
			"energy_eV": -.0007728891304741546,
			"root_residual": 6248335182590381e-28,
			"nodes": 13,
			"n_points": 201,
			"tail_probability": .6175567681015182,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 4,
			"match_over_a": 3.5,
			"classification": "COMPUTED",
			"energy_eV": -.000772889130472767,
			"root_residual": -32784885917180873e-29,
			"nodes": 13,
			"n_points": 201,
			"tail_probability": .6175567681015979,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 5,
			"match_over_a": .17,
			"classification": "COMPUTED",
			"energy_eV": -4.574174109232857,
			"root_residual": 4007905118896815e-29,
			"nodes": 0,
			"n_points": 251,
			"tail_probability": .1163542239443463,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 5,
			"match_over_a": 1.5,
			"classification": "COMPUTED",
			"energy_eV": -.7040129073591689,
			"root_residual": 1906919067096169e-27,
			"nodes": 9,
			"n_points": 251,
			"tail_probability": .07868319725584771,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 5,
			"match_over_a": 2,
			"classification": "COMPUTED",
			"energy_eV": -.07819364775301751,
			"root_residual": -4862776847858186e-28,
			"nodes": 12,
			"n_points": 251,
			"tail_probability": .13033709898378487,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 5,
			"match_over_a": 2.5,
			"classification": "COMPUTED",
			"energy_eV": -.0007729009378014385,
			"root_residual": -14606371667724716e-30,
			"nodes": 13,
			"n_points": 251,
			"tail_probability": .5388591939808636,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 5,
			"match_over_a": 3,
			"classification": "COMPUTED",
			"energy_eV": -.0007729009377997251,
			"root_residual": -15384915563743107e-28,
			"nodes": 13,
			"n_points": 251,
			"tail_probability": .5388591939808005,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 5,
			"match_over_a": 3.5,
			"classification": "COMPUTED",
			"energy_eV": -.0007729009378012583,
			"root_residual": -22870594307278225e-30,
			"nodes": 13,
			"n_points": 251,
			"tail_probability": .5388591939808772,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 6,
			"match_over_a": .17,
			"classification": "COMPUTED",
			"energy_eV": -4.574174109232857,
			"root_residual": 51514348342607263e-30,
			"nodes": 0,
			"n_points": 301,
			"tail_probability": .11635422394434612,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 6,
			"match_over_a": 1.5,
			"classification": "COMPUTED",
			"energy_eV": -.7040129073591689,
			"root_residual": 1907807245515869e-27,
			"nodes": 9,
			"n_points": 301,
			"tail_probability": .07868319725584773,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 6,
			"match_over_a": 2,
			"classification": "COMPUTED",
			"energy_eV": -.07819364775301736,
			"root_residual": -4760636329592671e-28,
			"nodes": 12,
			"n_points": 301,
			"tail_probability": .13033709898359574,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 6,
			"match_over_a": 2.5,
			"classification": "COMPUTED",
			"energy_eV": -.0007729009383165326,
			"root_residual": -4290873212298152e-28,
			"nodes": 13,
			"n_points": 301,
			"tail_probability": .5112863343461304,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 6,
			"match_over_a": 3,
			"classification": "COMPUTED",
			"energy_eV": -.0007729009383170292,
			"root_residual": -3784195179434846e-28,
			"nodes": 13,
			"n_points": 301,
			"tail_probability": .5112863343460259,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 6,
			"match_over_a": 3.5,
			"classification": "COMPUTED",
			"energy_eV": -.0007729009383176129,
			"root_residual": 21238566461079245e-29,
			"nodes": 13,
			"n_points": 301,
			"tail_probability": .5112863343460645,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 8,
			"match_over_a": .17,
			"classification": "COMPUTED",
			"energy_eV": -4.574174109232858,
			"root_residual": 12068124277675452e-29,
			"nodes": 0,
			"n_points": 401,
			"tail_probability": .11635422394434397,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 8,
			"match_over_a": 1.5,
			"classification": "COMPUTED",
			"energy_eV": -.7040129073591689,
			"root_residual": 19042545318370685e-28,
			"nodes": 9,
			"n_points": 401,
			"tail_probability": .0786831972558477,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 8,
			"match_over_a": 2,
			"classification": "COMPUTED",
			"energy_eV": -.07819364775301751,
			"root_residual": -4476419235288631e-28,
			"nodes": 12,
			"n_points": 401,
			"tail_probability": .13033709898359577,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 8,
			"match_over_a": 2.5,
			"classification": "COMPUTED",
			"energy_eV": -.0007729009383161465,
			"root_residual": -15894230376289897e-29,
			"nodes": 13,
			"n_points": 401,
			"tail_probability": .4960017915371325,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 8,
			"match_over_a": 3,
			"classification": "COMPUTED",
			"energy_eV": -.0007729009383167265,
			"root_residual": -8143485885625523e-29,
			"nodes": 13,
			"n_points": 401,
			"tail_probability": .4960017915371184,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 8,
			"match_over_a": 3.5,
			"classification": "COMPUTED",
			"energy_eV": -.000772900938317112,
			"root_residual": 20383694732117874e-29,
			"nodes": 13,
			"n_points": 401,
			"tail_probability": .4960017915371595,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 10,
			"match_over_a": .17,
			"classification": "COMPUTED",
			"energy_eV": -4.574174109232858,
			"root_residual": 8004708007547379e-29,
			"nodes": 0,
			"n_points": 501,
			"tail_probability": .11635422394434433,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 10,
			"match_over_a": 1.5,
			"classification": "COMPUTED",
			"energy_eV": -.7040129073591689,
			"root_residual": 1907807245515869e-27,
			"nodes": 9,
			"n_points": 501,
			"tail_probability": .07868319725584771,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 10,
			"match_over_a": 2,
			"classification": "COMPUTED",
			"energy_eV": -.07819364775301753,
			"root_residual": -4662936703425657e-28,
			"nodes": 12,
			"n_points": 501,
			"tail_probability": .13033709898359597,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 10,
			"match_over_a": 2.5,
			"classification": "COMPUTED",
			"energy_eV": -.0007729009383160336,
			"root_residual": -10941941797071308e-29,
			"nodes": 13,
			"n_points": 501,
			"tail_probability": .4933607775713173,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 10,
			"match_over_a": 3,
			"classification": "COMPUTED",
			"energy_eV": -.0007729009383160506,
			"root_residual": -16103784972187896e-29,
			"nodes": 13,
			"n_points": 501,
			"tail_probability": .49336077757129365,
			"status": "COMPUTED",
			"reason": "OK"
		},
		{
			"solver": "numerov-fixed-step",
			"h_over_a": .02,
			"rmax_over_a": 10,
			"match_over_a": 3.5,
			"classification": "COMPUTED",
			"energy_eV": -.0007729009383170759,
			"root_residual": 3960720640350246e-28,
			"nodes": 13,
			"n_points": 501,
			"tail_probability": .4933607775713721,
			"status": "COMPUTED",
			"reason": "OK"
		}
	],
	sweep_failed_count: 0,
	zero_node_energy_spread_eV: 8881784197001252e-31,
	sensitivity: {
		"classification": "COMPUTED",
		"grid": "h/a=0.02",
		"dE_dV0_expectation_eV_per_eV": -.9566241947297354,
		"dE_dV0_difference_eV_per_eV": -.9566241893055327,
		"dE_da_difference_eV_per_pm": -.004178941307024786,
		"dE_dmu_difference_eV_per_u": -.41789398401714806,
		"baseline_energy_eV": -4.574174109232857,
		"note": "Finite differences use the fixed-step solver. They are not experimental sensitivities."
	},
	uncertainty: {
		"components": [
			{
				"name": "zero-node match and domain sweep",
				"value": 8881784197001252e-31,
				"unit": "eV",
				"method": "fixed-step Numerov, h/a=0.02",
				"evidence": "max-min of 5 values",
				"assumptions": "same solver family; not an independent bound",
				"correlation": "deterministic-correlated",
				"classification": "NUMERICAL_ERROR",
				"resolved": true
			},
			{
				"name": "matrix minus fixed-step Numerov",
				"value": -.00014615372732951215,
				"unit": "eV",
				"method": "h/a=0.01 matrix versus h/a=0.01 Numerov",
				"evidence": "same Gaussian model, different discretization and boundary condition",
				"assumptions": "different truncation, not independent experiments",
				"correlation": "deterministic-correlated",
				"classification": "NUMERICAL_ERROR",
				"resolved": true
			},
			{
				"name": "DOP853 minus fixed-step Numerov",
				"value": 3015525606997471e-25,
				"unit": "eV",
				"method": "match r/a=0.17, domain R/a=6",
				"evidence": "DOP853 does not call Numerov",
				"assumptions": "same differential equation",
				"correlation": "deterministic-correlated",
				"classification": "NUMERICAL_ERROR",
				"resolved": true
			},
			{
				"name": "CODATA 2018 versus 2022 atomic mass constant",
				"value": null,
				"unit": "eV",
				"method": "constant substitution not executed as an eigenvalue sweep",
				"evidence": "manifest records both constants",
				"assumptions": "parameter definition",
				"correlation": "parameter",
				"classification": "PARAMETER_UNCERTAINTY",
				"resolved": false
			},
			{
				"name": "experiment",
				"value": null,
				"unit": "eV",
				"method": "no measured spectrum is loaded",
				"evidence": "absent",
				"assumptions": "not applicable",
				"correlation": "none",
				"classification": "EXPERIMENTAL_UNCERTAINTY",
				"resolved": false
			}
		],
		"aggregated_value": null,
		"aggregation": "NOT_PERFORMED",
		"reason": "Correlated deterministic errors are not combined by root-sum-square.",
		"unresolved": ["CODATA 2018 versus 2022 atomic mass constant", "experiment"],
		"correlated": [
			"zero-node match and domain sweep",
			"matrix minus fixed-step Numerov",
			"DOP853 minus fixed-step Numerov"
		],
		"classification_note": "A numerical spread is not a mathematical bound and not an experimental uncertainty."
	},
	release: {
		"gates": {
			"clean_checkout": "NOT_RUN",
			"environment": "PASS",
			"tests": "PASS",
			"ground_state_reproduction": "PASS",
			"solver_agreement": "PASS",
			"wavefunction": "PASS",
			"uncertainty": "PASS",
			"physical_review": "PASS",
			"reproducibility": "IN_PROGRESS",
			"independent_review": "NOT_RUN"
		},
		"failed": [],
		"missing": [
			"clean_checkout",
			"reproducibility",
			"independent_review"
		],
		"reviewer_recorded": false,
		"scientific_release_status": "NOT_CERTIFIED",
		"self_certification": false
	},
	historical_evidence_sha256: "636da512e27f25f161d49d9cb3fdda7c2cade2a118d85795eb212cad5bd0065e",
	source_sha256: {
		"__init__.py": "22985990861baaa02ddf54b113ba7eb377315a4fe7dfe3bc4f32b8720e8c079c",
		"__main__.py": "5be2ebe16b3e307f1c4efcc2e0ffa6e50781014ad3f26533ac6f7dadbf078d96",
		"adaptive_refinement.py": "3762786c93005881cf62894d377565520e25d9e3c575e409fe5f20171aa152ff",
		"convergence.py": "969cbdcf05237dfe398ed8cf5a3ac7b03a1ae5e0f11278cbbb1a5209e67be5e3",
		"future_methods.py": "7ae6735e0b80bb2f84f1708d01da20392a735c238f252b41312228873589417a",
		"gaussian_matrix.py": "8dea3f6c67e51f1a0a0738bf4c119948669c6a71dd3581755dd0a05ccc1c1758",
		"leg_mesh.py": "18980f3ae3e2d99e4154ab9688d5d934cdf4e9115bd3db474f3282a83bf71a61",
		"model_manifest.py": "bc189ab97cb6f34673e18f13742fa8b479949ba4639d0e2337868cea55cbb9c0",
		"nonuniform_numerov.py": "4a452663f469b2a8cdc85c12782dae32f382d39906876d3314ab75d2c9e4249c",
		"numerov_solver.py": "ae623f0ddcb221a35054d62297f9e5b9e9617bcede755711e4d9e0b29478a312",
		"ode_matching.py": "29cd2faf410f9f3a7716dd707d777ec38df98c5be0b46e47e0f63267aa11599f",
		"ode_reference.py": "930b9b008790ca7f3181c8587b74f08ea1850136ca46bcdca8e58a12962d8f98",
		"release_certification.py": "ef501d66aa5c0bccbb0c23bd24e6b05747133a761aeae515e842766bbfb8aeb4",
		"root_integrity.py": "bb062d250497c8dcb69c7a2e0564e3d765d7b7a9d81ff3495a555ef1aca9b44d",
		"tridiagonal.py": "28f02a989e987fd7c3a4e2176e6f137226a7a575dd2cfa04cc7b30b03501811c",
		"uncertainty.py": "31d819b7e338738ea4071890ef40ffacd450bbd1f66ef23bcf81e432397f3ca1",
		"validation_campaign.py": "78d23cd01e3fdedc244c69e5da95368264cfb7efeb1ef1c6dda7fad1e0a3029c",
		"variable_numerov.py": "b472c99bebb2308e92d7fe0de258fc1361ab7c3a1be53eb111542491c3fde0bf",
		"wavefunction_validation.py": "634e015ed0e3b208643f2daae16af5cb208425f2924e8e468590ec38b579d937"
	},
	note: "The matrix uses u(R)=0. Numerov and DOP853 use a decaying tail. At R=6a, uniform step halving shrinks the matrix gap to the archived Numerov energy. Measured orders are about 2. Formal order is NOT_ASSIGNED. Rows with 9 or more nodes are not ground-state convergence. Tests were run locally. A GitHub Actions workflow is present, but no completed check is claimed. Release status remains NOT_CERTIFIED.",
	pytest: {
		"exit_code": 0,
		"passed": true,
		"summary": "67 passed in 6.94s",
		"github_ci": false
	},
	follow_up: {
		"matrix_like_for_like": false,
		"matrix_domain_spread_eV": 17763568394002505e-31,
		"numerov_domain_spread_eV": 0,
		"cross_solver_difference_eV": -.00363747627007438,
		"ode_ground_state_count": 2,
		"ode_rejected_outer_match": 2,
		"pytest_summary": "67 passed in 6.94s",
		"pytest_source": "local execution, not GitHub CI",
		"github_ci": "NO_CHECK_RUNS",
		"observed_orders": [
			2.007110354353021,
			2.0017543126181034,
			2.000436955910289
		],
		"formal_order": "NOT_ASSIGNED",
		"matrix_gap_h_0_04_eV": -.002354267124782261,
		"matrix_gap_h_0_005_eV": -36549016639852994e-21
	}
};
/** Browser port of the fixed-step SQRT-01 Numerov reference. Not a measurement. */
var HBAR_J_S = 1054571817e-43;
var U_KG = 16605390666e-37;
var EV_J = 1602176634e-28;
var ENGINE05_NAME = "SQRT-01 Engine 05";
var ENGINE05_VERSION = "05-E";
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
var VALIDATION = validation_status_default;
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
			description: "Gaussian two-body ground state. Fixed-step Numerov is the reference. Equation (8) of Vigo-Aguiar and Ramos (2005) is a separate variable-step recurrence. A calculation, not a measurement.",
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Coordinate mapping and the WKB hybrid are not in this build." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "The 2005 variable-step panel is not the Woods–Saxon table. The 2021 panel is a different method and not a Gaussian eigenvalue." })
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
		LEDGER.legs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Independent legs",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: LEDGER.legs.converged ? "ok" : "warn",
					children: "05-D"
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Combined energy",
							value: `${LEDGER.legs.energy_eV.toFixed(10)} eV`,
							hint: `${LEDGER.legs.iterations} frozen search${LEDGER.legs.iterations === 1 ? "" : "es"}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Minus fixed-step",
							value: `${LEDGER.legs.reference_difference_eV.toExponential(1)} eV`,
							hint: "same Gaussian benchmark"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Leg steps",
							value: `${LEDGER.legs.n_out} / ${LEDGER.legs.n_in}`,
							hint: `h ${LEDGER.legs.h_out.toFixed(4)} and ${LEDGER.legs.h_in.toFixed(4)}`
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: LEDGER.legs.note
				})]
			})
		}) : null,
		LEDGER.variable_step ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Variable-step recurrence",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "info",
					children: "05-E"
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Two-zone energy",
							value: `${LEDGER.variable_step.energy_eV.toFixed(10)} eV`,
							hint: "equation (8), frozen mesh"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Minus fixed-step",
							value: `${LEDGER.variable_step.reference_difference_eV.toExponential(1)} eV`,
							hint: `ratio ${LEDGER.variable_step.step_ratio.toFixed(0)} at the zone boundary`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Local order",
							value: `${LEDGER.variable_step.local_order_when_ratio_is_one} / ${LEDGER.variable_step.local_order_when_ratio_changes}`,
							hint: "equal step, then a changed step"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: LEDGER.variable_step.note
				})]
			})
		}) : null,
		LEDGER.nonuniform_grid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Nonuniform-grid system",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "info",
					children: "05-F"
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 grid gap-3 sm:grid-cols-2",
					children: LEDGER.nonuniform_grid.runs.map((run) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: `${run.n_internal} nodes`,
						value: run.max_error.toExponential(2),
						hint: run.reduction_ratio == null ? `finite difference ${run.finite_difference_max_error.toExponential(2)}` : `ratio ${run.reduction_ratio.toFixed(1)}×${run.observed_order == null ? "" : `, measured order ${run.observed_order.toFixed(2)}`}, formal order not assigned`
					}, run.n_internal))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: LEDGER.nonuniform_grid.note
				})]
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Validation",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "warn",
					children: VALIDATION.scientific_release_status.replaceAll("_", " ")
				}),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Fixed-step ground state",
								value: `${VALIDATION.reference_numerov.energy_eV.toFixed(10)} eV`,
								hint: `${VALIDATION.reference_numerov.nodes} nodes`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "DOP853 minus Numerov",
								value: `${VALIDATION.ode.difference_from_numerov_eV.toExponential(2)} eV`,
								hint: "match r/a = 0.17"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Matrix overlap",
								value: VALIDATION.wavefunction.overlap_with_matrix?.toFixed(6) ?? "not run",
								hint: "not like-for-like: matrix uses u(R)=0"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: [
							VALIDATION.sweep.filter((row) => row.status === "COMPUTED" && row.nodes === 0).length,
							" ground-state rows.",
							" ",
							VALIDATION.sweep.filter((row) => row.status === "COMPUTED" && row.nodes !== 0).length,
							" computed rows are excited states, not the ground state.",
							" ",
							VALIDATION.pytest ? `${VALIDATION.pytest.summary}. Local run, not GitHub CI.` : "Tests were not recorded.",
							" ",
							"Experiment: ",
							VALIDATION.experimental_validation ? "claimed" : "not validated",
							".",
							VALIDATION.follow_up?.observed_orders?.length ? ` At R = 6a the matrix gap shrinks under step halving. Measured orders ${VALIDATION.follow_up.observed_orders.map((order) => order.toFixed(3)).join(", ")}. Formal order: ${VALIDATION.follow_up.formal_order ?? "not assigned"}.` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: VALIDATION.note
					})
				]
			})
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
