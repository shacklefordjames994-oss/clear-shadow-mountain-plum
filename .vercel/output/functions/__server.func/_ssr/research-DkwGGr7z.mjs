import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button } from "./badge-uyEFEQwD.mjs";
import { n as GradeBadge } from "./badges-DoNbXchz.mjs";
import { x as THEORY_DOMAINS } from "./constants-DoK96khb.mjs";
import { i as draftTheory, l as useOmegaStore, s as omegaHash } from "./store-lOmq_ntM.mjs";
import { n as Panel, t as PageHeader } from "./panel-GIo8_dlm.mjs";
import { n as Textarea } from "./input-B20aSgow.mjs";
import { r as SCINET_PIPELINE, t as HYPOTHESES } from "./master-NgVsSD82.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { i as string, r as object } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/research-DkwGGr7z.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var Input = object({
	prompt: string().min(8).max(1600),
	domain: string().min(3).max(80)
});
var synthesizeTheory = createServerFn({ method: "POST" }).validator((d) => Input.parse(d)).handler(createSsrRpc("dce70e815fc5f951934d8beaec28f1a66cbf20db1f95803c01f67b6624c45c5c"));
function ResearchPage() {
	const theories = useOmegaStore((s) => s.theories);
	const addTheory = useOmegaStore((s) => s.addTheory);
	const [domain, setDomain] = (0, import_react.useState)("fluid_dynamics");
	const [prompt, setPrompt] = (0, import_react.useState)("Propose the governing equations for transformer cooling oil as an incompressible Newtonian fluid with temperature-dependent viscosity. State the validity regime.");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function onSynthesize() {
		setPending(true);
		setError(null);
		try {
			const result = await synthesizeTheory({ data: {
				prompt,
				domain
			} });
			if (!result.ok) {
				setError(result.error);
				return;
			}
			const draft = draftTheory({
				id: omegaHash(result.theory.title + Date.now()),
				title: result.theory.title,
				domain,
				equations: result.theory.equations,
				assumptions: result.theory.assumptions,
				note: `${result.theory.note} Independent validation required. Not certified.`
			});
			addTheory(draft);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Synthesis failed");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "SCI-NET v2",
			title: "Scientific intelligence network",
			description: "Generated models are hypotheses. Hard reject dimensional nonsense. Never convert synthesis into observation, evidence, or certification. SCI-NET contracts stay frozen.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/package",
					children: "Open package v13"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/dark-matter",
					children: "Open Dark Matter Lab"
				})
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: `SCI-NET 2.0 contract`,
			className: "mb-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "OBSERVED ≠ DERIVED ≠ INFERRED ≠ HYPOTHETICAL ≠ SIMULATED. The inference chain is frozen before unblinding. Synthetic events are controls only."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-1",
					children: SCINET_PIPELINE.map((stage) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-md bg-secondary px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
						children: stage
					}, stage))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 font-mono text-[11px] text-muted-foreground",
					children: ["Hypotheses: ", HYPOTHESES.map((h) => h.id.replace("_", " ")).join(" · ")]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Theory agent",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs text-muted-foreground",
					children: ["Domain", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "mt-1 flex h-11 w-full rounded-sm border border-input bg-secondary px-3 text-sm text-foreground",
						value: domain,
						onChange: (e) => setDomain(e.target.value),
						children: THEORY_DOMAINS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: d }, d))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 block text-xs text-muted-foreground",
					children: ["Question", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						className: "mt-1",
						rows: 4,
						value: prompt,
						onChange: (e) => setPrompt(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onSynthesize,
						disabled: pending || prompt.trim().length < 8,
						children: pending ? "Synthesizing…" : "Synthesize hypothesis"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "User-initiated. Capped. Not evidence."
					})]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-danger",
					children: error
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Hypothesis ledger",
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: theories.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-lg bg-secondary p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-medium",
									children: t.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GradeBadge, { grade: t.evidenceGrade }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-[10px] text-muted-foreground",
									children: [
										t.status,
										" · ",
										t.regime
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-mono text-xs leading-relaxed",
							children: t.equations
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: t.note
						})
					]
				}, t.id))
			})
		})
	] });
}
//#endregion
export { ResearchPage as component };
