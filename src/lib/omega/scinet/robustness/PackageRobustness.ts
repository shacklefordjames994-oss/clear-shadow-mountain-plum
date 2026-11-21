/*
 * Leave-one-η-region-out + leave-one-background-out on package bins.
 * Uses robustnessSweep. Stability is not a discovery.
 *
 * STABLE != EVIDENCE
 * LEAVE_ONE_OUT != REPLICATION
 */

import type { ProfileBin } from "../statistics/ProfileLikelihood";
import type { DetectorLikelihood } from "../statistics/JointLikelihood";
import { robustnessSweep, type BackgroundSlice, type RobustnessReport } from "./LeaveOneOut";

export type EtaRegion = "BARREL" | "ENDCAP" | "FORWARD";

export interface PackageRobustness extends RobustnessReport {
  method: "leave-one-eta-region + leave-one-background";
  regions: EtaRegion[];
  discoveryEligible: false;
}

export function etaRegion(lo: number, hi: number): EtaRegion {
  const c = Math.abs((lo + hi) / 2);
  if (c < 1) return "BARREL";
  if (c < 2) return "ENDCAP";
  return "FORWARD";
}

function modelsFromBins(bins: ProfileBin[], mu: number): DetectorLikelihood[] {
  const groups: Record<EtaRegion, ProfileBin[]> = { BARREL: [], ENDCAP: [], FORWARD: [] };
  for (const bin of bins) groups[etaRegion(bin.lo, bin.hi)].push(bin);
  return (Object.entries(groups) as [EtaRegion, ProfileBin[]][])
    .filter(([, group]) => group.length > 0)
    .map(([id, group]) => ({
      detectorId: id,
      hypothesisId: mu > 0 ? "H_SHAPE" : "H0",
      signalStrength: mu,
      backgroundScale: 1,
      bins: group.map((b) => ({
        detectorId: id,
        energyMinKeV: b.lo,
        energyMaxKeV: b.hi,
        observed: Math.max(0, Math.round(b.observed)),
        signalExpected: b.signal,
        backgroundExpected: Math.max(1e-6, b.background),
      })),
    }));
}

function backgroundSlices(models: DetectorLikelihood[]): BackgroundSlice[] {
  const flat = models.flatMap((m) => m.bins);
  const mean = flat.reduce((s, b) => s + b.backgroundExpected, 0) / Math.max(1, flat.length);
  return [
    { id: "GEN_A", expectedByBin: flat.map((b) => 0.7 * b.backgroundExpected) },
    { id: "FLAT", expectedByBin: flat.map(() => 0.2 * mean) },
    { id: "LIT_TILT", expectedByBin: flat.map((b) => 0.1 * Math.max(b.observed, b.backgroundExpected)) },
  ];
}

function paintBackground(models: DetectorLikelihood[], components: BackgroundSlice[]): DetectorLikelihood[] {
  let offset = 0;
  return models.map((model) => {
    const n = model.bins.length;
    const bins = model.bins.map((bin, i) => {
      let bg = 0;
      for (const component of components) bg += Math.max(0, component.expectedByBin[offset + i] ?? 0);
      return { ...bin, backgroundExpected: Math.max(1e-6, bg) };
    });
    offset += n;
    return { ...model, bins };
  });
}

export function robustnessFromBins(bins: ProfileBin[]): PackageRobustness {
  const raw = modelsFromBins(bins, 1);
  const components = backgroundSlices(raw);
  const h1 = paintBackground(raw, components);
  const h0 = paintBackground(modelsFromBins(bins, 0), components);
  const report = robustnessSweep({ h1, h0, components });
  const regions = h1.map((m) => m.detectorId as EtaRegion);
  return {
    ...report,
    method: "leave-one-eta-region + leave-one-background",
    regions,
    discoveryEligible: false,
    note: report.stable
      ? "Preference is stable under leave-one-out. STABLE != EVIDENCE. Still SIMULATED."
      : "Preference flips when a region or background is dropped. Do not promote. STABLE != EVIDENCE.",
  };
}
