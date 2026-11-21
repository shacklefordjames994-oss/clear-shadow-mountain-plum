import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  EvidenceGraphSvg,
  ModulationCanvas,
  PosteriorCanvas,
  S2S1Canvas,
  SensitivityCanvas,
  SpectrumCanvas,
  TpcCanvas,
} from "@/components/omega/dark-matter-charts";
import { PageHeader, Panel, Stat } from "@/components/omega/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEFAULT_DETECTOR, DEFAULT_DM, DEFAULT_HALO } from "@/lib/omega/dark-matter/engine";
import {
  DEFAULT_BACKGROUNDS,
  DEFAULT_CALIBRATION,
  DEFAULT_NUISANCE,
  composeLabRun,
  evaluateDiscoveryGate,
  type BackgroundClass,
  type BackgroundComponent,
  type CalibrationParameters,
  type NuisanceParameters,
} from "@/lib/omega/dark-matter/research-engine";
import { hashObject } from "@/lib/omega/hash";
import { HYPOTHESES, SCINET_PIPELINE } from "@/lib/omega/scinet/master";
import { useOmegaStore } from "@/lib/omega/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dark-matter")({ component: DarkMatterLab });

const TABS = [
  ["overview", "Overview"],
  ["events", "Events"],
  ["hypotheses", "Hypotheses"],
  ["detector", "Detector"],
  ["background", "Background"],
  ["likelihood", "Likelihood"],
  ["modulation", "Modulation"],
  ["replication", "Replication"],
  ["evidence", "Evidence"],
  ["sensitivity", "Design"],
  ["provenance", "Gate"],
] as const;

type Tab = (typeof TABS)[number][0];

