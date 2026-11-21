import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Stat } from "@/components/omega/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adaptiveEigenvalue, type RefinementResult } from "@/lib/omega/engine05/adaptive";
import ledgerJson from "@/lib/omega/engine05/ledger.json";
import validationJson from "@/lib/omega/engine05/validation-status.json";
import { ENGINE05_NAME, ENGINE05_VERSION, GAUSSIAN_BENCHMARK, solveBoundState, type BoundState } from "@/lib/omega/engine05/numerov";

export const Route = createFileRoute("/_app/engine05")({ component: Engine05Page });

type GridRow = {
  h_over_a: number;
  energy_eV: number;
  archived_energy_eV: number;
  absolute_difference_eV: number;
  nodes: number;
  mean_radius_pm: number;
  tail_probability: number;
  potential_evaluations: number;
};

type Ledger = {
  content_sha256: string;
  experimental_validation: boolean;
  repository_publication: boolean;
  epistemic_status: Record<string, string>;
  pytest?: { exit_code: number; passed: boolean; summary: string };
  constants: { g: number; Es_eV: number };
  archived_reference_energy_eV: number;
  grid_convergence: GridRow[];
  reference_h_over_a_0_0025: GridRow;
  adaptive: {
    energy_eV: number;
    estimated_error_eV: number;
    relative_error: number;
    iterations: number;
    converged: boolean;
    potential_evaluations: number;
    history: Array<{
      iteration: number;
      step_size: number;
      q: number;
      richardson_energy: number;
      estimated_error: number;
      relative_error: number;
    }>;
    comparison: {
      fixed_h_0_000625_potential_evaluations: number;
      adaptive_potential_evaluations: number;
      ratio_adaptive_over_fine_fixed: number;
    };
  };
  variational: {
    recomputed: { sigma_pm: number; energy_eV: number };
    at_archived_width: { sigma_pm: number; energy_eV: number; archived_energy_eV: number };
  };
  limitations: string[];
  legs?: {
    energy_eV: number;
    estimated_error_eV: number;
    relative_error: number;
    n_out: number;
    n_in: number;
    h_out: number;
    h_in: number;
    iterations: number;
    converged: boolean;
    potential_evaluations: number;
    reference_difference_eV: number;
    note: string;
  };
  variable_step?: {
    energy_eV: number;
    reference_difference_eV: number;
    h_inner: number;
    h_outer: number;
    step_ratio: number;
    local_order_when_ratio_is_one: number;
    local_order_when_ratio_changes: number;
    note: string;
  };
  nonuniform_grid?: {
    runs: Array<{
      n_internal: number;
      max_error: number;
      finite_difference_max_error: number;
      reduction_ratio: number | null;
      observed_order?: number | null;
    }>;
    note: string;
  };
};

const LEDGER = ledgerJson as Ledger;
const VALIDATION = validationJson as {
  scientific_release_status: string;
  experimental_validation: boolean;
  pytest?: { summary: string };
  reference_numerov: { energy_eV: number; nodes: number };
  ode: { energy_eV: number; difference_from_numerov_eV: number };
  matrix: { h_0_01_eV: number };
  wavefunction: { overlap_with_matrix: number | null; nodes: number };
  sweep: Array<{ match_over_a: number; nodes: number | null; status: string }>;
  note: string;
};

