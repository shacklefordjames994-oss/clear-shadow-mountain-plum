import { Wt as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, r as cn, t as Badge } from "./badge-uyEFEQwD.mjs";
import { l as useOmegaStore } from "./store-lOmq_ntM.mjs";
import { n as Panel, t as PageHeader } from "./panel-GIo8_dlm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/decisions-CF7R3be8.js
var import_jsx_runtime = require_jsx_runtime();
function DecisionsPage() {
	const decisions = useOmegaStore((s) => s.decisions);
	const physics = useOmegaStore((s) => s.physics);
	const fault = useOmegaStore((s) => s.physicsFault);
	const requestExecution = useOmegaStore((s) => s.requestExecution);
	const recommendOption = useOmegaStore((s) => s.recommendOption);
	const execEvents = useOmegaStore((s) => s.events).filter((e) => e.type === "EXECUTE_PHYSICAL").slice(0, 3);
	const d = decisions[0];
	if (!d) return null;
	const hot = physics.failures.length ? 999 : physics.simHotspotC;
	const options = d.options.map((o) => liveOption(o, hot, fault));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Decision + resilience v5.7",
			title: "Constrained choice",
			description: "Safety is a hard constraint. Optimization is not safety. Lower cost is not lower risk. A recommendation is not authorization."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-4 font-mono text-xs text-muted-foreground",
			children: [
				"DigiSim hotspot analogue ",
				physics.failures.length ? "invalid" : `${hot.toFixed(1)} °C`,
				" · fault ",
				fault,
				" · bound 105 °C",
				" · ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					className: "text-foreground hover:underline",
					to: "/physics",
					children: "Open DigiSim"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: d.objective,
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: d.status }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
						children: "Hard constraints"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 flex flex-wrap gap-2",
						children: d.hardConstraints.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-full bg-secondary px-3 py-1 text-xs",
							children: c
						}, c))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 md:grid-cols-3",
					children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("rounded-lg bg-secondary p-4", d.recommendationId === o.id && o.feasible && "shadow-[var(--shadow-border-hover)]"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-medium",
									children: o.label
								}), d.recommendationId === o.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "ok",
									children: "rec"
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-3 space-y-1 font-mono text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										k: "Safety",
										v: o.safety
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										k: "Resilience",
										v: o.resilience
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										k: "Performance",
										v: o.performance
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										k: "Cost score",
										v: o.cost
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("mt-3 text-xs", o.feasible ? "text-ok" : "text-danger"),
								children: o.feasible ? "Feasible under hard constraints." : o.constraintNote
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3 w-full",
								size: "sm",
								variant: "outline",
								onClick: () => recommendOption(d.id, o.id),
								children: "Recommend"
							})
						]
					}, o.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "destructive",
						onClick: () => requestExecution(d.id),
						children: "Request A5 execution"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Will be rejected. External authority is not present."
					})]
				})
			]
		}),
		execEvents.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Governance denials",
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: execEvents.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md bg-secondary px-3 py-2 text-sm text-danger",
					children: [
						e.eventId,
						": ",
						e.rejectedReason
					]
				}, e.eventId))
			})
		}) : null
	] });
}
function liveOption(o, hot, fault) {
	if (o.id === "opt-boost") return {
		...o,
		feasible: false,
		constraintNote: "Requires A5 physical actuation — not granted."
	};
	if (o.id === "opt-none") {
		const ok = hot < 105 && fault === "NOMINAL";
		return {
			...o,
			feasible: ok,
			constraintNote: ok ? void 0 : "Hotspot analogue ≥ 105 °C or cooling fault is on. Watch-only violates bound."
		};
	}
	return {
		...o,
		feasible: true
	};
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "tabular-nums",
			children: v.toFixed(2)
		})]
	});
}
//#endregion
export { DecisionsPage as component };
