import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/omega/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOmegaStore } from "@/lib/omega/store";
import type { MemoryType } from "@/lib/omega/types";

export const Route = createFileRoute("/_app/memory")({ component: MemoryPage });

const TYPES: MemoryType[] = [
  "WORKING",
  "EPISODIC",
  "SEMANTIC",
  "OBSERVATIONAL",
  "DECISION",
  "MISSION",
  "THEORY",
  "FAILURE",
  "AUDIT",
  "RESEARCH",
];

function MemoryPage() {
  const memories = useOmegaStore((s) => s.memories);
  const addMemory = useOmegaStore((s) => s.addMemory);
  const [q, setQ] = useState("");
  const [type, setType] = useState<MemoryType>("WORKING");
  const [content, setContent] = useState("");
  const filtered = memories.filter(
    (m) =>
      !q ||
      m.content.toLowerCase().includes(q.toLowerCase()) ||
      m.type.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        kicker="Memory + context v5.9"
        title="Remembered is not real"
        description="Memory is not reality and not evidence. Context packages assemble relevant state, models, policies, failures, and open questions — they do not mint truth."
      />

      <Panel title="Write working memory">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (content.trim().length < 4) return;
            addMemory(content.trim(), type);
            setContent("");
          }}
        >
          <label className="text-xs text-muted-foreground">
            Type
            <select
              className="mt-1 flex h-11 rounded-sm border border-input bg-secondary px-3 text-sm text-foreground"
              value={type}
              onChange={(e) => setType(e.target.value as MemoryType)}
            >
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block min-w-0 flex-1 text-xs text-muted-foreground">
            Content
            <Input className="mt-1" value={content} onChange={(e) => setContent(e.target.value)} />
          </label>
          <Button type="submit">Store</Button>
        </form>
      </Panel>

      <Panel title="Context package" className="mt-4">
        <Input
          placeholder="Filter memory"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Filter memory"
        />
        <ul className="mt-3 space-y-2">
          {filtered.map((m) => (
            <li key={m.id} className="rounded-md bg-secondary px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <Badge>{m.type}</Badge>
                <span className="font-mono text-[10px] text-muted-foreground">
                  c {m.confidence.toFixed(2)}
                </span>
              </div>
              <p className="mt-1 text-sm">{m.content}</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                {m.source} · {new Date(m.createdAt).toISOString()}
              </p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
