import { Wt as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button } from "./badge-uyEFEQwD.mjs";
import { t as AuthorityBadge } from "./badges-DoNbXchz.mjs";
import { S as TRUST_ROOTS, p as LINEAGE, r as AXIOMS, t as AUTHORITY_LABEL, y as PRIMARY_BOUNDARY } from "./constants-DoK96khb.mjs";
import { l as useOmegaStore } from "./store-lOmq_ntM.mjs";
import { n as Panel, t as PageHeader } from "./panel-GIo8_dlm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/authority-CqIR8hM0.js
var import_jsx_runtime = require_jsx_runtime();
var LEVELS = [
	"A0",
	"A1",
	"A2",
	"A3",
	"A4",
	"A5"
];
function AuthorityPage() {
	const authority = useOmegaStore((s) => s.authority);
	const setAuthority = useOmegaStore((s) => s.setAuthority);
	const trySelfAuthorize = useOmegaStore((s) => s.trySelfAuthorize);
	const last = useOmegaStore((s) => s.events.find((e) => e.type === "AUTHORIZE_SELF" || e.rejected));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Governance",
			title: "Authority is external",
			description: PRIMARY_BOUNDARY
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Session authority",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthorityBadge, { level: authority }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Default high-consequence range is A0–A3. A4 and A5 cannot be claimed from inside the fabric."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: LEVELS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: authority === l ? "default" : l === "A4" || l === "A5" ? "destructive" : "outline",
						onClick: () => setAuthority(l),
						children: [
							l,
							" ",
							AUTHORITY_LABEL[l]
						]
					}, l))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "destructive",
						onClick: () => trySelfAuthorize(),
						children: "Agent requests A5"
					})
				}),
				last?.rejectedReason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger",
					children: last.rejectedReason
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Immutable trust roots",
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2 sm:grid-cols-2",
				children: TRUST_ROOTS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-md bg-secondary px-3 py-2 font-mono text-xs",
					children: r
				}, r))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "Agents, models, plugins, and generated code cannot rewrite these roots."
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Axioms",
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "columns-1 gap-3 sm:columns-2",
				children: AXIOMS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "mb-2 break-inside-avoid font-mono text-xs text-muted-foreground",
					children: a
				}, a))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Single fabric, not version islands",
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-2",
				children: LINEAGE.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-3 rounded-md bg-secondary px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "w-12 shrink-0 font-mono text-xs",
						children: ["v", v.version]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: v.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [" — ", v.note]
						})]
					})]
				}, v.version))
			})
		})
	] });
}
//#endregion
export { AuthorityPage as component };
