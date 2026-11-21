import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/omega/panel";
import { SecurityBadge } from "@/components/omega/badges";
import { Button } from "@/components/ui/button";
import { GUARD_LAYERS } from "@/lib/omega/constants";
import { useOmegaStore } from "@/lib/omega/store";

export const Route = createFileRoute("/_app/guard")({ component: GuardPage });

const DOMAINS = ["AI_tools", "API", "OT_SCADA", "models", "agents", "network", "hypervisor"];

function GuardPage() {
  const security = useOmegaStore((s) => s.security);
  const probes = useOmegaStore((s) => s.probes);
  const injectProbe = useOmegaStore((s) => s.injectProbe);

  return (
    <div>
      <PageHeader
        kicker="OMEGA-GUARD"
        title="Defensive digital immune system"
        description="Guard sits above agent execution. Fail closed. Allowlist. Sandbox. Hash audit. Software cannot rewrite the trust roots."
        actions={<SecurityBadge status={security} />}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {GUARD_LAYERS.map((layer, i) => (
          <Panel key={layer.id} title={`${layer.id.split("_")[0]}  ${layer.label}`}>
            <p className="text-sm leading-relaxed text-muted-foreground">{layer.duty}</p>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">priority {i}</p>
          </Panel>
        ))}
      </div>

      <Panel title="Inject unsigned probe" className="mt-4">
        <p className="mb-3 text-sm text-muted-foreground">
          L3 may observe, correlate, explain, simulate, recommend, and record. It may not authorize. Unknown publishers are denied.
        </p>
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map((d) => (
            <Button key={d} variant="outline" size="sm" onClick={() => injectProbe(d)}>
              Probe {d.replaceAll("_", " ")}
            </Button>
          ))}
        </div>
      </Panel>

      <Panel title="Containment log" className="mt-4">
        {probes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No probes this session. Fabric is fail-closed at rest.</p>
        ) : (
          <ul className="space-y-2">
            {probes.map((p) => (
              <li key={p.id} className="rounded-md bg-secondary px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs">{p.domain}</span>
                  <span className="text-xs text-danger">{p.result}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.layer} — {p.note}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
