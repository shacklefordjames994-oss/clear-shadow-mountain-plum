import { useEffect, useRef, useState } from "react";
import { synthesisFrame } from "@/lib/omega/synthesis";

export function SynthesisCanvas({
  step,
  energyClass,
  charge,
  overlap,
  time,
  yaw,
  eye,
}: {
  step: number;
  energyClass: number;
  charge: number;
  overlap: number;
  time: number;
  yaw: number;
  eye?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plateRef = useRef<HTMLImageElement | null>(null);
  const [plateReady, setPlateReady] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      plateRef.current = image;
      setPlateReady(true);
    };
    image.src = "/templates/fusion-states.png";
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const parent = canvas.parentElement;
    const width = Math.max(280, parent?.clientWidth ?? 640);
    const height = 300;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = "100%";
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const styles = getComputedStyle(canvas);
    const ink = styles.color || "#e8eaee";
    const info = styles.getPropertyValue("--color-info").trim() || "#8fa3b8";
    const warn = styles.getPropertyValue("--color-warn").trim() || "#c4a574";
    const hot = styles.getPropertyValue("--color-destructive").trim() || "#c47a6a";
    const frame = synthesisFrame({ step, energyClass, charge, overlap, time, yaw });
    const plate = plateRef.current;

    const card = styles.getPropertyValue("--color-card").trim() || styles.backgroundColor;
    context.clearRect(0, 0, width, height);
    context.fillStyle = card;
    context.fillRect(0, 0, width, height);
    if (plate && plate.complete && plate.naturalWidth > 0) {
      context.globalAlpha = 0.34;
      context.drawImage(plate, 0, 0, width, height);
      context.globalAlpha = 1;
    }

    const project = (x: number, y: number, z: number) => {
      const depth = 2.4 + z;
      return { x: width / 2 + (x / depth) * width * 0.34, y: height / 2 + (y / depth) * height * 0.42, depth };
    };

    for (let i = 0; i < frame.particles.length; i += 1) {
      for (let j = i + 1; j < frame.particles.length; j += 1) {
        const a = frame.particles[i];
        const b = frame.particles[j];
        if (!a || !b || a.species === b.species || a.species === "out" || b.species === "out") continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        if (dx * dx + dy * dy > 0.08) continue;
        const pa = project(a.x, a.y, a.z);
        const pb = project(b.x, b.y, b.z);
        context.strokeStyle = ink;
        context.globalAlpha = 0.35;
        context.beginPath();
        context.moveTo(pa.x, pa.y);
        context.lineTo(pb.x, pb.y);
        context.stroke();
        context.globalAlpha = 1;
      }
    }

    const ordered = [...frame.particles].sort((a, b) => a.z - b.z);
    for (const particle of ordered) {
      const point = project(particle.x, particle.y, particle.z);
      const radius = particle.species === "out" ? 3.5 : 7;
      context.fillStyle = particle.species === "A" ? info : particle.species === "B" ? (energyClass === 1 ? hot : warn) : ink;
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
    }

    context.fillStyle = ink;
    context.font = "12px IBM Plex Mono, ui-monospace, monospace";
    context.fillText(eye ? `${eye} · ${frame.reaction}` : frame.reaction, 12, height - 16);
  }, [step, energyClass, charge, overlap, time, yaw, eye, plateReady]);

  return <canvas ref={canvasRef} className="block w-full rounded-lg border border-border text-foreground" aria-label="Particle synthesis simulation" />;
}