function Engine05Page() {
  const [tick, setTick] = useState(0);
  const [browserAdaptive, setBrowserAdaptive] = useState<RefinementResult | null>(null);
  const [adaptiveError, setAdaptiveError] = useState<string | null>(null);
  const live = useMemo(() => solveBoundState(GAUSSIAN_BENCHMARK, 0.0025), [tick]);
  const ledgerEnergy = LEDGER.reference_h_over_a_0_0025.energy_eV;
  const browserDelta = live.energyEv - ledgerEnergy;
  const agrees = Math.abs(browserDelta) < 1e-9;

  function runAdaptive() {
    setAdaptiveError(null);
    try {
      const result = adaptiveEigenvalue((step) => solveBoundState(GAUSSIAN_BENCHMARK, step).energyEv, {
        initialStep: 0.02,
        relativeTolerance: 1e-6,
        energyScale: 1,
        minStep: 1e-4,
        maxIterations: 8,
      });
      setBrowserAdaptive(result);
    } catch (error) {
      setBrowserAdaptive(null);
      setAdaptiveError(error instanceof Error ? error.message : "Refinement failed");
    }
  }

  return (
    <div>
      <PageHeader
        kicker={`${ENGINE05_NAME} · ${ENGINE05_VERSION}`}
        title="Bound-state Numerov"
        description="Gaussian two-body ground state. Fixed-step Numerov is the reference. Equation (8) of Vigo-Aguiar and Ramos (2005) is a separate variable-step recurrence. A calculation, not a measurement."
        actions={
          <>
            <Button onClick={() => setTick((value) => value + 1)}>Recompute ground state</Button>
            <Button variant="outline" onClick={runAdaptive}>
              Run browser refinement
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone={LEDGER.pytest?.passed ? "ok" : "warn"}>
          {LEDGER.pytest?.passed ? `Pytest ${LEDGER.pytest.summary}` : "Pytest not recorded"}
        </Badge>
        <Badge tone={agrees ? "ok" : "danger"}>{agrees ? "Browser matches ledger" : "Browser disagrees"}</Badge>
        <Badge tone="warn">Not experimentally validated</Badge>
        <Badge>No repository claim</Badge>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Browser eigenvalue" value={`${live.energyEv.toFixed(10)} eV`} hint="h/a = 0.0025" />
        <Stat
          label="Ledger difference"
          value={`${browserDelta.toExponential(1)} eV`}
          hint="browser minus Python record"
        />
        <Stat label="Archived prototype" value={`${LEDGER.archived_reference_energy_eV.toFixed(10)} eV`} hint="not a measurement" />
        <Stat label="Coupling g" value={live.g.toFixed(8)} hint={`Es ${live.esEv.toExponential(4)} eV`} />
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <Panel
          title="Radial wavefunction"
          meta={<Badge tone="info">{live.nodes} nodes</Badge>}
        >
          <WaveCanvas state={live} />
          <p className="mt-3 text-sm text-muted-foreground">
            Solid curve is the normalized radial function u(r). Dashed curve is V/V0. The mark is the classical turning point.
            Mean radius {live.meanRadiusPm.toFixed(3)} pm. Probability beyond the turning point {live.tailProbability.toFixed(4)}.
          </p>
        </Panel>
        <Panel title="What this is not">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Computation is not observation.</li>
            <li>The archived eigenvalue is a cited numerical prototype, left unchanged.</li>
            <li>The variational Gaussian is an upper bound, not the exact level.</li>
            <li>A finer grid is not experimental confirmation.</li>
            <li>Coordinate mapping and the WKB hybrid are not in this build.</li>
            <li>The 2005 variable-step panel is not the Woods–Saxon table. The 2021 panel is a different method and not a Gaussian eigenvalue.</li>
          </ul>
        </Panel>
      </div>

      <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
        <Panel title="Python grid ledger" meta={<Badge>executed</Badge>}>
          <div className="overflow-x-auto">
            <table className="w-max text-left font-mono text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3 font-medium">h/a</th>
                  <th className="py-2 pr-3 font-medium">Energy eV</th>
                  <th className="py-2 pr-3 font-medium">Minus archive</th>
                  <th className="py-2 font-medium">V calls</th>
                </tr>
              </thead>
              <tbody>
                {LEDGER.grid_convergence.map((row) => (
                  <tr key={row.h_over_a} className="border-t border-border">
                    <td className="py-2 pr-3 tabular-nums">{row.h_over_a}</td>
                    <td className="py-2 pr-3 tabular-nums">{row.energy_eV.toFixed(12)}</td>
                    <td className="py-2 pr-3 tabular-nums">{row.absolute_difference_eV.toExponential(1)}</td>
                    <td className="py-2 tabular-nums">{row.potential_evaluations.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Richardson refinement" meta={<Badge tone={LEDGER.adaptive.converged ? "ok" : "warn"}>05-B</Badge>}>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <Stat label="Extrapolated" value={`${LEDGER.adaptive.energy_eV.toFixed(10)} eV`} hint={`${LEDGER.adaptive.iterations} iterations`} />
            <Stat
              label="Counted V-call ratio"
              value={LEDGER.adaptive.comparison.ratio_adaptive_over_fine_fixed.toFixed(3)}
              hint="adaptive / fixed h/a=0.000625"
            />
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            That ratio is one measured comparison. It is not a guaranteed 3–5× saving. The controller exponent is 1/4 because the error being controlled is global and fourth order.
          </p>
          <div className="overflow-x-auto">
            <table className="w-max text-left font-mono text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3 font-medium">Step</th>
                  <th className="py-2 pr-3 font-medium">q</th>
                  <th className="py-2 font-medium">Relative error</th>
                </tr>
              </thead>
              <tbody>
                {LEDGER.adaptive.history.map((row) => (
                  <tr key={row.iteration} className="border-t border-border">
                    <td className="py-2 pr-3 tabular-nums">{row.step_size.toFixed(5)}</td>
                    <td className="py-2 pr-3 tabular-nums">{row.q.toFixed(3)}</td>
                    <td className="py-2 tabular-nums">{row.relative_error.toExponential(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {browserAdaptive ? (
            <p className="mt-3 text-sm text-foreground">
              Browser refinement: {browserAdaptive.energy.toFixed(10)} eV, relative error {browserAdaptive.relativeError.toExponential(2)}, converged.
            </p>
          ) : null}
          {adaptiveError ? <p className="mt-3 text-sm text-destructive">{adaptiveError}</p> : null}
        </Panel>
      </div>

      {LEDGER.legs ? (
        <div className="mt-4">
          <Panel
            title="Independent legs"
            meta={<Badge tone={LEDGER.legs.converged ? "ok" : "warn"}>05-D</Badge>}
          >
            <div className="mb-3 grid gap-3 sm:grid-cols-3">
              <Stat label="Combined energy" value={`${LEDGER.legs.energy_eV.toFixed(10)} eV`} hint={`${LEDGER.legs.iterations} frozen search${LEDGER.legs.iterations === 1 ? "" : "es"}`} />
              <Stat label="Minus fixed-step" value={`${LEDGER.legs.reference_difference_eV.toExponential(1)} eV`} hint="same Gaussian benchmark" />
              <Stat label="Leg steps" value={`${LEDGER.legs.n_out} / ${LEDGER.legs.n_in}`} hint={`h ${LEDGER.legs.h_out.toFixed(4)} and ${LEDGER.legs.h_in.toFixed(4)}`} />
            </div>
            <p className="text-sm text-muted-foreground">{LEDGER.legs.note}</p>
          </Panel>
        </div>
      ) : null}

      {LEDGER.variable_step ? (
        <div className="mt-4">
          <Panel title="Variable-step recurrence" meta={<Badge tone="info">05-E</Badge>}>
            <div className="mb-3 grid gap-3 sm:grid-cols-3">
              <Stat label="Two-zone energy" value={`${LEDGER.variable_step.energy_eV.toFixed(10)} eV`} hint="equation (8), frozen mesh" />
              <Stat label="Minus fixed-step" value={`${LEDGER.variable_step.reference_difference_eV.toExponential(1)} eV`} hint={`ratio ${LEDGER.variable_step.step_ratio.toFixed(0)} at the zone boundary`} />
              <Stat label="Local order" value={`${LEDGER.variable_step.local_order_when_ratio_is_one} / ${LEDGER.variable_step.local_order_when_ratio_changes}`} hint="equal step, then a changed step" />
            </div>
            <p className="text-sm text-muted-foreground">{LEDGER.variable_step.note}</p>
          </Panel>
        </div>
      ) : null}

      {LEDGER.nonuniform_grid ? (
        <div className="mt-4">
          <Panel title="Nonuniform-grid system" meta={<Badge tone="info">05-F</Badge>}>
            <div className="mb-3 grid gap-3 sm:grid-cols-2">
              {LEDGER.nonuniform_grid.runs.map((run) => (
                <Stat
                  key={run.n_internal}
                  label={`${run.n_internal} nodes`}
                  value={run.max_error.toExponential(2)}
                  hint={
                    run.reduction_ratio == null
                      ? `finite difference ${run.finite_difference_max_error.toExponential(2)}`
                      : `ratio ${run.reduction_ratio.toFixed(1)}×${
                          run.observed_order == null ? "" : `, measured order ${run.observed_order.toFixed(2)}`
                        }, formal order not assigned`
                  }
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{LEDGER.nonuniform_grid.note}</p>
          </Panel>
        </div>
      ) : null}

      <div className="mt-4">
        <Panel
          title="Validation"
          meta={<Badge tone="warn">{VALIDATION.scientific_release_status.replaceAll("_", " ")}</Badge>}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Fixed-step ground state" value={`${VALIDATION.reference_numerov.energy_eV.toFixed(10)} eV`} hint={`${VALIDATION.reference_numerov.nodes} nodes`} />
            <Stat label="DOP853 minus Numerov" value={`${VALIDATION.ode.difference_from_numerov_eV.toExponential(2)} eV`} hint="match r/a = 0.17" />
            <Stat label="Matrix overlap" value={VALIDATION.wavefunction.overlap_with_matrix?.toFixed(6) ?? "not run"} hint={`${VALIDATION.matrix.h_0_01_eV.toFixed(6)} eV at h/a = 0.01`} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {VALIDATION.sweep.filter((row) => row.status === "COMPUTED" && row.nodes === 0).length} ground-state rows.
            {" "}
            {VALIDATION.sweep.filter((row) => row.status === "COMPUTED" && row.nodes !== 0).length} computed rows are excited states, not the ground state.
            {" "}
            {VALIDATION.pytest ? VALIDATION.pytest.summary : "Tests were not recorded."}
            {" "}
            Experiment: {VALIDATION.experimental_validation ? "claimed" : "not validated"}.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{VALIDATION.note}</p>
        </Panel>
      </div>

      <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
        <Panel title="Variational upper bound">
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat
              label="Recomputed optimum"
              value={`${LEDGER.variational.recomputed.energy_eV.toFixed(10)} eV`}
              hint={`σ ${LEDGER.variational.recomputed.sigma_pm.toFixed(5)} pm`}
            />
            <Stat
              label="At archived width"
              value={`${LEDGER.variational.at_archived_width.energy_eV.toFixed(10)} eV`}
              hint={`cited σ ${LEDGER.variational.at_archived_width.sigma_pm} pm`}
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Both sit above the Numerov eigenvalue. The archived variational energy was not replaced.
          </p>
        </Panel>
        <Panel title="Record">
          <p className="break-all font-mono text-xs text-muted-foreground">SHA-256 {LEDGER.content_sha256}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {LEDGER.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function WaveCanvas({ state }: { state: BoundState }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const paint = () => {
      const width = Math.max(280, parent.clientWidth);
      const height = 280;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const style = getComputedStyle(document.documentElement);
      const fg = style.getPropertyValue("--color-foreground").trim();
      const muted = style.getPropertyValue("--color-muted-foreground").trim();
      const card = style.getPropertyValue("--color-card").trim();
      const info = style.getPropertyValue("--color-info").trim();
      const warn = style.getPropertyValue("--color-warn").trim();
      ctx.fillStyle = card;
      ctx.fillRect(0, 0, width, height);
      const xMax = 1.2;
      const pad = 28;
      const plotW = width - pad * 2;
      const plotH = height - pad * 2;
      const xs = state.x;
      const us = state.u;
      let uMax = 1e-12;
      for (let i = 0; i < xs.length; i += 1) {
        if (xs[i] <= xMax) uMax = Math.max(uMax, Math.abs(us[i]));
      }
      const xOf = (x: number) => pad + (x / xMax) * plotW;
      const yOfU = (u: number) => pad + plotH * 0.5 - (u / uMax) * plotH * 0.42;
      const yOfV = (vOverV0: number) => pad + plotH * 0.82 - (vOverV0 + 1) * plotH * 0.28;
      ctx.strokeStyle = muted;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, pad);
      ctx.lineTo(pad, height - pad);
      ctx.lineTo(width - pad, height - pad);
      ctx.stroke();
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < xs.length; i += 1) {
        if (xs[i] > xMax) break;
        const y = yOfV(state.potentialEv[i] / GAUSSIAN_BENCHMARK.v0Ev);
        if (!started) {
          ctx.moveTo(xOf(xs[i]), y);
          started = true;
        } else ctx.lineTo(xOf(xs[i]), y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = fg;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      started = false;
      for (let i = 0; i < xs.length; i += 1) {
        if (xs[i] > xMax) break;
        const y = yOfU(us[i]);
        if (!started) {
          ctx.moveTo(xOf(xs[i]), y);
          started = true;
        } else ctx.lineTo(xOf(xs[i]), y);
      }
      ctx.stroke();
      const turnX = xOf(Math.min(state.turningOverA, xMax));
      ctx.strokeStyle = warn;
      ctx.beginPath();
      ctx.moveTo(turnX, pad);
      ctx.lineTo(turnX, height - pad);
      ctx.stroke();
      ctx.fillStyle = info;
      ctx.font = "12px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText("u(r)", pad + 8, pad + 14);
      ctx.fillStyle = muted;
      ctx.fillText("V/V0", pad + 8, pad + 30);
      ctx.fillText("r/a", width - pad - 28, height - 10);
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [state]);
  return <canvas ref={ref} className="block w-full rounded-md" />;
}
