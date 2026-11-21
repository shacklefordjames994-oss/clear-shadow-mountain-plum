import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FaultCanvas, FillCanvas, ParetoCanvas, RingCanvas, SweepCanvas, UncertaintyMapCanvas } from "@/components/omega/kernel-charts";
import { PageHeader, Panel, Stat } from "@/components/omega/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HL,
  KERNEL_VERSION,
  applyAuthorization,
  conveneSwarm,
  debateLines,
  faultSamples,
  fillLumi,
  fillPhase,
  initialKnowledge,
  injectFault,
  pareto,
  proposeExperiments,
  replayKernelCapsule,
  runEmitLum001,
  sealKernelCapsule,
  sensitivityLumi,
  sweepEmittance,
  tamperCapsule,
  toyLattice,
  uncertaintyGrid,
  FAULT_IDS,
  blindFaultId,
  type CandidateExperiment,
  type FaultId,
  type KernelCapsule,
  type KernelMode,
  type KnowledgeState,
  type ReplayReport,
  type SwarmRound,
} from "@/lib/omega/kernel";
import { useOmegaStore } from "@/lib/omega/store";

export const Route = createFileRoute("/_app/kernel")({ component: KernelLab });

const TABS = [
  ["cockpit", "Cockpit"],
  ["optics", "Optics"],
  ["lumi", "Luminosity"],
  ["fill", "Fill"],
  ["golden", "Golden"],
  ["design", "Design"],
  ["hypotheses", "Hypotheses"],
  ["debate", "Debate"],
  ["swarm", "Swarm"],
  ["capsule", "Capsule"],
  ["faults", "Faults"],
  ["guard", "Guard"],
] as const;

type Tab = (typeof TABS)[number][0];

