import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ColliderEvidenceSvg,
  DetectorTwinCanvas,
  EventDisplayCanvas,
  QuantumCanvas,
  SpectrumCanvas,
} from "@/components/omega/collider-charts";
import { Event3D, type Event3DKind } from "@/components/omega/event-3d";
import { AtlasDepositCanvas, AtlasLayerTable, AtlasRzCanvas, describeLayer } from "@/components/omega/atlas-geometry";
import {
  AirShowerCanvas,
  CompareTable,
  DataVsModelCanvas,
  DisagreementCanvas,
  LhcfGeometryCanvas,
  NucleusGeometryCanvas,
  PoEventCanvas,
} from "@/components/omega/cosmic-charts";
import { PageHeader, Panel, Stat } from "@/components/omega/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CAMPAIGNS,
  COLLIDER_HYPOTHESES,
  DEFAULT_ACCEL,
  GENERATORS,
  MODE_LABEL,
  PROCESS_LABEL,
  censusTracks,
  collisionRateHz,
  layersForEta,
  respondProbes,
  tracksToProbes,
  runColliderExperiment,
  runUniversalLab,
  type ColliderMode,
  type GeneratorId,
} from "@/lib/omega/collider";
import { useOmegaStore } from "@/lib/omega/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/collider")({ component: ColliderLab });

const TABS = [
  ["overview", "Overview"],
  ["display", "3D / 4D"],
  ["systems", "Systems"],
  ["geometry", "Geometry"],
  ["collision", "Collision"],
  ["detector", "Detector"],
  ["atlas", "ATLAS"],
  ["forward", "Forward"],
  ["shower", "Shower"],
  ["models", "Models"],
  ["sources", "Sources"],
  ["heavy", "Heavy ion"],
  ["reconstruct", "Reco"],
  ["spectrum", "Spectrum"],
  ["quantum", "Quantum"],
  ["missing", "MET / DM"],
  ["evidence", "Evidence"],
  ["ledger", "Ledger"],
  ["gate", "Gate"],
] as const;

type Tab = (typeof TABS)[number][0];

const MODES: ColliderMode[] = ["standard", "z", "higgs", "top", "dm", "entangled"];

