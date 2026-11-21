import { useEffect, useRef } from "react";

export function VoiceVisualizer({
  active,
  speaker,
}: {
  active: boolean;
  speaker: string | null;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t0 = performance.now();
    const bars = 36;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const w = canvas.clientWidth || 320;
      const h = canvas.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.floor(w * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#111318";
      ctx.fillRect(0, 0, w, h);
      const t = (now - t0) / 1000;
      const bw = w / bars;
      for (let i = 0; i < bars; i++) {
        const phase = t * (active ? 4.2 : 0.6) + i * 0.38;
        const env = active ? 0.35 + 0.65 * Math.abs(Math.sin(phase) * Math.cos(phase * 0.37 + i * 0.1)) : 0.12;
        const bh = Math.max(3, env * (h - 10));
        ctx.fillStyle = active ? "#d4d8df" : "#2a3038";
        ctx.globalAlpha = active ? 0.85 : 0.55;
        ctx.fillRect(i * bw + 1, (h - bh) * 0.5, Math.max(2, bw - 3), bh);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText(speaker ? `${speaker} · A2` : active ? "SPEAKING · A2" : "IDLE · speech cannot grant A5", 8, h - 6);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, speaker]);

  return <canvas ref={ref} height={56} className="h-14 w-full rounded-md" aria-hidden />;
}