function KernelLab() {
  const commit = useOmegaStore((s) => s.commitKernelRun);
  const authorizeProposal = useOmegaStore((s) => s.authorizeKernelProposal);
  const refuseAuto = useOmegaStore((s) => s.refuseAutoExperiment);
  const convene = useOmegaStore((s) => s.conveneKernelSwarm);
  const refuseSwarm = useOmegaStore((s) => s.refuseSwarmAuthorize);
  const commitCapsule = useOmegaStore((s) => s.commitKernelCapsule);
  const commitFault = useOmegaStore((s) => s.commitKernelFault);
  const attemptDiscovery = useOmegaStore((s) => s.attemptDiscovery);
  const attemptBeam = useOmegaStore((s) => s.attemptBeamActuation);
  const lastDenial = useOmegaStore((s) => s.events.find((e) => e.rejected));

  const [tab, setTab] = useState<Tab>("cockpit");
  const [emitN, setEmit] = useState<number>(HL.emitN_m);
  const [crab, setCrab] = useState(0.85);
  const [mode, setMode] = useState<KernelMode>("DISTRIBUTION");
  const [seed, setSeed] = useState(104928);
  const [fillT, setFillT] = useState(0.8);
  const [note, setNote] = useState<string | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeState>(() => initialKnowledge());
  const [proposals, setProposals] = useState<CandidateExperiment[]>(() => proposeExperiments(uncertaintyGrid()));
  const [round, setRound] = useState<SwarmRound | null>(null);
  const [capsule, setCapsule] = useState<KernelCapsule | null>(null);
  const [replay, setReplay] = useState<ReplayReport | null>(null);
  const [faultId, setFaultId] = useState<FaultId>("QUAD_ERROR");
  const [faultHidden, setFaultHidden] = useState(false);

  const run = useMemo(
    () => runEmitLum001({ emitN_m: emitN, crabFraction: crab, mode, seed }),
    [emitN, crab, mode, seed],
  );
  const sweep = useMemo(() => sweepEmittance({ crabFraction: crab, mode, seed }), [crab, mode, seed]);
  const dLdE = useMemo(() => sensitivityLumi(emitN, crab), [emitN, crab]);
  const lattice = useMemo(() => toyLattice(), []);
  const phase = fillPhase(fillT);
  const fillCurve = useMemo(() => {
    const out: { t: number; L: number }[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      out.push({ t, L: fillLumi(t, emitN, crab) });
    }
    return out;
  }, [emitN, crab]);
  const grid = useMemo(() => uncertaintyGrid(), []);
  const frontIds = useMemo(() => pareto(proposals).map((p) => p.id), [proposals]);
  const debate = useMemo(() => debateLines(), []);
  const fault = useMemo(
    () => injectFault(faultId, { emitN, crab, mode, seed }),
    [faultId, emitN, crab, mode, seed],
  );
  const faultCurve = useMemo(() => faultSamples(faultId, emitN, crab), [faultId, emitN, crab]);

  function onCommit() {
    const evt = commit({
      seed,
      emitN_m: emitN,
      crabFraction: crab,
      mode,
      residual: run.residual,
      goldenPass: run.goldenPass,
      lumiE34: run.simulated.lumiE34,
    });
    setNote(evt.rejected ? (evt.rejectedReason ?? "Rejected.") : "Hashed as SIMULATED. Not a machine fill.");
  }

  function onApprove(id: string) {
    const evt = authorizeProposal(id);
    const next = applyAuthorization(knowledge, proposals, id, "APPROVED");
    setKnowledge(next.knowledge);
    setProposals(next.cands);
    setNote(
      evt.rejected
        ? (evt.rejectedReason ?? "Rejected.")
        : `${id} authorized in sandbox. Knowledge v${next.knowledge.version}. SIMULATED, not a fill.`,
    );
  }

  function onReject(id: string) {
    const next = applyAuthorization(knowledge, proposals, id, "REJECTED");
    setKnowledge(next.knowledge);
    setProposals(next.cands);
    setNote(`${id} archived. Proposals are not deleted.`);
  }

  function onConvene() {
    const r = conveneSwarm({ run, knowledge, emitN, crab, mode, seed });
    setRound(r);
    const evt = convene({
      seed: r.seed,
      dissent: r.votes.DISSENT,
      deny: r.votes.DENY,
      consensus: r.consensus,
    });
    setNote(evt.rejected ? (evt.rejectedReason ?? "Rejected.") : r.report);
  }

  function onSeal() {
    const r =
      round ??
      conveneSwarm({ run, knowledge, emitN, crab, mode, seed });
    if (!round) setRound(r);
    const cap = sealKernelCapsule({ run, knowledge, emitN, crab, mode, seed, round: r });
    setCapsule(cap);
    setReplay(null);
    const evt = commitCapsule({ contentHash: cap.contentHash, seed: cap.seed });
    setNote(evt.rejected ? (evt.rejectedReason ?? "Rejected.") : `Sealed ${cap.contentHash.slice(0, 12)}. SIMULATED.`);
  }

  function onReplay() {
    if (!capsule) return;
    const report = replayKernelCapsule(capsule, knowledge);
    setReplay(report);
    setNote(
      report.match
        ? "Replay matches. Same seed, same toy. Not another laboratory."
        : `Replay broke: ${report.mismatches.join(", ")}.`,
    );
  }

  function onTamper() {
    if (!capsule) return;
    const dirty = tamperCapsule(capsule);
    setCapsule(dirty);
    const report = replayKernelCapsule(dirty, knowledge);
    setReplay(report);
    setNote("Seed bumped. Replay must fail. Tamper is not a new experiment.");
  }

  function onExport() {
    if (!capsule) return;
    const blob = new Blob([JSON.stringify(capsule, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `EMIT-LUM-001-${capsule.contentHash.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(href);
    setNote("Exported JSON. A file is not a fill.");
  }

  function onFault(id: FaultId) {
    setFaultId(id);
    setFaultHidden(false);
    const next = injectFault(id, { emitN, crab, mode, seed });
    const evt = commitFault({ faultId: id, klass: next.klass, seed });
    setNote(evt.rejected ? (evt.rejectedReason ?? "Rejected.") : `${next.klass}. ${next.hypothesis}`);
  }

  function onBlindFault() {
    const id = blindFaultId(seed + Math.floor(Math.random() * 997));
    setFaultId(id);
    setFaultHidden(true);
    const next = injectFault(id, { emitN, crab, mode, seed });
    const evt = commitFault({ faultId: "BLIND", klass: next.klass, seed });
    setNote(
      evt.rejected
        ? (evt.rejectedReason ?? "Rejected.")
        : `Blind draw. Classifier says ${next.klass}. The injection label stays covered.`,
    );
  }

  return (
    <div>
      <PageHeader
        kicker={`Digital CERN kernel v${KERNEL_VERSION} · fault injection`}
        title="HL-LHC physics kernel"
        description="Inject a magnet error, an RF slip, a toy quench, or a lying instrument. ANOMALY ≠ DISCOVERY."
        actions={
          <>
            <Button onClick={onCommit}>Commit run to bus</Button>
            <Button variant="destructive" onClick={() => setNote(attemptDiscovery("SIMULATED").rejectedReason ?? "")}>
              Declare SCI:DISC
            </Button>
            <Button variant="outline" onClick={() => setNote(attemptBeam().rejectedReason ?? "")}>
              Actuate beam
            </Button>
            <Button variant="outline" asChild>
              <Link to="/collider">DHC / Cosmic</Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map(([id, label]) => (
          <Button key={id} size="sm" variant={tab === id ? "default" : "outline"} onClick={() => setTab(id)}>
            {label}
          </Button>
        ))}
      </div>

      <Panel className="mt-4" title="EMIT-LUM-001" meta={<Badge>{run.evidence}</Badge>}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              εn
              <span className="font-mono text-foreground">{(emitN * 1e6).toFixed(2)} μm</span>
            </span>
            <input
              type="range"
              className="mt-2 h-11 w-full accent-primary"
              min={1.5e-6}
              max={3.5e-6}
              step={0.05e-6}
              value={emitN}
              onChange={(e) => setEmit(Number(e.target.value))}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              Crab fraction
              <span className="font-mono text-foreground">{crab.toFixed(2)}</span>
            </span>
            <input
              type="range"
              className="mt-2 h-11 w-full accent-primary"
              min={0}
              max={1}
              step={0.05}
              value={crab}
              onChange={(e) => setCrab(Number(e.target.value))}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Kernel mode
            <select
              className="mt-2 h-11 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground"
              value={mode}
              onChange={(e) => setMode(e.target.value as KernelMode)}
            >
              <option value="DISTRIBUTION">DISTRIBUTION</option>
              <option value="MACRO">MACRO</option>
            </select>
          </label>
          <label className="block text-xs text-muted-foreground">
            Seed
            <input
              type="number"
              className="mt-2 h-11 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value) || 1)}
            />
          </label>
        </div>
        {note ? <p className="mt-3 text-sm text-muted-foreground">{note}</p> : null}
        {lastDenial?.rejectedReason && note?.includes("HIGH_CONSEQUENCE") ? (
          <p className="mt-2 font-mono text-xs text-danger">{lastDenial.rejectedReason}</p>
        ) : null}
      </Panel>

      {tab === "cockpit" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Toy lattice" meta={<Badge>8 cells ≠ 26.7 km</Badge>}>
            <RingCanvas highlight={phase === "COLLISION" ? "IP1" : null} />
          </Panel>
          <Panel title="State" meta={<Badge tone="danger">external_control false</Badge>}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="L sim" value={`${run.simulated.lumiE34.toFixed(2)} ×10³⁴`} />
              <Stat label="L analytic" value={`${run.analytic.lumiE34.toFixed(2)} ×10³⁴`} />
              <Stat label="σx" value={`${(run.simulated.sigmaXM * 1e6).toFixed(2)} μm`} />
              <Stat label="Overlap F" value={run.simulated.overlapF.toFixed(3)} />
              <Stat label="Fill phase" value={phase} />
              <Stat label="Eligible" value="false" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{run.simulated.note}</p>
          </Panel>
        </div>
      )}

      {tab === "optics" && (
        <Panel className="mt-4" title="IP Twiss">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="β*" value={`${HL.betaStarM.toFixed(2)} m`} />
            <Stat label="γ" value={(HL.energyGeV / HL.protonMassGeV).toFixed(0)} />
            <Stat label="ε geometric" value={`${((emitN / (HL.energyGeV / HL.protonMassGeV)) * 1e9).toFixed(2)} nm`} />
            <Stat label="∂L/∂εn" value={dLdE.toExponential(2)} hint="finite difference, DISTRIBUTION" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            σ = √(β ε). Negative luminosity sensitivity to emittance is the golden qualitative test, not a machine
            optics table.
          </p>
          <ul className="mt-3 columns-2 gap-4 font-mono text-xs text-muted-foreground sm:columns-3">
            {lattice
              .filter((e) => e.kind !== "DRIFT")
              .map((e) => (
                <li key={e.id}>
                  {e.id} {e.kind} s={e.sM.toFixed(0)}
                </li>
              ))}
          </ul>
        </Panel>
      )}

      {tab === "lumi" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="L vs εn" meta={<Badge>line = analytic</Badge>}>
            <SweepCanvas points={sweep} current={emitN} />
          </Panel>
          <Panel title="Causal chain">
            <p className="text-sm text-muted-foreground">
              εn ↑ → σ* ↑ → overlap ↓ → L ↓. Crab raises F by shrinking the effective crossing angle. That is the
              reduced-order story, not a crab-cavity TDR.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Stat label="N / bunch" value={HL.bunchN.toExponential(1)} />
              <Stat label="bunches" value={String(HL.nBunch)} />
              <Stat label="f_rev" value={`${(299792458 / HL.circumferenceM).toFixed(0)} Hz`} />
              <Stat label="crossing" value={`${HL.crossingUrad} μrad`} />
            </div>
          </Panel>
        </div>
      )}

      {tab === "fill" && (
        <Panel className="mt-4" title="Synthetic fill">
          <FillCanvas samples={fillCurve} />
          <label className="mt-3 block text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              Fill clock
              <span className="font-mono text-foreground">
                {fillT.toFixed(2)} · {phase}
              </span>
            </span>
            <input
              type="range"
              className="mt-2 h-11 w-full accent-primary"
              min={0}
              max={1}
              step={0.01}
              value={fillT}
              onChange={(e) => setFillT(Number(e.target.value))}
            />
          </label>
          <p className="mt-3 text-xs text-muted-foreground">
            EMPTY → INJECT → RAMP → SQUEEZE → COLLISION → DUMP. Pictures of a fill are not a fill.
          </p>
        </Panel>
      )}

      {tab === "golden" && (
        <Panel className="mt-4" title="Analytical envelope" meta={<Badge>{run.goldenPass ? "PASS" : "FAIL"}</Badge>}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Relative residual" value={run.residual.toExponential(2)} />
            <Stat label="Mode" value={run.mode} />
            <Stat label="Golden" value={run.goldenPass ? "PASS" : "FAIL"} />
            <Stat label="Discovery" value="closed" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            DISTRIBUTION must match σ=√(βε) and the Gaussian L formula to 1e-9. MACRO may disagree by sampling. A pass
            is self-consistency of the toy, not HL-LHC certification.
          </p>
        </Panel>
      )}

      {tab === "design" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Uncertainty map" meta={<Badge>MODEL_A ≠ MODEL_B</Badge>}>
            <UncertaintyMapCanvas cells={grid} />
            <p className="mt-2 text-xs text-muted-foreground">
              Bright cells are where Piwinski and hourglass disagree. That is a sampling target, not a hole in nature.
              SURROGATE ≠ HIGH-FIDELITY.
            </p>
          </Panel>
          <Panel title="Pareto" meta={<Badge>IG vs cost</Badge>}>
            <ParetoCanvas points={proposals} front={frontIds} />
            <p className="mt-2 text-xs text-muted-foreground">
              Gold = non-dominated. The designer does not pick for you. Utility is a proposal metric.
            </p>
          </Panel>
          <Panel className="lg:col-span-2" title="Candidate portfolio" meta={<Badge tone="danger">HUMAN REQUIRED</Badge>}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="font-mono text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2">ID</th>
                    <th>Objective</th>
                    <th>IG</th>
                    <th>Cost</th>
                    <th>U</th>
                    <th>State</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((p) => (
                    <tr key={p.id} className="border-t border-border font-mono text-xs">
                      <td className="py-2">{p.id}</td>
                      <td className="max-w-[16rem] font-sans text-muted-foreground">{p.objective}</td>
                      <td>{p.expectedIG.toFixed(2)}</td>
                      <td>{p.cost.toFixed(1)}</td>
                      <td>{p.utility.toFixed(2)}</td>
                      <td>{p.status}</td>
                      <td className="whitespace-nowrap">
                        {p.status === "PROPOSED" ? (
                          <>
                            <Button size="sm" className="mr-1" onClick={() => onApprove(p.id)}>
                              Authorize
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onReject(p.id)}>
                              Archive
                            </Button>
                          </>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="destructive" onClick={() => setNote(refuseAuto().rejectedReason ?? "")}>
                Auto-run swarm
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              K<sub>t</sub> version {knowledge.version} · ⟨|A−B|⟩ {knowledge.uncertainty.toFixed(3)} ×10³⁴.
              PROPOSAL ≠ AUTHORIZATION. Auto-run is refused.
            </p>
          </Panel>
        </div>
      )}

      {tab === "hypotheses" && (
        <Panel className="mt-4" title="Hypothesis registry" meta={<Badge>never PROVEN</Badge>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="font-mono text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">ID</th>
                  <th>Statement</th>
                  <th>Falsify if</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {knowledge.hypotheses.map((h) => (
                  <tr key={h.id} className="border-t border-border text-xs">
                    <td className="py-2 font-mono">{h.id}</td>
                    <td>{h.statement}</td>
                    <td className="text-muted-foreground">{h.falsifyIf}</td>
                    <td className="font-mono">{h.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {knowledge.openQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === "debate" && (
        <Panel className="mt-4" title="Interpreter / skeptic / synthesizer">
          <ul className="space-y-3">
            {debate.map((line) => (
              <li key={line.role} className="rounded-md bg-secondary p-3">
                <div className="font-mono text-[10px] uppercase text-muted-foreground">{line.role}</div>
                <p className="mt-1 text-sm">{line.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Disagreement is the product. Consensus is not validation. Human review is the gate.
          </p>
        </Panel>
      )}

      {tab === "swarm" && (
        <div className="mt-4 grid gap-4">
          <Panel
            title="Bounded swarm"
            meta={<Badge tone="danger">SWARM ≠ AUTHORITY</Badge>}
            action={
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={onConvene}>
                  Convene swarm
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setNote(refuseSwarm().rejectedReason ?? "")}>
                  Swarm authorize
                </Button>
              </div>
            }
          >
            {round ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat label="PROCEED" value={String(round.votes.PROCEED)} />
                  <Stat label="HOLD" value={String(round.votes.HOLD)} />
                  <Stat label="DISSENT" value={String(round.votes.DISSENT)} />
                  <Stat label="DENY" value={String(round.votes.DENY)} />
                  <Stat label="Replay" value={round.reproductionMatch ? "match" : "mismatch"} />
                  <Stat label="Consensus" value={String(round.consensus)} />
                  <Stat label="Eligible" value="false" />
                  <Stat label="Auth" value="HUMAN_REQUIRED" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{round.report}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Convene the eleven. PHYSICS and NUMERICAL will disagree on purpose. SECURITY will deny the beam.
                Reproduction is the same seed, not another lab.
              </p>
            )}
          </Panel>
          {round ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {round.claims.map((c) => (
                <Panel key={c.role} title={c.role} meta={<Badge>{c.vote}</Badge>}>
                  <p className="text-sm text-muted-foreground">{c.claim}</p>
                </Panel>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {tab === "capsule" && (
        <Panel
          className="mt-4"
          title="Reproducibility capsule"
          meta={<Badge>{capsule ? capsule.schema : "UNSEALED"}</Badge>}
          action={
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={onSeal}>
                Seal
              </Button>
              <Button size="sm" variant="outline" onClick={onReplay} disabled={!capsule}>
                Replay
              </Button>
              <Button size="sm" variant="outline" onClick={onExport} disabled={!capsule}>
                Export JSON
              </Button>
              <Button size="sm" variant="destructive" onClick={onTamper} disabled={!capsule}>
                Tamper seed
              </Button>
            </div>
          }
        >
          {capsule ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Hash" value={capsule.contentHash.slice(3, 11)} hint={capsule.contentHash} />
                <Stat label="Seed" value={String(capsule.seed)} />
                <Stat label="L" value={`${capsule.lumiE34.toFixed(2)}e34`} />
                <Stat label="Dissent" value={capsule.dissent.join(" · ") || "none"} />
                <Stat label="Replay" value={replay ? (replay.match ? "MATCH" : replay.mismatches.join("+")) : "—"} />
                <Stat label="Eligible" value="false" />
                <Stat label="Control" value="false" />
                <Stat label="Evidence" value={capsule.evidence} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{capsule.note}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Seal EMIT-LUM-001 with the swarm votes. Replay must match. Bump the seed and it must fail. A matching
              hash is not a second laboratory.
            </p>
          )}
        </Panel>
      )}

      {tab === "faults" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <Panel title="Inject" meta={<Badge>{fault.klass}</Badge>}>
            <div className="flex flex-wrap gap-2">
              {FAULT_IDS.map((id) => (
                <Button key={id} size="sm" variant={faultId === id && !faultHidden ? "default" : "outline"} onClick={() => onFault(id)}>
                  {id === "QUAD_ERROR" ? "Quad" : id === "RF_SLIP" ? "RF slip" : id === "CORRELATED" ? "Unknown" : id[0] + id.slice(1).toLowerCase()}
                </Button>
              ))}
              <Button size="sm" variant="outline" onClick={onBlindFault}>
                Blind draw
              </Button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Stat label="L ratio" value={fault.channels.lumiRatio.toFixed(3)} />
              <Stat label="β* ratio" value={fault.channels.betaRatio.toFixed(3)} />
              <Stat label="Crab ratio" value={fault.channels.crabRatio.toFixed(2)} />
              <Stat label="T" value={`${fault.channels.tempK.toFixed(2)} K`} />
              <Stat label="Quench bit" value={fault.channels.quenchBit ? "1" : "0"} />
              <Stat label="Eligible" value="false" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{fault.hypothesis}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {faultHidden ? "Injection label covered. A covered label is not a measurement." : fault.injected}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {faultHidden ? (
                <Button size="sm" variant="outline" onClick={() => setFaultHidden(false)}>
                  Show injection label
                </Button>
              ) : null}
              <Button size="sm" variant="destructive" onClick={() => setNote(attemptDiscovery("SIMULATED").rejectedReason ?? "")}>
                Call it new physics
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setNote(attemptBeam().rejectedReason ?? "")}>
                Trip quench protection
              </Button>
            </div>
          </Panel>
          <Panel title="Fill after t = 0.7" meta={<Badge>{faultHidden ? "BLIND" : fault.label}</Badge>}>
            <FaultCanvas samples={faultCurve} />
            <p className="mt-2 text-xs text-muted-foreground">
              Pale line is luminosity. Warm line is toy temperature. The dashed mark is the injection time. A picture of a dump is not a dump.
            </p>
          </Panel>
        </div>
      )}

      {tab === "guard" && (
        <Panel className="mt-4" title="Kernel policy">
          <ul className="space-y-2 font-mono text-xs">
            <li>ALLOW · synthetic fill, sweep, replay, commit SIMULATE</li>
            <li>DENY · PHYSICAL_ACTUATOR_CONTROL</li>
            <li>DENY · DECLARE_DISCOVERY from SIMULATED L</li>
            <li>DENY · silent model replacement</li>
            <li>DENY · SWARM_AUTHORIZE (votes do not grant A5)</li>
            <li>ALLOW · seal / replay capsule as SIMULATED</li>
            <li>ALLOW · inject synthetic faults; class them; do not actuate</li>
            <li>DENY · trip real quench protection</li>
            <li>external_control = {String(run.externalControl)}</li>
            <li>discoveryEligible = {String(run.discoveryEligible)}</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            The AI can propose a squeeze. The kernel will not send current to a quadrupole. TWIN ≠ MACHINE.
          </p>
        </Panel>
      )}
    </div>
  );
}
