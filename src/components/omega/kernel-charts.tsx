import { useEffect, useRef } from "react";
import { HL, toyLattice, type LatticeElement } from "@/lib/omega/kernel/optics";
import type { SweepPoint } from "@/lib/omega/kernel/experiment";
import type { FaultSample } from "@/lib/omega/kernel/faults";

function useCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[], cssH: number) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const paint = () => {
      const w = Math.max(160, parent.clientWidth);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${cssH}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, w, cssH);
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(parent);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

const KIND_COLOR: Record<LatticeElement["kind"], string> = {
  DRIFT: "#2a3038",
  QUADRUPOLE: "#8fa3b8",
  DIPOLE: "#5c6370",
  RF_CAVITY: "#c4a574",
  CRAB_CAVITY: "#7a9a80",
  COLLIMATOR: "#c47a6a",
  INTERACTION_POINT: "#d4d8df",
};

export function RingCanvas({ highlight }: { highlight: string | null }) {
  const lattice = toyLattice();
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.fillStyle = "#12151a";
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.38;
      ctx.strokeStyle = "#2a3038";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      for (const el of lattice) {
        const ang = (el.sM / HL.circumferenceM) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r;
        ctx.fillStyle = KIND_COLOR[el.kind];
        const s = el.kind === "INTERACTION_POINT" ? 7 : el.kind === "QUADRUPOLE" ? 4 : 3;
        ctx.beginPath();
        ctx.arc(x, y, el.id === highlight ? s + 2 : s, 0, Math.PI * 2);
        ctx.fill();
        if (el.kind === "INTERACTION_POINT") {
          ctx.fillStyle = "#8b919c";
          ctx.font = "10px ui-monospace, monospace";
          ctx.fillText(el.id, x + 8, y + 3);
        }
      }
    },
    [highlight],
    280,
  );
  return <canvas ref={ref} className="w-full" role="img" aria-label="Toy eight-cell HL-LHC ring" />;
}

export function SweepCanvas({ points, current }: { points: SweepPoint[]; current: number }) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.fillStyle = "#12151a";
      ctx.fillRect(0, 0, w, h);
      const pad = { l: 44, r: 12, t: 16, b: 28 };
      const xs = points.map((p) => p.emitN_m * 1e6);
      const ys = points.flatMap((p) => [p.analyticE34, p.simulatedE34]);
      const xmin = Math.min(...xs);
      const xmax = Math.max(...xs);
      const ymin = 0;
      const ymax = Math.max(...ys) * 1.12;
      const xOf = (x: number) => pad.l + ((x - xmin) / (xmax - xmin || 1)) * (w - pad.l - pad.r);
      const yOf = (y: number) => h - pad.b - ((y - ymin) / (ymax - ymin || 1)) * (h - pad.t - pad.b);
      ctx.strokeStyle = "#2a3038";
      ctx.beginPath();
      ctx.moveTo(pad.l, pad.t);
      ctx.lineTo(pad.l, h - pad.b);
      ctx.lineTo(w - pad.r, h - pad.b);
      ctx.stroke();
      ctx.strokeStyle = "#7a9a80";
      ctx.beginPath();
      points.forEach((p, i) => {
        const x = xOf(p.emitN_m * 1e6);
        const y = yOf(p.analyticE34);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.fillStyle = "#c4a574";
      for (const p of points) {
        ctx.beginPath();
        ctx.arc(xOf(p.emitN_m * 1e6), yOf(p.simulatedE34), 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "#d4d8df";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(xOf(current * 1e6), pad.t);
      ctx.lineTo(xOf(current * 1e6), h - pad.b);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText("εn [μm]", w - 64, h - 8);
      ctx.fillText("L [10³⁴]", 6, 14);
    },
    [points, current],
    240,
  );
  return <canvas ref={ref} className="w-full" role="img" aria-label="Luminosity versus emittance" />;
}

export function FillCanvas({ samples }: { samples: { t: number; L: number }[] }) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.fillStyle = "#12151a";
      ctx.fillRect(0, 0, w, h);
      const pad = { l: 44, r: 12, t: 12, b: 24 };
      const ymax = Math.max(0.1, ...samples.map((s) => s.L)) * 1.1;
      const xOf = (t: number) => pad.l + t * (w - pad.l - pad.r);
      const yOf = (L: number) => h - pad.b - (L / ymax) * (h - pad.t - pad.b);
      ctx.strokeStyle = "#c4a574";
      ctx.beginPath();
      samples.forEach((s, i) => {
        const x = xOf(s.t);
        const y = yOf(s.L);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText("fill time", w - 70, h - 6);
    },
    [samples],
    160,
  );
  return <canvas ref={ref} className="w-full" role="img" aria-label="Fill luminosity timeline" />;
}

