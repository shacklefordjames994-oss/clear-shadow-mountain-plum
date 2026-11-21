import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { SimulatedEvent } from "@/lib/omega/dark-matter/engine";
import type { ModulationBin, SensitivityPoint } from "@/lib/omega/dark-matter/research-engine";
import type { EvidenceGraph, PosteriorSet } from "@/lib/omega/scinet/master";

function useCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[]) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = Math.max(160, parent.clientWidth);
    const h = canvas.height;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx, w, h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

function classColor(ev: SimulatedEvent) {
  return ev.classification === "NR_LIKE" ? "#7a9a80" : ev.classification === "VETOED" ? "#c47a6a" : "#8fa3b8";
}

export function TpcCanvas({
  events,
  radiusM,
  heightM,
  sliceZ = 0.5,
}: {
  events: SimulatedEvent[];
  radiusM: number;
  heightM: number;
  sliceZ?: number;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const layout = useRef({ cx: 0, cy: 0, scale: 1, w: 0, h: 0 });
  const zWorld = (sliceZ * 2 - 1) * (heightM * 0.5);
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#111318";
      ctx.fillRect(0, 0, w, h);
      const cx = w * 0.5;
      const cy = h * 0.5;
      const scale = (Math.min(w, h) * 0.42) / Math.max(radiusM, 0.2);
      layout.current = { cx, cy, scale, w, h };
      ctx.strokeStyle = "rgba(232,234,238,0.45)";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(cx, cy, radiusM * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radiusM * scale * 0.82, 0, Math.PI * 2);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "rgba(143,163,184,0.75)";
      ctx.stroke();
      ctx.setLineDash([]);
      const layers = ["VETOED", "ER_LIKE", "NR_LIKE"] as const;
      for (const layer of layers) {
        for (const ev of events) {
          if (ev.classification !== layer) continue;
          const dz = Math.abs(ev.signal.zM - zWorld);
          const fade = dz > heightM * 0.18 ? 0.1 : 1 - dz / (heightM * 0.18);
          const x = cx + ev.signal.xM * scale;
          const y = cy + ev.signal.yM * scale;
          ctx.fillStyle = classColor(ev);
          ctx.globalAlpha = (layer === "VETOED" ? 0.22 : 0.92) * Math.max(0.08, fade);
          const r = (layer === "NR_LIKE" ? 3.4 : layer === "ER_LIKE" ? 2.3 : 1.6) * (0.75 + Math.min(1.4, ev.signal.energyKeV / 50));
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText("XY fiducial · z-slice", 10, 16);
      ctx.fillText(`z=${zWorld.toFixed(2)} m  H=${heightM.toFixed(2)} m`, 10, h - 10);
      if (hover) ctx.fillText(hover, 10, 32);
    },
    [events, radiusM, heightM, sliceZ, hover],
  );

  function onMove(e: PointerEvent<HTMLCanvasElement>) {
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { cx, cy, scale } = layout.current;
    let best: SimulatedEvent | null = null;
    let bestD = 10;
    for (const ev of events) {
      const x = cx + ev.signal.xM * scale;
      const y = cy + ev.signal.yM * scale;
      const d = Math.hypot(x - mx, y - my);
      if (d < bestD) {
        bestD = d;
        best = ev;
      }
    }
    setHover(best ? `${best.classification} · ${best.signal.energyKeV.toFixed(1)} keV · SCI:SIMULATED` : null);
  }

  return (
    <canvas
      ref={ref}
      height={280}
      className="h-[280px] w-full rounded-md touch-none"
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
    />
  );
}

export function S2S1Canvas({ events }: { events: SimulatedEvent[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const layout = useRef({ pad: 36, w: 0, h: 0, maxS1: 80, maxLogS2: Math.log10(4000) });
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#111318";
      ctx.fillRect(0, 0, w, h);
      const pad = 36;
      const maxS1 = 80;
      const maxLogS2 = Math.log10(4000);
      layout.current = { pad, w, h, maxS1, maxLogS2 };
      ctx.strokeStyle = "rgba(232,234,238,0.16)";
      ctx.strokeRect(pad, 12, w - pad - 12, h - pad);
      ctx.fillStyle = "rgba(122,154,128,0.08)";
      ctx.beginPath();
      ctx.moveTo(pad, h - pad - (Math.log10(16) / maxLogS2) * (h - pad - 12));
      ctx.lineTo(w - 12, h - pad - (Math.log10(80 * 10) / maxLogS2) * (h - pad - 12));
      ctx.lineTo(w - 12, h - pad);
      ctx.lineTo(pad, h - pad);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText("S1 (PE)", w / 2 - 20, h - 8);
      ctx.save();
      ctx.translate(12, h / 2 + 30);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("log10 S2", 0, 0);
      ctx.restore();
      for (const ev of events) {
        const x = pad + (Math.min(ev.signal.s1PE, maxS1) / maxS1) * (w - pad - 12);
        const y = h - pad - (Math.log10(Math.max(ev.signal.s2PE, 1)) / maxLogS2) * (h - pad - 12);
        ctx.fillStyle = classColor(ev);
        ctx.globalAlpha = ev.classification === "VETOED" ? 0.28 : 0.9;
        const s = ev.classification === "NR_LIKE" ? 3.2 : 2.2;
        ctx.fillRect(x, y, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(122,154,128,0.55)";
      ctx.beginPath();
      ctx.moveTo(pad, h - pad - (Math.log10(16) / maxLogS2) * (h - pad - 12));
      ctx.lineTo(w - 12, h - pad - (Math.log10(80 * 10) / maxLogS2) * (h - pad - 12));
      ctx.stroke();
      if (hover) ctx.fillText(hover, 10, 16);
    },
    [events, hover],
  );

  function onMove(e: PointerEvent<HTMLCanvasElement>) {
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { pad, w, h, maxS1, maxLogS2 } = layout.current;
    let best: SimulatedEvent | null = null;
    let bestD = 8;
    for (const ev of events) {
      const x = pad + (Math.min(ev.signal.s1PE, maxS1) / maxS1) * (w - pad - 12);
      const y = h - pad - (Math.log10(Math.max(ev.signal.s2PE, 1)) / maxLogS2) * (h - pad - 12);
      const d = Math.hypot(x - mx, y - my);
      if (d < bestD) {
        bestD = d;
        best = ev;
      }
    }
    setHover(best ? `${best.classification} · S2/S1=${best.signal.s2s1.toFixed(1)} · SCI:SIMULATED` : null);
  }

  return (
    <canvas
      ref={ref}
      height={280}
      className="h-[280px] w-full rounded-md touch-none"
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
    />
  );
}

export function ModulationCanvas({ bins }: { bins: ModulationBin[] }) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#111318";
      ctx.fillRect(0, 0, w, h);
      if (bins.length === 0) return;
      const pad = 28;
      const maxY = Math.max(1, ...bins.map((b) => Math.max(b.observed, b.expectedModulated, b.expectedConstant)));
      const bw = (w - pad * 2) / bins.length;
      bins.forEach((b, i) => {
        const x = pad + i * bw;
        const bh = (b.observed / maxY) * (h - pad * 2);
        ctx.fillStyle = "rgba(232,234,238,0.28)";
        ctx.fillRect(x + 4, h - pad - bh, bw - 8, bh);
      });
      ctx.strokeStyle = "#8fa3b8";
      ctx.beginPath();
      bins.forEach((b, i) => {
        const x = pad + i * bw + bw / 2;
        const y = h - pad - (b.expectedConstant / maxY) * (h - pad * 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.strokeStyle = "#7a9a80";
      ctx.beginPath();
      bins.forEach((b, i) => {
        const x = pad + i * bw + bw / 2;
        const y = h - pad - (b.expectedModulated / maxY) * (h - pad * 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText("bars = accepted counts · gray = constant · green = SHM modulation", 10, 16);
    },
    [bins],
  );
  return <canvas ref={ref} height={220} className="h-[220px] w-full rounded-md" />;
}

export function SensitivityCanvas({ points }: { points: SensitivityPoint[] }) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#111318";
      ctx.fillRect(0, 0, w, h);
      if (points.length === 0) return;
      const pad = 32;
      const xs = points.map((p) => Math.log10(p.crossSectionCm2));
      const ys = points.map((p) => p.discoveryMetric);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const maxY = Math.max(5, ...ys);
      const xAt = (v: number) => pad + ((v - minX) / (maxX - minX || 1)) * (w - pad * 2);
      const yAt = (v: number) => h - pad - (v / maxY) * (h - pad * 2);
      ctx.strokeStyle = "rgba(196,165,116,0.7)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pad, yAt(5));
      ctx.lineTo(w - pad, yAt(5));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "#8fa3b8";
      ctx.beginPath();
      points.forEach((p, i) => {
        const x = xAt(Math.log10(p.crossSectionCm2));
        const y = yAt(p.discoveryMetric);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        ctx.fillStyle = "#e8eaee";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.stroke();
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText("Asimov Z vs σ  ·  dashed = 5σ diagnostic, not a claim", 10, 16);
    },
    [points],
  );
  return <canvas ref={ref} height={220} className="h-[220px] w-full rounded-md" />;
}

export function Spacetime2DCanvas({
  events,
  scrub = 0.42,
  axis = "RT",
}: {
  events: SimulatedEvent[];
  scrub?: number;
  axis?: "RT" | "ZT";
}) {
  const [hover, setHover] = useState<string | null>(null);
  const layout = useRef({ pad: 36, w: 0, h: 0 });
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#111318";
      ctx.fillRect(0, 0, w, h);
      const pad = 36;
      layout.current = { pad, w, h };
      ctx.strokeStyle = "rgba(232,234,238,0.16)";
      ctx.strokeRect(pad, 12, w - pad - 12, h - pad);
      const xAt = (day: number) => pad + (day / 365.25) * (w - pad - 12);
      const yAt = (ev: SimulatedEvent) => {
        if (axis === "ZT") {
          const z = (ev.signal.zM + 0.73) / 1.46;
          return h - pad - Math.min(1, Math.max(0, z)) * (h - pad - 12);
        }
        const r = Math.hypot(ev.signal.xM, ev.signal.yM);
        return h - pad - Math.min(1, r / 0.72) * (h - pad - 12);
      };
      const sorted = [...events].sort((a, b) => a.truth.timeDay - b.truth.timeDay);
      const byClass: Record<string, SimulatedEvent[]> = { NR_LIKE: [], ER_LIKE: [], VETOED: [] };
      for (const ev of sorted) byClass[ev.classification]?.push(ev);
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 1;
      for (const key of Object.keys(byClass)) {
        const list = byClass[key];
        ctx.strokeStyle = key === "NR_LIKE" ? "#7a9a80" : key === "VETOED" ? "#c47a6a" : "#8fa3b8";
        ctx.beginPath();
        list.forEach((ev, i) => {
          const x = xAt(ev.truth.timeDay);
          const y = yAt(ev);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (const ev of events) {
        const x = xAt(ev.truth.timeDay);
        const y = yAt(ev);
        ctx.fillStyle = classColor(ev);
        ctx.globalAlpha = ev.classification === "VETOED" ? 0.28 : 0.9;
        ctx.fillRect(x, y, 2.4, 2.4);
      }
      ctx.globalAlpha = 1;
      const cx = xAt(scrub * 365.25);
      ctx.strokeStyle = "rgba(232,234,238,0.55)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, 12);
      ctx.lineTo(cx, h - pad);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText(axis === "ZT" ? "2D slice of (z, t) — missing r and type" : "2D slice of (r, t) — missing z and type", 10, 16);
      ctx.fillText("day →", w - 52, h - 10);
      if (hover) ctx.fillText(hover, 10, 30);
    },
    [events, scrub, axis, hover],
  );

  function onMove(e: PointerEvent<HTMLCanvasElement>) {
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { pad, w, h } = layout.current;
    let best: SimulatedEvent | null = null;
    let bestD = 8;
    for (const ev of events) {
      const x = pad + (ev.truth.timeDay / 365.25) * (w - pad - 12);
      const y =
        axis === "ZT"
          ? h - pad - Math.min(1, Math.max(0, (ev.signal.zM + 0.73) / 1.46)) * (h - pad - 12)
          : h - pad - Math.min(1, Math.hypot(ev.signal.xM, ev.signal.yM) / 0.72) * (h - pad - 12);
      const d = Math.hypot(x - mx, y - my);
      if (d < bestD) {
        bestD = d;
        best = ev;
      }
    }
    setHover(best ? `${best.classification} · day ${best.truth.timeDay.toFixed(0)} · SCI:SIMULATED` : null);
  }

  return (
    <canvas
      ref={ref}
      height={280}
      className="h-[280px] w-full rounded-md touch-none"
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
    />
  );
}

export function PosteriorCanvas({ posterior }: { posterior: PosteriorSet }) {
  const ids = Object.keys(posterior.posterior) as (keyof PosteriorSet["posterior"])[];
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#111318";
      ctx.fillRect(0, 0, w, h);
      const pad = 28;
      const bw = (w - pad * 2) / ids.length;
      ids.forEach((id, i) => {
        const p = posterior.posterior[id];
        const bh = p * (h - pad * 2);
        const x = pad + i * bw;
        ctx.fillStyle = id === posterior.preferred ? "#7a9a80" : "rgba(232,234,238,0.28)";
        ctx.fillRect(x + 6, h - pad - bh, bw - 12, bh);
        ctx.fillStyle = "#8b919c";
        ctx.font = "9px IBM Plex Mono, ui-monospace, monospace";
        ctx.fillText(String(id).slice(0, 2), x + 8, h - 10);
      });
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText("posterior mass  ·  preferred is green  ·  not a discovery", 10, 16);
    },
    [posterior],
  );
  return <canvas ref={ref} height={180} className="h-[180px] w-full rounded-md" />;
}

export function SpectrumCanvas({
  bins,
  observed,
  background,
  signal,
}: {
  bins: number[];
  observed: number[];
  background: number[];
  signal: number[];
}) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#111318";
      ctx.fillRect(0, 0, w, h);
      const pad = 28;
      const n = bins.length;
      const maxY = Math.max(1, ...observed, ...background, ...signal.map((s, i) => s + (background[i] ?? 0)));
      const bw = (w - pad * 2) / n;
      for (let i = 0; i < n; i++) {
        const x = pad + i * bw;
        const b = ((background[i] ?? 0) / maxY) * (h - pad * 2);
        const s = ((signal[i] ?? 0) / maxY) * (h - pad * 2);
        ctx.fillStyle = "rgba(143,163,184,0.35)";
        ctx.fillRect(x + 3, h - pad - b, bw - 6, b);
        ctx.fillStyle = "rgba(122,154,128,0.55)";
        ctx.fillRect(x + 3, h - pad - b - s, bw - 6, s);
        const o = ((observed[i] ?? 0) / maxY) * (h - pad * 2);
        ctx.fillStyle = "#e8eaee";
        ctx.fillRect(x + bw / 2 - 1.5, h - pad - o, 3, o);
      }
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText("gray B · green S folded · white observed (simulated counts)", 10, 16);
    },
    [bins, observed, background, signal],
  );
  return <canvas ref={ref} height={200} className="h-[200px] w-full rounded-md" />;
}

export function EvidenceGraphSvg({ graph }: { graph: EvidenceGraph }) {
  const pos: Record<string, { x: number; y: number }> = {
    dataset: { x: 70, y: 32 },
    calibration: { x: 190, y: 32 },
    background: { x: 310, y: 32 },
    model: { x: 400, y: 32 },
    reconstruction: { x: 70, y: 100 },
    likelihood: { x: 190, y: 100 },
    posterior: { x: 310, y: 100 },
    statistic: { x: 70, y: 168 },
    replication: { x: 190, y: 168 },
    ppc: { x: 310, y: 168 },
    claim: { x: 400, y: 168 },
  };
  const tone: Record<string, string> = {
    "SCI:SIMULATED": "var(--color-info)",
    "SCI:CONTROL": "var(--color-muted-foreground)",
    "SCI:HYPOTHETICAL": "var(--color-muted-foreground)",
    "SCI:MODEL_SUPPORTED": "var(--color-ok)",
    "SCI:BACKGROUND_PREFERRED": "var(--color-info)",
    "SCI:MODEL_CHECK_FAILED": "var(--color-warn)",
    "SCI:REJECTED": "var(--color-danger)",
    "SCI:ANOMALY": "var(--color-warn)",
    "SCI:RECONSTRUCTED": "var(--color-info)",
    "SCI:DERIVED": "var(--color-info)",
    "SCI:CALIBRATED": "var(--color-ok)",
    "SCI:OBSERVED": "var(--color-ok)",
  };
  return (
    <svg viewBox="0 0 460 210" className="h-[210px] w-full min-w-0" role="img" aria-label="Evidence graph">
      {graph.edges.map((e) => {
        const a = pos[e.from];
        const b = pos[e.to];
        if (!a || !b) return null;
        const dash = e.type === "CONTRADICTED_BY" || e.type === "REJECTED_BY" || e.type === "SUPPORTED_BY" ? "4 3" : undefined;
        const color =
          e.type === "CONTRADICTED_BY" || e.type === "REJECTED_BY"
            ? "var(--color-danger)"
            : e.type === "SUPPORTED_BY"
              ? "var(--color-warn)"
              : "rgb(232 234 238 / 0.2)";
        return (
          <line key={e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth="1.25" strokeDasharray={dash} />
        );
      })}
      {graph.nodes.map((n) => {
        const p = pos[n.id] ?? { x: 40, y: 40 };
        return (
          <g key={n.id}>
            <rect
              x={p.x - 48}
              y={p.y - 16}
              width="96"
              height="32"
              rx="8"
              fill="var(--color-secondary)"
              stroke="rgb(232 234 238 / 0.1)"
            />
            <text
              x={p.x}
              y={p.y - 2}
              textAnchor="middle"
              fill="var(--color-foreground)"
              fontSize="9"
              fontFamily="IBM Plex Sans, sans-serif"
            >
              {n.label.length > 18 ? n.label.slice(0, 16) + "…" : n.label}
            </text>
            <text
              x={p.x}
              y={p.y + 10}
              textAnchor="middle"
              fill={tone[n.epistemicState] ?? "var(--color-muted-foreground)"}
              fontSize="8"
              fontFamily="IBM Plex Mono, monospace"
            >
              {n.epistemicState.replace("SCI:", "")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
