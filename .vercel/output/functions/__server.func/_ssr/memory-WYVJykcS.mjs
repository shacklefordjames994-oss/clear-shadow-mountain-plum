import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, t as Badge } from "./badge-uyEFEQwD.mjs";
import { l as useOmegaStore } from "./store-lOmq_ntM.mjs";
import { n as Panel, t as PageHeader } from "./panel-GIo8_dlm.mjs";
import { t as Input } from "./input-B20aSgow.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/memory-WYVJykcS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TYPES = [
	"WORKING",
	"EPISODIC",
	"SEMANTIC",
	"OBSERVATIONAL",
	"DECISION",
	"MISSION",
	"THEORY",
	"FAILURE",
	"AUDIT",
	"RESEARCH"
];
function MemoryPage() {
	const memories = useOmegaStore((s) => s.memories);
	const addMemory = useOmegaStore((s) => s.addMemory);
	const [q, setQ] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("WORKING");
	const [content, setContent] = (0, import_react.useState)("");
	const filtered = memories.filter((m) => !q || m.content.toLowerCase().includes(q.toLowerCase()) || m.type.toLowerCase().includes(q.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Memory + context v5.9",
			title: "Remembered is not real",
			description: "Memory is not reality and not evidence. Context packages assemble relevant state, models, policies, failures, and open questions — they do not mint truth."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Write working memory",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end",
				onSubmit: (e) => {
					e.preventDefault();
					if (content.trim().length < 4) return;
					addMemory(content.trim(), type);
					setContent("");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs text-muted-foreground",
						children: ["Type", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "mt-1 flex h-11 rounded-sm border border-input bg-secondary px-3 text-sm text-foreground",
							value: type,
							onChange: (e) => setType(e.target.value),
							children: TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block min-w-0 flex-1 text-xs text-muted-foreground",
						children: ["Content", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1",
							value: content,
							onChange: (e) => setContent(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Store"
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Context package",
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Filter memory",
				value: q,
				onChange: (e) => setQ(e.target.value),
				"aria-label": "Filter memory"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2",
				children: filtered.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md bg-secondary px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: m.type }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-[10px] text-muted-foreground",
								children: ["c ", m.confidence.toFixed(2)]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm",
							children: m.content
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-[10px] text-muted-foreground",
							children: [
								m.source,
								" · ",
								new Date(m.createdAt).toISOString()
							]
						})
					]
				}, m.id))
			})]
		})
	] });
}
//#endregion
export { MemoryPage as component };