export function UncertaintyMapCanvas({
  cells,
}: {
  cells: { emitN: number; crab: number; d: number }[];
}) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.fillStyle = "#12151a";
      ctx.fillRect(0, 0, w, h);
      const pad = { l: 44, r: 12, t: 12, b: 28 };
      const emits = [...new Set(cells.map((c) => c.emitN))].sort((a, b) => a - b);
      const crabs = [...new Set(cells.map((c) => c.crab))].sort((a, b) => a - b);
      const maxD = Math.max(1e-6, ...cells.map((c) => c.d));
      const cw = (w - pad.l - pad.r) / crabs.length;
      const ch = (h - pad.t - pad.b) / emits.length;
      cells.forEach((c) => {
        const i = crabs.indexOf(c.crab);
        const j = emits.indexOf(c.emitN);
        const t = c.d / maxD;
        ctx.fillStyle = `rgba(196,165,116,${0.12 + 0.75 * t})`;
        ctx.fillRect(pad.l + i * cw + 1, pad.t + (emits.length - 1 - j) * ch + 1, cw - 2, ch - 2);
      });
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText("crab →", w - 52, h - 8);
      ctx.fillText("εn", 8, pad.t + 8);
    },
    [cells],
    200,
  );
  return <canvas ref={ref} className="w-full" role="img" aria-label="Model disagreement map" />;
}

export function ParetoCanvas({
  points,
  front,
}: {
  points: { id: string; cost: number; expectedIG: number }[];
  front: string[];
}) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.fillStyle = "#12151a";
      ctx.fillRect(0, 0, w, h);
      const pad = { l: 36, r: 12, t: 12, b: 28 };
      const maxC = Math.max(1, ...points.map((p) => p.cost));
      const maxI = Math.max(1e-6, ...points.map((p) => p.expectedIG));
      const xOf = (c: number) => pad.l + (c / maxC) * (w - pad.l - pad.r);
      const yOf = (i: number) => h - pad.b - (i / maxI) * (h - pad.t - pad.b);
      ctx.strokeStyle = "#2a3038";
      ctx.beginPath();
      ctx.moveTo(pad.l, pad.t);
      ctx.lineTo(pad.l, h - pad.b);
      ctx.lineTo(w - pad.r, h - pad.b);
      ctx.stroke();
      points.forEach((p) => {
        ctx.fillStyle = front.includes(p.id) ? "#c4a574" : "#5c6370";
        ctx.beginPath();
        ctx.arc(xOf(p.cost), yOf(p.expectedIG), front.includes(p.id) ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText("cost", w - 40, h - 8);
      ctx.fillText("IG", 8, pad.t + 8);
    },
    [points, front],
    180,
  );
  return <canvas ref={ref} className="w-full" role="img" aria-label="Pareto of information gain versus cost" />;
}

export function FaultCanvas({ samples }: { samples: FaultSample[] }) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.fillStyle = "#12151a";
      ctx.fillRect(0, 0, w, h);
      const pad = { l: 36, r: 12, t: 14, b: 22 };
      const maxL = Math.max(0.2, ...samples.map((s) => s.lumi));
      const xOf = (t: number) => pad.l + t * (w - pad.l - pad.r);
      const yL = (L: number) => h - pad.b - (L / maxL) * (h - pad.t - pad.b);
      const yT = (T: number) => h - pad.b - ((T - 1.5) / 10) * (h - pad.t - pad.b);
      ctx.strokeStyle = "#2a3038";
      ctx.beginPath();
      ctx.moveTo(pad.l, pad.t);
      ctx.lineTo(pad.l, h - pad.b);
      ctx.lineTo(w - pad.r, h - pad.b);
      ctx.stroke();
      const onset = xOf(0.7);
      ctx.strokeStyle = "#3a2a28";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(onset, pad.t);
      ctx.lineTo(onset, h - pad.b);
      ctx.stroke();
      ctx.setLineDash([]);
      const stroke = (pick: (s: FaultSample) => number, color: string, map: (v: number) => number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        samples.forEach((s, i) => {
          const x = xOf(s.t);
          const y = map(pick(s));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      };
      stroke((s) => s.lumi, "#d4d8df", yL);
      stroke((s) => s.tempK, "#c47a6a", yT);
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText("L", 8, pad.t + 8);
      ctx.fillText("T", w - 18, pad.t + 8);
      ctx.fillText("inject", onset + 4, pad.t + 10);
    },
    [samples],
    180,
  );
  return <canvas ref={ref} className="w-full" role="img" aria-label="Synthetic luminosity and temperature after fault injection" />;
}
