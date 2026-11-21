import { useEffect, useRef } from "react";

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

export function QFieldCanvas({
  values,
  n,
  mode,
  closed,
}: {
  values: number[] | null;
  n: number;
  mode: "mag" | "phase" | "resid" | "count";
  closed?: string;
}) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.fillStyle = "#12151a";
      ctx.fillRect(0, 0, w, h);
      if (!values || closed) {
        ctx.fillStyle = "#8b919c";
        ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(closed ?? "No field", 16, h / 2);
        return;
      }
      let lo = Infinity;
      let hi = -Infinity;
      for (const v of values) {
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
      const span = hi - lo || 1;
      const cell = Math.min((w - 16) / n, (h - 16) / n);
      const ox = (w - cell * n) / 2;
      const oy = (h - cell * n) / 2;
      for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
          const v = values[j * n + i] ?? 0;
          if (mode === "phase") {
            const hue = ((v + Math.PI) / (2 * Math.PI)) * 360;
            ctx.fillStyle = `hsl(${hue} 42% 48%)`;
          } else if (mode === "resid") {
            const t = Math.max(-1, Math.min(1, v / (Math.max(Math.abs(lo), Math.abs(hi)) || 1)));
            ctx.fillStyle = t >= 0 ? `rgb(${80 + t * 140}, ${70}, ${70})` : `rgb(${70}, ${80}, ${90 + -t * 120})`;
          } else {
            const t = (v - lo) / span;
            const g = Math.round(18 + t * 210);
            ctx.fillStyle = `rgb(${g}, ${g + 4}, ${g + 8})`;
          }
          ctx.fillRect(ox + i * cell, oy + j * cell, cell + 0.4, cell + 0.4);
        }
      }
    },
    [values, n, mode, closed],
    220,
  );
  return <canvas ref={ref} className="w-full" role="img" aria-label="Quantum correlation field" />;
}
