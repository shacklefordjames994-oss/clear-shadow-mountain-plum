import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, r as cn, t as Badge } from "./badge-uyEFEQwD.mjs";
import { l as useOmegaStore, o as hashObject } from "./store-lOmq_ntM.mjs";
import { n as Panel, r as Stat, t as PageHeader } from "./panel-GIo8_dlm.mjs";
import { r as SCINET_PIPELINE, t as HYPOTHESES } from "./master-NgVsSD82.mjs";
import { a as SensitivityCanvas, c as TpcCanvas, i as S2S1Canvas, n as ModulationCanvas, r as PosteriorCanvas, s as SpectrumCanvas, t as EvidenceGraphSvg } from "./dark-matter-charts-DV74z4c5.mjs";
import { a as DEFAULT_HALO, c as evaluateDiscoveryGate, i as DEFAULT_DM, n as DEFAULT_CALIBRATION, o as DEFAULT_NUISANCE, r as DEFAULT_DETECTOR, s as composeLabRun, t as DEFAULT_BACKGROUNDS } from "./research-engine-a6Btj1Uj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dark-matter-Dagi_6sX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	["overview", "Overview"],
	["events", "Events"],
	["hypotheses", "Hypotheses"],
	["detector", "Detector"],
	["background", "Background"],
	["likelihood", "Likelihood"],
	["modulation", "Modulation"],
	["replication", "Replication"],
	["evidence", "Evidence"],
	["sensitivity", "Design"],
	["provenance", "Gate"]
];
function DarkMatterLab() {
	const commit = useOmegaStore((s) => s.commitDarkMatterRun);
	const attemptDiscovery = useOmegaStore((s) => s.attemptDiscovery);
	const lastDenial = useOmegaStore((s) => s.events.find((e) => e.type === "DECLARE_DISCOVERY"));
	const [tab, setTab] = (0, import_react.useState)("overview");
	const [seed, setSeed] = (0, import_react.useState)(77123);
	const [massGeV, setMassGeV] = (0, import_react.useState)(DEFAULT_DM.massGeV);
	const [log10Sigma, setLog10Sigma] = (0, import_react.useState)(Math.log10(DEFAULT_DM.crossSectionCm2));
	const [exposureDays, setExposureDays] = (0, import_react.useState)(DEFAULT_DETECTOR.exposureDays);
	const [fiducialMassKg, setFiducialMassKg] = (0, import_react.useState)(DEFAULT_DETECTOR.fiducialMassKg);
	const [calibration, setCalibration] = (0, import_react.useState)(DEFAULT_CALIBRATION);
	const [nuisance, setNuisance] = (0, import_react.useState)(DEFAULT_NUISANCE);
	const [backgrounds, setBackgrounds] = (0, import_react.useState)(DEFAULT_BACKGROUNDS);
	const [replication, setReplication] = (0, import_react.useState)(false);
	const [bgValidated, setBgValidated] = (0, import_react.useState)(false);
	const [sysValidated, setSysValidated] = (0, import_react.useState)(false);
	const [unblinded, setUnblinded] = (0, import_react.useState)(false);
	const [sigmaClaim, setSigmaClaim] = (0, import_react.useState)(0);
	const [note, setNote] = (0, import_react.useState)(null);
	const detector = (0, import_react.useMemo)(() => ({
		...DEFAULT_DETECTOR,
		exposureDays,
		fiducialMassKg
	}), [exposureDays, fiducialMassKg]);
	const dm = (0, import_react.useMemo)(() => ({
		...DEFAULT_DM,
		massGeV,
		crossSectionCm2: 10 ** log10Sigma
	}), [massGeV, log10Sigma]);
	const lab = (0, import_react.useMemo)(() => composeLabRun({
		detector,
		dm,
		halo: DEFAULT_HALO,
		seed,
		calibration,
		backgrounds,
		nuisance
	}), [
		detector,
		dm,
		seed,
		calibration,
		backgrounds,
		nuisance
	]);
	const gate = evaluateDiscoveryGate(sigmaClaim, replication, bgValidated, sysValidated, unblinded, "SIMULATED");
	function onCommit() {
		const evt = commit({
			seed,
			massGeV,
			log10Sigma,
			exposureDays,
			fiducialMassKg,
			summary: {
				total: lab.research.eventSummary.total,
				accepted: lab.research.eventSummary.accepted,
				nrLike: lab.research.eventSummary.nrLike,
				preferred: lab.research.modulation.preferred,
				state: lab.research.epistemic.state,
				blockers: lab.research.epistemic.blockers,
				discoveryGate: lab.research.epistemic.discoveryGate,
				hypothesis: lab.research.sciNet.preferredHypothesis,
				logBayesH1H0: lab.research.sciNet.logBayesH1H0,
				replicationScore: lab.research.sciNet.replication.score,
				runState: lab.research.sciNet.researchRun.state,
				approxZ: lab.research.sciNet.approxZ
			}
		});
		setNote(evt.rejected ? evt.rejectedReason ?? "Run rejected." : "Run hashed onto the bus as SIMULATED. Not evidence.");
	}
	function onDeclare() {
		const evt = attemptDiscovery(lab.research.epistemic.state);
		setNote(evt.rejectedReason ?? "Discovery blocked.");
	}
	const sciTone = lab.research.epistemic.state === "SCI:ANOMALY" ? "warn" : lab.research.epistemic.state === "SCI:BACKGROUND_PREFERRED" ? "info" : "default";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Dark Matter Lab · SCI-NETv2",
			title: "Digital dark-matter detection laboratory",
			description: "Physics folds through detector response, background, joint likelihood, replication, and the evidence graph. The simulator still cannot manufacture evidence.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onCommit,
					children: "Commit run to bus"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "destructive",
					onClick: onDeclare,
					children: "Declare SCI:DISC"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/research",
						children: "SCI-NET"
					})
				})
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Accepted",
					value: lab.research.eventSummary.accepted,
					hint: `${lab.research.eventSummary.total} rendered`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "NR-like",
					value: lab.research.eventSummary.nrLike,
					hint: "classification, not truth"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Expected background",
					value: lab.research.eventSummary.expectedBackground.toFixed(0),
					hint: `${lab.generatedBackground} drawn`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Epistemic state",
					value: lab.research.epistemic.state.replace("SCI:", ""),
					hint: lab.research.epistemic.discoveryGate ? "gate open" : "gate closed"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex gap-1 overflow-x-auto pb-1",
			children: SCINET_PIPELINE.map((stage, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-11 shrink-0 items-center gap-1 rounded-md bg-secondary px-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-foreground",
					children: stage
				}), i < SCINET_PIPELINE.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					children: "→"
				}) : null]
			}, stage))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "Exposure controls",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							label: "WIMP mass",
							value: massGeV,
							min: 1,
							max: 1e3,
							step: 1,
							format: (v) => `${v.toFixed(0)} GeV`,
							onChange: setMassGeV
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							label: "log10 σ",
							value: log10Sigma,
							min: -49,
							max: -39,
							step: .1,
							format: (v) => `${v.toFixed(1)}  (${(10 ** v).toExponential(1)} cm²)`,
							onChange: setLog10Sigma
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							label: "Exposure",
							value: exposureDays,
							min: 30,
							max: 1500,
							step: 5,
							format: (v) => `${v.toFixed(0)} days`,
							onChange: setExposureDays
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							label: "Fiducial mass",
							value: fiducialMassKg,
							min: 100,
							max: 5e3,
							step: 50,
							format: (v) => `${v.toFixed(0)} kg`,
							onChange: setFiducialMassKg
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setSeed((s) => s + 1),
							children: ["Reseed ", seed]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: sciTone,
							children: lab.research.epistemic.state
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "SIMULATION ≠ EVIDENCE" })
					]
				}),
				note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-danger",
					children: note
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex gap-1 overflow-x-auto pb-1",
			children: TABS.map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(id),
				className: cn("h-11 shrink-0 rounded-md px-3 text-sm", tab === id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"),
				children: label
			}, id))
		}),
		tab === "overview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid min-w-0 gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "TPC analogue (XY)",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "info",
					children: "SIMULATED"
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TpcCanvas, {
					events: lab.events,
					radiusM: detector.radiusM,
					heightM: detector.heightM
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: "Green NR-like, blue ER-like, red vetoed. Dashed ring is fiducial. Geometry is a software twin, not a detector."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "S2 / S1 plane",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(S2S1Canvas, { events: lab.events }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: [
						"Expected signal ",
						lab.expectedSignal.toFixed(2),
						" events. Band split is a classifier, not a particle ID."
					]
				})]
			})]
		}) : null,
		tab === "events" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Rendered event ledger",
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-w-0 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[40rem] text-left text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "ID"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Model"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "E keV"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "S1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "S2"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Day"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Class"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: lab.events.slice(0, 40).map((ev) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border font-mono",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5",
								children: ev.truth.id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: ev.truth.model }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: ev.signal.energyKeV.toFixed(2) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: ev.signal.s1PE.toFixed(1) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: ev.signal.s2PE.toFixed(0) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: ev.truth.timeDay.toFixed(1) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: ev.classification })
						]
					}, ev.truth.id)) })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "Truth tags are SCI:SIMULATED. Display is a subsample. Time is a generated day-of-year, not a clock."
			})]
		}) : null,
		tab === "detector" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid min-w-0 gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Geometry",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-2 gap-2 font-mono text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Name",
							v: detector.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Target",
							v: detector.target
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Radius",
							v: `${detector.radiusM} m`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Height",
							v: `${detector.heightM} m`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "S1 thr",
							v: `${detector.s1ThresholdPE} PE`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "S2 thr",
							v: `${detector.s2ThresholdPE} PE`
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Calibration / nuisance",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Energy scale",
						value: calibration.energyScale,
						min: .85,
						max: 1.15,
						step: .005,
						format: (v) => v.toFixed(3),
						onChange: (v) => setCalibration({
							...calibration,
							energyScale: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Photon efficiency",
						value: calibration.photonEfficiencyScale,
						min: .7,
						max: 1.3,
						step: .01,
						format: (v) => v.toFixed(2),
						onChange: (v) => setCalibration({
							...calibration,
							photonEfficiencyScale: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Electron gain",
						value: calibration.electronGainScale,
						min: .7,
						max: 1.3,
						step: .01,
						format: (v) => v.toFixed(2),
						onChange: (v) => setCalibration({
							...calibration,
							electronGainScale: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "NR class bias",
						value: calibration.nrClassificationBias,
						min: -.3,
						max: .3,
						step: .01,
						format: (v) => v.toFixed(2),
						onChange: (v) => setCalibration({
							...calibration,
							nrClassificationBias: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Background norm",
						value: nuisance.backgroundNormalization,
						min: .5,
						max: 1.8,
						step: .02,
						format: (v) => v.toFixed(2),
						onChange: (v) => setNuisance({
							...nuisance,
							backgroundNormalization: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Halo density scale",
						value: nuisance.haloDensityScale,
						min: .5,
						max: 1.5,
						step: .02,
						format: (v) => v.toFixed(2),
						onChange: (v) => setNuisance({
							...nuisance,
							haloDensityScale: v
						})
					})
				]
			})]
		}) : null,
		tab === "background" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Background model (development rates)",
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-sm text-muted-foreground",
				children: "These are software-development components, not a claim about any experiment. Toggle a class off to see the analogue respond."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-w-0 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[36rem] text-left text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Class"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Rate /kg/day"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "NR frac"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Unc"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "On"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: backgrounds.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border font-mono",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2",
								children: b.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: b.ratePerKgDay.toExponential(2) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: b.nrFraction.toFixed(2) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [(b.uncertaintyFraction * 100).toFixed(0), "%"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-11 min-w-11 rounded-md bg-secondary px-3",
								onClick: () => toggleBackground(b.name, backgrounds, setBackgrounds),
								children: b.enabled ? "on" : "off"
							}) })
						]
					}, b.name)) })]
				})
			})]
		}) : null,
		tab === "hypotheses" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Hypothesis registry",
			className: "mt-4",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "priors ≠ truth" }),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-w-0 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[40rem] text-left text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "ID"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Channel"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Prior"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Posterior"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Required tests"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: HYPOTHESES.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border font-mono",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "py-2",
								children: [h.id, lab.research.sciNet.preferredHypothesis === h.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "ml-2",
									tone: "ok",
									children: "preferred"
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: h.channel }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [(lab.research.sciNet.posterior.prior[h.id] * 100).toFixed(1), "%"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [(lab.research.sciNet.posterior.posterior[h.id] * 100).toFixed(1), "%"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "text-muted-foreground",
								children: h.requiredTests.join(", ")
							})
						]
					}, h.id)) })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "Registry is frozen on the research contract. Posterior mass is a sandbox preference, not a discovery."
			})]
		}) : null,
		tab === "likelihood" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid min-w-0 gap-4 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: "Folded spectrum",
					meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "info",
						children: "SIMULATED"
					}),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpectrumCanvas, {
						bins: lab.research.sciNet.run.binsKeV,
						observed: lab.research.sciNet.run.observedByBin,
						background: lab.research.sciNet.run.backgroundByBin,
						signal: lab.research.sciNet.run.foldedSpectrum
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					title: "Posterior",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosteriorCanvas, { posterior: lab.research.sciNet.posterior }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-2 gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "log BF H1/H0",
								value: lab.research.sciNet.logBayesH1H0.toFixed(2),
								hint: "Bayes factor, not causation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "q = 2Δℓ",
								value: lab.research.sciNet.testStatistic.toFixed(2),
								hint: "joint likelihood ratio"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "approx Z",
								value: lab.research.sciNet.approxZ.toFixed(2),
								hint: "diagnostic only"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "run state",
								value: lab.research.sciNet.researchRun.state,
								hint: lab.research.sciNet.researchRun.synthetic ? "synthetic" : "live"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: "Joint likelihood",
					className: "lg:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[36rem] text-left text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 font-medium",
										children: "Hypothesis"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 font-medium",
										children: "ℓ"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 font-medium",
										children: "Nuisance"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 font-medium",
										children: "Bins"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 font-medium",
										children: "Valid"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: lab.research.sciNet.joint.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border font-mono",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5",
										children: row.hypothesisId
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.logLikelihood.toFixed(2) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.nuisancePenalty.toFixed(2) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.totalBins }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.valid ? "yes" : "no" })
								]
							}, row.hypothesisId)) })]
						})
					})
				})
			]
		}) : null,
		tab === "replication" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid min-w-0 gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Cross-target replica",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "warn",
					children: "not independent"
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-2 gap-2 font-mono text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Primary",
							v: lab.research.sciNet.replication.primary
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Replica",
							v: lab.research.sciNet.replication.replica
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Shape distance",
							v: lab.research.sciNet.replication.shapeDistance.toFixed(3)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Rate ratio",
							v: lab.research.sciNet.replication.rateRatio.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Consistent",
							v: lab.research.sciNet.replication.consistent ? "yes" : "no"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Independent",
							v: "no"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: lab.research.sciNet.replication.note
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Leave-one-out robustness",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: lab.research.sciNet.robustness.stable ? "stable" : "fragile" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted-foreground",
					children: lab.research.sciNet.robustness.note
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[28rem] text-left text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 font-medium",
									children: "Dropped"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 font-medium",
									children: "Kind"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 font-medium",
									children: "Δ vs full"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 font-medium",
									children: "Still prefers H1"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: lab.research.sciNet.robustness.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border font-mono",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5",
									children: row.dropped
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.kind }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.deltaVsFull.toFixed(2) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.preferredStill ? "yes" : "no" })
							]
						}, `${row.kind}-${row.dropped}`)) })]
					})
				})]
			})]
		}) : null,
		tab === "evidence" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid min-w-0 gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Evidence graph",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "danger",
					children: "claim rejected"
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceGraphSvg, { graph: lab.research.sciNet.evidence }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: "Claims cannot be supported directly by simulation. SUPPORTED_BY from a SIMULATED node is a validation error."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Evidence ledger",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "append-only" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "max-h-64 space-y-1 overflow-y-auto font-mono text-[11px]",
					children: lab.research.sciNet.ledger.entries.slice(-12).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-2 border-t border-border py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								e.seq,
								" ",
								e.kind,
								" ",
								e.ref
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e.state.replace("SCI:", "") })]
					}, e.seq))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: [
						"Terminal ",
						lab.research.sciNet.ledger.terminal,
						". A hashed simulation is still a simulation."
					]
				})]
			})]
		}) : null,
		tab === "modulation" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Annual modulation laboratory",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModulationCanvas, { bins: lab.research.modulation.bins })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Model comparison",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Amplitude",
						value: `${(lab.research.modulation.amplitudeFraction * 100).toFixed(2)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Phase",
						value: `${lab.research.modulation.phaseDay.toFixed(1)} d`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "χ² constant",
						value: lab.research.modulation.chiSquareConstant.toFixed(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "χ² modulated",
						value: lab.research.modulation.chiSquareModulated.toFixed(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm font-medium",
						children: lab.research.modulation.preferred
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "A lower χ² for the SHM curve is a preference inside this sandbox. It is not an observation of the galactic halo."
					})
				]
			})]
		}) : null,
		tab === "sensitivity" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Asimov sensitivity + experiment design",
			className: "mt-4",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: "warn",
				children: "not a limit"
			}),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SensitivityCanvas, { points: lab.research.sensitivity.points }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 min-w-0 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[32rem] text-left text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 font-medium",
									children: "σ cm²"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 font-medium",
									children: "E[S]"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 font-medium",
									children: "E[B]"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 font-medium",
									children: "Z"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: lab.research.sensitivity.points.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border font-mono",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5",
									children: p.crossSectionCm2.toExponential(0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p.expectedSignal.toFixed(2) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p.expectedBackground.toFixed(1) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p.discoveryMetric.toFixed(2) })
							]
						}, p.crossSectionCm2)) })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: [
						"Mass ",
						lab.research.sensitivity.massGeV,
						" GeV. Z is an Asimov diagnostic. Crossing 5 on this plot still cannot open SCI:DISC."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Fisher Z",
							value: lab.research.sciNet.info.fisherZ.toFixed(2),
							hint: "information, not a claim"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Bits vs H0",
							value: lab.research.sciNet.info.bitsVsH0.toFixed(2),
							hint: "sandbox entropy drop"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Recommend",
							value: lab.research.sciNet.info.recommend,
							hint: "A2 only"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: lab.research.sciNet.info.note
				})
			]
		}) : null,
		tab === "provenance" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid min-w-0 gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Hard discovery gate",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "danger",
					children: "SCI:DISC locked"
				}),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Data state is welded to SIMULATED. You may tick every other box. The gate still fails."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 flex h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: replication,
							onChange: (e) => setReplication(e.target.checked)
						}), "Independent replication"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: bgValidated,
							onChange: (e) => setBgValidated(e.target.checked)
						}), "Background model validated"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: sysValidated,
							onChange: (e) => setSysValidated(e.target.checked)
						}), "Detector systematics validated"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: unblinded,
							onChange: (e) => setUnblinded(e.target.checked)
						}), "Pretend unblinded"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Claimed significance",
						value: sigmaClaim,
						min: 0,
						max: 8,
						step: .1,
						format: (v) => `${v.toFixed(1)} σ`,
						onChange: setSigmaClaim
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-xs text-muted-foreground",
						children: "dataState = SIMULATED (immutable)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-1",
						children: gate.blockers.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "font-mono text-xs text-danger",
							children: b
						}, b))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3",
						variant: "destructive",
						onClick: onDeclare,
						children: "Declare SCI:DISC"
					}),
					lastDenial?.rejectedReason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-danger",
						children: lastDenial.rejectedReason
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Run hash",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "space-y-2 font-mono text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Seed",
							v: String(seed)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Config",
							v: hashObject({
								massGeV,
								log10Sigma,
								exposureDays,
								fiducialMassKg,
								calibration,
								nuisance
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Events",
							v: hashObject(lab.events.map((e) => e.truth.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "State",
							v: lab.research.epistemic.state
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Run",
							v: lab.research.sciNet.researchRun.state
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Blind",
							v: lab.research.sciNet.run.blind.state
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Contract",
							v: lab.research.sciNet.run.contractHash
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Gate",
							v: gate.passed ? "PASS" : "BLOCK"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "Provenance survives transformation. A hashed simulation is still a simulation."
				})]
			})]
		}) : null
	] });
}
function toggleBackground(name, backgrounds, setBackgrounds) {
	setBackgrounds(backgrounds.map((b) => b.name === name ? {
		...b,
		enabled: !b.enabled
	} : b));
}
function Slider({ label, value, min, max, step, format, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex justify-between gap-2",
			children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-foreground",
				children: format(value)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			className: "mt-2 h-11 w-full accent-primary",
			min,
			max,
			step,
			value,
			onChange: (e) => onChange(Number(e.target.value))
		})]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted-foreground",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "truncate text-foreground",
			children: v
		})]
	});
}
//#endregion
export { DarkMatterLab as component };
