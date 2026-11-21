import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, Stat } from "@/components/omega/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CAMPAIGNS, GENERATORS, type GeneratorId } from "@/lib/omega/collider";
import {
  applyProtocol,
  assembleExperimentPackage,
  replayPackage,
  runParameterSweep,
  sealPackage,
  validateImported,
  type ExperimentPackage,
  type SweepRow,
} from "@/lib/omega/package";
import { freezeProtocol, requestProtocolUnblind } from "@/lib/omega/scinet/core/Protocol";
import { scanAsimov, type AsimovResult } from "@/lib/omega/scinet/statistics/Asimov";
import { useOmegaStore } from "@/lib/omega/store";
import type { PackageSnapshot } from "@/lib/omega/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/package")({ component: PackageDesk });

const TABS = [
  ["assemble", "Assemble"],
  ["protocol", "Protocol"],
  ["sweep", "Sweep"],
  ["profile", "Profile"],
  ["asimov", "Asimov"],
  ["robustness", "Robustness"],
  ["covariance", "Covariance"],
  ["import", "Import"],
  ["validate", "Validate"],
  ["gate", "Gate"],
] as const;
type Tab = (typeof TABS)[number][0];

function toSnapshot(pkg: ExperimentPackage): PackageSnapshot {
  return {
    experimentId: pkg.experimentId,
    schema: pkg.schema,
    seed: pkg.seed,
    systemId: pkg.configuration.systemId,
    contentHash: pkg.hashes.content,
    sha256: pkg.hashes.sha256,
    preferredGenerator: pkg.statistics.preferredGenerator,
    epistemic: "SCI:SIMULATED",
    discoveryEligible: false,
  };
}

