import { Wt as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-uyEFEQwD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badges-DoNbXchz.js
var import_jsx_runtime = require_jsx_runtime();
function AuthorityBadge({ level }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: level === "A5" || level === "A4" ? "danger" : level === "A0" ? "default" : "info",
		children: level
	});
}
function SecurityBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: status === "CLEAR" ? "ok" : status === "WATCH" ? "warn" : status === "REJECTED" ? "danger" : "warn",
		children: status
	});
}
function StateBadge({ cls }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: cls === "TRUSTED" || cls === "OBSERVED" || cls === "MEASURED" ? "ok" : cls === "QUARANTINED" || cls === "UNKNOWN" ? "danger" : cls === "SIMULATED" || cls === "SCENARIO" || cls === "FORECAST" || cls === "COUNTERFACTUAL" ? "info" : "warn",
		children: cls
	});
}
function GradeBadge({ grade }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: grade === "STRONG" ? "ok" : grade === "REJECTED" || grade === "UNKNOWN" ? "danger" : grade === "HYPOTHESIS" || grade === "PRELIMINARY" ? "info" : "warn",
		children: grade
	});
}
//#endregion
export { StateBadge as i, GradeBadge as n, SecurityBadge as r, AuthorityBadge as t };
