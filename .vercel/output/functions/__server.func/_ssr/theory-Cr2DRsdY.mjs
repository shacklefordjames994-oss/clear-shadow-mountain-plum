import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, r as cn, t as Badge } from "./badge-uyEFEQwD.mjs";
import { n as GradeBadge } from "./badges-DoNbXchz.mjs";
import { x as THEORY_DOMAINS } from "./constants-DoK96khb.mjs";
import { a as formatDim, i as draftTheory, l as useOmegaStore, n as DIM_EXAMPLES, r as analyzeEquations, s as omegaHash, t as DIM_CATALOG } from "./store-lOmq_ntM.mjs";
import { n as Panel, t as PageHeader } from "./panel-GIo8_dlm.mjs";
import { n as Textarea } from "./input-B20aSgow.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/theory-Cr2DRsdY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TheoryPage() {
	const theories = useOmegaStore((s) => s.theories);
	const selectedId = useOmegaStore((s) => s.selectedTheoryId);
	const selectTheory = useOmegaStore((s) => s.selectTheory);
	const runTheoryValidation = useOmegaStore((s) => s.runTheoryValidation);
	const attemptCertify = useOmegaStore((s) => s.attemptCertify);
	const addTheory = useOmegaStore((s) => s.addTheory);
	const lastCert = useOmegaStore((s) => s.events.find((e) => e.type === "CERTIFY_MODEL"));
	const theory = theories.find((t) => t.id === selectedId) ?? theories[0];
	const [probeEq, setProbeEq] = (0, import_react.useState)(DIM_EXAMPLES[0].eq);
	const [probeDomain, setProbeDomain] = (0, import_react.useState)("fluid_dynamics");
	const live = (0, import_react.useMemo)(() => theory ? analyzeEquations(theory.equations, theory.variables) : null, [theory]);
	const probe = (0, import_react.useMemo)(() => analyzeEquations(probeEq), [probeEq]);
	function admitProbe() {
		const draft = draftTheory({
			id: omegaHash(probeEq + Date.now()),
			title: "Admitted probe",
			domain: probeDomain,
			equations: probeEq,
			note: probe.summary
		});
		addTheory(draft);
	}
	function runSelected() {
		if (!theory) return;
		runTheoryValidation(theory.id);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Theory fabric v5.3",
			title: "Dimensional structure",
			description: "Every additive term must share one SI vector. Operators change exponents: ∂/∂t subtracts T, ∇ subtracts L. Catalog is an assumption, not truth. Match is not certification."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-w-0 gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Contracts",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1",
					children: theories.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => selectTheory(t.id),
						className: cn("flex h-auto min-h-11 w-full flex-col items-start rounded-md px-3 py-2 text-left", t.id === theory?.id ? "bg-accent" : "hover:bg-accent/60"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: t.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-[10px] text-muted-foreground",
							children: [
								t.status,
								" · ",
								t.regime
							]
						})]
					}) }, t.id))
				})
			}), theory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						title: theory.title,
						meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GradeBadge, { grade: theory.evidenceGrade }),
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: runSelected,
								children: "Run validation"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "destructive",
								onClick: () => attemptCertify(theory.id),
								children: "Attempt certify"
							})]
						}),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs text-muted-foreground",
								children: [
									theory.id,
									" · v",
									theory.version,
									" · ",
									theory.domain,
									" · scale ",
									theory.scale
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 font-mono text-sm leading-relaxed break-all",
								children: theory.equations
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-4 grid gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
										k: "Regime",
										v: theory.regime
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
										k: "Status",
										v: theory.status
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
										k: "Certified",
										v: theory.certified ? "yes" : "no"
									})
								]
							}),
							theory.variables.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-4 space-y-1",
								children: theory.variables.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between gap-2 font-mono text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										v.symbol,
										" — ",
										v.meaning
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: v.dimension
									})]
								}, v.symbol))
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted-foreground",
								children: theory.note
							})
						]
					}),
					live ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						title: "Term ledger",
						meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status: live.hardReject ? "FAIL" : live.consistent ? "PASS" : "WARN" }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-sm text-muted-foreground",
							children: live.summary
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DimLedger, { analysis: live })]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Independent checks",
						meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] text-muted-foreground",
							children: theory.lastReport?.hash ?? "not run this session"
						}),
						children: theory.lastReport ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2",
							children: theory.lastReport.checks.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-secondary px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: c.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status: c.status })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: c.detail
								})]
							}, c.id))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm",
							children: theory.lastReport.summary
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Term ledger above is live SI arithmetic. Run validation to bind a hashed report to the twin and physics residuals."
						})
					})
				]
			}) : null]
		}),
		lastCert?.rejectedReason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger",
			children: lastCert.rejectedReason
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Equation probe",
			className: "mt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted-foreground",
					children: "Paste an equation or load a case. Additive terms must share one vector. Zero inherits. Unknown is not a pass."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 flex flex-wrap gap-1",
					children: DIM_EXAMPLES.map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: cn("h-11 rounded-md px-3 font-mono text-xs", probeEq === ex.eq ? "bg-accent text-foreground" : "bg-secondary text-muted-foreground"),
						onClick: () => setProbeEq(ex.eq),
						children: ex.label
					}, ex.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs text-muted-foreground",
					children: ["Domain", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "mt-1 flex h-11 w-full rounded-sm border border-input bg-secondary px-3 text-sm text-foreground",
						value: probeDomain,
						onChange: (e) => setProbeDomain(e.target.value),
						children: THEORY_DOMAINS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: d }, d))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 block text-xs text-muted-foreground",
					children: ["Equation", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						className: "mt-1 font-mono",
						rows: 3,
						value: probeEq,
						onChange: (e) => setProbeEq(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status: probe.hardReject ? "FAIL" : probe.consistent ? "PASS" : "WARN" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted-foreground",
						children: probe.summary
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DimLedger, { analysis: probe })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: admitProbe,
						disabled: probeEq.trim().length < 4,
						children: "Admit as hypothesis"
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Assumed catalog",
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs text-muted-foreground",
				children: "These exponents are declared, not measured. A contract may override them. MODEL != REALITY."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-mono font-medium",
								children: "symbol"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-mono font-medium",
								children: "meaning"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-mono font-medium",
								children: "M"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-mono font-medium",
								children: "L"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-mono font-medium",
								children: "T"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-mono font-medium",
								children: "Θ"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-mono font-medium",
								children: "I"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-mono font-medium",
								children: "SI"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: Object.entries(DIM_CATALOG).map(([sym, meta]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 font-mono",
								children: sym
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 text-muted-foreground",
								children: meta.meaning
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 font-mono",
								children: meta.dim.M
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 font-mono",
								children: meta.dim.L
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 font-mono",
								children: meta.dim.T
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 font-mono",
								children: meta.dim.Theta
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 font-mono",
								children: meta.dim.I
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 font-mono text-muted-foreground",
								children: formatDim(meta.dim)
							})
						]
					}, sym)) })]
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Compatibility matrix",
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs text-muted-foreground",
				children: "Never force incompatible theories into one equation. A cell is a relation, not a fusion."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Matrix, { theories })]
		})
	] });
}
function DimLedger({ analysis }) {
	if (!analysis.equations.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "No A = B structure to score."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-4",
		children: analysis.equations.map((eq) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EquationTable, { eq }, eq.raw))
	});
}
function EquationTable({ eq }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-2 font-mono text-xs text-muted-foreground",
			children: [
				"target ",
				eq.target,
				" · ",
				eq.consistent ? "consistent" : eq.hardReject ? "rejected" : "unresolved"
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-left text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "pb-2 font-mono font-medium",
							children: "side"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "pb-2 font-mono font-medium",
							children: "term"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "pb-2 font-mono font-medium",
							children: "M"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "pb-2 font-mono font-medium",
							children: "L"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "pb-2 font-mono font-medium",
							children: "T"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "pb-2 font-mono font-medium",
							children: "Θ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "pb-2 font-mono font-medium",
							children: "I"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "pb-2 font-mono font-medium",
							children: "SI"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: eq.terms.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1.5 font-mono text-muted-foreground",
							children: t.side
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1.5 font-mono",
							children: t.raw
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1.5 font-mono",
							children: t.dim ? t.dim.M : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1.5 font-mono",
							children: t.dim ? t.dim.L : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1.5 font-mono",
							children: t.dim ? t.dim.T : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1.5 font-mono",
							children: t.dim ? t.dim.Theta : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1.5 font-mono",
							children: t.dim ? t.dim.I : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: cn("py-1.5 font-mono", t.ok ? "text-ok" : "text-danger"),
							children: t.formatted
						})
					]
				}, `${t.side}-${t.raw}-${i}`)) })]
			})
		}),
		eq.terms.some((t) => t.note) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 space-y-1",
			children: eq.terms.filter((t) => t.note).map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: cn("text-xs", t.ok ? "text-muted-foreground" : "text-danger"),
				children: [
					t.raw,
					": ",
					t.note
				]
			}, t.raw + i))
		}) : null
	] });
}
function Meta({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-secondary p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-[10px] uppercase text-muted-foreground",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-sm",
			children: v
		})]
	});
}
function StatusChip({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: status === "PASS" ? "ok" : status === "WARN" ? "warn" : status === "BLOCK" ? "info" : "danger",
		children: status
	});
}
function Matrix({ theories }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-left text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
				className: "pb-2 font-mono font-medium text-muted-foreground",
				children: " "
			}), theories.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
				className: "pb-2 pr-3 font-mono font-medium whitespace-nowrap text-muted-foreground",
				children: t.id
			}, t.id))] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: theories.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "py-2 pr-3 font-mono font-medium whitespace-nowrap",
					children: row.id
				}), theories.map((col) => {
					const self = row.id === col.id;
					const conflict = row.conflictsWith.includes(col.id) || col.conflictsWith.includes(row.id);
					const label = self ? "self" : conflict ? "conflict" : "adjacent";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn(conflict ? "text-warn" : "text-muted-foreground"),
							children: label
						})
					}, col.id);
				})]
			}, row.id)) })]
		})
	});
}
//#endregion
export { TheoryPage as component };