function downloadPkg(pkg: ExperimentPackage) {
  const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${pkg.experimentId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function PackageDesk() {
  const collider = useOmegaStore((s) => s.collider);
  const darkMatter = useOmegaStore((s) => s.darkMatter);
  const physics = useOmegaStore((s) => s.physics);
  const committed = useOmegaStore((s) => s.experimentPackage);
  const commit = useOmegaStore((s) => s.commitExperimentPackage);
  const attemptDiscovery = useOmegaStore((s) => s.attemptDiscovery);
  const lastDenial = useOmegaStore((s) => s.events.find((e) => e.rejected));

  const [tab, setTab] = useState<Tab>("assemble");
  const [seed, setSeed] = useState(collider.seed);
  const [systemId, setSystemId] = useState(collider.systemId || "pO");
  const [generator, setGenerator] = useState<GeneratorId>(collider.generator || "GEN_A");
  const [eventCount, setEventCount] = useState(Math.min(160, collider.eventCount || 120));
  const [includeTpc, setIncludeTpc] = useState(false);
  const [pkg, setPkg] = useState<ExperimentPackage | null>(null);
  const [sweep, setSweep] = useState<SweepRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [paste, setPaste] = useState("");
  const [replay, setReplay] = useState<{ match: boolean; replayHash: string; originalHash: string } | null>(null);
  const [injectedMu, setInjectedMu] = useState(1);
  const [peeked, setPeeked] = useState(false);

  const preview = useMemo(
    () =>
      assembleExperimentPackage({
        seed,
        systemId,
        generator,
        eventCount,
        beamEnergyGeV: collider.beamEnergyGeV,
        luminosityFb: collider.luminosityFb,
        mode: collider.mode,
        darkMatter,
        physics,
        includeTpc: false,
        sweep: null,
      }),
    [
      seed,
      systemId,
      generator,
      eventCount,
      collider.beamEnergyGeV,
      collider.luminosityFb,
      collider.mode,
      darkMatter.seed,
      darkMatter.massGeV,
      darkMatter.log10Sigma,
      darkMatter.exposureDays,
      darkMatter.fiducialMassKg,
      darkMatter.lastSummary,
      physics.regime,
      physics.massResidual,
      physics.kineticEnergy,
    ],
  );

  async function onAssemble() {
    setBusy("Sealing package…");
    setNote(null);
    try {
      const raw = assembleExperimentPackage({
        seed,
        systemId,
        generator,
        eventCount,
        beamEnergyGeV: collider.beamEnergyGeV,
        luminosityFb: collider.luminosityFb,
        mode: collider.mode,
        darkMatter,
        physics,
        includeTpc,
        sweep,
      });
      const sealed = await sealPackage(raw);
      setPkg(sealed);
      setReplay(null);
      const evt = commit(toSnapshot(sealed));
      setNote(evt.rejected ? (evt.rejectedReason ?? "Rejected.") : "Sealed and hashed as SIMULATED. Not evidence.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Assemble failed.");
    } finally {
      setBusy(null);
    }
  }

  function onSweep() {
    setBusy("Sweeping p–O / O–O / Ne–Ne…");
    setNote(null);
    try {
      const rows = runParameterSweep(seed, 50);
      setSweep(rows);
      setNote("Sweep complete. No row is eligible for discovery.");
      setTab("sweep");
    } finally {
      setBusy(null);
    }
  }

  function onReplay() {
    const target = pkg ?? preview;
    const result = replayPackage(target);
    setReplay(result);
    setNote(result.match ? "Replay hash matches. Reproducible sandbox — still not an observation." : "Replay mismatch. Treat as a different run.");
    setTab("validate");
  }

  function onImportText(text: string) {
    setNote(null);
    try {
      const parsed: unknown = JSON.parse(text);
      const check = validateImported(parsed);
      if (!check.ok || !check.pkg) {
        setNote(`Import refused: ${check.errors.join(" · ")}`);
        return;
      }
      setPkg(check.pkg);
      commit(toSnapshot({ ...check.pkg, validation: { ...check.pkg.validation, discoveryEligible: false } }));
      setNote("Imported as SIMULATED. Discovery eligibility stripped if present.");
      setTab("validate");
    } catch {
      setNote("Import refused: invalid JSON.");
    }
  }

  function onDeclare() {
    const evt = attemptDiscovery("SCI:SIMULATED");
    setNote(evt.rejectedReason ?? "Discovery blocked.");
    setTab("gate");
  }

  async function onFreeze() {
    const proto = shown.protocol;
    if (!proto) {
      setNote("Assemble a v13 package first.");
      return;
    }
    setBusy("Freezing protocol…");
    try {
      const next = applyProtocol(shown, freezeProtocol(proto, peeked));
      const sealed = await sealPackage(next);
      setPkg(sealed);
      commit(toSnapshot(sealed));
      setNote(sealed.protocol?.note ?? "Frozen.");
      setTab("protocol");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Freeze failed.");
    } finally {
      setBusy(null);
    }
  }

  function onUnblind() {
    const proto = shown.protocol;
    if (!proto) {
      setNote("No protocol to unblind.");
      return;
    }
    const next = applyProtocol(shown, requestProtocolUnblind(proto));
    setPkg(next);
    setNote(next.protocol?.note ?? "Unblind refused.");
    setTab("protocol");
  }

  function onTab(id: Tab) {
    if (id === "profile" || id === "asimov" || id === "robustness") setPeeked(true);
    setTab(id);
  }

  const shown = pkg ?? preview;

  const liveAsimov = useMemo((): AsimovResult | null => {
    const bins = shown.inference?.bins;
    const lit = shown.inference?.litRelativeUnc;
    if (!bins || lit == null) return shown.asimov ?? null;
    if (shown.asimov && Math.abs(shown.asimov.injectedMu - injectedMu) < 1e-9) return shown.asimov;
    return scanAsimov(bins, lit, injectedMu);
  }, [shown.inference, shown.asimov, injectedMu]);

  return (
    <div>
      <PageHeader
        kicker="DHC-TWIN v13 · leave-one-out"
        title="Portable sealed run"
        description="Drop a η region or a background and see if the preference survives. Stability is not evidence. Frozen is not observed."
        actions={
          <>
            <Button onClick={onAssemble} disabled={!!busy}>
              {busy ?? "Assemble + seal"}
            </Button>
            <Button variant="outline" onClick={() => void onFreeze()} disabled={!!busy}>
              Freeze protocol
            </Button>
            <Button variant="destructive" onClick={onDeclare}>
              Declare SCI:DISC
            </Button>
            <Button variant="outline" asChild>
              <Link to="/collider">DHC / Cosmic</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Schema" value={shown.schema} hint={shown.versions.protocol} />
        <Stat
          label="Protocol"
          value={shown.protocol?.state ?? "—"}
          hint={shown.protocol?.frozen ? "frozen ≠ observed" : "draft"}
        />
        <Stat label="μ̂" value={shown.profile ? shown.profile.muHat.toFixed(2) : "—"} hint="profiled toy" />
        <Stat
          label="Robust"
          value={shown.robustness ? (shown.robustness.stable ? "stable" : "flips") : "—"}
          hint="stable ≠ evidence"
        />
      </div>

      <Panel className="mt-4" title="Run configuration" meta={<Badge>PACKAGE ≠ OBSERVATION</Badge>}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block text-xs text-muted-foreground">
            Collision system
            <select
              className="mt-2 h-11 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground"
              value={systemId}
              onChange={(e) => setSystemId(e.target.value)}
            >
              {CAMPAIGNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted-foreground">
            Generator
            <select
              className="mt-2 h-11 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground"
              value={generator}
              onChange={(e) => setGenerator(e.target.value as GeneratorId)}
            >
              {GENERATORS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              Events
              <span className="font-mono text-foreground">{eventCount}</span>
            </span>
            <input
              type="range"
              className="mt-2 h-11 w-full accent-primary"
              min={40}
              max={300}
              step={20}
              value={eventCount}
              onChange={(e) => setEventCount(Number(e.target.value))}
            />
          </label>
          <label className="flex h-11 items-center gap-3 self-end text-sm">
            <input
              type="checkbox"
              className="size-5 accent-primary"
              checked={includeTpc}
              onChange={(e) => setIncludeTpc(e.target.checked)}
            />
            Pack live TPC (slow)
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setSeed((s) => s + 1)}>
            Reseed {seed}
          </Button>
          <Badge tone="info">{shown.epistemic}</Badge>
          <Badge>STABLE ≠ EVIDENCE</Badge>
          {shown.protocol?.peekedBeforeFreeze ? <Badge tone="warn">PEEKED</Badge> : null}
          {committed ? <Badge tone="ok">On bus</Badge> : <Badge>Not committed</Badge>}
        </div>
        {note ? <p className="mt-3 text-sm text-danger">{note}</p> : null}
        {busy ? <p className="mt-2 font-mono text-xs text-muted-foreground">{busy}</p> : null}
      </Panel>

      <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onTab(id)}
            className={cn(
              "h-11 shrink-0 rounded-md px-3 text-sm",
              tab === id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "assemble" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Collider / cosmic slice">
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="√s_NN" value={`${shown.collider.sqrtSNNTeV.toFixed(2)} TeV`} />
              <Metric label="N_ch" value={shown.collider.meanNch.toFixed(1)} />
              <Metric label="Preferred gen" value={shown.collider.preferredGenerator} />
              <Metric label="χ² preferred" value={shown.statistics.chi2Preferred.toFixed(1)} />
              <Metric label="μ̂" value={shown.profile ? shown.profile.muHat.toFixed(2) : "—"} />
              <Metric label="q₀" value={shown.profile ? shown.profile.q0.toFixed(2) : "—"} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Mapping: {shown.cosmic.mapping}. Collision ≠ air shower. Literature calibrates; it does not observe.
            </p>
          </Panel>
          <Panel title="TPC / DigiSim slices">
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="TPC packed" value={shown.darkMatter.included ? "yes" : "config only"} />
              <Metric label="TPC state" value={shown.darkMatter.state ?? "—"} />
              <Metric label="TPC Z" value={shown.darkMatter.approxZ?.toFixed(2) ?? "—"} />
              <Metric label="DigiSim regime" value={shown.digisim.regime ?? "—"} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{shown.darkMatter.note}</p>
            <p className="mt-2 text-xs text-muted-foreground">{shown.digisim.note}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => downloadPkg(shown)}>
                Download JSON
              </Button>
              <Button size="sm" variant="outline" onClick={onReplay}>
                Replay from seed
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {tab === "protocol" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel
            title="Blind box"
            meta={
              <Badge tone={shown.protocol?.state === "UNBLIND_REJECTED" ? "danger" : shown.protocol?.frozen ? "ok" : "warn"}>
                {shown.protocol?.state ?? "MISSING"}
              </Badge>
            }
          >
            {shown.protocol ? (
              <>
                <p className="font-mono text-[11px] break-all text-muted-foreground">
                  {shown.protocol.contractHash}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{shown.protocol.note}</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button size="sm" onClick={() => void onFreeze()} disabled={!!busy || shown.protocol.frozen}>
                    {shown.protocol.frozen ? "Already frozen" : "Freeze now"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={onUnblind}>
                    Request unblind
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Assemble a v13 package to draft a protocol.</p>
            )}
          </Panel>
          <Panel title="Research run" meta={<Badge tone="danger">CLOSED</Badge>}>
            {shown.protocol ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Run" value={shown.protocol.research.state} />
                <Metric label="Data" value={shown.protocol.dataState} />
                <Metric label="Peeked" value={String(shown.protocol.peekedBeforeFreeze || peeked)} />
                <Metric label="Unblind" value={shown.protocol.unblindReason} />
                <Metric label="Synthetic" value="true" />
                <Metric label="Eligible" value="false" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No research run attached.</p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Looking at Profile or Asimov before freeze marks PEEKED_BEFORE_FREEZE. Asimov controls are allowed after freeze.
              Unblind of SIMULATED is refused. FROZEN ≠ OBSERVED.
            </p>
          </Panel>
        </div>
      )}

      {tab === "sweep" && (
        <Panel className="mt-4" title="System × generator χ²" meta={<Badge>preference ≠ truth</Badge>}>
          {sweep ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="font-mono text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2">System</th>
                    <th>√s_NN</th>
                    <th>Preferred</th>
                    <th>χ² A</th>
                    <th>χ² B</th>
                    <th>χ² C</th>
                    <th>N_ch</th>
                    <th>Gate</th>
                  </tr>
                </thead>
                <tbody>
                  {sweep.map((row) => (
                    <tr key={row.systemId} className="border-t border-border font-mono text-xs">
                      <td className="py-2">{row.label}</td>
                      <td>{row.sqrtSNNTeV.toFixed(2)}</td>
                      <td>{row.preferredGenerator}</td>
                      <td>{row.chi2.GEN_A.toFixed(1)}</td>
                      <td>{row.chi2.GEN_B.toFixed(1)}</td>
                      <td>{row.chi2.GEN_C.toFixed(1)}</td>
                      <td>{row.meanNch.toFixed(1)}</td>
                      <td className="text-danger">CLOSED</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Run a parameter sweep to compare p–O, O–O, and Ne–Ne on this seed.</p>
          )}
        </Panel>
      )}

      {tab === "profile" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="q(μ) scan" meta={<Badge>literature ≠ observed</Badge>}>
            {shown.profile ? (
              <>
                <ProfileCurve points={shown.profile.points} muHat={shown.profile.muHat} />
                <p className="mt-3 text-xs text-muted-foreground">{shown.profile.note}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Assemble a v9 package to profile μ.</p>
            )}
          </Panel>
          <Panel title="Profiled fit" meta={<Badge tone="danger">CLOSED</Badge>}>
            {shown.profile ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="μ̂" value={shown.profile.muHat.toFixed(2)} />
                <Metric label="q₀" value={shown.profile.q0.toFixed(2)} />
                <Metric label="Toy Z" value={shown.profile.approxZ.toFixed(2)} />
                <Metric label="CL_s toy" value={Number.isFinite(shown.profile.clsToy) ? shown.profile.clsToy.toFixed(3) : "—"} />
                <Metric label="lumi" value={shown.profile.bestTheta.lumi.toFixed(3)} />
                <Metric label="η-scale" value={shown.profile.bestTheta.etaScale.toFixed(3)} />
                <Metric label="lit cal" value={shown.profile.bestTheta.litCal.toFixed(3)} />
                <Metric label="Eligible" value="false" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No profile in this package.</p>
            )}
          </Panel>
        </div>
      )}

      {tab === "asimov" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Expected CLs toy" meta={<Badge>EXPECTED ≠ OBSERVED</Badge>}>
            {liveAsimov ? (
              <>
                <CLsCurve points={liveAsimov.cls} muHat={liveAsimov.expectedMuHat} mu95={liveAsimov.mu95Toy} />
                <p className="mt-3 text-xs text-muted-foreground">{liveAsimov.note}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Assemble a v13 package to run Asimov.</p>
            )}
          </Panel>
          <Panel title="Asimov fit" meta={<Badge tone="danger">CLOSED</Badge>}>
            {liveAsimov ? (
              <>
                <label className="mb-3 block text-xs text-muted-foreground">
                  <span className="flex justify-between gap-2">
                    Injected μ
                    <span className="font-mono text-foreground">{injectedMu.toFixed(1)}</span>
                  </span>
                  <input
                    type="range"
                    className="mt-2 h-11 w-full accent-primary"
                    min={0}
                    max={2}
                    step={0.5}
                    value={injectedMu}
                    onChange={(e) => setInjectedMu(Number(e.target.value))}
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Metric label="Injected μ" value={liveAsimov.injectedMu.toFixed(1)} />
                  <Metric label="Expected μ̂" value={liveAsimov.expectedMuHat.toFixed(2)} />
                  <Metric label="Expected Z" value={liveAsimov.expectedZ.toFixed(2)} />
                  <Metric label="μ_95 toy" value={liveAsimov.mu95Toy == null ? "none" : liveAsimov.mu95Toy.toFixed(1)} />
                  <Metric label="State" value={liveAsimov.observedState} />
                  <Metric label="Eligible" value="false" />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No inference bins in this package.</p>
            )}
          </Panel>
        </div>
      )}

      {tab === "robustness" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel
            title="Leave-one-out"
            meta={
              <Badge tone={shown.robustness?.stable ? "ok" : "warn"}>
                {shown.robustness?.stable ? "STABLE" : "FLIPS"}
              </Badge>
            }
          >
            {shown.robustness ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[22rem] text-left text-sm">
                    <thead className="font-mono text-[10px] uppercase text-muted-foreground">
                      <tr>
                        <th className="py-2">Dropped</th>
                        <th>Kind</th>
                        <th>Δ vs full</th>
                        <th>H1 wins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shown.robustness.rows.map((row) => (
                        <tr key={`${row.kind}-${row.dropped}`} className="border-t border-border font-mono text-xs">
                          <td className="py-2">{row.dropped}</td>
                          <td>{row.kind}</td>
                          <td>{row.deltaVsFull.toFixed(2)}</td>
                          <td className={row.preferredStill ? "text-foreground" : "text-danger"}>
                            {String(row.preferredStill)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{shown.robustness.note}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Assemble a v13 package to run leave-one-out.</p>
            )}
          </Panel>
          <Panel title="Regions" meta={<Badge tone="danger">CLOSED</Badge>}>
            {shown.robustness ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Full ΔLL" value={shown.robustness.fullDelta.toFixed(2)} />
                <Metric label="Full prefers" value={shown.robustness.fullDelta > 0 ? "H1" : "H0"} />
                <Metric label="Stable" value={String(shown.robustness.stable)} />
                <Metric label="Eligible" value="false" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No robustness report.</p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Barrel / endcap / forward are toy |η| slices, not ATLAS subdetectors. Dropping a background is a diagnostic.
              STABLE ≠ EVIDENCE. LEAVE_ONE_OUT ≠ REPLICATION.
            </p>
          </Panel>
        </div>
      )}

      {tab === "covariance" && (
        <Panel className="mt-4" title="Toy nuisance covariance" meta={<Badge>{shown.systematics.covariance}</Badge>}>
          <p className="text-sm text-muted-foreground">{shown.systematics.note}</p>
          {"matrix" in shown.systematics && shown.systematics.matrix ? (
            <CovarianceGrid names={shown.systematics.names ?? []} matrix={shown.systematics.matrix} />
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">v8 packages carry diagonal toys only.</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            σ_lit = {(shown.systematics.literatureRelativeUnc * 100).toFixed(1)}%. Generator χ² spread is a diagnostic,
            not a covariance eigenvalue.
          </p>
        </Panel>
      )}

      {tab === "import" && (
        <Panel className="mt-4" title="Import package">
          <p className="text-sm text-muted-foreground">
            Paste a v8–v13 JSON. Packages that claim OBSERVED or discoveryEligible are refused. A stable leave-one-out
            does not travel with the file as a replication.
          </p>
          <textarea
            className="mt-3 min-h-40 w-full rounded-md border border-border bg-secondary p-3 font-mono text-xs text-foreground"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder='{"schema":"DHC-TWIN-v13", ...}'
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => onImportText(paste)}>Import JSON</Button>
            <label className="inline-flex h-11 items-center rounded-md border border-border bg-secondary px-3 text-sm">
              Load file
              <input
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  void file.text().then(onImportText);
                }}
              />
            </label>
          </div>
        </Panel>
      )}

      {tab === "validate" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Reproducibility">
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Replayable" value={String(shown.validation.replayable)} />
              <Metric label="Graph valid" value={String(shown.validation.graphValid)} />
              <Metric label="Match" value={replay ? String(replay.match) : "—"} />
              <Metric label="Ledger" value={shown.evidence.terminal} />
            </div>
            {replay ? (
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                orig {replay.originalHash}
                <br />
                replay {replay.replayHash}
              </p>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">Replay from seed to test the content hash.</p>
            )}
            <Button className="mt-3" size="sm" variant="outline" onClick={onReplay}>
              Replay now
            </Button>
          </Panel>
          <Panel title="Firewall">
            <ul className="space-y-1 font-mono text-xs">
              {Object.entries(shown.validation.firewall).map(([k, v]) => (
                <li key={k} className="flex justify-between gap-2 border-b border-border py-1">
                  <span>{k}</span>
                  <span className="text-muted-foreground">{String(v)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {tab === "gate" && (
        <Panel className="mt-4" title="Discovery gate" meta={<Badge tone="danger">CLOSED</Badge>}>
          <p className="text-sm text-muted-foreground">
            A sealed package is a portable sandbox. Leave-one-out stability is not a replication. Frozen is not
            observed. STABLE != EVIDENCE. LEAVE_ONE_OUT != REPLICATION. UNBLIND != OBSERVATION.
          </p>
          <ul className="mt-3 space-y-1 font-mono text-xs text-danger">
            {shown.validation.blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="destructive" onClick={onDeclare}>
              Declare SCI:DISC
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dark-matter">TPC lab</Link>
            </Button>
          </div>
          {lastDenial ? <p className="mt-3 text-sm text-danger">{lastDenial.rejectedReason}</p> : null}
        </Panel>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary p-3">
      <div className="font-mono text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-sm tabular-nums text-foreground">{value}</div>
    </div>
  );
}

function ProfileCurve({
  points,
  muHat,
}: {
  points: Array<{ mu: number; q: number }>;
  muHat: number;
}) {
  const w = 560;
  const h = 220;
  const pad = 28;
  const clip = 12;
  const qMax = clip;
  const x = (mu: number) => pad + (mu / 2.4) * (w - pad * 2);
  const y = (q: number) => h - pad - (Math.min(q, clip) / qMax) * (h - pad * 2);
  const d = points.map((p, i) => `${i ? "L" : "M"} ${x(p.mu).toFixed(1)} ${y(Number.isFinite(p.q) ? p.q : 0).toFixed(1)}`).join(" ");
  const y0 = y(0);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Profile q of mu">
      <rect width={w} height={h} className="fill-secondary" />
      {qMax >= 9 ? (
        <>
          <line x1={pad} x2={w - pad} y1={y(9)} y2={y(9)} className="stroke-warn/50" strokeDasharray="4 4" />
          <text x={w - pad} y={y(9) - 4} textAnchor="end" className="fill-warn" fontSize="10">
            3σ toy
          </text>
        </>
      ) : null}
      <line x1={x(0)} x2={x(2.4)} y1={y0} y2={y0} className="stroke-border" />
      <path d={d} className="stroke-primary" fill="none" strokeWidth="2.5" />
      <circle cx={x(muHat)} cy={y(points.find((p) => p.mu === muHat)?.q ?? 0)} r="4.5" className="fill-primary" />
      <text x={x(0)} y={h - 8} className="fill-muted-foreground" fontSize="10">
        0
      </text>
      <text x={x(1)} y={h - 8} textAnchor="middle" className="fill-muted-foreground" fontSize="10">
        1
      </text>
      <text x={x(muHat)} y={Math.max(14, y(points.find((p) => p.mu === muHat)?.q ?? 0) - 8)} textAnchor="middle" className="fill-foreground" fontSize="10">
        μ̂={muHat.toFixed(1)}
      </text>
    </svg>
  );
}

function CLsCurve({
  points,
  muHat,
  mu95,
}: {
  points: Array<{ mu: number; clsToy: number }>;
  muHat: number;
  mu95: number | null;
}) {
  const w = 560;
  const h = 220;
  const pad = 28;
  const x = (mu: number) => pad + (mu / 2.4) * (w - pad * 2);
  const y = (c: number) => h - pad - (Math.min(1, Math.max(0, c)) / 1) * (h - pad * 2);
  const d = points
    .map((p, i) => `${i ? "L" : "M"} ${x(p.mu).toFixed(1)} ${y(Number.isFinite(p.clsToy) ? p.clsToy : 1).toFixed(1)}`)
    .join(" ");
  const y05 = y(0.05);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Toy CLs of mu">
      <rect width={w} height={h} className="fill-secondary" />
      <line x1={pad} x2={w - pad} y1={y05} y2={y05} className="stroke-warn/50" strokeDasharray="4 4" />
      <text x={w - pad} y={y05 - 4} textAnchor="end" className="fill-warn" fontSize="10">
        0.05 toy
      </text>
      <path d={d} className="stroke-primary" fill="none" strokeWidth="2.5" />
      <circle cx={x(muHat)} cy={y(points.find((p) => p.mu === muHat)?.clsToy ?? 1)} r="4.5" className="fill-primary" />
      {mu95 != null ? (
        <line x1={x(mu95)} x2={x(mu95)} y1={pad} y2={h - pad} className="stroke-danger/40" strokeDasharray="3 3" />
      ) : null}
      <text x={x(0)} y={h - 8} className="fill-muted-foreground" fontSize="10">
        0
      </text>
      <text x={x(1)} y={h - 8} textAnchor="middle" className="fill-muted-foreground" fontSize="10">
        1
      </text>
      <text x={x(muHat)} y={14} textAnchor="middle" className="fill-foreground" fontSize="10">
        μ̂={muHat.toFixed(1)}
      </text>
    </svg>
  );
}

function CovarianceGrid({ names, matrix }: { names: string[]; matrix: number[][] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[20rem] text-left font-mono text-xs">
        <thead className="text-[10px] uppercase text-muted-foreground">
          <tr>
            <th className="py-2" />
            {names.map((n) => (
              <th key={n}>{n}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={names[i]} className="border-t border-border">
              <th className="py-2 text-muted-foreground">{names[i]}</th>
              {row.map((v, j) => (
                <td key={j} className={i === j ? "text-foreground" : "text-muted-foreground"}>
                  {v.toExponential(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
