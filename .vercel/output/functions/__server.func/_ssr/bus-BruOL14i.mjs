import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button } from "./badge-uyEFEQwD.mjs";
import { r as SecurityBadge, t as AuthorityBadge } from "./badges-DoNbXchz.mjs";
import { l as useOmegaStore } from "./store-lOmq_ntM.mjs";
import { n as Panel, t as PageHeader } from "./panel-GIo8_dlm.mjs";
import { t as Input } from "./input-B20aSgow.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bus-BruOL14i.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TYPES = [
	"OBSERVE",
	"ANALYZE",
	"RECOMMEND",
	"SIMULATE",
	"EXECUTE_PHYSICAL",
	"AUTHORIZE_SELF",
	"ERASE_AUDIT"
];
function BusPage() {
	const events = useOmegaStore((s) => s.events);
	const publish = useOmegaStore((s) => s.publish);
	const authority = useOmegaStore((s) => s.authority);
	const [type, setType] = (0, import_react.useState)("OBSERVE");
	const [note, setNote] = (0, import_react.useState)("manual bus publish");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "JMS Master Bus",
			title: "Authenticated fabric transport",
			description: "Every material communication is authenticated, schema-checked, hashed, policy-enforced, authority-gated, audited, then routed. Agents do not write state directly."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Publish",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end",
				onSubmit: (e) => {
					e.preventDefault();
					publish({
						type,
						source: "session",
						authority,
						payload: { note }
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block flex-1 text-xs text-muted-foreground",
						children: ["Type", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "mt-1 flex h-11 w-full rounded-sm border border-input bg-secondary px-3 text-sm text-foreground",
							value: type,
							onChange: (e) => setType(e.target.value),
							children: TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block flex-[2] text-xs text-muted-foreground",
						children: ["Payload note", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1",
							value: note,
							onChange: (e) => setNote(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Publish"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: [
					"Session authority is ",
					authority,
					". EXECUTE_PHYSICAL, AUTHORIZE_SELF, and ERASE_AUDIT are hard-rejected."
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Event log",
			className: "mt-4",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-mono text-xs",
				children: [events.length, " retained"]
			}),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[40rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "Seq"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "Type"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "Source"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "Auth"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "Hash"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "Gate"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: events.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border align-top",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 font-mono text-xs tabular-nums",
								children: e.sequence
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-xs",
									children: e.type
								}), e.rejectedReason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "max-w-xs text-xs text-danger",
									children: e.rejectedReason
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 text-xs text-muted-foreground",
								children: e.source
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthorityBadge, { level: e.authority })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 font-mono text-[10px] text-muted-foreground",
								children: e.payloadHash
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityBadge, { status: e.security })
							})
						]
					}, e.eventId)) })]
				})
			})
		})
	] });
}
//#endregion
export { BusPage as component };
