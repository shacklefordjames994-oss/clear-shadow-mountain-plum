import { Wt as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button } from "./badge-uyEFEQwD.mjs";
import { n as GradeBadge } from "./badges-DoNbXchz.mjs";
import { l as useOmegaStore } from "./store-lOmq_ntM.mjs";
import { n as Panel, t as PageHeader } from "./panel-GIo8_dlm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/knowledge-DZl73kEe.js
var import_jsx_runtime = require_jsx_runtime();
function KnowledgePage() {
	const evidence = useOmegaStore((s) => s.evidence);
	const theories = useOmegaStore((s) => s.theories);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Knowledge + evidence",
			title: "Lineage that survives transformation",
			description: "AI output is not evidence. Correlation is not causation. Contradictions remain visible. Every claim carries type, grade, uncertainty, and hash."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Evidence graph",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: evidence.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg bg-secondary p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs",
									children: e.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GradeBadge, { grade: e.grade }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[10px] uppercase text-muted-foreground",
									children: e.type
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm",
							children: e.claim
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: [
								e.source,
								" · unc ",
								e.uncertainty.toFixed(2),
								" · ",
								e.hash
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 flex flex-wrap gap-1",
							children: e.relations.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-full bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground",
								children: [
									r.kind,
									" → ",
									r.targetId
								]
							}, r.kind + r.targetId))
						})
					]
				}, e.id))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Theory fabric v5.3",
			className: "mt-4",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/theory",
					children: "Open validation"
				})
			}),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: theories.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-lg bg-secondary p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-medium",
								children: t.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GradeBadge, { grade: t.evidenceGrade })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-[10px] text-muted-foreground",
							children: [
								t.domain,
								" · ",
								t.regime,
								" · ",
								t.status
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 font-mono text-xs leading-relaxed",
							children: t.equations
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 list-disc pl-4 text-xs text-muted-foreground",
							children: t.assumptions.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: a }, a))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: t.note
						})
					]
				}, t.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "Incompatible theories are never forced into one equation. Conflicts stay explicit."
			})]
		})
	] });
}
//#endregion
export { KnowledgePage as component };
