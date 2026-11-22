import { fusionPose } from "./fusion-template";

export type SynthSpecies = "A" | "B" | "out";

export interface SynthParticle {
  x: number;
  y: number;
  z: number;
  species: SynthSpecies;
}

export interface SynthesisFrame {
  particles: SynthParticle[];
  reaction: "APPROACH" | "OVERLAP" | "EXCHANGE" | "SCATTER" | "BOUND" | "REJECTED";
  products: number;
  templateYield: number;
  note: string;
}

const COUNT = 12;

export function synthesisFrame(input: {
  step: number;
  energyClass: number;
  charge: number;
  overlap: number;
  time: number;
  yaw: number;
}): SynthesisFrame {
  const pose = fusionPose(input.step, input.energyClass, input.charge, input.overlap);
  const particles: SynthParticle[] = [];
  const cos = Math.cos(input.yaw);
  const sin = Math.sin(input.yaw);

  for (let i = 0; i < COUNT; i += 1) {
    const angle = (i / COUNT) * Math.PI * 2;
    const breathe = 0.2 + 0.05 * Math.sin(input.time * 2.4 + i);
    const scatter = input.step >= 2 && i % 4 === 0 && !pose.fused;
    const fly = scatter ? 0.35 + ((input.time * 0.35 + i * 0.07) % 1) * 0.45 : 0;
    const pair = input.step >= 1 && i % 3 === 0 && !pose.fused ? 0.18 : 0;
    push(particles, pose.fused ? 0 : -pose.separation, angle + input.time * 0.7, breathe + fly, pair, scatter ? "out" : "A", cos, sin);
    push(particles, pose.fused ? 0 : pose.separation, angle - input.time * 0.55, breathe + fly * 0.8, -pair, scatter ? "out" : "B", cos, sin);
  }

  if (pose.fused) {
    for (let k = 0; k < 5; k += 1) {
      const ang = input.time * 1.6 + (k / 5) * Math.PI * 2;
      const radius = 0.28 + ((input.time * 0.5 + k * 0.13) % 1) * 0.55;
      particles.push(yawed(Math.cos(ang) * radius, Math.sin(ang) * radius * 0.55, Math.sin(ang) * 0.2, "out", cos, sin));
    }
  }

  const products = particles.filter((particle) => particle.species === "out").length;
  let reaction: SynthesisFrame["reaction"] = "APPROACH";
  if (pose.fused) reaction = "BOUND";
  else if (input.step >= 3.6) reaction = "REJECTED";
  else if (input.step >= 2) reaction = "SCATTER";
  else if (input.step >= 1.2) reaction = "EXCHANGE";
  else if (input.step >= 0.4) reaction = "OVERLAP";

  const templateYield = pose.fused ? Math.max(0, Math.min(1, input.overlap * (1 - input.charge))) : 0;
  const note =
    reaction === "BOUND"
      ? "Simulated composite. The outgoing sparks are a picture of released energy, not detected photons."
      : reaction === "REJECTED"
        ? "Simulated encounter did not bind. Particles rebound."
        : reaction === "SCATTER" || reaction === "EXCHANGE"
          ? "Simulated exchange and scatter. This is not a measured cross section."
          : "Simulated approach. No reaction products yet.";

  return { particles, reaction, products, templateYield, note };
}

function push(
  particles: SynthParticle[],
  center: number,
  angle: number,
  radius: number,
  shift: number,
  species: SynthSpecies,
  cos: number,
  sin: number,
) {
  particles.push(
    yawed(center + Math.cos(angle) * radius + shift, Math.sin(angle * 1.15) * radius * 0.72, Math.sin(angle) * radius, species, cos, sin),
  );
}

function yawed(x: number, y: number, z: number, species: SynthSpecies, cos: number, sin: number): SynthParticle {
  return { x: x * cos - z * sin, y, z: x * sin + z * cos, species };
}
