import { Wt as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, r as cn, t as Badge } from "./badge-uyEFEQwD.mjs";
import { l as useOmegaStore } from "./store-lOmq_ntM.mjs";
import { n as Panel, t as PageHeader } from "./panel-GIo8_dlm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scenarios-HT1YPMqG.js
var import_jsx_runtime = require_jsx_runtime();
function ScenariosPage() {
	const scenarios = useOmegaStore((s) => s.scenarios);
	const selected = useOmegaStore((s) => s.selectedScenarioId);
	const selectScenario = useOmegaStore((s) => s.selectScenario);
	const runScenario = useOmegaStore((s) => s.runScenario);
	const forkScenario = useOmegaStore((s) => s.forkScenario);
	const current = scenarios.find((s) => s.id === selected) ?? scenarios[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: "Scenario engine v5.6",
		title: "Isolated futures",
		description: "Branches cannot overwrite trusted state. A scenario is not reality. A counterfactual is not an observation."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Branches",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: scenarios.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => selectScenario(s.id),
					className: cn("flex h-auto min-h-11 w-full flex-col items-start rounded-md px-3 py-2 text-left", s.id === selected ? "bg-accent" : "hover:bg-accent/60"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm",
						children: s.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-[10px] text-muted-foreground",
						children: [s.kind, s.parentId ? ` · from ${s.parentId}` : ""]
					})]
				}) }, s.id))
			})
		}), current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: current.name,
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: "info",
				children: current.kind
			}),
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => runScenario(current.id),
						children: "Run branch"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => forkScenario(current.id, "COUNTERFACTUAL"),
						children: "Fork counterfactual"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => forkScenario(current.id, "STRESS_TEST"),
						children: "Fork stress"
					})
				]
			}),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-3 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "font-mono text-[10px] uppercase text-muted-foreground",
							children: "P"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-mono tabular-nums",
							children: current.probability.toFixed(2)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "font-mono text-[10px] uppercase text-muted-foreground",
							children: "Uncertainty"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-mono tabular-nums",
							children: current.uncertainty.toFixed(2)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "font-mono text-[10px] uppercase text-muted-foreground",
							children: "Risk"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-mono tabular-nums",
							children: current.risk.toFixed(2)
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
					children: "Assumptions"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground",
					children: current.assumptions.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: a }, a))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-md bg-secondary p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] uppercase text-muted-foreground",
						children: current.ran ? "Outcome (simulated)" : "Not run"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm",
						children: current.outcome
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 font-mono text-[10px] text-muted-foreground",
					children: current.hash
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Run applies a Physics DigiSim fault (stall / blockage / nominal). Trusted T-14 does not move."
				})
			]
		}) : null]
	})] });
}
//#endregion
export { ScenariosPage as component };
