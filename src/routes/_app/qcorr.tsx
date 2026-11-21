import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { QFieldCanvas } from "@/components/omega/qcorr-canvas";
import { PageHeader, Panel, Stat } from "@/components/omega/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DATASET_NOTE,
  PIPELINE_STAGES,
  QCORR_VERSION,
  qStateLabel,
  runQCorr,
  type QDataset,
  type QModelId,
  type QStateId,
} from "@/lib/omega/qcorr";
import { useOmegaStore } from "@/lib/omega/store";

export const Route = createFileRoute("/_app/qcorr")({ component: QCorrLab });

const STATES: QStateId[] = ["SLIT", "VORTEX", "TILT"];
const DATASETS: QDataset[] = ["IDEAL", "INSTRUMENT", "ADVERSARIAL"];
const MODELS: QModelId[] = ["TRUTH", "PRODUCT", "FLAT"];

function QCorrLab() {
  const commit = useOmegaStore((s) => s.commitQCorr);
  const attemptDiscovery = useOmegaStore((s) => s.attemptDiscovery);
  const attemptBeam = useOmegaStore((s) => s.attemptBeamActuation);
  const [stateId, setState] = useState<QStateId>("SLIT");
  const [dataset, setDataset] = useState<QDataset>("IDEAL");
  const [modelId, setModel] = useState<QModelId>("TRUTH");
  const [seed, setSeed] = useState(29);
  const [stage, setStage] = useState(5);
  const [view, setView] = useState<"mag" | "phase">("mag");
  const [note, setNote] = useState<string | null>(null);
  const run = useMemo(() => runQCorr({ seed, stateId, dataset, modelId }), [seed, stateId, dataset, modelId]);
  const closed = run.amplitude == null;
  const showTruth = stage >= 0;
  const showMeas = stage >= 2;
  const showRec = stage >= 3;
  const showVal = stage >= 4;

  function onCommit() {
    const evt = commit({
      stateId: run.stateId,
      dataset: run.dataset,
      validity: run.validity,
      fidelity: run.validation.stateFidelity,
      seed: run.seed,
    });
    setNote(evt.rejected ? (evt.rejectedReason ?? "Rejected.") : "Logged as SIMULATED. Not a detector run.");
  }

  return (
    <div>
      <PageHeader
        kicker={`DHC-QCORR v${QCORR_VERSION} · research prototype`}
        title="Quantum correlation reconstruction"
        description="Synthetic biphoton holography. The reconstructor never sees the injected state. A residual is not a particle, and a failed reconstruction is not replaced with a guess."
        actions={
          <>
            <Button onClick={onCommit}>Commit to bus</Button>
            <Button variant="destructive" onClick={() => setNote(attemptDiscovery("SIMULATED").rejectedReason ?? "")}>
              Write a claim
            </Button>
            <Button variant="outline" onClick={() => setNote(attemptBeam().rejectedReason ?? "")}>
              Actuate beam
            </Button>
            <Button variant="outline" asChild>
              <Link to="/collider">Collider twin</Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone="info">SIMULATED COUNTS</Badge>
        <Badge tone={closed ? "danger" : "warn"}>{closed ? "NO RECONSTRUCTION" : "RECONSTRUCTED"}</Badge>
        <Badge>CLAIM BLOCKED</Badge>
      </div>

      {note ? <p className="mb-3 text-sm text-muted-foreground">{note}</p> : null}

      <Panel title="Synthetic source" meta={<Badge>{run.validity}</Badge>}>
        <div className="flex flex-wrap gap-2">
          {STATES.map((id) => (
            <Button key={id} size="sm" variant={stateId === id ? "default" : "outline"} onClick={() => setState(id)}>
              {qStateLabel(id)}
            </Button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {DATASETS.map((id) => (
            <Button key={id} size="sm" variant={dataset === id ? "default" : "outline"} onClick={() => setDataset(id)}>
              {id[0] + id.slice(1).toLowerCase()}
            </Button>
          ))}
          {MODELS.map((id) => (
            <Button key={id} size="sm" variant={modelId === id ? "default" : "outline"} onClick={() => setModel(id)}>
              {id === "TRUTH" ? "Vs injected" : id === "PRODUCT" ? "Vs product" : "Vs flat"}
            </Button>
          ))}
        </div>
        <label className="mt-3 block text-xs text-muted-foreground">
          Seed {seed}
          <input
            className="mt-1 block w-full max-w-xs"
            type="range"
            min={1}
            max={400}
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value))}
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">{DATASET_NOTE[dataset]}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PIPELINE_STAGES.map((s, i) => (
            <Button key={s.id} size="sm" variant={stage === i ? "default" : "outline"} onClick={() => setStage(i)}>
              {s.id} {s.label}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{PIPELINE_STAGES[stage]?.note}</p>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Injected amplitude" meta={<Badge tone="warn">validation only</Badge>}>
          {showTruth ? (
            <QFieldCanvas values={run.truthAmplitude} n={run.n} mode="mag" />
          ) : (
            <p className="text-sm text-muted-foreground">Covered.</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">Hidden from QHOLO. Shown so you can score the toy. This is not a photograph.</p>
        </Panel>
        <Panel title="Coincidence image" meta={<Badge>SIMULATED</Badge>}>
          {showMeas ? (
            <QFieldCanvas values={run.coincidence} n={run.n} mode="count" />
          ) : (
            <p className="text-sm text-muted-foreground">Not yet in the pipeline scrub.</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            |Ψ + reference|², Poisson sampled. {run.counts.toLocaleString()} counts. y is not in this slice.
          </p>
        </Panel>
        <Panel
          title={view === "mag" ? "Reconstructed amplitude" : "Reconstructed phase"}
          meta={<Badge tone={closed ? "danger" : "info"}>{run.validity}</Badge>}
          action={
            <div className="flex gap-2">
              <Button size="sm" variant={view === "mag" ? "default" : "outline"} onClick={() => setView("mag")}>
                |Ψ|
              </Button>
              <Button size="sm" variant={view === "phase" ? "default" : "outline"} onClick={() => setView("phase")}>
                arg Ψ
              </Button>
            </div>
          }
        >
          {showRec ? (
            <QFieldCanvas
              values={view === "mag" ? run.amplitude : run.phase}
              n={run.n}
              mode={view === "mag" ? "mag" : "phase"}
              closed={closed ? "Fail closed. No state was invented." : undefined}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Reconstruction has not been opened on this scrub.</p>
          )}
        </Panel>
        <Panel title="Residual" meta={<Badge>{showVal ? run.validation.verdict : "pending"}</Badge>}>
          {showVal ? (
            <QFieldCanvas
              values={run.residual}
              n={run.n}
              mode="resid"
              closed={closed ? "No residual. The gate did not emit a state." : undefined}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Validation is downstream of reconstruction.</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">{run.validation.note}</p>
        </Panel>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="State fidelity" value={showVal ? run.validation.stateFidelity.toFixed(3) : "—"} hint="|⟨ψr|ψt⟩|²" />
        <Stat label="Amplitude error" value={showVal ? run.validation.amplitudeError.toFixed(4) : "—"} hint="RMS of L2-normalized |Ψ|" />
        <Stat label="Phase error" value={showVal ? `${run.validation.phaseError.toFixed(2)} rad` : "—"} hint="amplitude-weighted, circular" />
        <Stat label="Intensity overlap" value={showVal ? run.validation.intensityFidelity.toFixed(3) : "—"} hint="Bhattacharyya of densities" />
        <Stat label="Sideband / control" value={run.sidebandRatio.toFixed(1)} hint="no ground truth used" />
        <Stat label="Signal / background" value={run.validation.signalToBackground > 500 ? "high" : run.validation.signalToBackground.toFixed(1)} />
        <Stat label="Confidence" value={closed ? "0" : run.confidence.toFixed(2)} />
        <Stat label="Claim" value={run.claim} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Observation bus" meta={<Badge>{run.stateRecordId}</Badge>}>
          <ul className="space-y-2 text-xs">
            {run.messages.map((m) => (
              <li key={m.eventId} className="border-b border-border pb-2">
                <span className="font-mono">{m.eventId}</span> · {m.epistemic} · {m.role}
                <div className="text-muted-foreground">{m.note}</div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Calibration {run.calibrationId}. Assumed carrier {run.assumedCarrier}, true carrier {run.trueCarrier}. QCORR does not replace tracks, jets, or missing energy.
          </p>
        </Panel>
        <Panel title="Sampled pairs" meta={<Badge>would-be observed</Badge>}>
          <ul className="space-y-1 font-mono text-xs text-muted-foreground">
            {run.pairs.map((p) => (
              <li key={p.id}>
                {p.id} x1 {p.x1.toFixed(2)} x2 {p.x2.toFixed(2)} Δt inside 2 ns · {p.energyEV.toFixed(1)} eV stand-in
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Energies are an SPDC-scale label, not TeV tracks. Pair positions are drawn from the injected |Ψ|² for the ledger. They are still simulated.
          </p>
        </Panel>
      </div>
    </div>
  );
}
