import { useEffect, useRef, useState } from "react";
import type { CollisionEvent, DetectedParticle, SpectrumBin } from "@/lib/omega/collider";
import { curvatureRadius } from "@/lib/omega/collider";
import type { EvidenceGraph } from "@/lib/omega/scinet";

function useCanvas(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  deps: unknown[],
  cssH: number,
) {
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

const SPECIES_COLOR: Record<string, string> = {
  electron: "#8fa3b8",
  muon: "#c4a574",
  photon: "#d4d8df",
  jet: "#7a9a80",
  neutrino: "#8b919c",
  dark: "#c47a6a",
};

function speciesColor(name: string): string {
  return SPECIES_COLOR[name] ?? "#8b919c";
}

function layers() {
  return [
    { r: 0.22, label: "TRK", kind: "tracker" },
    { r: 0.38, label: "ECAL", kind: "ecal" },
    { r: 0.55, label: "HCAL", kind: "hcal" },
    { r: 0.78, label: "MUON", kind: "muon" },
  ] as const;
}

function drawTrack(
  ctx: CanvasRenderingContext2D,
  p: DetectedParticle,
  cx: number,
  cy: number,
  scale: number,
  reveal: number,
) {
  const R = Math.max(18, curvatureRadius(p.measuredPT) * 42);
  const steps = 28;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * reveal;
    const rad = (0.08 + t * 0.7) * scale;
    const bend = p.charge !== 0 ? (p.charge > 0 ? 1 : -1) * (t * t) * (scale / R) * 18 : 0;
    const phi = p.phi + bend;
    const x = cx + Math.cos(phi) * rad;
    const y = cy + Math.sin(phi) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

export function EventDisplayCanvas({ event }: { event: CollisionEvent | null }) {
  const [reveal, setReveal] = useState(1);
  useEffect(() => {
    if (!event) return;
    setReveal(0);
    const t0 = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const p = Math.min(1, (t - t0) / 780);
      setReveal(p);
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [event?.id]);

  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#111318";
      ctx.fillRect(0, 0, w, h);
      const cx = w * 0.5;
      const cy = h * 0.5;
      const scale = Math.min(w, h) * 0.46;
      for (const layer of layers()) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(232,234,238,0.16)";
        ctx.lineWidth = 1;
        ctx.arc(cx, cy, layer.r * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText("r–φ  ·  charged curves in B = 2 T", 10, 16);
      if (!event) {
        ctx.fillText("No collision yet.", 10, h - 12);
        return;
      }
      ctx.fillText(event.process.replaceAll("_", " "), 10, h - 12);
      const metR = Math.min(0.72, 0.18 + event.reconstruction.MET / 900) * scale * reveal;
      ctx.strokeStyle = "rgba(196,122,106,0.85)";
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(event.reconstruction.metPhi) * metR, cy + Math.sin(event.reconstruction.metPhi) * metR);
      ctx.stroke();
      ctx.setLineDash([]);
      for (const p of event.detected) {
        ctx.strokeStyle = speciesColor(p.name);
        ctx.globalAlpha = 0.95;
        ctx.lineWidth = p.name === "jet" ? 2.6 : 1.8;
        if (p.name === "photon" || p.charge === 0) ctx.setLineDash([3, 3]);
        else ctx.setLineDash([]);
        drawTrack(ctx, p, cx, cy, scale, reveal);
        ctx.setLineDash([]);
        const rad = (0.08 + reveal * 0.7) * scale;
        const R = Math.max(18, curvatureRadius(p.measuredPT) * 42);
        const bend = p.charge !== 0 ? (p.charge > 0 ? 1 : -1) * (reveal * reveal) * (scale / R) * 18 : 0;
        const phi = p.phi + bend;
        ctx.beginPath();
        ctx.fillStyle = speciesColor(p.name);
        ctx.arc(cx + Math.cos(phi) * rad, cy + Math.sin(phi) * rad, p.name === "jet" ? 3.2 : 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
    [event, reveal],
    320,
  );

  return <canvas ref={ref} height={320} className="block w-full rounded-md" aria-label="Collision event display" />;
}

export function DetectorTwinCanvas({ event }: { event: CollisionEvent | null }) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#111318";
      ctx.fillRect(0, 0, w, h);
      const cx = w * 0.5;
      const cy = h * 0.52;
      const scale = Math.min(w, h) * 0.44;
      const ring = layers();
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillStyle = "#8b919c";
      ctx.fillText("Detector twin  ·  tracker / ECAL / HCAL / muon", 10, 16);
      ring.forEach((layer, i) => {
        ctx.beginPath();
        ctx.strokeStyle = i === 0 ? "rgba(143,163,184,0.55)" : "rgba(232,234,238,0.22)";
        ctx.lineWidth = i === 3 ? 6 : 3;
        ctx.arc(cx, cy, layer.r * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#8b919c";
        ctx.fillText(layer.label, cx + layer.r * scale * 0.72, cy - 8 - i * 2);
      });
      ctx.beginPath();
      ctx.fillStyle = "#d4d8df";
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
      if (!event) return;
      for (const p of event.detected) {
        const hitR =
          p.muonHit ? 0.78 : p.hcalHit ? 0.55 : p.ecalHit ? 0.38 : p.trackerHit ? 0.22 : 0.12;
        const x = cx + Math.cos(p.phi) * hitR * scale;
        const y = cy + Math.sin(p.phi) * hitR * scale;
        ctx.beginPath();
        ctx.fillStyle = speciesColor(p.name);
        ctx.arc(x, y, p.ecalHit || p.hcalHit ? 4 : 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [event],
    320,
  );
  return <canvas ref={ref} height={320} className="block w-full rounded-md" aria-label="Detector twin" />;
}

export function SpectrumCanvas({
  bins,
  unit,
  markers,
}: {
  bins: SpectrumBin[];
  unit: string;
  markers?: { x: number; label: string }[];
}) {
  const max = Math.max(1, ...bins.map((b) => b.observed));
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#111318";
      ctx.fillRect(0, 0, w, h);
      const left = 36;
      const bottom = h - 22;
      const top = 18;
      const width = w - left - 12;
      const height = bottom - top;
      ctx.strokeStyle = "rgba(232,234,238,0.18)";
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(left, bottom);
      ctx.lineTo(left + width, bottom);
      ctx.stroke();
      const span = bins[bins.length - 1].hi - bins[0].lo;
      bins.forEach((b) => {
        const x = left + ((b.lo - bins[0].lo) / span) * width;
        const bw = Math.max(2, ((b.hi - b.lo) / span) * width - 2);
        const bh = (b.observed / max) * height;
        ctx.fillStyle = "#8fa3b8";
        ctx.fillRect(x, bottom - bh, bw, bh);
      });
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText(unit, left, 14);
      ctx.fillText(String(bins[0].lo), left, h - 6);
      ctx.fillText(String(bins[bins.length - 1].hi), left + width - 24, h - 6);
      for (const m of markers ?? []) {
        const x = left + ((m.x - bins[0].lo) / span) * width;
        ctx.strokeStyle = "rgba(196,165,116,0.9)";
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#c4a574";
        ctx.fillText(m.label, x + 4, top + 12);
      }
    },
    [bins, unit, markers],
    260,
  );
  return <canvas ref={ref} height={260} className="block w-full rounded-md" aria-label={unit} />;
}

export function QuantumCanvas({ event }: { event: CollisionEvent | null }) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#111318";
      ctx.fillRect(0, 0, w, h);
      const q = event?.quantum;
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillStyle = "#8b919c";
      ctx.fillText("Correlation lab  ·  sandbox spin diagnostic", 10, 16);
      if (!q) return;
      const cx = w * 0.28;
      const cy = h * 0.55;
      const R = Math.min(w, h) * 0.28;
      ctx.strokeStyle = "rgba(232,234,238,0.25)";
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      const ang = q.correlation * Math.PI * 0.5;
      ctx.strokeStyle = q.classification === "CONTROL" ? "#8b919c" : "#8fa3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * R * q.purity, cy + Math.sin(ang) * R * q.purity);
      ctx.stroke();
      ctx.fillStyle = "#e8eaee";
      ctx.font = "12px IBM Plex Mono, ui-monospace, monospace";
      const lines = [
        `C = ${q.correlation.toFixed(3)}`,
        `purity ${q.purity.toFixed(3)}`,
        `S_CHSH ${q.chsh.toFixed(3)}`,
        q.classification,
      ];
      lines.forEach((line, i) => ctx.fillText(line, w * 0.55, 48 + i * 22));
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText("CHSH > 2 is a sandbox diagnostic, not a Bell test.", 10, h - 10);
    },
    [event],
    220,
  );
  return <canvas ref={ref} height={220} className="block w-full rounded-md" aria-label="Quantum correlation" />;
}

