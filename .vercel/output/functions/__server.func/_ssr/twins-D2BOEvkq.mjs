import { Wt as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, r as cn } from "./badge-uyEFEQwD.mjs";
import { i as StateBadge } from "./badges-DoNbXchz.mjs";
import { l as useOmegaStore } from "./store-lOmq_ntM.mjs";
import { n as Panel, t as PageHeader } from "./panel-GIo8_dlm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/twins-D2BOEvkq.js
var import_jsx_runtime = require_jsx_runtime();
var RECON_STEPS = [
	"Observe",
	"Authenticate",
	"Quality",
	"Align",
	"Fuse",
	"Gap ID",
	"Geometry",
	"Materials",
	"Boundaries",
	"Initial state",
	"Parameters",
	"Ensemble",
	"Compile",
	"Physics",
	"Compare",
	"Residual",
	"Uncertainty",
	"Validate",
	"Untrusted reconstruction"
];
function TwinsPage() {
	const twins = useOmegaStore((s) => s.twins);
	const selected = useOmegaStore((s) => s.selectedTwinId);
	const selectTwin = useOmegaStore((s) => s.selectTwin);
	const reconstructTwin = useOmegaStore((s) => s.reconstructTwin);
	const twin = twins.find((t) => t.id === selected) ?? twins[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: "Digital twin v5.4",
		title: "Universal twin fabric",
		description: "Hierarchy from component to planetary system. Local authority stays local. Twin ≠ reality. Reconstruction never silently becomes trusted state."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Tree",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: twins.map((t) => {
					const depth = depthOf(t.id, twins);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => selectTwin(t.id),
						className: cn("flex h-11 w-full items-center rounded-md px-2 text-left text-sm", t.id === selected ? "bg-accent" : "hover:bg-accent/60"),
						style: { paddingLeft: 8 + depth * 12 },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: t.name
						})
					}) }, t.id);
				})
			})
		}), twin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: twin.name,
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StateBadge, { cls: twin.stateClass }),
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => reconstructTwin(twin.id),
					children: "Reconstruct"
				}),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-muted-foreground",
						children: [
							twin.level,
							" · ",
							twin.domain,
							" · authority ",
							twin.localAuthority
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Uncertainty",
								value: twin.uncertainty.toFixed(2)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Quality",
								value: twin.quality.toFixed(2)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Risk",
								value: twin.risk.toFixed(2)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
							children: "Observed"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KV, { data: twin.observed })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
							children: "Estimated"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KV, { data: twin.estimated })] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: [
							"Trusted: ",
							twin.trusted ? "yes, after validation" : "no",
							". Observed ≠ reconstructed ≠ inferred."
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "World reconstruction v5.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1",
					children: RECON_STEPS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-sm bg-secondary px-2 py-1 text-[11px] text-muted-foreground",
						children: [
							i + 1,
							". ",
							s
						]
					}, s))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Missing data is not absence. Unknown is not zero. Geometry is not complete state."
				})]
			})]
		}) : null]
	})] });
}
function depthOf(id, twins) {
	let d = 0;
	let cur = twins.find((t) => t.id === id);
	while (cur?.parentId) {
		d += 1;
		cur = twins.find((t) => t.id === cur?.parentId);
		if (d > 12) break;
	}
	return d;
}
function Metric({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-secondary p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-[10px] uppercase text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-lg tabular-nums",
			children: value
		})]
	});
}
function KV({ data }) {
	const entries = Object.entries(data);
	if (entries.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-sm text-muted-foreground",
		children: "None recorded."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 space-y-1",
		children: entries.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex justify-between gap-2 font-mono text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted-foreground",
				children: k
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tabular-nums",
				children: typeof v === "number" ? v.toPrecision(4) : v
			})]
		}, k))
	});
}
//#endregion
export { TwinsPage as component };
