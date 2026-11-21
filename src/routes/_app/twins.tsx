import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/omega/panel";
import { StateBadge } from "@/components/omega/badges";
import { Button } from "@/components/ui/button";
import { useOmegaStore } from "@/lib/omega/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/twins")({ component: TwinsPage });

const RECON_STEPS = [
  "Observe",
  "Authenticate",
  "Quality",
  "Align",
  "Fuse",
  "Gap ID",
  "Geometry",
  "Materials",
  "Boundaries",
  "Initial state",
  "Parameters",
  "Ensemble",
  "Compile",
  "Physics",
  "Compare",
  "Residual",
  "Uncertainty",
  "Validate",
  "Untrusted reconstruction",
];

function TwinsPage() {
  const twins = useOmegaStore((s) => s.twins);
  const selected = useOmegaStore((s) => s.selectedTwinId);
  const selectTwin = useOmegaStore((s) => s.selectTwin);
  const reconstructTwin = useOmegaStore((s) => s.reconstructTwin);
  const twin = twins.find((t) => t.id === selected) ?? twins[0];

  return (
    <div>
      <PageHeader
        kicker="Digital twin v5.4"
        title="Universal twin fabric"
        description="Hierarchy from component to planetary system. Local authority stays local. Twin ≠ reality. Reconstruction never silently becomes trusted state."
      />

      <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Panel title="Tree">
          <ul className="space-y-1">
            {twins.map((t) => {
              const depth = depthOf(t.id, twins);
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => selectTwin(t.id)}
                    className={cn(
                      "flex h-11 w-full items-center rounded-md px-2 text-left text-sm",
                      t.id === selected ? "bg-accent" : "hover:bg-accent/60",
                    )}
                    style={{ paddingLeft: 8 + depth * 12 }}
                  >
                    <span className="truncate">{t.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        {twin ? (
          <div className="space-y-4">
            <Panel
              title={twin.name}
              meta={<StateBadge cls={twin.stateClass} />}
              action={
                <Button size="sm" variant="outline" onClick={() => reconstructTwin(twin.id)}>
                  Reconstruct
                </Button>
              }
            >
              <p className="font-mono text-xs text-muted-foreground">
                {twin.level} · {twin.domain} · authority {twin.localAuthority}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Metric label="Uncertainty" value={twin.uncertainty.toFixed(2)} />
                <Metric label="Quality" value={twin.quality.toFixed(2)} />
                <Metric label="Risk" value={twin.risk.toFixed(2)} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Observed</h3>
                  <KV data={twin.observed} />
                </div>
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Estimated</h3>
                  <KV data={twin.estimated} />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Trusted: {twin.trusted ? "yes, after validation" : "no"}. Observed ≠ reconstructed ≠ inferred.
              </p>
            </Panel>

            <Panel title="World reconstruction v5.5">
              <div className="flex flex-wrap gap-1">
                {RECON_STEPS.map((s, i) => (
                  <span key={s} className="rounded-sm bg-secondary px-2 py-1 text-[11px] text-muted-foreground">
                    {i + 1}. {s}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Missing data is not absence. Unknown is not zero. Geometry is not complete state.
              </p>
            </Panel>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function depthOf(id: string, twins: { id: string; parentId: string | null }[]) {
  let d = 0;
  let cur = twins.find((t) => t.id === id);
  while (cur?.parentId) {
    d += 1;
    cur = twins.find((t) => t.id === cur?.parentId);
    if (d > 12) break;
  }
  return d;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary p-3">
      <div className="font-mono text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="font-mono text-lg tabular-nums">{value}</div>
    </div>
  );
}

function KV({ data }: { data: Record<string, number | string> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return <p className="mt-2 text-sm text-muted-foreground">None recorded.</p>;
  return (
    <ul className="mt-2 space-y-1">
      {entries.map(([k, v]) => (
        <li key={k} className="flex justify-between gap-2 font-mono text-sm">
          <span className="text-muted-foreground">{k}</span>
          <span className="tabular-nums">{typeof v === "number" ? v.toPrecision(4) : v}</span>
        </li>
      ))}
    </ul>
  );
}
