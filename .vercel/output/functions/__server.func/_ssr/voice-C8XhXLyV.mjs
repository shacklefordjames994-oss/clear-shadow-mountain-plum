import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, r as cn } from "./badge-uyEFEQwD.mjs";
import { l as useOmegaStore } from "./store-lOmq_ntM.mjs";
import { n as Panel, r as Stat, t as PageHeader } from "./panel-GIo8_dlm.mjs";
import { n as buildAgentBriefing, r as speechEngine, t as VoiceConsole } from "./voice-console-Di7DBnkl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/voice-C8XhXLyV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VoicePage() {
	const authority = useOmegaStore((s) => s.authority);
	const security = useOmegaStore((s) => s.security);
	const rejectedCount = useOmegaStore((s) => s.rejectedCount);
	const voiceSpeaker = useOmegaStore((s) => s.voiceSpeaker);
	const voiceFocus = useOmegaStore((s) => s.voiceFocus);
	const state = useOmegaStore.getState();
	const turns = buildAgentBriefing(state);
	const [index, setIndex] = (0, import_react.useState)(-1);
	(0, import_react.useEffect)(() => {
		return speechEngine.subscribe((st) => setIndex(st.index));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Agent fabric · voice",
			title: "Agents may speak. They may not rule.",
			description: "Live briefing reads the bus. Studio reels are recordings. Voice-authorize A5 is refused. Speech is an A2 channel.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/visuals",
					children: "Open visuals"
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid gap-3 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Session",
					value: authority,
					hint: "SPEAK requires A2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Speaking",
					value: voiceSpeaker ?? "idle",
					hint: voiceFocus ? `focus ${voiceFocus}` : "A2 only"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Guard",
					value: security,
					hint: `${rejectedCount} rejected writes`
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceConsole, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Script from live state",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "space-y-3",
					children: turns.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("rounded-md p-3", index === i ? "bg-accent" : "bg-secondary"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
							children: [
								t.speaker,
								" · ",
								t.role,
								" · look ",
								t.focus
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm leading-relaxed",
							children: t.text
						})]
					}, t.role))
				})
			})]
		})
	] });
}
//#endregion
export { VoicePage as component };
