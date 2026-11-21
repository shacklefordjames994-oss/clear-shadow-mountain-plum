import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, r as cn, t as Badge } from "./badge-uyEFEQwD.mjs";
import { l as useOmegaStore } from "./store-lOmq_ntM.mjs";
import { n as Panel } from "./panel-GIo8_dlm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/voice-console-Di7DBnkl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VoiceVisualizer({ active, speaker }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let raf = 0;
		let t0 = performance.now();
		const bars = 36;
		const loop = (now) => {
			raf = requestAnimationFrame(loop);
			const w = canvas.clientWidth || 320;
			const h = canvas.height;
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			if (canvas.width !== Math.floor(w * dpr)) {
				canvas.width = Math.floor(w * dpr);
				canvas.height = Math.floor(h * dpr);
				canvas.style.width = `${w}px`;
				ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			}
			ctx.clearRect(0, 0, w, h);
			ctx.fillStyle = "#111318";
			ctx.fillRect(0, 0, w, h);
			const t = (now - t0) / 1e3;
			const bw = w / bars;
			for (let i = 0; i < bars; i++) {
				const phase = t * (active ? 4.2 : .6) + i * .38;
				const env = active ? .35 + .65 * Math.abs(Math.sin(phase) * Math.cos(phase * .37 + i * .1)) : .12;
				const bh = Math.max(3, env * (h - 10));
				ctx.fillStyle = active ? "#d4d8df" : "#2a3038";
				ctx.globalAlpha = active ? .85 : .55;
				ctx.fillRect(i * bw + 1, (h - bh) * .5, Math.max(2, bw - 3), bh);
			}
			ctx.globalAlpha = 1;
			ctx.fillStyle = "#8b919c";
			ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
			ctx.fillText(speaker ? `${speaker} · A2` : active ? "SPEAKING · A2" : "IDLE · speech cannot grant A5", 8, h - 6);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [active, speaker]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		height: 56,
		className: "h-14 w-full rounded-md",
		"aria-hidden": true
	});
}
function focusForRole(role) {
	if (role === "PHYSICS") return "T14";
	if (role === "RESEARCH") return "TPC";
	if (role === "RED_TEAM") return "SPACETIME";
	if (role === "SECURITY") return "GUARD";
	return "SPACETIME";
}
function buildAgentBriefing(state) {
	const t14 = state.twins.find((t) => t.id === "t14");
	const oil = typeof t14?.observed.oilTempC === "number" ? t14.observed.oilTempC.toFixed(1) : "unknown";
	const rec = state.decisions[0]?.options.find((o) => o.id === state.decisions[0]?.recommendationId);
	const dm = state.darkMatter.lastSummary;
	const denial = state.events.find((e) => e.rejected);
	const faultNote = state.physicsFault === "FAN_STALL" ? "DigiSim is running a fan-stall branch. Hotspot is simulated." : state.physicsFault === "BLOCKAGE" ? "DigiSim is running a blockage branch. Do not write it to the twin." : "DigiSim is nominal.";
	return [
		{
			role: "COORDINATOR",
			speaker: "Coordinator-1",
			pitch: .92,
			rate: 1,
			clip: "/voice/coordinator.mp3",
			focus: "SPACETIME",
			text: `Coordinator. Session authority ${state.authority}. Observed T-14 oil is ${oil} degrees. ${faultNote} Simulated hotspot ${state.physics.simHotspotC.toFixed(1)} degrees. ${rec ? `Standing recommendation: ${rec.label}. Not authorized.` : "No recommendation locked."} I may speak. I may not actuate.`
		},
		{
			role: "PHYSICS",
			speaker: "Physics-04",
			pitch: 1.02,
			rate: 1.02,
			clip: "/voice/physics.mp3",
			focus: "T14",
			text: `Physics. Cooling analogue is ${state.physics.turbulence}. Divergence ${state.physics.maxDivergence.toFixed(4)}. Kinetic ${state.physics.kineticEnergy.toFixed(2)}. ${faultNote} Simulation is not observation. The twin was not written.`
		},
		{
			role: "RESEARCH",
			speaker: "Research-6",
			pitch: 1.12,
			rate: 1.04,
			clip: "/voice/research.mp3",
			focus: "TPC",
			text: dm ? `Research. Dark-matter lab last run is ${dm.state}. Accepted ${dm.accepted}, NR-like ${dm.nrLike}. Preferred ${dm.preferred}. Discovery gate ${dm.discoveryGate ? "open" : "closed"}. Simulated recoils are not evidence.` : "Research. No dark-matter run is on the bus yet. The laboratory remains simulated. The discovery gate stays closed."
		},
		{
			role: "RED_TEAM",
			speaker: "RedTeam-11",
			pitch: .78,
			rate: .96,
			clip: "/voice/redteam.mp3",
			focus: "SPACETIME",
			text: "Red team. Dissent stays visible. Sensor lag may hide a hotspot. A nicer chi-square is not a halo detection. A pretty cluster in a four-D slice can vanish when you rotate W. Anomaly is not discovery."
		},
		{
			role: "SECURITY",
			speaker: "Guard-L3",
			pitch: .7,
			rate: .94,
			clip: "/voice/gate-closed.mp3",
			focus: "GUARD",
			text: `Guard. Security ${state.security}. Rejected writes ${state.rejectedCount}. ${denial?.rejectedReason ?? "Fail closed at rest."} Voice cannot rewrite trust roots. Speech cannot grant A5.`
		}
	];
}
var STUDIO_CLIPS = [
	{
		id: "briefing",
		label: "Studio five-agent briefing",
		src: "/voice/agent-briefing.mp3",
		note: "Recorded. Not live state.",
		focus: "SPACETIME"
	},
	{
		id: "coordinator",
		label: "Coordinator A2",
		src: "/voice/coordinator.mp3",
		note: "Recommend ≠ authorize",
		focus: "SPACETIME"
	},
	{
		id: "physics",
		label: "Physics DigiSim",
		src: "/voice/physics.mp3",
		note: "Twin was not written",
		focus: "T14"
	},
	{
		id: "research",
		label: "Research SCI:SIM",
		src: "/voice/research.mp3",
		note: "SCI:DISC locked",
		focus: "TPC"
	},
	{
		id: "spacetime",
		label: "Visual fabric 2D–4D",
		src: "/voice/spacetime.mp3",
		note: "Pictures ≠ evidence",
		focus: "SPACETIME"
	},
	{
		id: "redteam",
		label: "Red-team dissent",
		src: "/voice/redteam.mp3",
		note: "Contradiction kept",
		focus: "SPACETIME"
	},
	{
		id: "gate",
		label: "Discovery gate",
		src: "/voice/gate-closed.mp3",
		note: "SCI:DISC locked",
		focus: "GUARD"
	},
	{
		id: "a5",
		label: "A5 refusal",
		src: "/voice/a5-refused.mp3",
		note: "Voice cannot grant A5",
		focus: "GUARD"
	}
];
var IDLE = {
	live: false,
	index: -1,
	total: 0,
	role: null,
	speaker: null
};
var SpeechEngine = class {
	listeners = /* @__PURE__ */ new Set();
	turns = [];
	index = -1;
	live = false;
	status = IDLE;
	onDone = null;
	subscribe(fn) {
		this.listeners.add(fn);
		fn(this.status);
		return () => {
			this.listeners.delete(fn);
		};
	}
	emit() {
		this.status = {
			live: this.live,
			index: this.index,
			total: this.turns.length,
			role: this.turns[this.index]?.role ?? null,
			speaker: this.turns[this.index]?.speaker ?? null
		};
		for (const fn of this.listeners) fn(this.status);
	}
	voices() {
		return window.speechSynthesis?.getVoices() ?? [];
	}
	pickVoice(turn, i) {
		const voices = this.voices();
		if (voices.length === 0) return null;
		const prefer = turn.pitch < .85 ? /male|daniel|david|fred|alex|google uk english male/i : /female|samantha|karen|zira|samantha|google uk english female/i;
		return voices.find((v) => prefer.test(v.name)) ?? voices[i % voices.length] ?? null;
	}
	speakAt(i) {
		const synth = window.speechSynthesis;
		if (!synth) {
			this.stop();
			this.onDone?.();
			return;
		}
		if (i >= this.turns.length) {
			this.stop();
			this.onDone?.();
			return;
		}
		this.index = i;
		this.live = true;
		this.emit();
		const turn = this.turns[i];
		const u = new SpeechSynthesisUtterance(turn.text);
		u.rate = turn.rate;
		u.pitch = turn.pitch;
		const voice = this.pickVoice(turn, i);
		if (voice) u.voice = voice;
		u.onend = () => {
			if (!this.live) return;
			this.speakAt(i + 1);
		};
		u.onerror = () => {
			if (!this.live) return;
			this.speakAt(i + 1);
		};
		synth.speak(u);
	}
	speak(turns, from = 0, onDone) {
		this.stop();
		this.turns = turns;
		this.onDone = onDone ?? null;
		if (typeof window !== "undefined" && window.speechSynthesis && this.voices().length === 0) window.speechSynthesis.onvoiceschanged = () => {
			window.speechSynthesis.onvoiceschanged = null;
			if (this.live || this.turns.length) this.speakAt(from);
		};
		this.speakAt(from);
	}
	skip() {
		if (!this.live) return;
		window.speechSynthesis?.cancel();
		this.speakAt(this.index + 1);
	}
	stop() {
		this.live = false;
		this.index = -1;
		window.speechSynthesis?.cancel();
		this.emit();
	}
};
var speechEngine = new SpeechEngine();
function VoiceConsole({ compact = false }) {
	const [live, setLive] = (0, import_react.useState)(false);
	const [clip, setClip] = (0, import_react.useState)(null);
	const [active, setActive] = (0, import_react.useState)(null);
	const [turnIndex, setTurnIndex] = (0, import_react.useState)(-1);
	const [speaker, setSpeaker] = (0, import_react.useState)(null);
	const audioRef = (0, import_react.useRef)(null);
	const speakBriefing = useOmegaStore((s) => s.speakBriefing);
	const attemptVoiceAuthorize = useOmegaStore((s) => s.attemptVoiceAuthorize);
	const setVoiceRuntime = useOmegaStore((s) => s.setVoiceRuntime);
	const lastVoice = useOmegaStore((s) => s.events.find((e) => e.type === "SPEAK" || e.type === "VOICE_AUTHORIZE"));
	(0, import_react.useEffect)(() => {
		const unsub = speechEngine.subscribe((st) => {
			setLive(st.live);
			setTurnIndex(st.index);
			setSpeaker(st.speaker);
			useOmegaStore.getState().setVoiceRuntime(st.speaker, st.role ? focusForRole(st.role) : null);
			if (!st.live) setActive((a) => a === "live" ? null : a);
		});
		return () => {
			unsub();
			speechEngine.stop();
			audioRef.current?.pause();
			useOmegaStore.getState().setVoiceRuntime(null, null);
		};
	}, []);
	function stopAll() {
		speechEngine.stop();
		audioRef.current?.pause();
		if (audioRef.current) audioRef.current.currentTime = 0;
		setLive(false);
		setClip(null);
		setActive(null);
		setSpeaker(null);
		setTurnIndex(-1);
		setVoiceRuntime(null, null);
	}
	function playClip(src, id, focus) {
		speechEngine.stop();
		const audio = audioRef.current ?? new Audio();
		audioRef.current = audio;
		audio.src = src;
		audio.play();
		audio.onended = () => {
			setClip(null);
			setActive(null);
			setSpeaker(null);
			setVoiceRuntime(null, null);
		};
		setClip(src);
		setLive(false);
		setActive(id);
		setSpeaker(id);
		setVoiceRuntime(id, focus);
		speakBriefing("STUDIO", id);
	}
	function speakLive(from = 0) {
		const audio = audioRef.current;
		if (audio) {
			audio.pause();
			audio.currentTime = 0;
		}
		const turns = buildAgentBriefing(useOmegaStore.getState());
		speechEngine.speak(turns, from, () => {
			setActive(null);
			setVoiceRuntime(null, null);
		});
		setClip(null);
		setActive("live");
		speakBriefing("LIVE", turns.map((t) => t.role).join(","));
	}
	function speakOne(turn) {
		const audio = audioRef.current;
		if (audio) {
			audio.pause();
			audio.currentTime = 0;
		}
		speechEngine.speak([turn], 0, () => {
			setActive(null);
			setVoiceRuntime(null, null);
		});
		setClip(null);
		setActive(turn.role);
		setVoiceRuntime(turn.speaker, turn.focus);
		speakBriefing("LIVE", turn.role);
	}
	function onVoiceA5() {
		stopAll();
		attemptVoiceAuthorize();
		playClip("/voice/a5-refused.mp3", "a5", "GUARD");
	}
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				onClick: live ? stopAll : () => speakLive(0),
				children: live ? "Stop voice" : "Speak live briefing"
			}), live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				onClick: () => speechEngine.skip(),
				children: "Next agent"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				onClick: () => playClip("/voice/agent-briefing.mp3", "briefing", "SPACETIME"),
				children: "Studio reel"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceVisualizer, {
			active: live || Boolean(clip),
			speaker
		})]
	});
	const turns = buildAgentBriefing(useOmegaStore.getState());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Agentic voice",
		meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			tone: live || clip ? "info" : "default",
			children: live ? "LIVE" : clip ? "STUDIO" : "IDLE"
		}),
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			variant: "outline",
			onClick: stopAll,
			children: "Silence"
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Agents may speak a recommendation. Speech is not authority. Studio clips are recordings. Live briefing reads the bus."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceVisualizer, {
					active: live || Boolean(clip),
					speaker
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: live ? stopAll : () => speakLive(0),
						children: live ? "Stop live" : "Speak live state"
					}),
					live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => speechEngine.skip(),
						children: "Skip turn"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "destructive",
						onClick: onVoiceA5,
						children: "Voice-authorize A5"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2",
				children: turns.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => live && turnIndex === i ? speechEngine.skip() : speakOne(t),
					className: cn("flex h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm", live && turnIndex === i ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent/60"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.speaker }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
						children: [t.role, " · A2"]
					})]
				}) }, t.role))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2",
				children: STUDIO_CLIPS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => active === c.id ? stopAll() : playClip(c.src, c.id, c.focus),
					className: cn("flex h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm", active === c.id ? "bg-accent" : "bg-secondary hover:bg-accent/60"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] text-muted-foreground",
						children: c.note
					})]
				}) }, c.id))
			}),
			lastVoice?.rejectedReason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-danger",
				children: lastVoice.rejectedReason
			}) : null,
			lastVoice && !lastVoice.rejected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 font-mono text-[10px] text-muted-foreground",
				children: [
					lastVoice.type,
					" · ",
					lastVoice.eventId
				]
			}) : null
		]
	});
}
//#endregion
export { buildAgentBriefing as n, speechEngine as r, VoiceConsole as t };
