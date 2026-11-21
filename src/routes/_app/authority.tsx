import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/omega/panel";
import { AuthorityBadge } from "@/components/omega/badges";
import { Button } from "@/components/ui/button";
import {
  AUTHORITY_LABEL,
  AXIOMS,
  LINEAGE,
  PRIMARY_BOUNDARY,
  TRUST_ROOTS,
} from "@/lib/omega/constants";
import { useOmegaStore } from "@/lib/omega/store";
import type { AuthorityLevel } from "@/lib/omega/types";

export const Route = createFileRoute("/_app/authority")({ component: AuthorityPage });

const LEVELS: AuthorityLevel[] = ["A0", "A1", "A2", "A3", "A4", "A5"];

function AuthorityPage() {
  const authority = useOmegaStore((s) => s.authority);
  const setAuthority = useOmegaStore((s) => s.setAuthority);
  const trySelfAuthorize = useOmegaStore((s) => s.trySelfAuthorize);
  const last = useOmegaStore((s) =>
    s.events.find((e) => e.type === "AUTHORIZE_SELF" || e.rejected),
  );

  return (
    <div>
      <PageHeader
        kicker="Governance"
        title="Authority is external"
        description={PRIMARY_BOUNDARY}
      />

      <Panel title="Session authority" meta={<AuthorityBadge level={authority} />}>
        <p className="text-sm text-muted-foreground">
          Default high-consequence range is A0–A3. A4 and A5 cannot be claimed from inside the fabric.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <Button
              key={l}
              size="sm"
              variant={
                authority === l ? "default" : l === "A4" || l === "A5" ? "destructive" : "outline"
              }
              onClick={() => setAuthority(l)}
            >
              {l} {AUTHORITY_LABEL[l]}
            </Button>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="destructive" onClick={() => trySelfAuthorize()}>
            Agent requests A5
          </Button>
        </div>
        {last?.rejectedReason ? (
          <p className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{last.rejectedReason}</p>
        ) : null}
      </Panel>

      <Panel title="Immutable trust roots" className="mt-4">
        <ul className="grid gap-2 sm:grid-cols-2">
          {TRUST_ROOTS.map((r) => (
            <li key={r} className="rounded-md bg-secondary px-3 py-2 font-mono text-xs">
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Agents, models, plugins, and generated code cannot rewrite these roots.
        </p>
      </Panel>

      <Panel title="Axioms" className="mt-4">
        <ul className="columns-1 gap-3 sm:columns-2">
          {AXIOMS.map((a) => (
            <li key={a} className="mb-2 break-inside-avoid font-mono text-xs text-muted-foreground">
              {a}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Single fabric, not version islands" className="mt-4">
        <ol className="space-y-2">
          {LINEAGE.map((v) => (
            <li key={v.version} className="flex gap-3 rounded-md bg-secondary px-3 py-2">
              <span className="w-12 shrink-0 font-mono text-xs">v{v.version}</span>
              <span className="text-sm">
                <span className="font-medium">{v.title}</span>
                <span className="text-muted-foreground"> — {v.note}</span>
              </span>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
