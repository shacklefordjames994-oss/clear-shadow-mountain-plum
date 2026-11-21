import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/omega/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOmegaStore } from "@/lib/omega/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/scenarios")({ component: ScenariosPage });

function ScenariosPage() {
  const scenarios = useOmegaStore((s) => s.scenarios);
  const selected = useOmegaStore((s) => s.selectedScenarioId);
  const selectScenario = useOmegaStore((s) => s.selectScenario);
  const runScenario = useOmegaStore((s) => s.runScenario);
  const forkScenario = useOmegaStore((s) => s.forkScenario);
  const current = scenarios.find((s) => s.id === selected) ?? scenarios[0];

  return (
    <div>
      <PageHeader
        kicker="Scenario engine v5.6"
        title="Isolated futures"
        description="Branches cannot overwrite trusted state. A scenario is not reality. A counterfactual is not an observation."
      />

      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Panel title="Branches">
          <ul className="space-y-1">
            {scenarios.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => selectScenario(s.id)}
                  className={cn(
                    "flex h-auto min-h-11 w-full flex-col items-start rounded-md px-3 py-2 text-left",
                    s.id === selected ? "bg-accent" : "hover:bg-accent/60",
                  )}
                >
                  <span className="text-sm">{s.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {s.kind}
                    {s.parentId ? ` · from ${s.parentId}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        {current ? (
          <Panel
            title={current.name}
            meta={<Badge tone="info">{current.kind}</Badge>}
            action={
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => runScenario(current.id)}>
                  Run branch
                </Button>
                <Button size="sm" variant="outline" onClick={() => forkScenario(current.id, "COUNTERFACTUAL")}>
                  Fork counterfactual
                </Button>
                <Button size="sm" variant="outline" onClick={() => forkScenario(current.id, "STRESS_TEST")}>
                  Fork stress
                </Button>
              </div>
            }
          >
            <dl className="grid grid-cols-3 gap-3">
              <div>
                <dt className="font-mono text-[10px] uppercase text-muted-foreground">P</dt>
                <dd className="font-mono tabular-nums">{current.probability.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase text-muted-foreground">Uncertainty</dt>
                <dd className="font-mono tabular-nums">{current.uncertainty.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase text-muted-foreground">Risk</dt>
                <dd className="font-mono tabular-nums">{current.risk.toFixed(2)}</dd>
              </div>
            </dl>
            <h3 className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Assumptions</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {current.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <div className="mt-4 rounded-md bg-secondary p-3">
              <div className="font-mono text-[10px] uppercase text-muted-foreground">
                {current.ran ? "Outcome (simulated)" : "Not run"}
              </div>
              <p className="mt-1 text-sm">{current.outcome}</p>
            </div>
            <p className="mt-3 font-mono text-[10px] text-muted-foreground">{current.hash}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Run applies a Physics DigiSim fault (stall / blockage / nominal). Trusted T-14 does not move.
            </p>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
