import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FluidCanvas } from "@/components/physics/fluid-canvas";
import { PageHeader, Panel, Stat } from "@/components/omega/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DIGISIM_NAME, DIGISIM_VERSION } from "@/lib/omega/constants";
import { useOmegaStore } from "@/lib/omega/store";
import type { DigiSimFault, DigiSimField, TurbulenceModel } from "@/lib/omega/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/physics")({ component: PhysicsPage });

const MODELS: TurbulenceModel[] = ["DNS", "LES", "RANS"];
const FIELDS: { id: DigiSimField; label: string }[] = [
  { id: "DYE", label: "Dye" },
  { id: "SPEED", label: "Speed" },
  { id: "DIV", label: "Divergence" },
];
const FAULTS: { id: DigiSimFault; label: string }[] = [
  { id: "NOMINAL", label: "Nominal" },
  { id: "FAN_STALL", label: "Fan stall" },
  { id: "BLOCKAGE", label: "Blockage" },
];

function PhysicsPage() {
  const physics = useOmegaStore((s) => s.physics);
  const running = useOmegaStore((s) => s.physicsRunning);
  const field = useOmegaStore((s) => s.physicsField);
  const fault = useOmegaStore((s) => s.physicsFault);
  const probe = useOmegaStore((s) => s.physicsProbe);
  const twins = useOmegaStore((s) => s.twins);
  const setRunning = useOmegaStore((s) => s.setPhysicsRunning);
  const setTurbulence = useOmegaStore((s) => s.setTurbulence);
  const setPhysicsField = useOmegaStore((s) => s.setPhysicsField);
  const setPhysicsFault = useOmegaStore((s) => s.setPhysicsFault);
  const resetDigiSim = useOmegaStore((s) => s.resetDigiSim);
  const commitDigiSimRun = useOmegaStore((s) => s.commitDigiSimRun);
  const [note, setNote] = useState<string | null>(null);

  const t14 = twins.find((t) => t.id === "t14");
  const loop = twins.find((t) => t.id === "cool-loop");
  const oil = num(t14?.observed.oilTempC);
  const hot = num(t14?.observed.windingHotSpot);
  const dT = num(loop?.observed.deltaT);
  const flow = num(loop?.observed.flowLpm);
  const broken = physics.failures.length > 0;

  return (
    <div>
      <PageHeader
        kicker={`${DIGISIM_NAME} v${DIGISIM_VERSION}`}
        title={DIGISIM_NAME}
        description="Navier–Stokes analogue of the T-14 cooling loop. Drag to stir. Tap to probe. Faults and scenario branches drive the field. They do not overwrite the transformer."
        actions={
          <>
            <Button variant={running ? "outline" : "default"} onClick={() => setRunning(!running)}>
              {running ? "Pause DigiSim" : "Resume DigiSim"}
            </Button>
            <Button variant="outline" onClick={() => resetDigiSim()}>
              Reset field
            </Button>
          </>
        }
      />

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_18.5rem]">
        <Panel title="T-14 cooling-loop analogue" meta={<Badge tone={fault === "NOMINAL" ? "default" : "warn"}>{fault}</Badge>}>
          <div className="relative">
            <FluidCanvas />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-background/40 px-3 py-2">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground">
                  {DIGISIM_NAME}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  96×54 · {field} · {fault}
                </p>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-foreground">
                {physics.turbulence} · {running ? "live" : "paused"}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            ∂u/∂t + (u·∇)u = −∇p/ρ + ν∇²u + f, ∇·u = 0. Boussinesq dye lift is an analogue, not oil.
          </p>
        </Panel>

        <div className="space-y-4">
          <Panel title="Probe" meta={probe ? <Badge tone="info">cell</Badge> : <Badge>tap field</Badge>}>
            {probe ? (
              <dl className="grid grid-cols-2 gap-2 font-mono text-xs">
                <Row k="x,y" v={`${probe.nx.toFixed(2)}, ${probe.ny.toFixed(2)}`} />
                <Row k="u" v={probe.u.toFixed(3)} />
                <Row k="v" v={probe.v.toFixed(3)} />
                <Row k="|u|" v={probe.speed.toFixed(3)} />
                <Row k="dye" v={probe.dye.toFixed(3)} />
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Tap the field without dragging. Drag still injects momentum.</p>
            )}
          </Panel>

          <Panel
            title="Sim vs observed"
            meta={<Badge tone={broken ? "danger" : "warn"}>SIMULATED</Badge>}
            action={
              <Link className="text-xs text-muted-foreground hover:text-foreground" to="/twins">
                Open twin
              </Link>
            }
          >
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-1 font-medium">Qty</th>
                  <th className="py-1 font-medium">Observed</th>
                  <th className="py-1 font-medium">DigiSim</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr>
                  <td className="py-1">Oil °C</td>
                  <td>{fmt(oil)}</td>
                  <td className="text-muted-foreground">not oil</td>
                </tr>
                <tr>
                  <td className="py-1">Hotspot °C</td>
                  <td>{fmt(hot)}</td>
                  <td className={broken ? "text-danger" : ""}>{broken ? "invalid" : physics.simHotspotC.toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="py-1">Loop ΔT</td>
                  <td>{fmt(dT)}</td>
                  <td className={broken ? "text-danger" : ""}>{broken ? "invalid" : physics.simDeltaT.toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="py-1">Flow L/min</td>
                  <td>{fmt(flow)}</td>
                  <td className="text-muted-foreground">KE {physics.kineticEnergy.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted-foreground">
              Dye/KE mapped to a thermal analogue. Trusted T-14 does not move.
            </p>
            <Button
              className="mt-3 w-full"
              onClick={() => {
                const evt = commitDigiSimRun();
                setNote(
                  evt.rejected
                    ? evt.rejectedReason ?? "Rejected."
                    : `Run ${evt.eventId} on the bus as SIMULATE. Twin unchanged.`,
                );
              }}
            >
              Commit run to bus
            </Button>
            {note ? <p className="mt-2 text-xs">{note}</p> : null}
          </Panel>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {MODELS.map((m) => (
          <Button
            key={m}
            size="sm"
            variant={physics.turbulence === m ? "default" : "outline"}
            onClick={() => setTurbulence(m)}
          >
            {m}
          </Button>
        ))}
        <span className="mx-1 hidden h-9 w-px bg-border sm:block" />
        {FIELDS.map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={field === f.id ? "default" : "outline"}
            onClick={() => setPhysicsField(f.id)}
          >
            {f.label}
          </Button>
        ))}
        <span className="mx-1 hidden h-9 w-px bg-border sm:block" />
        {FAULTS.map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={fault === f.id ? "default" : "outline"}
            onClick={() => setPhysicsFault(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Max divergence" value={physics.maxDivergence.toFixed(4)} hint="PHYS_MASS" />
        <Stat label="CFL" value={physics.cfl.toFixed(3)} hint="PHYS_CFL" />
        <Stat label="Kinetic energy" value={physics.kineticEnergy.toFixed(4)} />
        <Stat label="Re*" value={Math.round(physics.reStar).toLocaleString()} hint="grid Reynolds" />
        <Stat label="Regime" value={physics.regime} />
      </div>

      <Panel title="Integrity" className="mt-4">
        <ul className="grid gap-2 sm:grid-cols-2">
          <Check ok={!physics.nonFinite} label="Finite fields" />
          <Check ok={physics.inBounds} label="Velocity bounds" />
          <Check ok={physics.cfl < 1} label="CFL < 1" />
          <Check ok={physics.failures.length === 0} label="No physics failures" />
        </ul>
        {broken ? (
          <p className="mt-3 font-mono text-xs text-danger">{physics.failures.join(" · ")}</p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            Integrity pass is not certification. Physics DigiSim remains untrusted until independently validated.
          </p>
        )}
      </Panel>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={cn("rounded-md px-3 py-2 text-sm", ok ? "bg-ok/10 text-ok" : "bg-danger/10 text-danger")}>
      {ok ? "PASS" : "FAIL"} — {label}
    </li>
  );
}

function num(v: unknown) {
  return typeof v === "number" ? v : null;
}

function fmt(v: number | null) {
  return v == null ? "—" : v.toFixed(1);
}
