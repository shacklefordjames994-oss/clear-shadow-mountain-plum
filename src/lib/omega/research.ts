import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  prompt: z.string().min(8).max(1600),
  domain: z.string().min(3).max(80),
});

export const synthesizeTheory = createServerFn({ method: "POST" })
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "SCI-NET synthesis is unavailable in this environment." };
    }

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 900,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `You are the OMEGA Theory Agent inside a governed intelligence fabric.
Rules: AI_OUTPUT != EVIDENCE. MODEL != REALITY. Never claim certification.
Return ONLY JSON with keys:
title (string), equations (string, compact), assumptions (string[]),
regime (VALIDATED|INTERPOLATION|NEAR_BOUNDARY|EXTRAPOLATION|OUT_OF_DOMAIN|UNRESOLVED),
failures (string[]), note (string, 1-2 sentences).
Prefer known physics. Mark anything speculative as UNRESOLVED or EXTRAPOLATION.
Do not invent conservation-violating equations.`,
          },
          {
            role: "user",
            content: `Domain: ${data.domain}\nQuestion: ${data.prompt}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: `SCI-NET upstream error ${res.status}` };
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content ?? "";
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart < 0 || jsonEnd < jsonStart) {
      return { ok: false as const, error: "Theory agent returned unstructured output." };
    }
    try {
      const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as {
        title?: string;
        equations?: string;
        assumptions?: string[];
        regime?: string;
        failures?: string[];
        note?: string;
      };
      return {
        ok: true as const,
        theory: {
          title: String(parsed.title ?? "Untitled hypothesis"),
          equations: String(parsed.equations ?? ""),
          assumptions: Array.isArray(parsed.assumptions)
            ? parsed.assumptions.map(String).slice(0, 6)
            : [],
          regime: String(parsed.regime ?? "UNRESOLVED"),
          failures: Array.isArray(parsed.failures) ? parsed.failures.map(String).slice(0, 6) : [],
          note: String(parsed.note ?? ""),
        },
      };
    } catch {
      return { ok: false as const, error: "Theory agent JSON failed validation." };
    }
  });
