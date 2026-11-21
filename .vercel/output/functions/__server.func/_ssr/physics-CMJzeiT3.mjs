import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, r as cn, t as Badge } from "./badge-uyEFEQwD.mjs";
import { d as DIGISIM_NAME } from "./constants-DoK96khb.mjs";
import { l as useOmegaStore } from "./store-lOmq_ntM.mjs";
import { n as Panel, r as Stat, t as PageHeader } from "./panel-GIo8_dlm.mjs";
import { t as FluidCanvas } from "./fluid-canvas-Cg-3ThF9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/physics-CMJzeiT3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MODELS = [
	"DNS",
	"LES",
	"RANS"
];
var FIELDS = [
	{
		id: "DYE",
		label: "Dye"
	},
	{
		id: "SPEED",
		label: "Speed"
	},
	{
		id: "DIV",
		label: "Divergence"
	}
];
var FAULTS = [
	{
		id: "NOMINAL",
		label: "Nominal"
	},
	{
		id: "FAN_STALL",
		label: "Fan stall"
	},
	{
		id: "BLOCKAGE",
		label: "Blockage"
	}
];
function PhysicsPage() {
	const physics = useOmegaStore((s) => s.physics);
	const running = useOmegaStore((s) => s.physicsRunning);
	const field = useOmegaStore((s) => s.physicsField);
	const fault = useOmegaStore((s) => s.physicsFault);
	const probe = useOmegaStore((s) => s.physicsProbe);
	const twins = useOmegaStore((s) => s.twins);
	const setRunning = useOmegaStore((s) => s.setPhysicsRunning);
	const setTurbulence = useOmegaStore((s) => s.setTurbulence);
	const setPhysicsField = useOmegaStore((s) => s.setPhysicsField);
	const setPhysicsFault = useOmegaStore((s) => s.setPhysicsFault);
	const resetDigiSim = useOmegaStore((s) => s.resetDigiSim);
	const commitDigiSimRun = useOmegaStore((s) => s.commitDigiSimRun);
	const [note, setNote] = (0, import_react.useState)(null);
	const t14 = twins.find((t) => t.id === "t14");
	const loop = twins.find((t) => t.id === "cool-loop");
	const oil = num(t14?.observed.oilTempC);
	const hot = num(t14?.observed.windingHotSpot);
	const dT = num(loop?.observed.deltaT);
	const flow = num(loop?.observed.flowLpm);
	const broken = physics.failures.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: `${DIGISIM_NAME} v5.3`,
			title: DIGISIM_NAME,
			description: "Navier–Stokes analogue of the T-14 cooling loop. Drag to stir. Tap to probe. Faults and scenario branches drive the field. They do not overwrite the transformer.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: running ? "outline" : "default",
				onClick: () => setRunning(!running),
				children: running ? "Pause DigiSim" : "Resume DigiSim"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => resetDigiSim(),
				children: "Reset field"
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_18.5rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "T-14 cooling-loop analogue",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: fault === "NOMINAL" ? "default" : "warn",
					children: fault
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FluidCanvas, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-background/40 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[10px] uppercase tracking-[0.18em] text-foreground",
							children: DIGISIM_NAME
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
							children: [
								"96×54 · ",
								field,
								" · ",
								fault
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-[10px] uppercase tracking-wider text-foreground",
							children: [
								physics.turbulence,
								" · ",
								running ? "live" : "paused"
							]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: "∂u/∂t + (u·∇)u = −∇p/ρ + ν∇²u + f, ∇·u = 0. Boussinesq dye lift is an analogue, not oil."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: "Probe",
					meta: probe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "info",
						children: "cell"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "tap field" }),
					children: probe ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "grid grid-cols-2 gap-2 font-mono text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "x,y",
								v: `${probe.nx.toFixed(2)}, ${probe.ny.toFixed(2)}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "u",
								v: probe.u.toFixed(3)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "v",
								v: probe.v.toFixed(3)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "|u|",
								v: probe.speed.toFixed(3)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "dye",
								v: probe.dye.toFixed(3)
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Tap the field without dragging. Drag still injects momentum."
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					title: "Sim vs observed",
					meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: broken ? "danger" : "warn",
						children: "SIMULATED"
					}),
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						className: "text-xs text-muted-foreground hover:text-foreground",
						to: "/twins",
						children: "Open twin"
					}),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 font-medium",
										children: "Qty"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 font-medium",
										children: "Observed"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 font-medium",
										children: "DigiSim"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
								className: "font-mono",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1",
											children: "Oil °C"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: fmt(oil) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "text-muted-foreground",
											children: "not oil"
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1",
											children: "Hotspot °C"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: fmt(hot) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: broken ? "text-danger" : "",
											children: broken ? "invalid" : physics.simHotspotC.toFixed(1)
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1",
											children: "Loop ΔT"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: fmt(dT) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: broken ? "text-danger" : "",
											children: broken ? "invalid" : physics.simDeltaT.toFixed(1)
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1",
											children: "Flow L/min"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: fmt(flow) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "text-muted-foreground",
											children: ["KE ", physics.kineticEnergy.toFixed(2)]
										})
									] })
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: "Dye/KE mapped to a thermal analogue. Trusted T-14 does not move."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-3 w-full",
							onClick: () => {
								const evt = commitDigiSimRun();
								setNote(evt.rejected ? evt.rejectedReason ?? "Rejected." : `Run ${evt.eventId} on the bus as SIMULATE. Twin unchanged.`);
							},
							children: "Commit run to bus"
						}),
						note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs",
							children: note
						}) : null
					]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			children: [
				MODELS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: physics.turbulence === m ? "default" : "outline",
					onClick: () => setTurbulence(m),
					children: m
				}, m)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 hidden h-9 w-px bg-border sm:block" }),
				FIELDS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: field === f.id ? "default" : "outline",
					onClick: () => setPhysicsField(f.id),
					children: f.label
				}, f.id)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 hidden h-9 w-px bg-border sm:block" }),
				FAULTS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: fault === f.id ? "default" : "outline",
					onClick: () => setPhysicsFault(f.id),
					children: f.label
				}, f.id))
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Max divergence",
					value: physics.maxDivergence.toFixed(4),
					hint: "PHYS_MASS"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "CFL",
					value: physics.cfl.toFixed(3),
					hint: "PHYS_CFL"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Kinetic energy",
					value: physics.kineticEnergy.toFixed(4)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Re*",
					value: Math.round(physics.reStar).toLocaleString(),
					hint: "grid Reynolds"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Regime",
					value: physics.regime
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Integrity",
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "grid gap-2 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						ok: !physics.nonFinite,
						label: "Finite fields"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						ok: physics.inBounds,
						label: "Velocity bounds"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						ok: physics.cfl < 1,
						label: "CFL < 1"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						ok: physics.failures.length === 0,
						label: "No physics failures"
					})
				]
			}), broken ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-xs text-danger",
				children: physics.failures.join(" · ")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "Integrity pass is not certification. Physics DigiSim remains untrusted until independently validated."
			})]
		})
	] });
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-[10px] uppercase tracking-wider text-muted-foreground",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: v })] });
}
function Check({ ok, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: cn("rounded-md px-3 py-2 text-sm", ok ? "bg-ok/10 text-ok" : "bg-danger/10 text-danger"),
		children: [
			ok ? "PASS" : "FAIL",
			" — ",
			label
		]
	});
}
function num(v) {
	return typeof v === "number" ? v : null;
}
function fmt(v) {
	return v == null ? "—" : v.toFixed(1);
}
//#endregion
export { PhysicsPage as component };
