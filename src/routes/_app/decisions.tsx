import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/omega/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOmegaStore } from "@/lib/omega/store";
import type { DecisionOption } from "@/lib/omega/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/decisions")({ component: DecisionsPage });

function DecisionsPage() {
  const decisions = useOmegaStore((s) => s.decisions);
  const physics = useOmegaStore((s) => s.physics);
  const fault = useOmegaStore((s) => s.physicsFault);
  const requestExecution = useOmegaStore((s) => s.requestExecution);
  const recommendOption = useOmegaStore((s) => s.recommendOption);
  const events = useOmegaStore((s) => s.events);
  const execEvents = events.filter((e) => e.type === "EXECUTE_PHYSICAL").slice(0, 3);
  const d = decisions[0];

  if (!d) return null;

  const hot = physics.failures.length ? 999 : physics.simHotspotC;
  const options = d.options.map((o) => liveOption(o, hot, fault));

  return (
    <div>
      <PageHeader
        kicker="Decision + resilience v5.7"
        title="Constrained choice"
        description="Safety is a hard constraint. Optimization is not safety. Lower cost is not lower risk. A recommendation is not authorization."
      />

      <p className="mb-4 font-mono text-xs text-muted-foreground">
        DigiSim hotspot analogue {physics.failures.length ? "invalid" : `${hot.toFixed(1)} °C`} · fault {fault} · bound 105 °C
        {" · "}
        <Link className="text-foreground hover:underline" to="/physics">
          Open DigiSim
        </Link>
      </p>

      <Panel title={d.objective} meta={<Badge>{d.status}</Badge>}>
        <div className="mb-4">
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Hard constraints</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {d.hardConstraints.map((c) => (
              <li key={c} className="rounded-full bg-secondary px-3 py-1 text-xs">
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {options.map((o) => (
            <div
              key={o.id}
              className={cn(
                "rounded-lg bg-secondary p-4",
                d.recommendationId === o.id && o.feasible && "shadow-[var(--shadow-border-hover)]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-medium">{o.label}</h3>
                {d.recommendationId === o.id ? <Badge tone="ok">rec</Badge> : null}
              </div>
              <dl className="mt-3 space-y-1 font-mono text-xs">
                <Row k="Safety" v={o.safety} />
                <Row k="Resilience" v={o.resilience} />
                <Row k="Performance" v={o.performance} />
                <Row k="Cost score" v={o.cost} />
              </dl>
              <p className={cn("mt-3 text-xs", o.feasible ? "text-ok" : "text-danger")}>
                {o.feasible ? "Feasible under hard constraints." : o.constraintNote}
              </p>
              <Button className="mt-3 w-full" size="sm" variant="outline" onClick={() => recommendOption(d.id, o.id)}>
                Recommend
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="destructive" onClick={() => requestExecution(d.id)}>
            Request A5 execution
          </Button>
          <span className="text-xs text-muted-foreground">Will be rejected. External authority is not present.</span>
        </div>
      </Panel>

      {execEvents.length > 0 ? (
        <Panel title="Governance denials" className="mt-4">
          <ul className="space-y-2">
            {execEvents.map((e) => (
              <li key={e.eventId} className="rounded-md bg-secondary px-3 py-2 text-sm text-danger">
                {e.eventId}: {e.rejectedReason}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}

function liveOption(o: DecisionOption, hot: number, fault: string): DecisionOption {
  if (o.id === "opt-boost") {
    return { ...o, feasible: false, constraintNote: "Requires A5 physical actuation — not granted." };
  }
  if (o.id === "opt-none") {
    const ok = hot < 105 && fault === "NOMINAL";
    return {
      ...o,
      feasible: ok,
      constraintNote: ok ? undefined : "Hotspot analogue ≥ 105 °C or cooling fault is on. Watch-only violates bound.",
    };
  }
  return { ...o, feasible: true };
}

function Row({ k, v }: { k: string; v: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="tabular-nums">{v.toFixed(2)}</span>
    </div>
  );
}