import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FluidCanvas } from "@/components/physics/fluid-canvas";
import { S2S1Canvas, Spacetime2DCanvas, TpcCanvas } from "@/components/omega/dark-matter-charts";
import { PageHeader, Panel, Stat } from "@/components/omega/panel";
import { VoiceConsole } from "@/components/omega/voice-console";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FabricCanvas, type FabricPick } from "@/components/visuals/fabric-canvas";
import { FusionStage } from "@/components/visuals/fusion-stage";
import { DEFAULT_DETECTOR, DEFAULT_DM, DEFAULT_HALO } from "@/lib/omega/dark-matter/engine";
import { composeLabRun } from "@/lib/omega/dark-matter/research-engine";
import { FUSION_DIMS, type FusionDim } from "@/lib/omega/fusion-template";
import { PLANES, type CameraPreset, type Plane4, type VisualMode, type VisualSubject } from "@/lib/omega/spacetime";
import { useOmegaStore } from "@/lib/omega/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/visuals")({ component: VisualsPage });

function VisualsPage() {
  const [mode, setMode] = useState<VisualMode>("3D");
  const [subject, setSubject] = useState<VisualSubject | "FUSION">("FUSION");
  const [fusionDim, setFusionDim] = useState<FusionDim>("2D");
  const [scrub, setScrub] = useState(0.42);
  const [spinning, setSpinning] = useState(true);
  const [planeA, setPlaneA] = useState<Plane4>("XW");
  const [planeB, setPlaneB] = useState<Plane4>("YW");
  const [sliceY, setSliceY] = useState(0.5);
  const [slabWidth, setSlabWidth] = useState(0.28);
  const [preset, setPreset] = useState<CameraPreset>("ISO");
  const [pick, setPick] = useState<FabricPick | null>(null);
  const fault = useOmegaStore((s) => s.physicsFault);
  const dm = useOmegaStore((s) => s.darkMatter);
  const voiceFocus = useOmegaStore((s) => s.voiceFocus);
  const voiceSpeaker = useOmegaStore((s) => s.voiceSpeaker);

  const lab = useMemo(
    () =>
      composeLabRun({
        detector: { ...DEFAULT_DETECTOR, exposureDays: dm.exposureDays, fiducialMassKg: dm.fiducialMassKg },
        dm: { ...DEFAULT_DM, massGeV: dm.massGeV, crossSectionCm2: 10 ** dm.log10Sigma },
        halo: DEFAULT_HALO,
        seed: dm.seed,
      }),
    [dm.exposureDays, dm.fiducialMassKg, dm.massGeV, dm.log10Sigma, dm.seed],
  );

  const detector = { ...DEFAULT_DETECTOR, exposureDays: dm.exposureDays, fiducialMassKg: dm.fiducialMassKg };
  const classLabel = pick ? (pick.classId === 0 ? "NR_LIKE" : pick.classId === 1 ? "ER_LIKE" : "VETOED") : null;

  return (
    <div>
      <PageHeader
        kicker="Visual fabric · 2D through XR"
        title="The plates are templates"
        description="The fusion posters set the 2D boards, the 3D spheres, the 4D storyboard, the 5D energy class, the 6D charge and overlap gate, and the XR stereo plate. None of those views is a measurement."
        actions={
          <>
            <Button variant={spinning ? "outline" : "default"} onClick={() => setSpinning((v) => !v)}>
              {spinning ? "Hold 4-rotation" : "Rotate 4-space"}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/voice">Agent voice</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Mode" value={subject === "FUSION" ? fusionDim : mode} hint={subject === "FUSION" ? "poster template" : mode === "4D" ? `${planeA} then ${planeB}` : mode === "3D" ? "volume + orbit" : "slice"} />
        <Stat label="Events" value={lab.events.length} hint="SCI:SIMULATED" />
        <Stat label="Time slab" value={`${(scrub * 365).toFixed(0)} d`} hint="4D window center" />
        <Stat
          label="Voice focus"
          value={voiceSpeaker ?? "idle"}
          hint={voiceFocus ? `camera → ${voiceFocus}` : "speech is A2"}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setSubject("FUSION")}
          className={cn(
            "h-11 rounded-md px-3 text-sm",
            subject === "FUSION" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60",
          )}
        >
          Fusion plates
        </button>
        {(["COOLING", "TPC", "SPACETIME"] as VisualSubject[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSubject(s)}
            className={cn(
              "h-11 rounded-md px-3 text-sm",
              subject === s ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60",
            )}
          >
            {s === "COOLING" ? "T-14 loop" : s === "TPC" ? "Xe TPC" : "Spacetime"}
          </button>
        ))}
      </div>

      {subject === "FUSION" ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {FUSION_DIMS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFusionDim(item)}
              className={cn(
                "h-11 min-w-11 rounded-md px-4 text-sm",
                fusionDim === item ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1">
          {(["2D", "3D", "4D"] as VisualMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "h-11 min-w-11 rounded-md px-4 text-sm",
                mode === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {subject !== "FUSION" && mode !== "2D" ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {(["ISO", "TPC", "T14", "4D"] as CameraPreset[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              className={cn(
                "h-11 rounded-md px-3 text-xs",
                preset === p ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent/60",
              )}
            >
              {p === "ISO" ? "Isometric" : p === "TPC" ? "Look TPC" : p === "T14" ? "Look T-14" : "Look 4-space"}
            </button>
          ))}
        </div>
      ) : null}

      {subject !== "FUSION" && mode === "4D" ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {PLANES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPlaneA(p);
                setPlaneB(p === "XW" ? "YW" : p === "YW" ? "ZW" : p === "ZW" ? "XW" : "XW");
              }}
              className={cn(
                "h-11 rounded-md px-3 font-mono text-xs",
                planeA === p ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent/60",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      ) : null}

      <Panel
        className="mt-4"
        title={
          subject === "FUSION"
            ? `Fusion template · ${fusionDim}`
            : mode === "2D"
            ? subject === "COOLING"
              ? "DigiSim field (2D)"
              : subject === "TPC"
                ? "TPC planes (2D)"
                : "Worldline slices (r,t) and (z,t)"
            : mode === "3D"
              ? "Volume — orbit to inspect"
              : "4D projection — tesseract + time slab"
        }
        meta={<Badge tone="info">{fault}</Badge>}
      >
        {subject === "FUSION" ? <FusionStage dim={fusionDim} /> : null}
        {subject !== "FUSION" && mode === "2D" && subject === "COOLING" ? <FluidCanvas /> : null}
        {subject !== "FUSION" && mode === "2D" && subject === "TPC" ? (
          <div className="grid min-w-0 gap-3 lg:grid-cols-2">
            <TpcCanvas events={lab.events} radiusM={detector.radiusM} heightM={detector.heightM} sliceZ={sliceY} />
            <S2S1Canvas events={lab.events} />
          </div>
        ) : null}
        {subject !== "FUSION" && mode === "2D" && subject === "SPACETIME" ? (
          <div className="grid min-w-0 gap-3 lg:grid-cols-2">
            <Spacetime2DCanvas events={lab.events} scrub={scrub} axis="RT" />
            <Spacetime2DCanvas events={lab.events} scrub={scrub} axis="ZT" />
          </div>
        ) : null}
        {subject !== "FUSION" && mode !== "2D" ? (
          <FabricCanvas
            mode={mode}
            subject={subject}
            events={lab.events}
            radiusM={detector.radiusM}
            heightM={detector.heightM}
            fault={fault}
            scrub={scrub}
            spinning={spinning}
            planeA={planeA}
            planeB={planeB}
            sliceY={sliceY}
            slabWidth={slabWidth}
            preset={preset}
            voiceFocus={voiceFocus}
            onPick={setPick}
          />
        ) : null}

        {subject !== "FUSION" && (mode === "3D" || (mode === "2D" && subject === "TPC")) ? (
          <label className="mt-3 block text-xs text-muted-foreground">
            <span className="flex justify-between">
              Height slice
              <span className="font-mono text-foreground">{((sliceY * 2 - 1) * detector.heightM * 0.5).toFixed(2)} m</span>
            </span>
            <input
              type="range"
              className="mt-2 h-11 w-full accent-primary"
              min={0}
              max={1}
              step={0.01}
              value={sliceY}
              onChange={(e) => setSliceY(Number(e.target.value))}
            />
          </label>
        ) : null}

        {subject !== "FUSION" && (mode === "4D" || (mode === "2D" && subject === "SPACETIME")) ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-muted-foreground">
              <span className="flex justify-between">
                Time hyperplane
                <span className="font-mono text-foreground">{(scrub * 365.25).toFixed(0)} day</span>
              </span>
              <input
                type="range"
                className="mt-2 h-11 w-full accent-primary"
                min={0}
                max={1}
                step={0.01}
                value={scrub}
                onChange={(e) => setScrub(Number(e.target.value))}
              />
            </label>
            {mode === "4D" ? (
              <label className="block text-xs text-muted-foreground">
                <span className="flex justify-between">
                  Slab width
                  <span className="font-mono text-foreground">{slabWidth.toFixed(2)}</span>
                </span>
                <input
                  type="range"
                  className="mt-2 h-11 w-full accent-primary"
                  min={0.08}
                  max={0.9}
                  step={0.01}
                  value={slabWidth}
                  onChange={(e) => setSlabWidth(Number(e.target.value))}
                />
              </label>
            ) : null}
          </div>
        ) : null}

        {pick ? (
          <p className="mt-3 font-mono text-xs text-foreground">
            Picked {classLabel} · {pick.energy.toFixed(1)} keV · day {pick.day.toFixed(0)}
            {pick.signal ? " · injected SI" : ""} · still SCI:SIMULATED
          </p>
        ) : null}
        <p className="mt-3 text-xs text-muted-foreground">
          Green NR-like, blue ER-like, red vetoed. 4D colors events by day. Drag to orbit — no WASD. Click a point to
          inspect. Voice from the briefing steers the camera. This is a picture of a simulation.
        </p>
      </Panel>

      <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel title="What each extra dimension adds">
          {subject === "FUSION" ? (
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li><span className="text-foreground">2D</span> — the poster plates, plus the reaction plane.</li>
              <li><span className="text-foreground">3D</span> — the same particles, orbitable.</li>
              <li><span className="text-foreground">4D</span> — storyboard time: approach, overlap, exchange, scatter, bind or reject.</li>
              <li><span className="text-foreground">5D</span> — energy class: rest, above rest, below rest.</li>
              <li><span className="text-foreground">6D</span> — charge residual and overlap. Both must clear before the template fuses.</li>
              <li><span className="text-foreground">XR</span> — a stereo plate. No headset is started.</li>
            </ul>
          ) : (
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>
              <span className="text-foreground">2D</span> — a cut. Cooling dye plus velocity arrows, S2/S1, or paired
              (r,t) and (z,t) worldlines. Easy to read. Easy to lie with.
            </li>
            <li>
              <span className="text-foreground">3D</span> — xenon volume, PMT planes, field-cage rings, T-14 body and
              oil loop. Height slice fades events off the plane. Fiducial is a dashed cylinder, not containment.
            </li>
            <li>
              <span className="text-foreground">4D</span> — time is an axis. Recoils become a world-tube. Rotate XW /
              YW / ZW. A pretty 5σ-looking cluster in a slab can vanish when you rotate w.
            </li>
          </ul>
          )}
        </Panel>
        <VoiceConsole compact />
      </div>
    </div>
  );
}
