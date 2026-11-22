import { useEffect, useState } from "react";
import { SynthesisCanvas } from "@/components/visuals/synthesis-canvas";
import ledgerJson from "@/lib/omega/engine05/ledger.json";
import { ENERGY_CLASS, FUSION_STEPS, fusionPose, type FusionDim } from "@/lib/omega/fusion-template";
import { synthesisFrame } from "@/lib/omega/synthesis";

const PLATES = [
  { src: "/templates/fusion-states.png", title: "State plate", note: "Free, reactive, and bound frames." },
  { src: "/templates/sqrt01-board.png", title: "SQRT-01 plate", note: "Storyboard and printed benchmark. Not the ledger." },
] as const;

export function FusionStage({ dim }: { dim: FusionDim }) {
  const [step, setStep] = useState(0);
  const [energyClass, setEnergyClass] = useState(0);
  const [charge, setCharge] = useState(0.8);
  const [overlap, setOverlap] = useState(0.15);
  const [spin, setSpin] = useState(18);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const pose = fusionPose(step, energyClass, charge, overlap);
  const frame = synthesisFrame({ step, energyClass, charge, overlap, time, yaw: (spin * Math.PI) / 180 });
  const ledger = ledgerJson.reference_h_over_a_0_0025.energy_eV;
  const showEnergy = dim === "5D" || dim === "6D" || dim === "XR";
  const showQuantum = dim === "6D" || dim === "XR";
  const eyes = dim === "XR" ? ([-0.14, 0.14] as const) : ([0] as const);

  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frameId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setTime((value) => value + dt);
      setStep((value) => {
        const next = value + dt * 0.42;
        if (next >= 4) {
          setPlaying(false);
          return 4;
        }
        return next;
      });
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [playing]);

  return (
    <div className="grid min-w-0 gap-4">
      <div className={dim === "XR" ? "grid min-w-0 gap-3 sm:grid-cols-2" : "grid min-w-0"}>
        {eyes.map((offset) => (
          <SynthesisCanvas
            key={offset}
            step={step}
            energyClass={energyClass}
            charge={charge}
            overlap={overlap}
            time={time}
            yaw={(spin * Math.PI) / 180 + offset}
            eye={dim === "XR" ? (offset < 0 ? "Left eye" : "Right eye") : undefined}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="h-11 rounded-md bg-primary px-4 text-sm text-primary-foreground"
          onClick={() => {
            if (playing) {
              setPlaying(false);
              return;
            }
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (reduce) {
              setStep((value) => (value >= 4 ? 0 : Math.min(4, Math.floor(value) + 1)));
              setTime((value) => value + 0.4);
              return;
            }
            if (step >= 4) setStep(0);
            setPlaying(true);
          }}
        >
          {playing ? "Hold synthesis" : "Run synthesis"}
        </button>
        <p className="font-mono text-xs text-foreground">
          {frame.reaction} · products {frame.products} · template yield {frame.templateYield.toFixed(2)}
        </p>
      </div>

      {dim === "2D" ? (
        <div className="grid min-w-0 gap-3">
          {PLATES.map((plate) => (
            <figure key={plate.src} className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
              <img src={plate.src} alt={plate.title} className="block h-auto w-full" />
              <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                <span className="text-foreground">{plate.title}.</span> {plate.note}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-muted-foreground">
          <span className="flex justify-between">
            Storyboard time
            <span className="font-mono text-foreground">{FUSION_STEPS[Math.min(4, Math.round(step))]?.label}</span>
          </span>
          <input
            className="mt-2 h-11 w-full accent-primary"
            type="range"
            min={0}
            max={4}
            step={0.01}
            value={step}
            onChange={(event) => setStep(Number(event.target.value))}
          />
        </label>
        {dim === "2D" ? (
          <p className="self-end text-xs text-muted-foreground">2D is the reaction plane. Orbit starts at 3D. Charge and overlap open at 6D.</p>
        ) : (
          <label className="block text-xs text-muted-foreground">
            <span className="flex justify-between">
              Orbit
              <span className="font-mono text-foreground">{spin.toFixed(0)}°</span>
            </span>
            <input
              className="mt-2 h-11 w-full accent-primary"
              type="range"
              min={0}
              max={360}
              value={spin}
              onChange={(event) => setSpin(Number(event.target.value))}
            />
          </label>
        )}
        {showEnergy
          ? ENERGY_CLASS.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setEnergyClass(index)}
                className={
                  index === energyClass
                    ? "h-11 rounded-md bg-primary px-3 text-sm text-primary-foreground"
                    : "h-11 rounded-md bg-secondary px-3 text-sm text-muted-foreground"
                }
              >
                {item.label}
              </button>
            ))
          : null}
        {showQuantum ? (
          <>
            <label className="block text-xs text-muted-foreground">
              <span className="flex justify-between">
                Charge residual
                <span className="font-mono text-foreground">{charge.toFixed(2)}</span>
              </span>
              <input
                className="mt-2 h-11 w-full accent-primary"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={charge}
                onChange={(event) => setCharge(Number(event.target.value))}
              />
            </label>
            <label className="block text-xs text-muted-foreground">
              <span className="flex justify-between">
                Overlap
                <span className="font-mono text-foreground">{overlap.toFixed(2)}</span>
              </span>
              <input
                className="mt-2 h-11 w-full accent-primary"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={overlap}
                onChange={(event) => setOverlap(Number(event.target.value))}
              />
            </label>
          </>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground">
        {frame.note} {pose.reason}
      </p>
      <p className="text-xs text-muted-foreground">
        Blue and amber clouds are the two reactants. Pale sparks are simulated products. The SQRT-01 plate prints 4.854 eV.
        Engine 05’s archived Gaussian ground state is {ledger.toFixed(6)} eV. This run is not that solve and not a fusion measurement.
        {dim === "XR" ? " XR is a stereo plate. No headset session is opened." : ""}
      </p>
    </div>
  );
}