function ColliderLab() {
  const commit = useOmegaStore((s) => s.commitColliderRun);
  const attemptDiscovery = useOmegaStore((s) => s.attemptDiscovery);
  const attemptBeam = useOmegaStore((s) => s.attemptBeamActuation);
  const lastDenial = useOmegaStore((s) => s.events.find((e) => e.rejected));

  const [tab, setTab] = useState<Tab>("overview");
  const [seed, setSeed] = useState(13600);
  const [beamEnergyGeV, setBeam] = useState(DEFAULT_ACCEL.beamEnergyGeV);
  const [luminosityFb, setLumi] = useState(DEFAULT_ACCEL.luminosityFb);
  const [eventCount, setCount] = useState(220);
  const [mode, setMode] = useState<ColliderMode>("z");
  const [systemId, setSystemId] = useState("pO");
  const [generator, setGenerator] = useState<GeneratorId>("GEN_A");
  const [note, setNote] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [viewKind, setViewKind] = useState<Event3DKind>("barrel");
  const [scrub, setScrub] = useState(0.72);
  const [spinning, setSpinning] = useState(true);
  const [atlasId, setAtlasId] = useState("TILE");
  const [atlasEta, setAtlasEta] = useState(0.8);

  const accel = useMemo(
    () => ({ ...DEFAULT_ACCEL, beamEnergyGeV, luminosityFb }),
    [beamEnergyGeV, luminosityFb],
  );

  const run = useMemo(
    () => runColliderExperiment(seed, accel, mode, Math.min(400, eventCount)),
    [seed, accel, mode, eventCount],
  );

  const lab = useMemo(
    () => runUniversalLab(seed, systemId, generator, eventCount),
    [seed, systemId, generator, eventCount],
  );

  const focus = run.events.find((e) => e.id === focusId) ?? run.last;
  const inf = run.inference;
  const rate = collisionRateHz(accel);
  const nuclear = systemId !== "pp";
  const atlasHits = useMemo(() => new Set(layersForEta(atlasEta).map((l) => l.id)), [atlasEta]);
  const atlasCensus = useMemo(() => {
    const etas = (lab.last?.tracks ?? []).map((t) => t.eta);
    return censusTracks(etas.slice(0, 80));
  }, [lab.last]);
  const atlasPicked = describeLayer(atlasId);
  const atlasReco = useMemo(() => {
    if (nuclear) return respondProbes(tracksToProbes(lab.last?.tracks ?? []), seed);
    const probes = (focus?.generated ?? []).map((p) => ({
      eta: p.eta,
      phi: p.phi,
      pT: p.pT,
      energy: p.E,
      charge: p.charge,
      name: p.name === "proton" ? ("proton" as const) : p.name,
    }));
    return respondProbes(probes, seed);
  }, [nuclear, lab.last, focus, seed]);

  function onCommit() {
    const evt = commit({
      seed,
      beamEnergyGeV,
      luminosityFb,
      eventCount,
      mode,
      systemId,
      generator,
      summary: {
        process: nuclear ? lab.system.label : (focus?.process ?? "QCD_jets"),
        preferred: nuclear ? lab.preferredGenerator : inf.preferred,
        approxZ: inf.approxZ,
        state: nuclear ? lab.state : inf.state,
        blockers: nuclear ? lab.blockers : inf.blockers,
        discoveryGate: false,
        events: nuclear ? lab.events.length : run.events.length,
        meanMass: run.meanMass,
        meanMET: run.meanMET,
        systemId,
        sqrtSNNTeV: lab.sqrtSNNTeV,
        preferredGenerator: lab.preferredGenerator,
      },
    });
    setNote(evt.rejected ? (evt.rejectedReason ?? "Rejected.") : "Hashed as SIMULATED. Not evidence.");
  }

  function onDeclare() {
    const evt = attemptDiscovery(nuclear ? lab.state : inf.state);
    setNote(evt.rejectedReason ?? "Discovery blocked.");
  }

  function onActuate() {
    const evt = attemptBeam();
    setNote(evt.rejectedReason ?? "Beam actuation blocked.");
  }

  return (
    <div>
      <PageHeader
        kicker="DHC-TWIN v15 · ATLAS response"
        title="Universal collider + cosmic-ray twin"
        description="Literature envelopes now smear. A ray through TileCal is not a cluster. Stochastic ⊕ constant is not a calibration."
        actions={
          <>
            <Button onClick={onCommit}>Commit run to bus</Button>
            <Button variant="destructive" onClick={onDeclare}>
              Declare SCI:DISC
            </Button>
            <Button variant="outline" onClick={onActuate}>
              Actuate beam
            </Button>
            <Button variant="outline" asChild>
              <Link to="/package">Package v13</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="System" value={lab.system.label} hint={lab.system.campaign} />
        <Stat
          label="√s_NN"
          value={`${lab.sqrtSNNTeV.toFixed(2)} TeV`}
          hint="per nucleon pair, not the nucleus total"
        />
        <Stat label="N_ch mean" value={lab.meanNch.toFixed(1)} hint="fiducial |η|<2.5, pT>0.5 GeV (toy)" />
        <Stat label="Epistemic" value="SIMULATED" hint="firewall closed" />
      </div>

      <Panel className="mt-4" title="Beam and generator" meta={<Badge>TWIN ≠ MACHINE</Badge>}>
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
                  {c.label} · {c.campaign}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted-foreground">
            Hadronic generator (toy)
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
          <Slider
            label="Monte Carlo events"
            value={eventCount}
            min={40}
            max={500}
            step={20}
            format={(v) => v.toFixed(0)}
            onChange={setCount}
          />
          <label className="block text-xs text-muted-foreground">
            p–p signal overlay
            <select
              className="mt-2 h-11 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground"
              value={mode}
              onChange={(e) => setMode(e.target.value as ColliderMode)}
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {MODE_LABEL[m]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <Slider
            label="p–p beam energy / beam"
            value={beamEnergyGeV}
            min={4500}
            max={7000}
            step={50}
            format={(v) => `${v.toFixed(0)} GeV`}
            onChange={setBeam}
          />
          <Slider
            label="Integrated luminosity (p–p overlay)"
            value={luminosityFb}
            min={1}
            max={140}
            step={1}
            format={(v) => `${v.toFixed(0)} fb⁻¹`}
            onChange={setLumi}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setSeed((s) => s + 1)}>
            Reseed {seed}
          </Button>
          <Badge tone="info">{lab.state}</Badge>
          <Badge>COLLISION ≠ AIR SHOWER</Badge>
          <Badge>LITERATURE ≠ THIS TWIN</Badge>
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

      {tab === "overview" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Collider event" meta={<Badge tone="info">SIMULATED</Badge>}>
            {nuclear ? <PoEventCanvas event={lab.last} /> : <EventDisplayCanvas event={focus} />}
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {nuclear
                ? `${lab.system.label} · N_ch ${lab.last?.nCh ?? 0} · mapping, not a shower`
                : `${focus ? PROCESS_LABEL[focus.process] : "—"} · MET ${focus ? focus.reconstruction.MET.toFixed(1) : "—"} GeV`}
            </p>
          </Panel>
          <Panel title="Detector / geometry" meta={<Badge>TWIN</Badge>}>
            {nuclear ? (
              <NucleusGeometryCanvas
                a={lab.nucleusA}
                b={lab.nucleusB}
                geometry={lab.geometry}
                labelA={lab.system.projectile}
                labelB={lab.system.target}
              />
            ) : (
              <DetectorTwinCanvas event={focus} />
            )}
          </Panel>
          <Panel title="Air shower (mapped)" meta={<Badge tone="warn">MAPPING ≠ IDENTITY</Badge>}>
            <AirShowerCanvas shower={lab.shower} />
            <p className="mt-2 text-xs text-muted-foreground">
              First interaction uses the hadronic toy constrained by the collider desk. This is a separate cascade, not
              an ATLAS event replayed in the sky.
            </p>
          </Panel>
          <Panel title="Literature vs generators" meta={<Badge>few-% cal. · model spread</Badge>}>
            <DataVsModelCanvas
              literature={lab.literatureEta}
              models={[lab.eta.GEN_A, lab.eta.GEN_B, lab.eta.GEN_C]}
              labels={["A", "B", "C"]}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              White bars are a literature-inspired ATLAS p–O shape, not this twin’s observation. Lines are toy
              generators. ATLAS reports models disagree with each other; the measurement is at the few-percent level.
            </p>
          </Panel>
        </div>
      )}

      {tab === "display" && (
        <div className="mt-4 grid gap-4">
          <Panel
            title={viewKind === "shower" ? "Air-shower 4D (generation slab)" : "ATLAS-like barrel"}
            meta={<Badge>PICTURE ≠ EVIDENCE</Badge>}
            action={
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={viewKind === "barrel" ? "default" : "outline"} onClick={() => setViewKind("barrel")}>
                  Barrel
                </Button>
                <Button size="sm" variant={viewKind === "shower" ? "default" : "outline"} onClick={() => setViewKind("shower")}>
                  Shower 4D
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSpinning((v) => !v)}>
                  {spinning ? "Hold orbit" : "Auto orbit"}
                </Button>
              </div>
            }
          >
            <Event3D
              key={`${viewKind}-${seed}-${systemId}`}
              kind={viewKind}
              nuclear={nuclear ? lab.last : null}
              collision={nuclear ? null : focus}
              shower={lab.shower}
              scrub={scrub}
              spinning={spinning}
            />
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Slider
                label={viewKind === "shower" ? "Generation time" : "Track reveal"}
                value={scrub}
                min={0.08}
                max={1}
                step={0.02}
                format={(v) => v.toFixed(2)}
                onChange={setScrub}
              />
              <p className="self-end text-xs text-muted-foreground">
                Drag to orbit. Time is a slider, not a clock on nature. A mapped shower is not an ATLAS event in the sky.
              </p>
            </div>
          </Panel>
        </div>
      )}

      {tab === "systems" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Campaigns">
            <ul className="space-y-2 text-sm">
              {CAMPAIGNS.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3 border-b border-border py-2">
                  <span>
                    <span className="font-medium">{c.label}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{c.campaign}</span>
                  </span>
                  <Button size="sm" variant={systemId === c.id ? "default" : "outline"} onClick={() => setSystemId(c.id)}>
                    {systemId === c.id ? "Active" : "Select"}
                  </Button>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Energy contract">
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Beam A / nucleon" value={`${lab.system.energyAGeV.toFixed(0)} GeV`} />
              <Metric label="Beam B / nucleon" value={`${lab.system.energyBGeV.toFixed(0)} GeV`} />
              <Metric label="√s_NN" value={`${lab.sqrtSNNTeV.toFixed(3)} TeV`} />
              <Metric label="√s (p–p overlay)" value={`${((2 * beamEnergyGeV) / 1000).toFixed(2)} TeV`} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              For nuclei the relevant collision energy is per nucleon pair. July 2025 p–O used a 6.8 TeV proton against
              3.4 TeV/nucleon oxygen → √s_NN = 9.62 TeV. O–O / Ne–Ne sat at 5.36 TeV.
            </p>
          </Panel>
        </div>
      )}

      {tab === "geometry" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Nuclear overlap">
            <NucleusGeometryCanvas
              a={lab.nucleusA}
              b={lab.nucleusB}
              geometry={lab.geometry}
              labelA={lab.system.projectile}
              labelB={lab.system.target}
            />
          </Panel>
          <Panel title="Glauber diagnostics" meta={<Badge>toy overlap</Badge>}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="b" value={`${lab.geometry.bFm.toFixed(2)} fm`} />
              <Metric label="N_part" value={String(lab.geometry.nPart)} />
              <Metric label="N_coll" value={String(lab.geometry.nColl)} />
              <Metric label="Centrality" value={`${lab.geometry.centrality.toFixed(0)}%`} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Uniform-sphere nucleons, not Woods-Saxon. Participants and binary collisions are estimates for the visual
              twin. Replace with a validated Glauber / T_A T_B sampler for production.
            </p>
          </Panel>
        </div>
      )}

      {tab === "collision" && (
        <Panel className="mt-4" title="Monte Carlo event display">
          {nuclear ? <PoEventCanvas event={lab.last} /> : <EventDisplayCanvas event={focus} />}
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="System" value={lab.system.label} />
            <Metric label="N_ch" value={String(lab.last?.nCh ?? 0)} />
            <Metric label="Σ pT" value={`${(lab.last?.sumPT ?? 0).toFixed(1)} GeV`} />
            <Metric label="Forward E" value={`${(lab.last?.forwardEnergyGeV ?? 0).toFixed(1)} GeV`} />
          </div>
        </Panel>
      )}

      {tab === "detector" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Layer hits (p–p overlay)">
            <DetectorTwinCanvas event={focus} />
          </Panel>
          <Panel title="ATLAS-like fiducial (literature)">
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="pT min" value={`${lab.literature.pTminGeV} GeV`} />
              <Metric label="|η| max" value={String(lab.literature.etaMax)} />
              <Metric label="σ_fid (lit.)" value={`${lab.literature.sigmaFidMb} mb`} />
              <Metric label="L_int (lit.)" value={`${lab.literature.luminosityUb} μb⁻¹`} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{lab.literature.source}</p>
            <p className="mt-2 text-xs text-muted-foreground">{lab.literature.caveat}</p>
          </Panel>
        </div>
      )}

      {tab === "atlas" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="R–z literature cutaway" meta={<Badge>GEOMETRY ≠ DETECTOR</Badge>}>
            <AtlasRzCanvas selectedId={atlasId} eta={atlasEta} />
            <label className="mt-3 block text-xs text-muted-foreground">
              <span className="flex justify-between gap-2">
                Probe η
                <span className="font-mono text-foreground">{atlasEta.toFixed(1)}</span>
              </span>
              <input
                type="range"
                className="mt-2 h-11 w-full accent-primary"
                min={0}
                max={4.5}
                step={0.1}
                value={atlasEta}
                onChange={(e) => setAtlasEta(Number(e.target.value))}
              />
            </label>
            <p className="mt-2 text-xs text-muted-foreground">
              Quarter-cylinder envelopes, not a cavern survey. ZDC at 140 m is off-scale. ITk is not this layout.
            </p>
          </Panel>
          <Panel title="Published envelopes" meta={<Badge tone="danger">LITERATURE</Badge>}>
            <AtlasLayerTable selectedId={atlasId} onSelect={setAtlasId} hits={atlasHits} />
            {atlasPicked ? (
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{atlasPicked.name}.</span> {atlasPicked.role}
              </p>
            ) : null}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Metric label="Mean layers / track" value={atlasCensus.meanLayers.toFixed(1)} />
              <Metric label="PIXEL hits" value={String(atlasCensus.familyTotals.PIXEL)} />
              <Metric label="MUON hits" value={String(atlasCensus.familyTotals.MUON)} />
              <Metric label="Eligible" value="false" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Hits are |η| ≤ layer η_max, not GEANT4. Toy tracks from the nuclear event. LITERATURE_ENVELOPE ≠ SURVEY.
            </p>
          </Panel>
        </div>
      )}

      {tab === "forward" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="LHCf · 140 m from IP">
            <LhcfGeometryCanvas />
            <p className="mt-2 text-xs text-muted-foreground">
              LHCf sits along the beamline to measure near-zero-angle neutrals. That is the collider’s cosmic-ray
              calibration channel — still not an air shower inside the LHC.
            </p>
          </Panel>
          <Panel title="Forward observables">
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Mean forward E" value={`${lab.meanForwardGeV.toFixed(1)} GeV`} />
              <Metric label="Acceptance" value={`${lab.forward.acceptanceMrad} mrad`} />
              <Metric label="ZDC z" value={`${lab.forward.zdcZm} m`} />
              <Metric label="Evidence" value="SIMULATED" />
            </div>
          </Panel>
        </div>
      )}

      {tab === "shower" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Atmospheric cascade">
            <AirShowerCanvas shower={lab.shower} />
          </Panel>
          <Panel title="Ground / composition inputs">
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Target" value={lab.shower.target} />
              <Metric label="Generations" value={String(lab.shower.generations)} />
              <Metric label="Charged" value={String(lab.shower.charged)} />
              <Metric label="Muons" value={String(lab.shower.muons)} />
              <Metric label="Ground flux" value={String(lab.shower.groundFlux)} />
              <Metric label="Xmax" value={`${lab.shower.xMaxGcm2.toFixed(0)} g/cm²`} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Atmosphere N₂ {lab.atmosphere.nitrogen} · O₂ {lab.atmosphere.oxygen} · Ar {lab.atmosphere.argon}. Toy
              cascade, not CORSIKA. Primary {lab.shower.primaryEnergyGeV.toExponential(1)} GeV.
            </p>
          </Panel>
        </div>
      )}

      {tab === "models" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="dN/dη · literature vs toys">
            <DataVsModelCanvas
              literature={lab.literatureEta}
              models={[lab.eta.GEN_A, lab.eta.GEN_B, lab.eta.GEN_C]}
              labels={["A", "B", "C"]}
            />
            <DisagreementCanvas bins={lab.disagreement} />
          </Panel>
          <Panel title="Model quality" meta={<Badge>preference ≠ truth</Badge>}>
            <div className="grid gap-3 sm:grid-cols-3">
              {GENERATORS.map((g) => (
                <Metric
                  key={g.id}
                  label={`${g.name} χ²/ndf`}
                  value={lab.chi2[g.id].toFixed(1)}
                />
              ))}
            </div>
            <p className="mt-3 text-sm">
              Least-disagreeing toy: <strong>{lab.preferredGenerator}</strong>. That is not a hadronic discovery.
            </p>
            <CompareTable rows={lab.compare[lab.preferredGenerator]} label={lab.preferredGenerator} />
            <p className="mt-3 text-xs text-muted-foreground">
              Generators A/B/C are pedagogical stand-ins, not EPOS, QGSJET, or SIBYLL. The published ATLAS result is
              that those real codes disagree with each other while the measurement reaches few-percent precision.
            </p>
          </Panel>
        </div>
      )}

      {tab === "sources" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Primary composition (inferred)" meta={<Badge tone="warn">INFERRED</Badge>}>
            <ul className="space-y-2">
              {lab.composition.hypotheses.map((h) => (
                <li key={h.id} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{h.id}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    P = {h.posterior.toFixed(3)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">{lab.composition.warning}</p>
          </Panel>
          <Panel title="Source hypotheses" meta={<Badge>HYPOTHETICAL</Badge>}>
            <ul className="space-y-1 font-mono text-xs text-muted-foreground">
              {["SUPERNOVA_REMNANT", "ACTIVE_GALACTIC_NUCLEUS", "BLACK_HOLE_ENVIRONMENT", "GALACTIC_ACCELERATOR", "EXTRAGALACTIC_SOURCE", "UNKNOWN"].map(
                (s) => (
                  <li key={s}>{s}</li>
                ),
              )}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Source classes stay hypothetical until the collision and shower models are constrained by real
              observations — not by this sandbox agreeing with itself.
            </p>
          </Panel>
        </div>
      )}

      {tab === "heavy" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Small-system / heavy-ion diagnostics">
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Centrality" value={`${lab.heavyIon.centrality.toFixed(0)}%`} />
              <Metric label="N_part" value={String(lab.heavyIon.participantCount)} />
              <Metric label="N_coll" value={String(lab.heavyIon.binaryCollisionCount)} />
              <Metric label="⟨pT⟩" value={`${lab.heavyIon.meanPt.toFixed(2)} GeV`} />
              <Metric label="v2 (toy)" value={lab.heavyIon.flow.toFixed(3)} />
              <Metric label="Quench frac" value={lab.heavyIon.quenching.toFixed(3)} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              qgpInterpretation = {lab.heavyIon.qgpInterpretation}. One simulated number is not “QGP detected.” 2026
              small-system jet-quenching papers are the literature path; this slider is a diagnostic.
            </p>
          </Panel>
          <Panel title="Jet energy-loss branch" meta={<Badge>DIAGNOSTIC</Badge>}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Jet pT init" value={`${lab.jet.jetPtInitial.toFixed(0)} GeV`} />
              <Metric label="Jet pT final" value={`${lab.jet.jetPtFinal.toFixed(1)} GeV`} />
              <Metric label="ΔE" value={`${lab.jet.energyLoss.toFixed(1)} GeV`} />
              <Metric label="Reference" value={lab.jet.referenceSystem} />
            </div>
          </Panel>
        </div>
      )}

      {tab === "reconstruct" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Literature response" meta={<Badge>GEOMETRY ≠ RESPONSE</Badge>}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="μ" value={String(atlasReco.nMuon)} />
              <Metric label="e" value={String(atlasReco.nElectron)} />
              <Metric label="γ" value={String(atlasReco.nPhoton)} />
              <Metric label="jets" value={String(atlasReco.nJet)} />
              <Metric label="Σ ET" value={`${atlasReco.sumET.toFixed(0)} GeV`} />
              <Metric label="Fake MET" value={`${atlasReco.met.toFixed(1)} GeV`} />
              <Metric label="⟨EM frac⟩" value={atlasReco.meanEmFrac.toFixed(2)} />
              <Metric label="Eligible" value="false" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{atlasReco.note}</p>
            {focus && !nuclear ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Overlay reco still reports {focus.reconstruction.leptonCount} leptons / {focus.reconstruction.jetCount}{" "}
                jets. That older 4-boolean cartoon is not this smear.
              </p>
            ) : null}
          </Panel>
          <Panel title="EM vs hadronic deposits" meta={<Badge tone="danger">SIMULATED</Badge>}>
            <AtlasDepositCanvas objects={atlasReco.objects} />
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[22rem] text-left text-sm">
                <thead className="font-mono text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2">ID</th>
                    <th>pT truth</th>
                    <th>pT meas.</th>
                    <th>EM</th>
                    <th>HAD</th>
                  </tr>
                </thead>
                <tbody>
                  {atlasReco.objects.slice(0, 8).map((o) => (
                    <tr key={o.id} className="border-t border-border font-mono text-xs">
                      <td className="py-2">{o.idGuess}</td>
                      <td>{o.truthPT.toFixed(1)}</td>
                      <td>{o.measuredPT.toFixed(1)}</td>
                      <td>{o.emGeV.toFixed(1)}</td>
                      <td>{o.hadGeV.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Fake MET is residual of smearing, not missing energy from a new particle. RESPONSE ≠ OBSERVATION. SMEARING ≠
              CALIBRATION.
            </p>
          </Panel>
        </div>
      )}

      {tab === "spectrum" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Invariant mass" meta={<Badge tone="info">DERIVED</Badge>}>
            <SpectrumCanvas
              bins={run.mass}
              unit="m_ll / m_γγ  [GeV]"
              markers={[
                { x: 91.2, label: "Z" },
                { x: 125.3, label: "H" },
              ]}
            />
          </Panel>
          <Panel title="Joint likelihood" meta={<Badge>not discovery</Badge>}>
            <table className="w-full text-left text-sm">
              <thead className="font-mono text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Hypothesis</th>
                  <th>log L</th>
                </tr>
              </thead>
              <tbody>
                {COLLIDER_HYPOTHESES.map((h) => (
                  <tr key={h} className="border-t border-border font-mono text-xs">
                    <td className={cn("py-2", h === inf.preferred && "text-foreground")}>{h}</td>
                    <td>{(inf.logL[h] ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted-foreground">
              Likelihood preference inside a sandbox is not a resonance discovery. Run state {inf.researchRun.state}.
            </p>
          </Panel>
        </div>
      )}

      {tab === "quantum" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Spin correlation">
            <QuantumCanvas event={focus} />
          </Panel>
          <Panel title="Density diagnostics">
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Correlation" value={focus ? focus.quantum.correlation.toFixed(4) : "—"} />
              <Metric label="Purity" value={focus ? focus.quantum.purity.toFixed(4) : "—"} />
              <Metric label="Entropy" value={focus ? focus.quantum.entropy.toFixed(4) : "—"} />
              <Metric label="CHSH S" value={focus ? focus.quantum.chsh.toFixed(4) : "—"} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Entangled mode plants a spin-singlet-like pair. CHSH above 2 here is a drawing, not a loophole-free Bell
              test. The biphoton holography prototype is a separate lab —{" "}
              <Link to="/qcorr" className="underline">
                open QCORR
              </Link>
              . It does not replace this spin panel, and it does not image a hadron wavefunction.
            </p>
          </Panel>
        </div>
      )}

      {tab === "missing" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Missing transverse momentum">
            <SpectrumCanvas bins={run.met} unit="MET [GeV]" />
          </Panel>
          <Panel title="Invisible search" meta={<Badge tone="warn">HYPOTHETICAL</Badge>}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Mean MET" value={`${run.meanMET.toFixed(1)} GeV`} />
              <Metric label="S / √B" value={run.significance.toFixed(3)} />
              <Metric label="H4_DM_MET log L" value={(inf.logL.H4_DM_MET ?? 0).toFixed(2)} />
              <Metric label="H0_QCD log L" value={(inf.logL.H0_QCD ?? 0).toFixed(2)} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Dark-matter injection adds invisible four-vectors. The TPC lab is a different search — this MET channel
              does not duplicate it.
            </p>
          </Panel>
        </div>
      )}

      {tab === "evidence" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Cosmic evidence chain" meta={<Badge tone="danger">CLAIM REJECTED</Badge>}>
            <ColliderEvidenceSvg graph={lab.graph} />
            <ul className="mt-3 space-y-1 font-mono text-xs text-muted-foreground">
              {lab.graphErrors.slice(0, 6).map((err) => (
                <li key={err}>{err}</li>
              ))}
              {lab.graphErrors.length === 0 ? (
                <li>Graph intact. Literature calibrates. Simulation still cannot support a claim.</li>
              ) : null}
            </ul>
          </Panel>
          <Panel title="Firewall">
            <ul className="space-y-1 font-mono text-xs">
              {Object.entries(lab.firewall).map(([k, v]) => (
                <li key={k} className="flex justify-between gap-2 border-b border-border py-1">
                  <span>{k}</span>
                  <span className={v && k === "discoveryEligible" ? "text-danger" : "text-muted-foreground"}>
                    {String(v)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              SIMULATED cannot automatically become OBSERVED. Only an external experimental dataset creates an OBSERVED
              node.
            </p>
          </Panel>
        </div>
      )}

      {tab === "ledger" && (
        <Panel className="mt-4" title="Experiment package">
          <p className="font-mono text-xs text-muted-foreground">
            {lab.schema} · {lab.packageHash} · ledger {lab.ledger.terminal}
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="font-mono text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Seq</th>
                  <th>Kind</th>
                  <th>Ref</th>
                  <th>State</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {lab.ledger.entries.map((e) => (
                  <tr key={e.seq} className="border-t border-border font-mono text-xs">
                    <td className="py-2">{e.seq}</td>
                    <td>{e.kind}</td>
                    <td>{e.ref}</td>
                    <td>{e.state}</td>
                    <td className="max-w-[16rem] truncate">{e.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === "gate" && (
        <Panel className="mt-4" title="Discovery gate" meta={<Badge tone="danger">CLOSED</Badge>}>
          <p className="text-sm text-muted-foreground">
            Nuclear lab {lab.state} · p–p overlay {inf.researchRun.state} / {inf.researchRun.dataState}. Approximate Z is
            a development diagnostic. ANOMALY != DISCOVERY. A p–O literature calibration does not unblind this twin.
          </p>
          <ul className="mt-3 space-y-1 font-mono text-xs text-danger">
            {lab.blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="destructive" onClick={onDeclare}>
              Declare SCI:DISC
            </Button>
            <Button variant="outline" onClick={onActuate}>
              Actuate beam
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
