import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { i as string, r as object } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/research-DJh6ji2C.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var Input = object({
	prompt: string().min(8).max(1600),
	domain: string().min(3).max(80)
});
var synthesizeTheory_createServerFn_handler = createServerRpc({
	id: "dce70e815fc5f951934d8beaec28f1a66cbf20db1f95803c01f67b6624c45c5c",
	name: "synthesizeTheory",
	filename: "src/lib/omega/research.ts"
}, (opts) => synthesizeTheory.__executeServer(opts));
var synthesizeTheory = createServerFn({ method: "POST" }).validator((d) => Input.parse(d)).handler(synthesizeTheory_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "SCI-NET synthesis is unavailable in this environment."
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 900,
			temperature: .2,
			messages: [{
				role: "system",
				content: `You are the OMEGA Theory Agent inside a governed intelligence fabric.
Rules: AI_OUTPUT != EVIDENCE. MODEL != REALITY. Never claim certification.
Return ONLY JSON with keys:
title (string), equations (string, compact), assumptions (string[]),
regime (VALIDATED|INTERPOLATION|NEAR_BOUNDARY|EXTRAPOLATION|OUT_OF_DOMAIN|UNRESOLVED),
failures (string[]), note (string, 1-2 sentences).
Prefer known physics. Mark anything speculative as UNRESOLVED or EXTRAPOLATION.
Do not invent conservation-violating equations.`
			}, {
				role: "user",
				content: `Domain: ${data.domain}\nQuestion: ${data.prompt}`
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `SCI-NET upstream error ${res.status}`
	};
	const text = (await res.json()).choices?.[0]?.message?.content ?? "";
	const jsonStart = text.indexOf("{");
	const jsonEnd = text.lastIndexOf("}");
	if (jsonStart < 0 || jsonEnd < jsonStart) return {
		ok: false,
		error: "Theory agent returned unstructured output."
	};
	try {
		const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
		return {
			ok: true,
			theory: {
				title: String(parsed.title ?? "Untitled hypothesis"),
				equations: String(parsed.equations ?? ""),
				assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions.map(String).slice(0, 6) : [],
				regime: String(parsed.regime ?? "UNRESOLVED"),
				failures: Array.isArray(parsed.failures) ? parsed.failures.map(String).slice(0, 6) : [],
				note: String(parsed.note ?? "")
			}
		};
	} catch {
		return {
			ok: false,
			error: "Theory agent JSON failed validation."
		};
	}
});
//#endregion
export { synthesizeTheory_createServerFn_handler };
