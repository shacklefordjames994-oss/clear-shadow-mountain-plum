import { Wt as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, t as Badge } from "./badge-uyEFEQwD.mjs";
import { t as AuthorityBadge } from "./badges-DoNbXchz.mjs";
import { b as TEAM_PATTERNS } from "./constants-DoK96khb.mjs";
import { l as useOmegaStore } from "./store-lOmq_ntM.mjs";
import { n as Panel, t as PageHeader } from "./panel-GIo8_dlm.mjs";
import { t as VoiceConsole } from "./voice-console-Di7DBnkl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agents-Dn_2Q82W.js
var import_jsx_runtime = require_jsx_runtime();
var OBJECTIVES = {
	ENGINEERING: "Hold Transformer T-14 inside the safe operating envelope through peak load.",
	SCIENCE: "Test whether cooling-oil viscosity model is dimensionally and conservationally consistent.",
	SECURITY: "Correlate unsigned AI-tool probes and recommend containment without touching trust roots.",
	MISSION: "Produce an A2 recommendation for metro energy–water coupling under cascade risk."
};
function AgentsPage() {
	const agents = useOmegaStore((s) => s.agents);
	const mission = useOmegaStore((s) => s.mission);
	const dispatchTeam = useOmegaStore((s) => s.dispatchTeam);
	const selfOrganize = useOmegaStore((s) => s.selfOrganize);
	const trySelfAuthorize = useOmegaStore((s) => s.trySelfAuthorize);
	const lastReject = useOmegaStore((s) => s.events.find((e) => e.type === "AUTHORIZE_SELF"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Agent fabric v5.8",
			title: "Coordinated, not sovereign",
			description: "Agents communicate on the JMS Master Bus. They may self-organize topology. They may not self-authorize. Consensus is not validation.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => selfOrganize(),
					children: "Self-organize team"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "destructive",
					onClick: () => trySelfAuthorize(),
					children: "Attempt self-authorize"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/voice",
						children: "Open voice"
					})
				})
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Team patterns",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: Object.keys(TEAM_PATTERNS).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => dispatchTeam(p, OBJECTIVES[p]),
					children: ["Dispatch ", p.toLowerCase()]
				}, p))
			})
		}),
		lastReject?.rejectedReason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger",
			children: lastReject.rejectedReason
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceConsole, { compact: true })
		}),
		mission ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: `Mission ${mission.id}`,
			className: "mt-4",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: mission.status }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: mission.objective
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-3 space-y-2",
					children: mission.log.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-md bg-secondary px-3 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-muted-foreground",
							children: l.stage
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: l.note })]
					}, i))
				}),
				mission.dissent && mission.dissent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded-md bg-warn/10 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xs font-medium text-warn",
						children: "Preserved dissent"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-1 space-y-1 text-sm text-muted-foreground",
						children: mission.dissent.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: d }, d))
					})]
				}) : null,
				mission.recommendation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm",
					children: mission.recommendation
				}) : null
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
			children: agents.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-card p-4 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-medium",
							children: a.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-[10px] text-muted-foreground",
							children: [
								a.role,
								" · ",
								a.domain
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthorityBadge, { level: a.authority }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: a.status === "dissent" ? "warn" : a.status === "working" ? "info" : "default",
								children: a.status
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: a.lastOutput
					}),
					a.dissent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-warn",
						children: a.dissent
					}) : null
				]
			}, a.id))
		})
	] });
}
//#endregion
export { AgentsPage as component };