function DarkMatterLab() {
  const commit = useOmegaStore((s) => s.commitDarkMatterRun);
  const attemptDiscovery = useOmegaStore((s) => s.attemptDiscovery);
  const lastDenial = useOmegaStore((s) => s.events.find((e) => e.type === "DECLARE_DISCOVERY"));

  const [tab, setTab] = useState<Tab>("overview");
  const [seed, setSeed] = useState(77123);
  const [massGeV, setMassGeV] = useState(DEFAULT_DM.massGeV);
  const [log10Sigma, setLog10Sigma] = useState(Math.log10(DEFAULT_DM.crossSectionCm2));
  const [exposureDays, setExposureDays] = useState(DEFAULT_DETECTOR.exposureDays);
  const [fiducialMassKg, setFiducialMassKg] = useState(DEFAULT_DETECTOR.fiducialMassKg);
  const [calibration, setCalibration] = useState<CalibrationParameters>(DEFAULT_CALIBRATION);
  const [nuisance, setNuisance] = useState<NuisanceParameters>(DEFAULT_NUISANCE);
  const [backgrounds, setBackgrounds] = useState<BackgroundComponent[]>(DEFAULT_BACKGROUNDS);
  const [replication, setReplication] = useState(false);
  const [bgValidated, setBgValidated] = useState(false);
  const [sysValidated, setSysValidated] = useState(false);
  const [unblinded, setUnblinded] = useState(false);
  const [sigmaClaim, setSigmaClaim] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  const detector = useMemo(
    () => ({ ...DEFAULT_DETECTOR, exposureDays, fiducialMassKg }),
    [exposureDays, fiducialMassKg],
  );
  const dm = useMemo(
    () => ({ ...DEFAULT_DM, massGeV, crossSectionCm2: 10 ** log10Sigma }),
    [massGeV, log10Sigma],
  );

  const lab = useMemo(
    () =>
      composeLabRun({
        detector,
        dm,
        halo: DEFAULT_HALO,
        seed,
        calibration,
        backgrounds,
        nuisance,
      }),
    [detector, dm, seed, calibration, backgrounds, nuisance],
  );

  const gate = evaluateDiscoveryGate(
    sigmaClaim,
    replication,
    bgValidated,
    sysValidated,
    unblinded,
    "SIMULATED",
  );

  function onCommit() {
    const evt = commit({
      seed,
      massGeV,
      log10Sigma,
      exposureDays,
      fiducialMassKg,
      summary: {
        total: lab.research.eventSummary.total,
        accepted: lab.research.eventSummary.accepted,
        nrLike: lab.research.eventSummary.nrLike,
        preferred: lab.research.modulation.preferred,
        state: lab.research.epistemic.state,
        blockers: lab.research.epistemic.blockers,
        discoveryGate: lab.research.epistemic.discoveryGate,
        hypothesis: lab.research.sciNet.preferredHypothesis,
        logBayesH1H0: lab.research.sciNet.logBayesH1H0,
        replicationScore: lab.research.sciNet.replication.score,
        runState: lab.research.sciNet.researchRun.state,
        approxZ: lab.research.sciNet.approxZ,
      },
    });
    setNote(
      evt.rejected
        ? evt.rejectedReason ?? "Run rejected."
        : "Run hashed onto the bus as SIMULATED. Not evidence.",
    );
  }

  function onDeclare() {
    const evt = attemptDiscovery(lab.research.epistemic.state);
    setNote(evt.rejectedReason ?? "Discovery blocked.");
  }

  const sciTone =
    lab.research.epistemic.state === "SCI:ANOMALY"
      ? "warn"
      : lab.research.epistemic.state === "SCI:BACKGROUND_PREFERRED"
        ? "info"
        : "default";

  return (
    <div>
      <PageHeader
        kicker="Dark Matter Lab · SCI-NETv2"
        title="Digital dark-matter detection laboratory"
        description="Physics folds through detector response, background, joint likelihood, replication, and the evidence graph. The simulator still cannot manufacture evidence."
        actions={
          <>
            <Button onClick={onCommit}>Commit run to bus</Button>
            <Button variant="destructive" onClick={onDeclare}>
              Declare SCI:DISC
            </Button>
            <Button variant="outline" asChild>
              <Link to="/research">SCI-NET</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Accepted" value={lab.research.eventSummary.accepted} hint={`${lab.research.eventSummary.total} rendered`} />
        <Stat label="NR-like" value={lab.research.eventSummary.nrLike} hint="classification, not truth" />
        <Stat
          label="Expected background"
          value={lab.research.eventSummary.expectedBackground.toFixed(0)}
          hint={`${lab.generatedBackground} drawn`}
        />
        <Stat
          label="Epistemic state"
          value={lab.research.epistemic.state.replace("SCI:", "")}
          hint={lab.research.epistemic.discoveryGate ? "gate open" : "gate closed"}
        />
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
        {SCINET_PIPELINE.map((stage, i) => (
          <div
            key={stage}
            className="flex h-11 shrink-0 items-center gap-1 rounded-md bg-secondary px-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
          >
            <span className="text-foreground">{stage}</span>
            {i < SCINET_PIPELINE.length - 1 ? <span aria-hidden="true">→</span> : null}
          </div>
        ))}
      </div>

      <Panel className="mt-4" title="Exposure controls">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Slider label="WIMP mass" value={massGeV} min={1} max={1000} step={1} format={(v) => `${v.toFixed(0)} GeV`} onChange={setMassGeV} />
          <Slider
            label="log10 σ"
            value={log10Sigma}
            min={-49}
            max={-39}
            step={0.1}
            format={(v) => `${v.toFixed(1)}  (${(10 ** v).toExponential(1)} cm²)`}
            onChange={setLog10Sigma}
          />
          <Slider label="Exposure" value={exposureDays} min={30} max={1500} step={5} format={(v) => `${v.toFixed(0)} days`} onChange={setExposureDays} />
          <Slider label="Fiducial mass" value={fiducialMassKg} min={100} max={5000} step={50} format={(v) => `${v.toFixed(0)} kg`} onChange={setFiducialMassKg} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setSeed((s) => s + 1)}>
            Reseed {seed}
          </Button>
          <Badge tone={sciTone}>{lab.research.epistemic.state}</Badge>
          <Badge>SIMULATION ≠ EVIDENCE</Badge>
        </div>
        {note ? <p className="mt-3 text-sm text-danger">{note}</p> : null}
      </Panel>

      <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "h-11 shrink-0 rounded-md px-3 text-sm",
              tab === id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
          <Panel title="TPC analogue (XY)" meta={<Badge tone="info">SIMULATED</Badge>}>
            <TpcCanvas events={lab.events} radiusM={detector.radiusM} heightM={detector.heightM} />
            <p className="mt-2 text-xs text-muted-foreground">
              Green NR-like, blue ER-like, red vetoed. Dashed ring is fiducial. Geometry is a software twin, not a detector.
            </p>
          </Panel>
          <Panel title="S2 / S1 plane">
            <S2S1Canvas events={lab.events} />
            <p className="mt-2 text-xs text-muted-foreground">
              Expected signal {lab.expectedSignal.toFixed(2)} events. Band split is a classifier, not a particle ID.
            </p>
          </Panel>
        </div>
      ) : null}

      {tab === "events" ? (
        <Panel title="Rendered event ledger" className="mt-4">
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-xs">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 font-medium">ID</th>
                  <th className="py-2 font-medium">Model</th>
                  <th className="py-2 font-medium">E keV</th>
                  <th className="py-2 font-medium">S1</th>
                  <th className="py-2 font-medium">S2</th>
                  <th className="py-2 font-medium">Day</th>
                  <th className="py-2 font-medium">Class</th>
                </tr>
              </thead>
              <tbody>
                {lab.events.slice(0, 40).map((ev) => (
                  <tr key={ev.truth.id} className="border-t border-border font-mono">
                    <td className="py-1.5">{ev.truth.id}</td>
                    <td>{ev.truth.model}</td>
                    <td>{ev.signal.energyKeV.toFixed(2)}</td>
                    <td>{ev.signal.s1PE.toFixed(1)}</td>
                    <td>{ev.signal.s2PE.toFixed(0)}</td>
                    <td>{ev.truth.timeDay.toFixed(1)}</td>
                    <td>{ev.classification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Truth tags are SCI:SIMULATED. Display is a subsample. Time is a generated day-of-year, not a clock.
          </p>
        </Panel>
      ) : null}

      {tab === "detector" ? (
        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
          <Panel title="Geometry">
            <dl className="grid grid-cols-2 gap-2 font-mono text-xs">
              <Row k="Name" v={detector.name} />
              <Row k="Target" v={detector.target} />
              <Row k="Radius" v={`${detector.radiusM} m`} />
              <Row k="Height" v={`${detector.heightM} m`} />
              <Row k="S1 thr" v={`${detector.s1ThresholdPE} PE`} />
              <Row k="S2 thr" v={`${detector.s2ThresholdPE} PE`} />
            </dl>
          </Panel>
          <Panel title="Calibration / nuisance">
            <Slider label="Energy scale" value={calibration.energyScale} min={0.85} max={1.15} step={0.005} format={(v) => v.toFixed(3)} onChange={(v) => setCalibration({ ...calibration, energyScale: v })} />
            <Slider label="Photon efficiency" value={calibration.photonEfficiencyScale} min={0.7} max={1.3} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => setCalibration({ ...calibration, photonEfficiencyScale: v })} />
            <Slider label="Electron gain" value={calibration.electronGainScale} min={0.7} max={1.3} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => setCalibration({ ...calibration, electronGainScale: v })} />
            <Slider label="NR class bias" value={calibration.nrClassificationBias} min={-0.3} max={0.3} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => setCalibration({ ...calibration, nrClassificationBias: v })} />
            <Slider label="Background norm" value={nuisance.backgroundNormalization} min={0.5} max={1.8} step={0.02} format={(v) => v.toFixed(2)} onChange={(v) => setNuisance({ ...nuisance, backgroundNormalization: v })} />
            <Slider label="Halo density scale" value={nuisance.haloDensityScale} min={0.5} max={1.5} step={0.02} format={(v) => v.toFixed(2)} onChange={(v) => setNuisance({ ...nuisance, haloDensityScale: v })} />
          </Panel>
        </div>
      ) : null}

      {tab === "background" ? (
        <Panel title="Background model (development rates)" className="mt-4">
          <p className="mb-3 text-sm text-muted-foreground">
            These are software-development components, not a claim about any experiment. Toggle a class off to see the analogue respond.
          </p>
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-xs">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 font-medium">Class</th>
                  <th className="py-2 font-medium">Rate /kg/day</th>
                  <th className="py-2 font-medium">NR frac</th>
                  <th className="py-2 font-medium">Unc</th>
                  <th className="py-2 font-medium">On</th>
                </tr>
              </thead>
              <tbody>
                {backgrounds.map((b) => (
                  <tr key={b.name} className="border-t border-border font-mono">
                    <td className="py-2">{b.name}</td>
                    <td>{b.ratePerKgDay.toExponential(2)}</td>
                    <td>{b.nrFraction.toFixed(2)}</td>
                    <td>{(b.uncertaintyFraction * 100).toFixed(0)}%</td>
                    <td>
                      <button
                        type="button"
                        className="h-11 min-w-11 rounded-md bg-secondary px-3"
                        onClick={() => toggleBackground(b.name, backgrounds, setBackgrounds)}
                      >
                        {b.enabled ? "on" : "off"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      {tab === "hypotheses" ? (
        <Panel title="Hypothesis registry" className="mt-4" meta={<Badge>priors ≠ truth</Badge>}>
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-xs">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 font-medium">ID</th>
                  <th className="py-2 font-medium">Channel</th>
                  <th className="py-2 font-medium">Prior</th>
                  <th className="py-2 font-medium">Posterior</th>
                  <th className="py-2 font-medium">Required tests</th>
                </tr>
              </thead>
              <tbody>
                {HYPOTHESES.map((h) => (
                  <tr key={h.id} className="border-t border-border font-mono">
                    <td className="py-2">
                      {h.id}
                      {lab.research.sciNet.preferredHypothesis === h.id ? (
                        <Badge className="ml-2" tone="ok">
                          preferred
                        </Badge>
                      ) : null}
                    </td>
                    <td>{h.channel}</td>
                    <td>{(lab.research.sciNet.posterior.prior[h.id] * 100).toFixed(1)}%</td>
                    <td>{(lab.research.sciNet.posterior.posterior[h.id] * 100).toFixed(1)}%</td>
                    <td className="text-muted-foreground">{h.requiredTests.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Registry is frozen on the research contract. Posterior mass is a sandbox preference, not a discovery.
          </p>
        </Panel>
      ) : null}

      {tab === "likelihood" ? (
        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
          <Panel title="Folded spectrum" meta={<Badge tone="info">SIMULATED</Badge>}>
            <SpectrumCanvas
              bins={lab.research.sciNet.run.binsKeV}
              observed={lab.research.sciNet.run.observedByBin}
              background={lab.research.sciNet.run.backgroundByBin}
              signal={lab.research.sciNet.run.foldedSpectrum}
            />
          </Panel>
          <Panel title="Posterior">
            <PosteriorCanvas posterior={lab.research.sciNet.posterior} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Stat label="log BF H1/H0" value={lab.research.sciNet.logBayesH1H0.toFixed(2)} hint="Bayes factor, not causation" />
              <Stat label="q = 2Δℓ" value={lab.research.sciNet.testStatistic.toFixed(2)} hint="joint likelihood ratio" />
              <Stat label="approx Z" value={lab.research.sciNet.approxZ.toFixed(2)} hint="diagnostic only" />
              <Stat label="run state" value={lab.research.sciNet.researchRun.state} hint={lab.research.sciNet.researchRun.synthetic ? "synthetic" : "live"} />
            </div>
          </Panel>
          <Panel title="Joint likelihood" className="lg:col-span-2">
            <div className="min-w-0 overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-xs">
                <thead>
                  <tr className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 font-medium">Hypothesis</th>
                    <th className="py-2 font-medium">ℓ</th>
                    <th className="py-2 font-medium">Nuisance</th>
                    <th className="py-2 font-medium">Bins</th>
                    <th className="py-2 font-medium">Valid</th>
                  </tr>
                </thead>
                <tbody>
                  {lab.research.sciNet.joint.map((row) => (
                    <tr key={row.hypothesisId} className="border-t border-border font-mono">
                      <td className="py-1.5">{row.hypothesisId}</td>
                      <td>{row.logLikelihood.toFixed(2)}</td>
                      <td>{row.nuisancePenalty.toFixed(2)}</td>
                      <td>{row.totalBins}</td>
                      <td>{row.valid ? "yes" : "no"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      ) : null}

      {tab === "replication" ? (
        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
          <Panel title="Cross-target replica" meta={<Badge tone="warn">not independent</Badge>}>
            <dl className="grid grid-cols-2 gap-2 font-mono text-xs">
              <Row k="Primary" v={lab.research.sciNet.replication.primary} />
              <Row k="Replica" v={lab.research.sciNet.replication.replica} />
              <Row k="Shape distance" v={lab.research.sciNet.replication.shapeDistance.toFixed(3)} />
              <Row k="Rate ratio" v={lab.research.sciNet.replication.rateRatio.toFixed(2)} />
              <Row k="Consistent" v={lab.research.sciNet.replication.consistent ? "yes" : "no"} />
              <Row k="Independent" v="no" />
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">{lab.research.sciNet.replication.note}</p>
          </Panel>
          <Panel title="Leave-one-out robustness" meta={<Badge>{lab.research.sciNet.robustness.stable ? "stable" : "fragile"}</Badge>}>
            <p className="mb-3 text-sm text-muted-foreground">{lab.research.sciNet.robustness.note}</p>
            <div className="min-w-0 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-xs">
                <thead>
                  <tr className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 font-medium">Dropped</th>
                    <th className="py-2 font-medium">Kind</th>
                    <th className="py-2 font-medium">Δ vs full</th>
                    <th className="py-2 font-medium">Still prefers H1</th>
                  </tr>
                </thead>
                <tbody>
                  {lab.research.sciNet.robustness.rows.map((row) => (
                    <tr key={`${row.kind}-${row.dropped}`} className="border-t border-border font-mono">
                      <td className="py-1.5">{row.dropped}</td>
                      <td>{row.kind}</td>
                      <td>{row.deltaVsFull.toFixed(2)}</td>
                      <td>{row.preferredStill ? "yes" : "no"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      ) : null}

      {tab === "evidence" ? (
        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
          <Panel title="Evidence graph" meta={<Badge tone="danger">claim rejected</Badge>}>
            <EvidenceGraphSvg graph={lab.research.sciNet.evidence} />
            <p className="mt-2 text-xs text-muted-foreground">
              Claims cannot be supported directly by simulation. SUPPORTED_BY from a SIMULATED node is a validation error.
            </p>
          </Panel>
          <Panel title="Evidence ledger" meta={<Badge>append-only</Badge>}>
            <ul className="max-h-64 space-y-1 overflow-y-auto font-mono text-[11px]">
              {lab.research.sciNet.ledger.entries.slice(-12).map((e) => (
                <li key={e.seq} className="flex justify-between gap-2 border-t border-border py-1">
                  <span className="text-muted-foreground">
                    {e.seq} {e.kind} {e.ref}
                  </span>
                  <span>{e.state.replace("SCI:", "")}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">Terminal {lab.research.sciNet.ledger.terminal}. A hashed simulation is still a simulation.</p>
          </Panel>
        </div>
      ) : null}

      {tab === "modulation" ? (
        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <Panel title="Annual modulation laboratory">
            <ModulationCanvas bins={lab.research.modulation.bins} />
          </Panel>
          <Panel title="Model comparison">
            <Stat label="Amplitude" value={`${(lab.research.modulation.amplitudeFraction * 100).toFixed(2)}%`} />
            <div className="mt-3" />
            <Stat label="Phase" value={`${lab.research.modulation.phaseDay.toFixed(1)} d`} />
            <div className="mt-3" />
            <Stat label="χ² constant" value={lab.research.modulation.chiSquareConstant.toFixed(2)} />
            <div className="mt-3" />
            <Stat label="χ² modulated" value={lab.research.modulation.chiSquareModulated.toFixed(2)} />
            <p className="mt-3 text-sm font-medium">{lab.research.modulation.preferred}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              A lower χ² for the SHM curve is a preference inside this sandbox. It is not an observation of the galactic halo.
            </p>
          </Panel>
        </div>
      ) : null}

      {tab === "sensitivity" ? (
        <Panel title="Asimov sensitivity + experiment design" className="mt-4" meta={<Badge tone="warn">not a limit</Badge>}>
          <SensitivityCanvas points={lab.research.sensitivity.points} />
          <div className="mt-3 min-w-0 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-xs">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 font-medium">σ cm²</th>
                  <th className="py-2 font-medium">E[S]</th>
                  <th className="py-2 font-medium">E[B]</th>
                  <th className="py-2 font-medium">Z</th>
                </tr>
              </thead>
              <tbody>
                {lab.research.sensitivity.points.map((p) => (
                  <tr key={p.crossSectionCm2} className="border-t border-border font-mono">
                    <td className="py-1.5">{p.crossSectionCm2.toExponential(0)}</td>
                    <td>{p.expectedSignal.toFixed(2)}</td>
                    <td>{p.expectedBackground.toFixed(1)}</td>
                    <td>{p.discoveryMetric.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Mass {lab.research.sensitivity.massGeV} GeV. Z is an Asimov diagnostic. Crossing 5 on this plot still cannot open SCI:DISC.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Fisher Z" value={lab.research.sciNet.info.fisherZ.toFixed(2)} hint="information, not a claim" />
            <Stat label="Bits vs H0" value={lab.research.sciNet.info.bitsVsH0.toFixed(2)} hint="sandbox entropy drop" />
            <Stat label="Recommend" value={lab.research.sciNet.info.recommend} hint="A2 only" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{lab.research.sciNet.info.note}</p>
        </Panel>
      ) : null}

      {tab === "provenance" ? (
        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
          <Panel title="Hard discovery gate" meta={<Badge tone="danger">SCI:DISC locked</Badge>}>
            <p className="text-sm text-muted-foreground">
              Data state is welded to SIMULATED. You may tick every other box. The gate still fails.
            </p>
            <label className="mt-3 flex h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={replication} onChange={(e) => setReplication(e.target.checked)} />
              Independent replication
            </label>
            <label className="flex h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={bgValidated} onChange={(e) => setBgValidated(e.target.checked)} />
              Background model validated
            </label>
            <label className="flex h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={sysValidated} onChange={(e) => setSysValidated(e.target.checked)} />
              Detector systematics validated
            </label>
            <label className="flex h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={unblinded} onChange={(e) => setUnblinded(e.target.checked)} />
              Pretend unblinded
            </label>
            <Slider label="Claimed significance" value={sigmaClaim} min={0} max={8} step={0.1} format={(v) => `${v.toFixed(1)} σ`} onChange={setSigmaClaim} />
            <p className="mt-3 font-mono text-xs text-muted-foreground">dataState = SIMULATED (immutable)</p>
            <ul className="mt-3 space-y-1">
              {gate.blockers.map((b) => (
                <li key={b} className="font-mono text-xs text-danger">
                  {b}
                </li>
              ))}
            </ul>
            <Button className="mt-3" variant="destructive" onClick={onDeclare}>
              Declare SCI:DISC
            </Button>
            {lastDenial?.rejectedReason ? <p className="mt-3 text-sm text-danger">{lastDenial.rejectedReason}</p> : null}
          </Panel>
          <Panel title="Run hash">
            <dl className="space-y-2 font-mono text-xs">
              <Row k="Seed" v={String(seed)} />
              <Row k="Config" v={hashObject({ massGeV, log10Sigma, exposureDays, fiducialMassKg, calibration, nuisance })} />
              <Row k="Events" v={hashObject(lab.events.map((e) => e.truth.id))} />
              <Row k="State" v={lab.research.epistemic.state} />
              <Row k="Run" v={lab.research.sciNet.researchRun.state} />
              <Row k="Blind" v={lab.research.sciNet.run.blind.state} />
              <Row k="Contract" v={lab.research.sciNet.run.contractHash} />
              <Row k="Gate" v={gate.passed ? "PASS" : "BLOCK"} />
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">
              Provenance survives transformation. A hashed simulation is still a simulation.
            </p>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}

function toggleBackground(
  name: BackgroundClass,
  backgrounds: BackgroundComponent[],
  setBackgrounds: (next: BackgroundComponent[]) => void,
) {
  setBackgrounds(backgrounds.map((b) => (b.name === name ? { ...b, enabled: !b.enabled } : b)));
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-xs text-muted-foreground">
      <span className="flex justify-between gap-2">
        {label}
        <span className="font-mono text-foreground">{format(value)}</span>
      </span>
      <input
        type="range"
        className="mt-2 h-11 w-full accent-primary"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="truncate text-foreground">{v}</dd>
    </div>
  );
}
