import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, Stat } from "@/components/omega/panel";
import { AuthorityBadge, SecurityBadge, StateBadge } from "@/components/omega/badges";
import { Button } from "@/components/ui/button";
import { LINEAGE, PIPELINE, CONTACT_NAME, CONTACT_ORG, CONTACT_PHONE, CONTACT_TEL, OMEGA_TITLE } from "@/lib/omega/constants";
import { useOmegaStore, useSelectedTwin } from "@/lib/omega/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/")({ component: CommandCenter });

function CommandCenter() {
  const sequence = useOmegaStore((s) => s.sequence);
  const events = useOmegaStore((s) => s.events);
  const agents = useOmegaStore((s) => s.agents);
  const mission = useOmegaStore((s) => s.mission);
  const pipelineIndex = useOmegaStore((s) => s.pipelineIndex);
  const rejectedCount = useOmegaStore((s) => s.rejectedCount);
  const security = useOmegaStore((s) => s.security);
  const twins = useOmegaStore((s) => s.twins);
  const twin = useSelectedTwin();
  const dispatchTeam = useOmegaStore((s) => s.dispatchTeam);
  const physics = useOmegaStore((s) => s.physics);
  const fault = useOmegaStore((s) => s.physicsFault);
  const scenarios = useOmegaStore((s) => s.scenarios);
  const lastScenarioId = useOmegaStore((s) => s.lastScenarioId);
  const decisions = useOmegaStore((s) => s.decisions);
  const runScenario = useOmegaStore((s) => s.runScenario);
  const recommendOption = useOmegaStore((s) => s.recommendOption);
  const requestExecution = useOmegaStore((s) => s.requestExecution);
  const lastDenial = events.find((e) => e.rejected);
  const t14 = twins.find((t) => t.id === "t14") ?? twin;
  const lastBranch = scenarios.find((s) => s.id === lastScenarioId) ?? scenarios.find((s) => s.ran);
  const rec = decisions[0]?.options.find((o) => o.id === decisions[0]?.recommendationId);
  const working = agents.filter((a) => a.status === "working").length;
  const trusted = twins.filter((t) => t.trusted).length;
  const eventTail = events.slice(0, 6);

  return (
    <div>
      <PageHeader
        kicker="OMEGA v6.0 · unified fabric"
        title="Command center"
        description="One bus, one guard, one authority model. Observe, simulate, and recommend — never silently convert inference into action."
        actions={
          <>
            <Button
              onClick={() =>
                dispatchTeam(
                  "ENGINEERING",
                  "Hold Transformer T-14 inside the safe operating envelope through peak load.",
                )
              }
            >
              Dispatch engineering team
            </Button>
            <Button variant="outline" asChild>
              <Link to="/train">Open academy</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/authority">Open authority</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/package">Open package v13</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/partner">AI Teams</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Bus sequence" value={sequence} hint="JMS Master Bus" />
        <Stat label="Trusted twins" value={`${trusted}/${twins.length}`} hint="Local authority preserved" />
        <Stat label="Agents working" value={working} hint={`${agents.length} rostered`} />
        <Stat label="Rejected writes" value={rejectedCount} hint="Fail closed" />
      </div>

      <Panel
        title="T-14 operator desk"
        className="mt-4"
        meta={<span className="font-mono text-[10px] text-muted-foreground">{fault}</span>}
        action={
          <div className="flex flex-wrap gap-2">
            <Link className="text-xs text-muted-foreground hover:text-foreground" to="/physics">
              DigiSim
            </Link>
            <Link className="text-xs text-muted-foreground hover:text-foreground" to="/scenarios">
              Scenarios
            </Link>
            <Link className="text-xs text-muted-foreground hover:text-foreground" to="/decisions">
              Decisions
            </Link>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Observed oil"
            value={`${typeof t14?.observed.oilTempC === "number" ? t14.observed.oilTempC.toFixed(1) : "—"} °C`}
            hint="class OBSERVED"
          />
          <Stat
            label="DigiSim hotspot"
            value={physics.failures.length ? "invalid" : `${physics.simHotspotC.toFixed(1)} °C`}
            hint={`${fault} · SIMULATED`}
          />
          <Stat
            label="Last branch"
            value={lastBranch?.kind ?? "none"}
            hint={lastBranch?.ran ? lastBranch.name : "No scenario run"}
          />
          <Stat
            label="Recommendation"
            value={rec?.label ?? "—"}
            hint="A2 · not authorized"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => runScenario("sc-adv")}>
            Run adverse
          </Button>
          <Button size="sm" variant="outline" onClick={() => runScenario("sc-rec")}>
            Recover envelope
          </Button>
          <Button size="sm" variant="outline" onClick={() => recommendOption("dec-cool", "opt-shed")}>
            Recommend 4% shed
          </Button>
          <Button size="sm" variant="destructive" onClick={() => requestExecution("dec-cool")}>
            Request A5 execution
          </Button>
        </div>
        {lastDenial?.rejectedReason ? (
          <p className="mt-3 text-sm text-danger">{lastDenial.rejectedReason}</p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            Adverse stalls DigiSim. Recover restores nominal. Shed is a recommendation. A5 is refused.
          </p>
        )}
      </Panel>

      <Panel title="Master pipeline" className="mt-4" meta={<span className="font-mono text-[10px] text-muted-foreground">live</span>}>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {PIPELINE.map((stage, i) => (
            <div
              key={stage.id}
              className={cn(
                "min-w-[4.5rem] rounded-sm px-2 py-2 text-center",
                i === pipelineIndex ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
              )}
            >
              <div className="font-mono text-[9px] uppercase tracking-wider">{String(i + 1).padStart(2, "0")}</div>
              <div className="text-[11px] leading-tight">{stage.label}</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="JMS event tail" action={<Link className="text-xs text-muted-foreground hover:text-foreground" to="/bus">Open bus</Link>}>
          <ul className="space-y-2">
            {eventTail.map((e) => (
              <li key={e.eventId} className="flex items-start justify-between gap-3 rounded-md bg-secondary px-3 py-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{e.type}</span>
                    {e.rejected ? <span className="text-xs text-danger">rejected</span> : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.source} · {e.eventId}
                    {e.rejectedReason ? ` · ${e.rejectedReason}` : ""}
                  </p>
                </div>
                <AuthorityBadge level={e.authority} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Selected twin" action={<Link className="text-xs text-muted-foreground hover:text-foreground" to="/twins">Open twins</Link>}>
          {twin ? (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-medium">{twin.name}</h3>
                <StateBadge cls={twin.stateClass} />
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {twin.level} · {twin.localAuthority} · unc {twin.uncertainty.toFixed(2)}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {Object.entries(twin.observed).slice(0, 4).map(([k, v]) => (
                  <div key={k} className="rounded-md bg-secondary px-3 py-2">
                    <dt className="font-mono text-[10px] uppercase text-muted-foreground">{k}</dt>
                    <dd className="font-mono tabular-nums">{typeof v === "number" ? v.toPrecision(4) : v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">Twin is not reality. No silent overwrite of trusted state.</p>
            </div>
          ) : null}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Active mission" action={<Link className="text-xs text-muted-foreground hover:text-foreground" to="/agents">Agents</Link>}>
          {mission ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{mission.pattern}</span>
                <span className="font-mono text-xs text-muted-foreground">{mission.status}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{mission.objective}</p>
              <ol className="mt-3 space-y-1">
                {mission.log.slice(-5).map((l, i) => (
                  <li key={i} className="text-xs leading-relaxed text-muted-foreground">
                    <span className="font-mono text-foreground">{l.stage}</span> — {l.note}
                  </li>
                ))}
              </ol>
              {mission.recommendation ? (
                <p className="mt-3 rounded-md bg-secondary p-3 text-sm">{mission.recommendation}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No mission running. Dispatch an engineering team to walk the governed pipeline on Transformer T-14.
            </p>
          )}
        </Panel>

        <Panel title="Fabric lineage">
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {LINEAGE.map((v) => (
              <li key={v.version} className="rounded-md bg-secondary p-2">
                <div className="font-mono text-[10px] text-muted-foreground">v{v.version}</div>
                <div className="text-xs font-medium">{v.title}</div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">
            Extended, never duplicated. Current core is v6.0.
          </p>
        </Panel>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SecurityBadge status={security} />
        <span className="text-xs text-muted-foreground">
          Guard is above agent execution. Recommendation is not authorization.
        </span>
      </div>

      <Panel className="mt-4" title="Architect" meta={<span className="font-mono text-[10px]">{CONTACT_ORG}</span>}>
        <p className="text-sm font-medium">{CONTACT_NAME}</p>
        <p className="mt-1 text-xs text-muted-foreground">{OMEGA_TITLE}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <a href={`tel:${CONTACT_TEL}`}>{CONTACT_PHONE}</a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/partner">Collaborate · partner · license</Link>
          </Button>
        </div>
      </Panel>
    </div>
  );
}
