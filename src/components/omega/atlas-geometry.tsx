import { useEffect, useRef } from "react";
import { ATLAS_LAYERS, type AtlasFamily, type AtlasLayer } from "@/lib/omega/collider/atlas";

const FAMILY_STROKE: Record<AtlasFamily, string> = {
  BEAMPIPE: "#5c6370",
  PIXEL: "#8fa3b8",
  SCT: "#8fa3b8",
  TRT: "#7a9a80",
  SOLENOID: "#6b7280",
  EMCAL: "#7a9a80",
  HCAL: "#c4a574",
  MUON: "#8b919c",
  FORWARD: "#c47a6a",
};

export function AtlasRzCanvas({
  selectedId,
  eta,
}: {
  selectedId: string | null;
  eta: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const paint = () => {
      const w = Math.max(200, parent.clientWidth);
      const h = 320;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#12151a";
      ctx.fillRect(0, 0, w, h);

      const padL = 44;
      const padB = 28;
      const padT = 16;
      const padR = 12;
      const zMax = 12.5;
      const rMax = 11.2;
      const xOf = (z: number) => padL + (z / zMax) * (w - padL - padR);
      const yOf = (r: number) => h - padB - (r / rMax) * (h - padB - padT);

      ctx.strokeStyle = "#2a3038";
      ctx.lineWidth = 1;
      for (const r of [2, 4, 6, 8, 10]) {
        ctx.beginPath();
        ctx.moveTo(padL, yOf(r));
        ctx.lineTo(w - padR, yOf(r));
        ctx.stroke();
        ctx.fillStyle = "#8b919c";
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillText(`${r} m`, 6, yOf(r) + 3);
      }
      for (const z of [0, 2, 5, 8, 12]) {
        ctx.fillText(`${z}`, xOf(z) - 4, h - 8);
      }
      ctx.fillText("z (m)", w - 36, h - 8);
      ctx.fillText("R", 10, padT + 4);

      const drawable = ATLAS_LAYERS.filter((l) => l.family !== "FORWARD");
      for (const layer of drawable) {
        const x0 = xOf(0);
        const x1 = xOf(Math.min(zMax, layer.zMaxM));
        const y0 = yOf(layer.rMaxM);
        const y1 = yOf(layer.rMinM);
        ctx.fillStyle = layer.id === selectedId ? "rgba(196,165,116,0.28)" : "rgba(143,163,184,0.08)";
        ctx.strokeStyle = FAMILY_STROKE[layer.family];
        ctx.lineWidth = layer.id === selectedId ? 2 : 1;
        ctx.beginPath();
        ctx.rect(x0, y0, Math.max(2, x1 - x0), Math.max(1, y1 - y0));
        ctx.fill();
        ctx.stroke();
      }

      const theta = 2 * Math.atan(Math.exp(-Math.abs(eta)));
      ctx.strokeStyle = "#c4a574";
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(xOf(0), yOf(0));
      const s = 14;
      ctx.lineTo(xOf(Math.min(zMax, s * Math.cos(theta))), yOf(Math.min(rMax, s * Math.sin(theta))));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#c4a574";
      ctx.fillText(`η=${eta.toFixed(1)}`, xOf(2.2), yOf(Math.min(rMax - 0.4, 2.2 * Math.tan(theta))) - 4);

      ctx.strokeStyle = "#8fa3b8";
      ctx.beginPath();
      ctx.moveTo(xOf(0), yOf(0));
      ctx.lineTo(xOf(zMax), yOf(0));
      ctx.stroke();

      const iw = Math.min(220, w * 0.38);
      const ih = 132;
      const ix = w - padR - iw;
      const iy = padT;
      ctx.fillStyle = "#0e1116";
      ctx.strokeStyle = "#2a3038";
      ctx.lineWidth = 1;
      ctx.fillRect(ix, iy, iw, ih);
      ctx.strokeRect(ix, iy, iw, ih);
      ctx.fillStyle = "#8b919c";
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText("ID inset  R≤1.3 m", ix + 6, iy + 12);

      const zId = 3.6;
      const rId = 1.32;
      const xI = (z: number) => ix + 8 + (z / zId) * (iw - 16);
      const yI = (r: number) => iy + ih - 8 - (r / rId) * (ih - 24);
      for (const layer of drawable.filter((l) => l.rMaxM <= 1.3)) {
        const x0 = xI(0);
        const x1 = xI(Math.min(zId, layer.zMaxM));
        const y0 = yI(layer.rMaxM);
        const y1 = yI(Math.max(0, layer.rMinM));
        ctx.fillStyle = layer.id === selectedId ? "rgba(196,165,116,0.35)" : "rgba(143,163,184,0.12)";
        ctx.strokeStyle = FAMILY_STROKE[layer.family];
        ctx.lineWidth = layer.id === selectedId ? 2 : 1;
        ctx.beginPath();
        ctx.rect(x0, y0, Math.max(1.5, x1 - x0), Math.max(1.2, y1 - y0));
        ctx.fill();
        ctx.stroke();
      }
      ctx.strokeStyle = "#c4a574";
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(xI(0), yI(0));
      ctx.lineTo(
        xI(Math.min(zId, 4 * Math.cos(theta))),
        yI(Math.min(rId, 4 * Math.sin(theta))),
      );
      ctx.stroke();
      ctx.setLineDash([]);
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [selectedId, eta]);

  return <canvas ref={ref} className="w-full" role="img" aria-label="ATLAS R-z literature cutaway" />;
}

export function AtlasLayerTable({
  selectedId,
  onSelect,
  hits,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  hits: Set<string>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] text-left text-sm">
        <thead className="font-mono text-[10px] uppercase text-muted-foreground">
          <tr>
            <th className="py-2">Layer</th>
            <th>R (m)</th>
            <th>|z| (m)</th>
            <th>|η|</th>
            <th>Ray</th>
          </tr>
        </thead>
        <tbody>
          {ATLAS_LAYERS.map((layer) => (
            <tr
              key={layer.id}
              className={`cursor-pointer border-t border-border font-mono text-xs ${
                selectedId === layer.id ? "bg-secondary" : ""
              }`}
              onClick={() => onSelect(layer.id)}
            >
              <td className="py-2">{layer.name}</td>
              <td>
                {layer.rMinM.toFixed(2)}–{layer.rMaxM.toFixed(2)}
              </td>
              <td>{layer.zMaxM < 20 ? layer.zMaxM.toFixed(2) : "140*"}</td>
              <td>{layer.etaMax.toFixed(2)}</td>
              <td className={hits.has(layer.id) ? "text-foreground" : "text-muted-foreground"}>
                {hits.has(layer.id) ? "hit" : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function describeLayer(id: string | null): AtlasLayer | undefined {
  return ATLAS_LAYERS.find((l) => l.id === id);
}

export function AtlasDepositCanvas({
  objects,
}: {
  objects: { id: string; idGuess: string; emGeV: number; hadGeV: number; measuredPT: number }[];
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const paint = () => {
      const w = Math.max(200, parent.clientWidth);
      const rows = Math.min(12, objects.length);
      const h = Math.max(160, 28 + rows * 22);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#12151a";
      ctx.fillRect(0, 0, w, h);
      const maxE = Math.max(1, ...objects.slice(0, rows).map((o) => o.emGeV + o.hadGeV));
      const barW = w - 92;
      objects.slice(0, rows).forEach((o, i) => {
        const y = 10 + i * 22;
        ctx.fillStyle = "#8b919c";
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillText(o.idGuess.slice(0, 3), 6, y + 12);
        const emW = (o.emGeV / maxE) * barW;
        const hadW = (o.hadGeV / maxE) * barW;
        ctx.fillStyle = "#7a9a80";
        ctx.fillRect(56, y + 4, Math.max(0, emW), 12);
        ctx.fillStyle = "#c4a574";
        ctx.fillRect(56 + emW, y + 4, Math.max(0, hadW), 12);
      });
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [objects]);
  return <canvas ref={ref} className="w-full" role="img" aria-label="EM versus hadronic deposits" />;
}
