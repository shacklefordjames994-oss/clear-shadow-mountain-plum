import { useEffect, useRef } from "react";
import type { CompareBin, DisagreementBin, HistBin } from "@/lib/omega/collider/generators";
import type { CosmicShower } from "@/lib/omega/collider/cosmic";
import type { GlauberEvent, Nucleon } from "@/lib/omega/collider/nuclei";

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

export function NucleusGeometryCanvas({
  a,
  b,
  geometry,
  labelA,
  labelB,
}: {
  a: Nucleon[];
  b: Nucleon[];
  geometry: GlauberEvent;
  labelA: string;
  labelB: string;
}) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.fillStyle = "#12151c";
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) / 18;
      const shift = (geometry.bFm * scale) / 2;
      const drawN = (list: Nucleon[], dx: number, proton: string, neutron: string) => {
        for (const n of list) {
          ctx.fillStyle = n.type === "proton" ? proton : neutron;
          ctx.beginPath();
          ctx.arc(cx + dx + n.x * scale, cy + n.y * scale, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      };
      drawN(a, -shift, "#c4a574", "#8fa3b8");
      drawN(b, shift, "#d27a70", "#6e8b9a");
      ctx.strokeStyle = "rgb(232 234 238 / 0.25)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, 12);
      ctx.lineTo(cx, h - 12);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#c4c9d2";
      ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText(`${labelA}  b=${geometry.bFm.toFixed(2)} fm  N_part=${geometry.nPart}`, 10, 16);
      ctx.fillText(`${labelB}  N_coll=${geometry.nColl}  cent ${geometry.centrality.toFixed(0)}%`, 10, h - 10);
    },
    [a, b, geometry, labelA, labelB],
    220,
  );
  return <canvas ref={ref} height={220} className="block w-full rounded-md" aria-label="Nuclear geometry" />;
}

export function AirShowerCanvas({ shower }: { shower: CosmicShower }) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.fillStyle = "#12151c";
      ctx.fillRect(0, 0, w, h);
      const ground = h - 18;
      const top = 18;
      const x0 = w / 2;
      ctx.fillStyle = "rgb(110 139 154 / 0.15)";
      ctx.fillRect(0, ground, w, 18);
      ctx.strokeStyle = "rgb(232 234 238 / 0.2)";
      ctx.beginPath();
      ctx.moveTo(0, ground);
      ctx.lineTo(w, ground);
      ctx.stroke();
      const zMax = Math.max(1, shower.altitudeKm);
      const color: Record<string, string> = {
        proton: "#e8eaee",
        pion: "#c4a574",
        kaon: "#b08d57",
        photon: "#8fa3b8",
        electron: "#6ea8a0",
        muon: "#d27a70",
        neutrino: "#5a6270",
        nucleon: "#c4c9d2",
      };
      for (const p of shower.particles) {
        const x = x0 + p.xKm * 28;
        const y = top + ((zMax - p.zKm) / zMax) * (ground - top);
        ctx.fillStyle = color[p.species] ?? "#8b919c";
        ctx.globalAlpha = p.charged ? 0.9 : 0.45;
        ctx.beginPath();
        ctx.arc(x, y, p.species === "muon" ? 2.8 : 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#c4c9d2";
      ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText(
        `E=${shower.primaryEnergyGeV.toExponential(1)} GeV  μ=${shower.muons}  e=${shower.electrons}  γ=${shower.photons}`,
        10,
        16,
      );
      ctx.fillText(`ground flux ${shower.groundFlux}  Xmax ${shower.xMaxGcm2.toFixed(0)} g/cm²  ${shower.evidence}`, 10, h - 6);
    },
    [shower],
    240,
  );
  return <canvas ref={ref} height={240} className="block w-full rounded-md" aria-label="Air shower" />;
}

