import { Wt as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button } from "./badge-uyEFEQwD.mjs";
import { r as SecurityBadge } from "./badges-DoNbXchz.mjs";
import { f as GUARD_LAYERS } from "./constants-DoK96khb.mjs";
import { l as useOmegaStore } from "./store-lOmq_ntM.mjs";
import { n as Panel, t as PageHeader } from "./panel-GIo8_dlm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guard-DjUi2HNQ.js
var import_jsx_runtime = require_jsx_runtime();
var DOMAINS = [
	"AI_tools",
	"API",
	"OT_SCADA",
	"models",
	"agents",
	"network",
	"hypervisor"
];
function GuardPage() {
	const security = useOmegaStore((s) => s.security);
	const probes = useOmegaStore((s) => s.probes);
	const injectProbe = useOmegaStore((s) => s.injectProbe);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "OMEGA-GUARD",
			title: "Defensive digital immune system",
			description: "Guard sits above agent execution. Fail closed. Allowlist. Sandbox. Hash audit. Software cannot rewrite the trust roots.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityBadge, { status: security })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
			children: GUARD_LAYERS.map((layer, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: `${layer.id.split("_")[0]}  ${layer.label}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-relaxed text-muted-foreground",
					children: layer.duty
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 font-mono text-[10px] text-muted-foreground",
					children: ["priority ", i]
				})]
			}, layer.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Inject unsigned probe",
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-sm text-muted-foreground",
				children: "L3 may observe, correlate, explain, simulate, recommend, and record. It may not authorize. Unknown publishers are denied."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: DOMAINS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => injectProbe(d),
					children: ["Probe ", d.replaceAll("_", " ")]
				}, d))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Containment log",
			className: "mt-4",
			children: probes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No probes this session. Fabric is fail-closed at rest."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: probes.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md bg-secondary px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs",
							children: p.domain
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-danger",
							children: p.result
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: [
							p.layer,
							" — ",
							p.note
						]
					})]
				}, p.id))
			})
		})
	] });
}
//#endregion
export { GuardPage as component };
