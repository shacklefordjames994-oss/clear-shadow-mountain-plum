export const FUSION_DIMS = ["2D", "3D", "4D", "5D", "6D", "XR"] as const;
export type FusionDim = (typeof FUSION_DIMS)[number];

export const FUSION_STEPS = [
  { label: "Separation", hint: "d > R1 + R2" },
  { label: "Overlap", hint: "O(d) rising" },
  { label: "Interaction", hint: "V(r) attractive" },
  { label: "Neutralization", hint: "Qc toward 0" },
  { label: "Bound state", hint: "E below the rest sum" },
] as const;

export const ENERGY_CLASS = [
  { label: "E = mc²", note: "Free or threshold" },
  { label: "E > mc²", note: "Excited, reactive" },
  { label: "E < mc²", note: "Bound composite" },
] as const;

export interface FusionPose {
  separation: number;
  fused: boolean;
  reason: string;
}

export function fusionPose(step: number, energyClass: number, charge: number, overlap: number): FusionPose {
  const bases = [1.55, 0.9, 0.48, 0.28, 0.12];
  const s = Math.min(4, Math.max(0, step));
  const index = Math.floor(s);
  const blend = s - index;
  const next = bases[Math.min(4, index + 1)] ?? bases[4];
  const base = (bases[index] ?? bases[0]) * (1 - blend) + next * blend;
  const separation = base * (1.2 - 0.45 * overlap);
  const fused = s >= 3.6 && energyClass === 2 && charge < 0.2 && overlap > 0.55;
  let reason = "Template still open. A picture of overlap is not a bound state.";
  if (fused) reason = "Template gate closed: late step, bound class, low charge, high overlap.";
  else if (energyClass !== 2) reason = "Energy class is not below the rest sum.";
  else if (charge >= 0.2) reason = "Charge residual is still large.";
  else if (overlap <= 0.55) reason = "Overlap is still small.";
  else if (s < 3.6) reason = "The storyboard has not reached the bound frame.";
  return { separation, fused, reason };
}