export function ColliderEvidenceSvg({ graph }: { graph: EvidenceGraph }) {
  const ids = graph.nodes.map((n) => n.id);
  const pos: Record<string, { x: number; y: number }> = {};
  ids.forEach((id, i) => {
    pos[id] = { x: 40 + (i % 4) * 110, y: 28 + Math.floor(i / 4) * 72 };
  });
  return (
    <svg viewBox="0 0 460 220" className="h-[220px] w-full min-w-0" role="img" aria-label="Collider evidence graph">
      {graph.edges.map((e) => {
        const a = pos[e.from];
        const b = pos[e.to];
        if (!a || !b) return null;
        const reject = e.type === "REJECTED_BY" || e.type === "CONTRADICTED_BY";
        return (
          <line
            key={e.id}
            x1={a.x + 40}
            y1={a.y + 10}
            x2={b.x + 40}
            y2={b.y + 10}
            stroke={reject ? "var(--color-danger)" : "rgb(232 234 238 / 0.2)"}
            strokeDasharray={reject || e.type === "SUPPORTED_BY" ? "4 3" : undefined}
          />
        );
      })}
      {graph.nodes.map((n) => {
        const p = pos[n.id];
        if (!p) return null;
        const fill =
          n.epistemicState === "SCI:REJECTED"
            ? "var(--color-danger)"
            : n.type === "CLAIM"
              ? "var(--color-warn)"
              : "var(--color-info)";
        return (
          <g key={n.id} transform={`translate(${p.x},${p.y})`}>
            <rect width="88" height="36" rx="6" fill="#22262f" stroke={fill} strokeWidth="1.4" />
            <text x="8" y="15" fill="#e8eaee" fontSize="9" fontFamily="IBM Plex Mono, monospace">
              {n.type}
            </text>
            <text x="8" y="28" fill="#c4c9d2" fontSize="8" fontFamily="IBM Plex Mono, monospace">
              {n.epistemicState.replace("SCI:", "")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
