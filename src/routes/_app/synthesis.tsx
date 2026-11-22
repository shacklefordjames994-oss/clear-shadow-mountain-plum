import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Stat } from "@/components/omega/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  compareToObservation,
  configurationPreview,
  parseObservations,
  runCollision,
  runMaterials,
  type CollisionRun,
  type DomainId,
  type MaterialsRun,
  type Observation,
} from "@/lib/omega/synthesis-lab/engine";
import { monteCarloComparison } from "@/lib/omega/synthesis-lab/monte-carlo";
import { runSynthesisProtocol, type ProtocolManifest } from "@/lib/omega/synthesis-lab/protocol";

export const Route = createFileRoute("/_app/synthesis")({ component: SynthesisPage });

const CSV_HEADER = "evidence,domain,quantity,value,uncertainty,units,source,timestamp,provenance";

function SynthesisPage() {
  const [domain, setDomain] = useState<DomainId>("COLLISION");
  const [population, setPopulation] = useState(240);
  const [energy, setEnergy] = useState(10);
  const [seed, setSeed] = useState(7);
  const [temperature, setTemperature] = useState(450);
  const [barrier, setBarrier] = useState(0.35);
  const [minutes, setMinutes] = useState(20);
  const [collision, setCollision] = useState<CollisionRun | null>(null);
  const [materials, setMaterials] = useState<MaterialsRun | null>(null);
  const [selected, setSelected] = useState(0);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [importNote, setImportNote] = useState("No measured file loaded. A template is not an observation.");
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<ProtocolManifest | null>(null);
  const comparison = useMemo(() => monteCarloComparison(seed, 480), [seed]);

  const preview = configurationPreview(domain, population, domain === "COLLISION" ? energy : temperature, seed);
  const executed = domain === "COLLISION" ? collision : materials;

  const comparisons = useMemo(() => {
    if (!executed) return [];
    const sim =
      executed.domain === "COLLISION"
        ? { domain: executed.domain, quantity: "synthesisFraction", units: "1", value: executed.synthesisFraction }
        : { domain: executed.domain, quantity: "meanDiameterNm", units: "nm", value: executed.meanDiameterNm };
    return observations.map((observation) => ({ observation, result: compareToObservation(sim, observation) }));
  }, [executed, observations]);

  function clearRun() {
    setCollision(null);
    setMaterials(null);
    setSelected(0);
  }

  function execute() {
    if (domain === "COLLISION") {
      const run = runCollision({
        seed,
        beamMomentumGeV: energy,
        massAGeV: 0.938,
        massBGeV: 0.938,
        chargeA: 1,
        chargeB: -1,
        thresholdGeV: 0.2,
        bindingGeV: 0.05,
        events: population,
      });
      setCollision(run);
      setMaterials(null);
    } else {
      const run = runMaterials({
        seed,
        temperatureK: temperature,
        precursorMolar: 0.25,
        timeMin: minutes,
        barrierEV: barrier,
        samples: population,
      });
      setMaterials(run);
      setCollision(null);
    }
    setSelected(0);
  }

  async function onFile(file: File) {
    const text = await file.text();
    const parsed = parseObservations(text);
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    setFingerprint(hash);
    setObservations(parsed.rows);
    setImportNote(
      parsed.errors.length
        ? `${parsed.rows.length} observed rows kept. ${parsed.errors[0]}`
        : `${parsed.rows.length} observed rows imported. The file was not rewritten.`,
    );
  }

  const event = collision?.events[selected];
  const bars = histogram(domain === "COLLISION" ? (collision?.events.map((item) => item.pxGeV) ?? []) : (materials?.diametersNm ?? []));

  return (
    <div className="grid gap-4">
      <PageHeader
        kicker="Simulation platform v1"
        title="Particle synthesis"
        description="Two domain engines. Collision kinematics stay in GeV. Materials growth stays in nm, K, and eV. Neither result is a measurement, and neither touches the Gaussian eigenvalue solver."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Status" value={executed ? "SIMULATED" : "NOT EXECUTED"} hint={executed ? "Seeded run in this browser." : "Configuration only."} />
        <Stat label="Domain" value={domain === "COLLISION" ? "Particle physics" : "Materials"} hint="Engines do not share a state." />
        <Stat label="Gaussian solver" value="Untouched" hint="Archived energy is not an input." />
      </div>

      <Panel
        title="Workbench"
        meta={<Badge tone={executed ? "info" : "warn"}>{executed ? "SIMULATED" : preview.status}</Badge>}
        action={
          <Button type="button" onClick={execute}>
            {executed ? "Run again" : "Run domain engine"}
          </Button>
        }
      >
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <Choice active={domain === "COLLISION"} onClick={() => { setDomain("COLLISION"); clearRun(); }}>
              Particle physics
            </Choice>
            <Choice active={domain === "MATERIALS"} onClick={() => { setDomain("MATERIALS"); clearRun(); }}>
              Materials
            </Choice>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Population" value={population} min={1} max={1000} step={1} onChange={(value) => { setPopulation(value); clearRun(); }} />
            <Field label="Seed" value={seed} min={0} max={999999} step={1} onChange={(value) => { setSeed(value); clearRun(); }} />
            {domain === "COLLISION" ? (
              <Field label="Beam momentum GeV" value={energy} min={0} max={50} step={0.1} onChange={(value) => { setEnergy(value); clearRun(); }} />
            ) : (
              <Field label="Temperature K" value={temperature} min={250} max={1200} step={1} onChange={(value) => { setTemperature(value); clearRun(); }} />
            )}
          </div>
          {domain === "MATERIALS" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Barrier eV" value={barrier} min={0.05} max={2} step={0.01} onChange={(value) => { setBarrier(value); clearRun(); }} />
              <Field label="Time min" value={minutes} min={1} max={240} step={1} onChange={(value) => { setMinutes(value); clearRun(); }} />
            </div>
          ) : null}
          {domain === "MATERIALS" ? (
            <p className="text-xs text-muted-foreground">
              Growth is a seeded toy. The mass-balance residual is an accounting identity, not a weighed sample. It is not a calibrated nucleation law.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Fixed toy masses 0.938 GeV, charges +1 and −1, threshold 0.2 GeV. Labels are not identified particles.
            </p>
          )}
          <p className="font-mono text-[11px] text-muted-foreground">
            {preview.schema} · seed {preview.seed} · population {preview.population} · adapters installed {String(preview.adaptersInstalled)}
          </p>
        </div>
      </Panel>

      <Panel title={domain === "COLLISION" ? "Event sample" : "Size sample"} meta={<Badge>{executed ? "SIMULATED" : "EMPTY"}</Badge>}>
        {!executed ? (
          <p className="text-sm text-muted-foreground">No physical simulation has run. Pythia, Geant4, ROOT, and LAMMPS are named candidates. They are not installed here.</p>
        ) : domain === "COLLISION" && collision && event ? (
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Synthesis fraction" value={collision.synthesisFraction.toFixed(3)} hint="dimensionless, simulated" />
              <Stat label="Energy residual" value={collision.meanEnergyResidualGeV.toExponential(2)} hint="internal identity, not a proof" />
              <Stat label="Momentum residual" value={collision.meanMomentumResidualGeV.toExponential(2)} hint="internal identity, not a proof" />
            </div>
            <MomentumPlot events={collision.events} selected={selected} />
            <div className="max-h-52 overflow-auto">
              {collision.events.slice(0, 12).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item.id)}
                  className={item.id === selected ? "flex h-11 w-full items-center justify-between bg-accent px-2 text-left text-xs" : "flex h-11 w-full items-center justify-between px-2 text-left text-xs text-muted-foreground"}
                >
                  <span>#{item.id} {item.channel}</span>
                  <span className="font-mono">p {item.pxGeV.toFixed(3)}, {item.pyGeV.toFixed(3)}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Event {event.id} is {event.evidence}. Channel {event.channel}. Product mass {event.productMassGeV?.toFixed(4) ?? "none"} GeV.
              Residuals are computed, not observed.
            </p>
          </div>
        ) : materials ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Mean diameter" value={materials.meanDiameterNm.toFixed(2)} hint="nm, simulated" />
            <Stat label="Nucleated" value={materials.nucleatedFraction.toFixed(3)} hint="fraction of the sample" />
            <Stat label="Mass balance" value={materials.massBalanceResidual.toFixed(0)} hint="internal identity only" />
          </div>
        ) : null}
        {executed ? <Bars values={bars} /> : null}
      </Panel>

      <Panel title="Measured rows" meta={<Badge tone="ok">OBSERVED only</Badge>}>
        <div className="grid gap-3">
          <label className="block text-xs text-muted-foreground">
            CSV import
            <input
              className="mt-2 block w-full text-sm"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void onFile(file);
              }}
            />
          </label>
          <p className="text-xs text-muted-foreground">{importNote}</p>
          {fingerprint ? <p className="break-all font-mono text-[11px] text-muted-foreground">SHA-256 {fingerprint}</p> : null}
          <p className="text-xs text-muted-foreground">Header: {CSV_HEADER}. HDF5, Parquet, and ROOT are not adapters in this build.</p>
          {comparisons.length ? (
            <ul className="grid gap-2 text-xs">
              {comparisons.map((item, index) => (
                <li key={`${item.observation.quantity}-${index}`} className="text-muted-foreground">
                  {item.observation.domain} {item.observation.quantity}:{" "}
                  {item.result.status === "DERIVED"
                    ? `DERIVED residual ${item.result.residual.toExponential(2)}${item.result.pull === null ? "" : `, pull ${item.result.pull.toFixed(2)}`}`
                    : `NONCOMPARABLE. ${item.result.reason}`}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">Comparison waits for a run and an imported OBSERVED row with the same domain, quantity, and units.</p>
          )}
        </div>
      </Panel>

      <Panel
        title="Validation protocol v1.1"
        meta={<Badge tone="warn">{protocol?.release ?? "NOT_CERTIFIED"}</Badge>}
        action={
          <Button type="button" onClick={() => setProtocol(runSynthesisProtocol())}>
            Run protocol
          </Button>
        }
      >
        {!protocol ? (
          <p className="text-sm text-muted-foreground">
            An internal identity check does not pass numerical validation. Numerical validation does not pass reference agreement. Reference agreement does not pass an experiment. Nothing here certifies a release.
          </p>
        ) : (
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="Internal consistency" value={protocol.gates.internalConsistency ? "PASS" : "FAIL"} hint="does not imply the next gate" />
              <Stat label="Numerical validation" value={protocol.gates.numericalValidation ? "PASS" : "FAIL"} hint="tolerance 1e-9" />
              <Stat label="Reference agreement" value="NOT RUN" hint="no licensed dataset" />
              <Stat label="Experiment" value="NOT RUN" hint="no instrument" />
            </div>
            <p className="text-xs text-muted-foreground">
              Sampling uses {protocol.uncertainty.sampling.count} seeds. Mean {protocol.uncertainty.sampling.mean.toFixed(3)}, standard deviation {protocol.uncertainty.sampling.standardDeviation.toFixed(3)}, quantiles {protocol.uncertainty.sampling.quantile05.toFixed(3)} / {protocol.uncertainty.sampling.quantile50.toFixed(3)} / {protocol.uncertainty.sampling.quantile95.toFixed(3)}. The standard deviation moved from {protocol.uncertainty.sampling.stdAt16.toFixed(3)} at 16 seeds to {protocol.uncertainty.sampling.stdAt32.toFixed(3)} at 32. This is not a confidence interval. Model, parameter, measurement, and experimental uncertainty stay open.
            </p>
            <p className="break-all font-mono text-[11px] text-muted-foreground">
              {protocol.protocol} · seed {protocol.manifest.seed} · dataset {String(protocol.manifest.datasetHash)} · KS bound {protocol.manifest.preregisteredKsDMax} fixed before data · fingerprint {protocol.manifest.sourceFingerprint}
            </p>
            <ul className="grid gap-2">
              {protocol.cases.map((item) => (
                <li key={item.id} className="min-w-0 text-xs text-muted-foreground">
                  <span className="font-mono text-foreground">{item.status}</span> {item.id}
                  {item.highestGate !== "NONE" ? ` · ${item.highestGate}` : ""}
                  <span className="mt-1 block">{item.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      <Panel title="Monte Carlo integration" meta={<Badge>NUMERICAL</Badge>}>
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">
            The integral is a Gaussian bump on [0, 1]. The closed form is {comparison.analytic.toFixed(6)}. These estimates are quadrature, not collider events and not a measurement. VEGAS, VEGAS+, MISER, Sobol, and multi-channel integration are not installed.
          </p>
          <ul className="grid gap-2">
            {comparison.estimates.map((item) => (
              <li key={item.method} className="min-w-0 text-xs text-muted-foreground">
                <span className="font-mono text-foreground">{item.method}</span> {item.estimate.toFixed(5)} · absolute error {item.error.toExponential(2)}
                {item.standardError === null ? " · no 1/sqrt(N) bar" : ` · standard error ${item.standardError.toExponential(2)}`}
                <span className="mt-1 block">{item.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </div>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "h-11 rounded-md bg-primary px-3 text-sm text-primary-foreground" : "h-11 rounded-md bg-secondary px-3 text-sm text-muted-foreground"}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-xs text-muted-foreground">
      <span className="flex justify-between">
        {label}
        <span className="font-mono text-foreground">{Number.isInteger(step) ? value : value.toFixed(2)}</span>
      </span>
      <input className="mt-2 h-11 w-full accent-primary" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function MomentumPlot({ events, selected }: { events: CollisionRun["events"]; selected: number }) {
  const width = 320;
  const height = 180;
  const scale = 28;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full rounded-lg bg-secondary" role="img" aria-label="Simulated transverse momenta">
      <line x1={width / 2} y1={8} x2={width / 2} y2={height - 8} stroke="currentColor" opacity={0.25} />
      <line x1={8} y1={height / 2} x2={width - 8} y2={height / 2} stroke="currentColor" opacity={0.25} />
      {events.slice(0, 180).map((event) => (
        <circle
          key={event.id}
          cx={width / 2 + event.pxGeV * scale}
          cy={height / 2 - event.pyGeV * scale}
          r={event.id === selected ? 4 : 2}
          fill="currentColor"
          opacity={event.channel === "SYNTHESIS" ? 0.95 : 0.45}
        />
      ))}
    </svg>
  );
}

function Bars({ values }: { values: number[] }) {
  const peak = Math.max(1, ...values);
  return (
    <div className="mt-3 flex h-16 items-end gap-1" aria-hidden="true">
      {values.map((value, index) => (
        <span key={index} className="min-w-0 flex-1 rounded-sm bg-primary/70" style={{ height: `${Math.max(4, (value / peak) * 100)}%` }} />
      ))}
    </div>
  );
}

function histogram(values: number[]) {
  if (!values.length) return [];
  const finite = values.filter((value) => Number.isFinite(value));
  if (!finite.length) return [];
  const lo = Math.min(...finite);
  const hi = Math.max(...finite);
  const bins = Array.from({ length: 8 }, () => 0);
  const span = hi - lo || 1;
  for (const value of finite) {
    const index = Math.min(7, Math.floor(((value - lo) / span) * 8));
    bins[index] += 1;
  }
  return bins;
}
