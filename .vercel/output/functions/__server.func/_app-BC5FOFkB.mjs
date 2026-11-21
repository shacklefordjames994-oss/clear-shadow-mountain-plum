import { i as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime, b as Link, g as Outlet, p as useRouterState } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as Button, r as cn } from "./_ssr/badge-uyEFEQwD.mjs";
import { r as SecurityBadge, t as AuthorityBadge } from "./_ssr/badges-DoNbXchz.mjs";
import { a as CONTACT_HANDLE, o as CONTACT_NAME, s as CONTACT_ORG, y as PRIMARY_BOUNDARY } from "./_ssr/constants-DoK96khb.mjs";
import { l as useOmegaStore } from "./_ssr/store-lOmq_ntM.mjs";
import { i as Menu, n as Volume2, t as X } from "./_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-BC5FOFkB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		to: "/",
		label: "Command",
		group: "Operations"
	},
	{
		to: "/train",
		label: "Academy",
		group: "Operations"
	},
	{
		to: "/bus",
		label: "Master Bus",
		group: "Operations"
	},
	{
		to: "/guard",
		label: "Guard",
		group: "Operations"
	},
	{
		to: "/physics",
		label: "DigiSim",
		group: "Physical"
	},
	{
		to: "/engine05",
		label: "Engine 05",
		group: "Physical"
	},
	{
		to: "/visuals",
		label: "Visuals 2D–4D",
		group: "Physical"
	},
	{
		to: "/dark-matter",
		label: "Dark Matter",
		group: "Physical"
	},
	{
		to: "/collider",
		label: "DHC / Cosmic",
		group: "Physical"
	},
	{
		to: "/qcorr",
		label: "QCORR",
		group: "Physical"
	},
	{
		to: "/kernel",
		label: "CERN kernel",
		group: "Physical"
	},
	{
		to: "/theory",
		label: "Theory",
		group: "Physical"
	},
	{
		to: "/twins",
		label: "Twins",
		group: "Physical"
	},
	{
		to: "/scenarios",
		label: "Scenarios",
		group: "Physical"
	},
	{
		to: "/agents",
		label: "Agents",
		group: "Intelligence"
	},
	{
		to: "/voice",
		label: "Voice",
		group: "Intelligence"
	},
	{
		to: "/decisions",
		label: "Decisions",
		group: "Intelligence"
	},
	{
		to: "/knowledge",
		label: "Knowledge",
		group: "Intelligence"
	},
	{
		to: "/memory",
		label: "Memory",
		group: "Intelligence"
	},
	{
		to: "/research",
		label: "SCI-NET",
		group: "Intelligence"
	},
	{
		to: "/package",
		label: "Package v13",
		group: "Intelligence"
	},
	{
		to: "/authority",
		label: "Authority",
		group: "Governance"
	},
	{
		to: "/partner",
		label: "AI Teams",
		group: "Governance"
	}
];
function AppShell({ children }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [now, setNow] = (0, import_react.useState)(null);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const sequence = useOmegaStore((s) => s.sequence);
	const authority = useOmegaStore((s) => s.authority);
	const security = useOmegaStore((s) => s.security);
	(0, import_react.useEffect)(() => {
		setNow(Date.now());
		const id = window.setInterval(() => {
			useOmegaStore.getState().tick();
			setNow(Date.now());
		}, 1100);
		return () => window.clearInterval(id);
	}, []);
	(0, import_react.useEffect)(() => {
		setOpen(false);
	}, [pathname]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-12 items-center gap-3 px-3 sm:px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "inline-flex size-11 items-center justify-center rounded-sm hover:bg-accent lg:hidden",
							onClick: () => setOpen((v) => !v),
							"aria-label": open ? "Close navigation" : "Open navigation",
							children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex min-w-0 items-baseline gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-base font-medium tracking-tight",
								children: "OMEGA"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden font-mono text-[10px] text-muted-foreground sm:inline",
								children: ["v", "6.0"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-2 overflow-hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/voice",
									className: "inline-flex size-11 items-center justify-center rounded-sm text-foreground hover:bg-accent",
									"aria-label": "Agent voice",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "hidden tabular-nums md:inline",
									children: ["seq ", String(sequence).padStart(6, "0")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthorityBadge, { level: authority }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityBadge, { status: security }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "hidden tabular-nums sm:inline",
									children: [now ? new Date(now).toISOString().slice(11, 19) : "--:--:--", "Z"]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "hidden border-t border-border px-4 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground md:block",
					children: PRIMARY_BOUNDARY
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "hidden w-52 shrink-0 border-r border-border lg:block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavList, { pathname })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8",
					children
				})]
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-50 lg:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "absolute inset-0 bg-background/70",
					"aria-label": "Close menu",
					onClick: () => setOpen(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative h-full w-64 max-w-[85vw] border-r border-border bg-card p-2 shadow-[var(--shadow-border)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavList, { pathname })
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end p-3 lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => useOmegaStore.getState().reset(),
					children: "Reset fabric"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/partner",
						className: "hover:text-foreground",
						children: [
							CONTACT_NAME,
							" · ",
							CONTACT_HANDLE,
							" · ",
							CONTACT_ORG
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-2 hidden sm:inline",
						children: "·"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: "Collaboration, sale, partnering"
					})
				]
			})
		]
	});
}
function NavList({ pathname }) {
	let lastGroup = "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: "flex flex-col gap-1 p-3",
		children: [NAV.map((item) => {
			const showGroup = item.group !== lastGroup;
			lastGroup = item.group;
			const active = item.to === "/" ? pathname === "/" : pathname === item.to;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [showGroup ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-1 mt-3 px-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground first:mt-0",
				children: item.group
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: item.to,
				className: cn("flex h-11 items-center rounded-md px-3 text-sm transition-colors duration-150", active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"),
				children: item.label
			})] }, item.to);
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			className: "mt-4 hidden justify-start lg:inline-flex",
			onClick: () => useOmegaStore.getState().reset(),
			children: "Reset fabric"
		})]
	});
}
function AppLayout() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
//#endregion
export { AppLayout as component };