export function DataVsModelCanvas({
  literature,
  models,
  labels,
}: {
  literature: HistBin[];
  models: HistBin[][];
  labels: string[];
}) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.fillStyle = "#12151c";
      ctx.fillRect(0, 0, w, h);
      const pad = { l: 36, r: 10, t: 18, b: 28 };
      const innerW = w - pad.l - pad.r;
      const innerH = h - pad.t - pad.b;
      const all = [...literature, ...models.flat()];
      const max = Math.max(1, ...all.map((b) => b.observed));
      const n = literature.length;
      const bw = innerW / n;
      const cols = ["#e8eaee", "#c4a574", "#6ea8a0", "#d27a70"];
      literature.forEach((b, i) => {
        const x = pad.l + i * bw;
        const bh = (b.observed / max) * innerH;
        ctx.fillStyle = cols[0];
        ctx.globalAlpha = 0.22;
        ctx.fillRect(x + 2, pad.t + innerH - bh, bw - 4, bh);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = cols[0];
        ctx.strokeRect(x + 2, pad.t + innerH - bh, bw - 4, bh);
      });
      models.forEach((hist, mi) => {
        ctx.strokeStyle = cols[mi + 1] ?? "#8fa3b8";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        hist.forEach((b, i) => {
          const x = pad.l + (i + 0.5) * bw;
          const y = pad.t + innerH - (b.observed / max) * innerH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText("η", w / 2, h - 6);
      ctx.fillText("lit.", pad.l, 12);
      labels.forEach((lb, i) => {
        ctx.fillStyle = cols[i + 1] ?? "#8fa3b8";
        ctx.fillText(lb, pad.l + 40 + i * 56, 12);
      });
    },
    [literature, models, labels],
    220,
  );
  return <canvas ref={ref} height={220} className="block w-full rounded-md" aria-label="Data versus model" />;
}

export function DisagreementCanvas({ bins }: { bins: DisagreementBin[] }) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.fillStyle = "#12151c";
      ctx.fillRect(0, 0, w, h);
      if (bins.length === 0) return;
      const pad = { l: 36, r: 10, t: 16, b: 24 };
      const innerW = w - pad.l - pad.r;
      const innerH = h - pad.t - pad.b;
      const max = Math.max(1, ...bins.map((b) => b.mean + b.spread));
      const bw = innerW / bins.length;
      bins.forEach((b, i) => {
        const x = pad.l + i * bw + bw / 2;
        const y = pad.t + innerH - (b.mean / max) * innerH;
        const s = (b.spread / max) * innerH;
        ctx.strokeStyle = "#c4a574";
        ctx.beginPath();
        ctx.moveTo(x, y - s);
        ctx.lineTo(x, y + s);
        ctx.stroke();
        ctx.fillStyle = "#e8eaee";
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText("model spread vs η  (toy generators, not named codes)", 10, h - 6);
    },
    [bins],
    180,
  );
  return <canvas ref={ref} height={180} className="block w-full rounded-md" aria-label="Model disagreement" />;
}

export function LhcfGeometryCanvas() {
  const ref = useCanvas((ctx, w, h) => {
    ctx.fillStyle = "#12151c";
    ctx.fillRect(0, 0, w, h);
    const y = h / 2;
    ctx.strokeStyle = "rgb(232 234 238 / 0.35)";
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(w - 16, y);
    ctx.stroke();
    ctx.fillStyle = "#c4a574";
    ctx.beginPath();
    ctx.arc(48, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e8eaee";
    ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
    ctx.fillText("ATLAS IP", 38, y - 16);
    const lhcfX = w - 70;
    ctx.strokeStyle = "#6ea8a0";
    ctx.strokeRect(lhcfX, y - 18, 36, 36);
    ctx.fillStyle = "#6ea8a0";
    ctx.fillText("LHCf", lhcfX + 4, y + 4);
    ctx.fillStyle = "#8b919c";
    ctx.fillText("140 m  ·  ~1 mrad  ·  forward neutrals", 48, h - 12);
    ctx.fillText("ZDC / near-beam neutrons", 48, 18);
  }, [], 160);
  return <canvas ref={ref} height={160} className="block w-full rounded-md" aria-label="LHCf geometry" />;
}

export function PoEventCanvas({ event }: { event: { tracks: { eta: number; phi: number; pT: number }[]; nCh: number } | null }) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.fillStyle = "#12151c";
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      ctx.strokeStyle = "rgb(232 234 238 / 0.12)";
      for (const r of [0.25, 0.5, 0.75]) {
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(cx, cy) * r * 0.92, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (!event) return;
      for (const t of event.tracks) {
        const R = Math.min(cx, cy) * 0.9 * (0.25 + Math.min(1, t.pT / 6) * 0.7);
        const ang = t.phi;
        ctx.strokeStyle = Math.abs(t.eta) < 1 ? "#e8eaee" : "#c4a574";
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#c4c9d2";
      ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillText(`N_ch (fiducial) ${event.nCh}  ·  SIMULATED`, 10, 16);
    },
    [event],
    220,
  );
  return <canvas ref={ref} height={220} className="block w-full rounded-md" aria-label="p-O charged tracks" />;
}

export function CompareTable({ rows, label }: { rows: CompareBin[]; label: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] text-left text-sm">
        <thead className="font-mono text-[10px] uppercase text-muted-foreground">
          <tr>
            <th className="py-2">η</th>
            <th>Lit.</th>
            <th>{label}</th>
            <th>Residual</th>
            <th>Data/MC</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.bin} className="border-t border-border font-mono text-xs">
              <td className="py-2">
                {r.lo.toFixed(1)}–{r.hi.toFixed(1)}
              </td>
              <td>{r.data.toFixed(0)}</td>
              <td>{r.model.toFixed(0)}</td>
              <td>{r.residual.toFixed(0)}</td>
              <td>{r.ratio == null ? "—" : r.ratio.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
