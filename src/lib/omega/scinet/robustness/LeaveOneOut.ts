/*
 * Robustness: leave-one-detector-out and leave-one-background-out.
 * A preference that vanishes when one detector or one background is dropped
 * is not a discovery. These tests never unblind and never mint evidence.
 */

import {
  calculateJointLikelihood,
  leaveOneDetectorOut,
  type DetectorLikelihood,
  type JointLikelihoodResult,
} from "../statistics/JointLikelihood";

export interface BackgroundSlice {
  id: string;
  expectedByBin: number[];
}

export interface RobustnessRow {
  dropped: string;
  kind: "DETECTOR" | "BACKGROUND";
  logLikelihood: number;
  deltaVsFull: number;
  preferredStill: boolean;
}

export interface RobustnessReport {
  full: JointLikelihoodResult;
  rows: RobustnessRow[];
  stable: boolean;
  fullDelta: number;
  note: string;
}

function remainderSlice(
  components: BackgroundSlice[],
  dropId: string,
  offset: number,
  binCount: number,
): number[] {
  const total = new Array(binCount).fill(0);
  for (const component of components) {
    if (component.id === dropId) continue;
    for (let i = 0; i < binCount; i++) {
      total[i] += Math.max(0, component.expectedByBin[offset + i] ?? 0);
    }
  }
  return total;
}

export function leaveOneBackgroundOut(
  models: DetectorLikelihood[],
  components: BackgroundSlice[],
  dropId: string,
): DetectorLikelihood[] {
  let offset = 0;
  return models.map((model) => {
    const n = model.bins.length;
    const bg = remainderSlice(components, dropId, offset, n);
    offset += n;
    return {
      ...model,
      bins: model.bins.map((bin, i) => ({ ...bin, backgroundExpected: Math.max(1e-12, bg[i] ?? 0) })),
    };
  });
}

export function robustnessSweep(args: {
  h1: DetectorLikelihood[];
  h0: DetectorLikelihood[];
  components: BackgroundSlice[];
}): RobustnessReport {
  const fullH1 = calculateJointLikelihood(args.h1);
  const fullH0 = calculateJointLikelihood(args.h0);
  const fullDelta = fullH1.logLikelihood - fullH0.logLikelihood;
  const rows: RobustnessRow[] = [];

  const detectorIds = [...new Set(args.h1.map((m) => m.detectorId))];
  for (const id of detectorIds) {
    if (detectorIds.length < 2) break;
    const h1 = leaveOneDetectorOut(args.h1, id);
    const h0 = leaveOneDetectorOut(args.h0, id);
    const delta = h1.logLikelihood - h0.logLikelihood;
    rows.push({
      dropped: id,
      kind: "DETECTOR",
      logLikelihood: h1.logLikelihood,
      deltaVsFull: delta - fullDelta,
      preferredStill: delta > 0,
    });
  }

  for (const component of args.components) {
    const h1 = calculateJointLikelihood(leaveOneBackgroundOut(args.h1, args.components, component.id));
    const h0 = calculateJointLikelihood(leaveOneBackgroundOut(args.h0, args.components, component.id));
    const delta = h1.logLikelihood - h0.logLikelihood;
    rows.push({
      dropped: component.id,
      kind: "BACKGROUND",
      logLikelihood: h1.logLikelihood,
      deltaVsFull: delta - fullDelta,
      preferredStill: delta > 0,
    });
  }

  const stable = rows.length === 0 || rows.every((r) => r.preferredStill === fullDelta > 0);
  return {
    full: fullH1,
    rows,
    stable,
    fullDelta,
    note: stable
      ? "Preference is stable under leave-one-out. Still not evidence."
      : "Preference flips when a detector or background is dropped. Do not promote.",
  };
}
