/** Global fourth-order Richardson wrapper. Exponent 1/4. Not a local step-doubling controller. */

export type RefinementRow = {
  iteration: number;
  stepSize: number;
  q: number;
  coarseEnergy: number;
  fineEnergy: number;
  richardsonEnergy: number;
  estimatedError: number;
  relativeError: number;
};

export type RefinementResult = {
  energy: number;
  estimatedError: number;
  relativeError: number;
  stepSize: number;
  iterations: number;
  converged: boolean;
  history: RefinementRow[];
};

export function adaptiveEigenvalue(
  solveEnergy: (step: number) => number,
  options: {
    initialStep: number;
    relativeTolerance?: number;
    energyScale?: number;
    safety?: number;
    minStep?: number;
    maxIterations?: number;
    maxRefinementFactor?: number;
  },
): RefinementResult {
  const relativeTolerance = options.relativeTolerance ?? 1e-6;
  const energyScale = options.energyScale ?? 1;
  const safety = options.safety ?? 0.9;
  const minStep = options.minStep ?? 1e-6;
  const maxIterations = options.maxIterations ?? 20;
  const maxRefinementFactor = options.maxRefinementFactor ?? 2;
  if (options.initialStep <= 0 || minStep <= 0 || minStep >= options.initialStep) {
    throw new Error("Invalid adaptive step settings");
  }
  let h = options.initialStep;
  let previous = 2 * h;
  let coarse = solveEnergy(previous);
  const history: RefinementRow[] = [];
  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const fine = solveEnergy(h);
    if (!Number.isFinite(coarse) || !Number.isFinite(fine)) {
      throw new Error("Solver returned a non-finite eigenvalue");
    }
    const q = previous / h;
    if (q <= 1) throw new Error("New grid is not finer than the previous grid");
    const denominator = q ** 4 - 1;
    const estimatedError = Math.abs(fine - coarse) / denominator;
    const extrapolated = (q ** 4 * fine - coarse) / denominator;
    const relativeError = estimatedError / Math.max(Math.abs(extrapolated), energyScale);
    history.push({
      iteration,
      stepSize: h,
      q,
      coarseEnergy: coarse,
      fineEnergy: fine,
      richardsonEnergy: extrapolated,
      estimatedError,
      relativeError,
    });
    if (relativeError <= relativeTolerance) {
      return {
        energy: extrapolated,
        estimatedError,
        relativeError,
        stepSize: h,
        iterations: iteration,
        converged: true,
        history,
      };
    }
    let factor = safety * (relativeTolerance / relativeError) ** 0.25;
    factor = Math.min(1, Math.max(1 / maxRefinementFactor, factor));
    let next = h * factor;
    if (next >= h) next = h / 2;
    if (next < minStep) throw new Error("Minimum grid spacing reached before convergence");
    coarse = fine;
    previous = h;
    h = next;
  }
  throw new Error("Adaptive refinement did not converge");
}
