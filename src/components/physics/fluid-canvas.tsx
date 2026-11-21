import { useEffect, useRef, type PointerEvent } from "react";
import { FluidSolver } from "@/lib/omega/fluid";
import { useOmegaStore } from "@/lib/omega/store";
import type { DigiSimField, DigiSimProbe } from "@/lib/omega/types";

export function FluidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const solverRef = useRef<FluidSolver | null>(null);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const downRef = useRef<{ x: number; y: number } | null>(null);
  const nonceRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const solver = new FluidSolver(96, 54);
    solverRef.current = solver;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const tmp = document.createElement("canvas");
    tmp.width = solver.w;
    tmp.height = solver.h;
    const tctx = tmp.getContext("2d");
    if (!tctx) return;

    let frame = 0;
    let raf = 0;
    const loop = () => {
      const state = useOmegaStore.getState();
      if (state.physicsResetNonce !== nonceRef.current) {
        nonceRef.current = state.physicsResetNonce;
        solver.reset();
      }
      const loopTwin = state.twins.find((t) => t.id === "cool-loop");
      const deltaT = typeof loopTwin?.observed.deltaT === "number" ? loopTwin.observed.deltaT : 12.4;
      const metrics = solver.step(state.physics.turbulence, state.physicsRunning, deltaT, state.physicsFault);
      if (frame % 8 === 0) state.setPhysicsMetrics(metrics);
      draw(ctx, canvas, solver, tmp, tctx, state.physicsField, state.physicsProbe);
      frame += 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  function pointer(e: PointerEvent<HTMLCanvasElement>, dragging: boolean) {
    const canvas = canvasRef.current;
    const solver = solverRef.current;
    if (!canvas || !solver) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const last = lastRef.current;
    const dx = last ? x - last.x : 0;
    const dy = last ? y - last.y : 0;
    lastRef.current = { x, y };
    if (dragging) solver.addForce(x, y, dx, dy, true);
  }

  return (
    <canvas
      ref={canvasRef}
      width={960}
      height={540}
      className="h-auto w-full rounded-md bg-background touch-none"
      onPointerDown={(e) => {
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        downRef.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        };
        lastRef.current = null;
        pointer(e, false);
      }}
      onPointerMove={(e) => {
        if (e.buttons) pointer(e, true);
      }}
      onPointerUp={(e) => {
        const canvas = canvasRef.current;
        const solver = solverRef.current;
        const down = downRef.current;
        if (canvas && solver && down) {
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          const dist = Math.hypot(x - down.x, y - down.y);
          if (dist < 0.02) useOmegaStore.getState().setPhysicsProbe(solver.sample(x, y));
        }
        lastRef.current = null;
        downRef.current = null;
      }}
    />
  );
}

function draw(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  solver: FluidSolver,
  tmp: HTMLCanvasElement,
  tctx: CanvasRenderingContext2D,
  field: DigiSimField,
  probe: DigiSimProbe | null,
) {
  const { w, h, d, u, v, particles, particleCount } = solver;
  const img = tctx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    let r = 10;
    let g = 12;
    let b = 16;
    if (field === "DYE") {
      const t = Math.min(1, Math.pow(Math.max(0, d[i]) * 2.4, 0.62));
      r = 10 + t * 198;
      g = 12 + t * 206;
      b = 16 + t * 224;
    } else if (field === "SPEED") {
      const t = Math.min(1, Math.hypot(u[i], v[i]) * 0.7);
      r = 8 + t * 40;
      g = 14 + t * 210;
      b = 18 + t * 190;
    } else {
      const div = Math.abs(
        (i % w < w - 1 && i % w > 0 && i > w && i < w * (h - 1)
          ? u[i + 1] - u[i - 1] + (v[i + w] - v[i - w])
          : 0),
      );
      const t = Math.min(1, div * 4);
      r = 12 + t * 210;
      g = 12 + t * 40;
      b = 16 + t * 50;
    }
    img.data[i * 4] = r;
    img.data[i * 4 + 1] = g;
    img.data[i * 4 + 2] = b;
    img.data[i * 4 + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);

  const sx = canvas.width / w;
  const sy = canvas.height / h;
  ctx.strokeStyle = "rgba(232,234,238,0.22)";
  ctx.lineWidth = 1;
  const step = 8;
  for (let y = 4; y < h; y += step) {
    for (let x = 4; x < w; x += step) {
      const i = y * w + x;
      const sp = Math.hypot(u[i], v[i]);
      if (sp < 0.08) continue;
      const px = (x + 0.5) * sx;
      const py = (y + 0.5) * sy;
      const nx = (u[i] / sp) * Math.min(14, sp * 9);
      const ny = (v[i] / sp) * Math.min(14, sp * 9);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + nx, py + ny);
      ctx.stroke();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    const px = particles[i * 2] * sx;
    const py = particles[i * 2 + 1] * sy;
    const gi = Math.max(0, Math.min(w * h - 1, (py / sy | 0) * w + (px / sx | 0)));
    const speed = Math.hypot(u[gi] ?? 0, v[gi] ?? 0);
    ctx.fillStyle = speed > 1.2 ? "rgba(196,122,106,0.7)" : "rgba(232,234,238,0.28)";
    ctx.fillRect(px - 1.4, py - 1.4, 5.2, 5.2);
    ctx.fillStyle = "rgba(212,216,223,0.85)";
    ctx.fillRect(px, py, 2.4, 2.4);
  }

  ctx.fillStyle = "#8b919c";
  ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
  ctx.fillText(`${field}  ·  arrows = velocity  ·  simulated`, 12, 18);
  const legendW = 120;
  const lx = canvas.width - legendW - 16;
  const ly = canvas.height - 22;
  const grd = ctx.createLinearGradient(lx, ly, lx + legendW, ly);
  if (field === "DYE") {
    grd.addColorStop(0, "#0a0c10");
    grd.addColorStop(1, "#d4d8df");
  } else if (field === "SPEED") {
    grd.addColorStop(0, "#0e1214");
    grd.addColorStop(1, "#32d2be");
  } else {
    grd.addColorStop(0, "#0c0c10");
    grd.addColorStop(1, "#d23232");
  }
  ctx.fillStyle = grd;
  ctx.fillRect(lx, ly - 6, legendW, 8);

  if (probe) {
    const x = probe.nx * canvas.width;
    const y = probe.ny * canvas.height;
    ctx.strokeStyle = "rgba(232,234,239,0.9)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y + 10);
    ctx.stroke();
  }
}
