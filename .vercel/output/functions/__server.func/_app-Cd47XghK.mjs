import { Wt as require_jsx_runtime, b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as Button, r as cn } from "./_ssr/badge-uyEFEQwD.mjs";
import { i as StateBadge, r as SecurityBadge, t as AuthorityBadge } from "./_ssr/badges-DoNbXchz.mjs";
import { _ as PIPELINE, c as CONTACT_PHONE, g as OMEGA_TITLE, l as CONTACT_TEL, o as CONTACT_NAME, p as LINEAGE, s as CONTACT_ORG } from "./_ssr/constants-DoK96khb.mjs";
import { l as useOmegaStore, u as useSelectedTwin } from "./_ssr/store-lOmq_ntM.mjs";
import { n as Panel, r as Stat, t as PageHeader } from "./_ssr/panel-GIo8_dlm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-Cd47XghK.js
var import_jsx_runtime = require_jsx_runtime();
function CommandCenter() {
	const sequence = useOmegaStore((s) => s.sequence);
	const events = useOmegaStore((s) => s.events);
	const agents = useOmegaStore((s) => s.agents);
	const mission = useOmegaStore((s) => s.mission);
	const pipelineIndex = useOmegaStore((s) => s.pipelineIndex);
	const rejectedCount = useOmegaStore((s) => s.rejectedCount);
	const security = useOmegaStore((s) => s.security);
	const twins = useOmegaStore((s) => s.twins);
	const twin = useSelectedTwin();
	const dispatchTeam = useOmegaStore((s) => s.dispatchTeam);
	const physics = useOmegaStore((s) => s.physics);
	const fault = useOmegaStore((s) => s.physicsFault);
	const scenarios = useOmegaStore((s) => s.scenarios);
	const lastScenarioId = useOmegaStore((s) => s.lastScenarioId);
	const decisions = useOmegaStore((s) => s.decisions);
	const runScenario = useOmegaStore((s) => s.runScenario);
	const recommendOption = useOmegaStore((s) => s.recommendOption);
	const requestExecution = useOmegaStore((s) => s.requestExecution);
	const lastDenial = events.find((e) => e.rejected);
	const t14 = twins.find((t) => t.id === "t14") ?? twin;
	const lastBranch = scenarios.find((s) => s.id === lastScenarioId) ?? scenarios.find((s) => s.ran);
	const rec = decisions[0]?.options.find((o) => o.id === decisions[0]?.recommendationId);
	const working = agents.filter((a) => a.status === "working").length;
	const trusted = twins.filter((t) => t.trusted).length;
	const eventTail = events.slice(0, 6);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "OMEGA v6.0 · unified fabric",
			title: "Command center",
			description: "One bus, one guard, one authority model. Observe, simulate, and recommend — never silently convert inference into action.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => dispatchTeam("ENGINEERING", "Hold Transformer T-14 inside the safe operating envelope through peak load."),
					children: "Dispatch engineering team"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/train",
						children: "Open academy"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/authority",
						children: "Open authority"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/package",
						children: "Open package v13"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/partner",
						children: "AI Teams"
					})
				})
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Bus sequence",
					value: sequence,
					hint: "JMS Master Bus"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Trusted twins",
					value: `${trusted}/${twins.length}`,
					hint: "Local authority preserved"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Agents working",
					value: working,
					hint: `${agents.length} rostered`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Rejected writes",
					value: rejectedCount,
					hint: "Fail closed"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "T-14 operator desk",
			className: "mt-4",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[10px] text-muted-foreground",
				children: fault
			}),
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						className: "text-xs text-muted-foreground hover:text-foreground",
						to: "/physics",
						children: "DigiSim"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						className: "text-xs text-muted-foreground hover:text-foreground",
						to: "/scenarios",
						children: "Scenarios"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						className: "text-xs text-muted-foreground hover:text-foreground",
						to: "/decisions",
						children: "Decisions"
					})
				]
			}),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Observed oil",
							value: `${typeof t14?.observed.oilTempC === "number" ? t14.observed.oilTempC.toFixed(1) : "—"} °C`,
							hint: "class OBSERVED"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "DigiSim hotspot",
							value: physics.failures.length ? "invalid" : `${physics.simHotspotC.toFixed(1)} °C`,
							hint: `${fault} · SIMULATED`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Last branch",
							value: lastBranch?.kind ?? "none",
							hint: lastBranch?.ran ? lastBranch.name : "No scenario run"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Recommendation",
							value: rec?.label ?? "—",
							hint: "A2 · not authorized"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => runScenario("sc-adv"),
							children: "Run adverse"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => runScenario("sc-rec"),
							children: "Recover envelope"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => recommendOption("dec-cool", "opt-shed"),
							children: "Recommend 4% shed"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "destructive",
							onClick: () => requestExecution("dec-cool"),
							children: "Request A5 execution"
						})
					]
				}),
				lastDenial?.rejectedReason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-danger",
					children: lastDenial.rejectedReason
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Adverse stalls DigiSim. Recover restores nominal. Shed is a recommendation. A5 is refused."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Master pipeline",
			className: "mt-4",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[10px] text-muted-foreground",
				children: "live"
			}),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 overflow-x-auto pb-1",
				children: PIPELINE.map((stage, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("min-w-[4.5rem] rounded-sm px-2 py-2 text-center", i === pipelineIndex ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[9px] uppercase tracking-wider",
						children: String(i + 1).padStart(2, "0")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] leading-tight",
						children: stage.label
					})]
				}, stage.id))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "JMS event tail",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					className: "text-xs text-muted-foreground hover:text-foreground",
					to: "/bus",
					children: "Open bus"
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: eventTail.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start justify-between gap-3 rounded-md bg-secondary px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs",
									children: e.type
								}), e.rejected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-danger",
									children: "rejected"
								}) : null]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: [
									e.source,
									" · ",
									e.eventId,
									e.rejectedReason ? ` · ${e.rejectedReason}` : ""
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthorityBadge, { level: e.authority })]
					}, e.eventId))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Selected twin",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					className: "text-xs text-muted-foreground hover:text-foreground",
					to: "/twins",
					children: "Open twins"
				}),
				children: twin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-medium",
							children: twin.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StateBadge, { cls: twin.stateClass })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-mono text-xs text-muted-foreground",
						children: [
							twin.level,
							" · ",
							twin.localAuthority,
							" · unc ",
							twin.uncertainty.toFixed(2)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "mt-3 grid grid-cols-2 gap-2 text-sm",
						children: Object.entries(twin.observed).slice(0, 4).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-secondary px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "font-mono text-[10px] uppercase text-muted-foreground",
								children: k
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-mono tabular-nums",
								children: typeof v === "number" ? v.toPrecision(4) : v
							})]
						}, k))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: "Twin is not reality. No silent overwrite of trusted state."
					})
				] }) : null
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Active mission",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					className: "text-xs text-muted-foreground hover:text-foreground",
					to: "/agents",
					children: "Agents"
				}),
				children: mission ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium",
							children: mission.pattern
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-muted-foreground",
							children: mission.status
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: mission.objective
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-3 space-y-1",
						children: mission.log.slice(-5).map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-xs leading-relaxed text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-foreground",
									children: l.stage
								}),
								" — ",
								l.note
							]
						}, i))
					}),
					mission.recommendation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 rounded-md bg-secondary p-3 text-sm",
						children: mission.recommendation
					}) : null
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No mission running. Dispatch an engineering team to walk the governed pipeline on Transformer T-14."
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Fabric lineage",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
					children: LINEAGE.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-md bg-secondary p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-mono text-[10px] text-muted-foreground",
							children: ["v", v.version]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-medium",
							children: v.title
						})]
					}, v.version))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Extended, never duplicated. Current core is v6.0."
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityBadge, { status: security }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: "Guard is above agent execution. Recommendation is not authorization."
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: "Architect",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[10px]",
				children: CONTACT_ORG
			}),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: CONTACT_NAME
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: OMEGA_TITLE
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `tel:${CONTACT_TEL}`,
							children: CONTACT_PHONE
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/partner",
							children: "Collaborate · partner · license"
						})
					})]
				})
			]
		})
	] });
}
//#endregion
export { CommandCenter as component };
