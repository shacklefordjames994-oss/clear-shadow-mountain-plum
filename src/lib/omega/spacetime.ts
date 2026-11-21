import type { SimulatedEvent } from "./dark-matter/engine";

export type VisualMode = "2D" | "3D" | "4D";
export type VisualSubject = "COOLING" | "TPC" | "SPACETIME";
export type Plane4 = "XY" | "XZ" | "XW" | "YZ" | "YW" | "ZW";
export type VoiceFocus = "TPC" | "T14" | "SPACETIME" | "GUARD" | null;
export type CameraPreset = "ISO" | "TPC" | "T14" | "4D";

export interface PackedEvent {
  x: number;
  y: number;
  z: number;
  w: number;
  classId: 0 | 1 | 2;
  signal: boolean;
  energy: number;
  day: number;
  s1: number;
}

export function packEvents(events: SimulatedEvent[], radiusM: number, heightM: number): PackedEvent[] {
  const invR = 1 / Math.max(radiusM, 0.2);
  const invH = 1 / Math.max(heightM * 0.5, 0.2);
  return events.map((ev) => ({
    x: ev.signal.xM * invR,
    y: ev.signal.zM * invH,
    z: ev.signal.yM * invR,
    w: (ev.truth.timeDay / 365.25) * 2 - 1,
    classId: ev.classification === "NR_LIKE" ? 0 : ev.classification === "ER_LIKE" ? 1 : 2,
    signal: ev.truth.model.startsWith("SI") || ev.truth.id.startsWith("DM-"),
    energy: ev.signal.energyKeV,
    day: ev.truth.timeDay,
    s1: ev.signal.s1PE,
  }));
}

export function rotate4D(
  x: number,
  y: number,
  z: number,
  w: number,
  plane: Plane4,
  theta: number,
): [number, number, number, number] {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  switch (plane) {
    case "XY":
      return [x * c - y * s, x * s + y * c, z, w];
    case "XZ":
      return [x * c - z * s, y, x * s + z * c, w];
    case "XW":
      return [x * c - w * s, y, z, x * s + w * c];
    case "YZ":
      return [x, y * c - z * s, y * s + z * c, w];
    case "YW":
      return [x, y * c - w * s, z, y * s + w * c];
    case "ZW":
      return [x, y, z * c - w * s, z * s + w * c];
  }
}

export function project4D(
  x: number,
  y: number,
  z: number,
  w: number,
  theta: number,
  phi: number,
  planeA: Plane4 = "XW",
  planeB: Plane4 = "YW",
): [number, number, number] {
  const p = rotate4D(x, y, z, w, planeA, theta);
  const q = rotate4D(p[0], p[1], p[2], p[3], planeB, phi);
  const k = 1 / Math.max(0.35, 2.15 - q[3]);
  return [q[0] * k, q[1] * k, q[2] * k];
}

export function slabFade(w: number, scrub: number, width: number): number {
  const d = Math.abs(w - scrub);
  if (d >= width) return 0.07;
  return 1 - 0.75 * (d / Math.max(width, 0.04));
}

export function timeRgb(w: number): [number, number, number] {
  const t = (w + 1) * 0.5;
  return [0.42 + 0.42 * t, 0.56 + 0.08 * (1 - t), 0.74 - 0.34 * t];
}

export const CLASS_RGB: [number, number, number][] = [
  [0.48, 0.6, 0.5],
  [0.56, 0.64, 0.72],
  [0.77, 0.48, 0.42],
];

/** 16 vertices of the unit tesseract, all ±1 combinations of (x,y,z,w). */
export const TESSERACT_VERTS: [number, number, number, number][] = Array.from({ length: 16 }, (_, i) => [
  i & 1 ? 1 : -1,
  i & 2 ? 1 : -1,
  i & 4 ? 1 : -1,
  i & 8 ? 1 : -1,
]);

/** 32 edges: vertices that differ in exactly one coordinate. */
export const TESSERACT_EDGES: [number, number][] = (() => {
  const edges: [number, number][] = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      let d = 0;
      for (let k = 0; k < 4; k++) if (TESSERACT_VERTS[i][k] !== TESSERACT_VERTS[j][k]) d += 1;
      if (d === 1) edges.push([i, j]);
    }
  }
  return edges;
})();

export const CAMERA_PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  ISO: { pos: [3.4, 2.2, 4.1], target: [0.4, 0, 0] },
  TPC: { pos: [0.15, 0.55, 4.35], target: [0, 0, 0] },
  T14: { pos: [4.05, 1.35, 1.55], target: [1.85, 0, 0] },
  "4D": { pos: [0.2, 0.15, 5.4], target: [0, 0, 0] },
};

export function cameraForFocus(focus: VoiceFocus, mode: VisualMode): CameraPreset {
  if (focus === "T14") return "T14";
  if (focus === "TPC") return "TPC";
  if (focus === "GUARD") return mode === "4D" ? "4D" : "ISO";
  if (focus === "SPACETIME" || mode === "4D") return "4D";
  return "ISO";
}

export const PLANES: Plane4[] = ["XW", "YW", "ZW", "XY", "XZ", "YZ"];
