import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/omega/panel";
import { VoiceConsole } from "@/components/omega/voice-console";
import { AuthorityBadge } from "@/components/omega/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TEAM_PATTERNS } from "@/lib/omega/constants";
import { useOmegaStore } from "@/lib/omega/store";
import type { TeamPattern } from "@/lib/omega/types";

export const Route = createFileRoute("/_app/agents")({ component: AgentsPage });

const OBJECTIVES: Record<TeamPattern, string> = {
  ENGINEERING: "Hold Transformer T-14 inside the safe operating envelope through peak load.",
  SCIENCE: "Test whether cooling-oil viscosity model is dimensionally and conservationally consistent.",
  SECURITY: "Correlate unsigned AI-tool probes and recommend containment without touching trust roots.",
  MISSION: "Produce an A2 recommendation for metro energy–water coupling under cascade risk.",
};

function AgentsPage() {
  const agents = useOmegaStore((s) => s.agents);
  const mission = useOmegaStore((s) => s.mission);
  const dispatchTeam = useOmegaStore((s) => s.dispatchTeam);
  const selfOrganize = useOmegaStore((s) => s.selfOrganize);
  const trySelfAuthorize = useOmegaStore((s) => s.trySelfAuthorize);
  const lastReject = useOmegaStore((s) => s.events.find((e) => e.type === "AUTHORIZE_SELF"));

  return (
    <div>
      <PageHeader
        kicker="Agent fabric v5.8"
        title="Coordinated, not sovereign"
        description="Agents communicate on the JMS Master Bus. They may self-organize topology. They may not self-authorize. Consensus is not validation."
        actions={
          <>
            <Button variant="outline" onClick={() => selfOrganize()}>
              Self-organize team
            </Button>
            <Button variant="destructive" onClick={() => trySelfAuthorize()}>
              Attempt self-authorize
            </Button>
            <Button variant="outline" asChild>
              <Link to="/voice">Open voice</Link>
            </Button>
          </>
        }
      />

      <Panel title="Team patterns">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TEAM_PATTERNS) as TeamPattern[]).map((p) => (
            <Button key={p} size="sm" variant="outline" onClick={() => dispatchTeam(p, OBJECTIVES[p])}>
              Dispatch {p.toLowerCase()}
            </Button>
          ))}
        </div>
      </Panel>

      {lastReject?.rejectedReason ? (
        <p className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{lastReject.rejectedReason}</p>
      ) : null}

      <div className="mt-4">
        <VoiceConsole compact />
      </div>

      {mission ? (
        <Panel title={`Mission ${mission.id}`} className="mt-4" meta={<Badge>{mission.status}</Badge>}>
          <p className="text-sm">{mission.objective}</p>
          <ol className="mt-3 space-y-2">
            {mission.log.map((l, i) => (
              <li key={i} className="rounded-md bg-secondary px-3 py-2 text-sm">
                <span className="font-mono text-xs text-muted-foreground">{l.stage}</span>
                <div>{l.note}</div>
              </li>
            ))}
          </ol>
          {mission.dissent && mission.dissent.length > 0 ? (
            <div className="mt-3 rounded-md bg-warn/10 p-3">
              <h3 className="text-xs font-medium text-warn">Preserved dissent</h3>
              <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                {mission.dissent.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {mission.recommendation ? <p className="mt-3 text-sm">{mission.recommendation}</p> : null}
        </Panel>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map((a) => (
          <div key={a.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium">{a.name}</h3>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {a.role} · {a.domain}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <AuthorityBadge level={a.authority} />
                <Badge tone={a.status === "dissent" ? "warn" : a.status === "working" ? "info" : "default"}>
                  {a.status}
                </Badge>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{a.lastOutput}</p>
            {a.dissent ? <p className="mt-2 text-xs text-warn">{a.dissent}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
