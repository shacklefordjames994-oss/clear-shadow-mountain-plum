import { Wt as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, t as Badge } from "./badge-uyEFEQwD.mjs";
import { a as CONTACT_HANDLE, c as CONTACT_PHONE, g as OMEGA_TITLE, h as OMEGA_ARCHITECT, i as CONTACT_BRIEF, l as CONTACT_TEL, o as CONTACT_NAME, s as CONTACT_ORG, y as PRIMARY_BOUNDARY } from "./constants-DoK96khb.mjs";
import { n as Panel, r as Stat, t as PageHeader } from "./panel-GIo8_dlm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/partner-CnRKl-d-.js
var import_jsx_runtime = require_jsx_runtime();
var LANES = [
	{
		id: "COLLABORATE",
		title: "Collaborate",
		body: "Joint research desks, academy modules, and governed-agent workflows. You keep authorization. We keep provenance."
	},
	{
		id: "PARTNER",
		title: "Partner",
		body: "Lab, campus, and industry twins that share the same Guard, evidence graph, and human gate."
	},
	{
		id: "SALE",
		title: "Sale / license",
		body: "Physics DigiSim, DHC-TWIN, and the OMEGA fabric as a sandbox — simulation only, never a control system."
	},
	{
		id: "INTEGRATE",
		title: "Integrate",
		body: "Drop SCI-NETv2 evidence, the CERN kernel, or the swarm into an existing research stack without duplicating Guard."
	}
];
function PartnerPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: `${CONTACT_ORG} · ${CONTACT_HANDLE}`,
			title: "Build with the architect",
			description: `${CONTACT_BRIEF} ${PRIMARY_BOUNDARY}.`,
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: `tel:${CONTACT_TEL}`,
					children: ["Call ", CONTACT_PHONE]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: "Command"
				})
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Architect",
					value: CONTACT_NAME,
					hint: OMEGA_TITLE
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Handle",
					value: CONTACT_HANDLE,
					hint: "OMEGA / Physics DigiSim"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Direct",
					value: CONTACT_PHONE,
					hint: "Voice, not a bot"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Desk",
					value: CONTACT_ORG,
					hint: "Collaboration · sale · partnering"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: OMEGA_ARCHITECT,
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "HUMAN GATE" }),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-relaxed text-muted-foreground",
				children: "James Marcelle Shackelford designed OMEGA so agents may organize, never authorize. AI Teams is the collaboration desk for labs, operators, and partners who want that boundary in the product — not in a slide."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: [
					"Call ",
					CONTACT_PHONE,
					". Say whether you want to collaborate, partner, license, or integrate. The swarm does not take the meeting."
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid gap-3 sm:grid-cols-2",
			children: LANES.map((lane) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: lane.title,
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: lane.id }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: lane.body
				})
			}, lane.id))
		})
	] });
}
//#endregion
export { PartnerPage as component };
