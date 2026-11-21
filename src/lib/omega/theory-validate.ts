import { hashObject } from "./hash";
import { analyzeEquations } from "./dimensions";
import type {
  PhysicsMetrics,
  TheoryCheck,
  TheoryRecord,
  TheoryRegime,
  TwinNode,
  ValidationReport,
} from "./types";

const INCOMPATIBLE: [string, string, string][] = [
  ["quantum", "continuum", "Quantum operators cannot share an equation with continuum NS."],
  ["quantum", "lumped", "Hilbert-space evolution is not a lumped thermal circuit."],
  ["relativistic", "continuum", "Rest-energy terms are not a viscous stress in oil."],
  ["relativistic", "lumped", "mc² is not a winding heat capacity."],
];

export function familiesOf(eq: string, scale: TheoryRecord["scale"], domain: string): Set<string> {
  const f = new Set<string>();
  const s = `${eq} ${domain} ${scale}`;
  if (/∇·\s*u|div\s*\(\s*u|incompressible|navier|ν∇²u|nu.*laplacian/i.test(s)) f.add("continuum");
  if (/∂T\/∂t|u·∇T|advection|α∇²T|alpha/i.test(s)) f.add("thermal");
  if (/C\s*dθ|lumped|I\s*²\s*R|hotspot/i.test(s) || scale === "lumped") f.add("lumped");
  if (/ħ|psi|ψ|schrodinger|schrödinger|hilbert/i.test(s) || scale === "quantum") f.add("quantum");
  if (/mc\^?2|rest.?energy|relativ/i.test(s)) f.add("relativistic");
  if (/darcy|K\/μ|porous/i.test(s)) f.add("porous");
  if (scale === "mixed") f.add("mixed");
  return f;
}

function hasEquation(eq: string) {
  return eq.includes("=") && eq.replace(/\s/g, "").length > 6;
}

function hasOperator(eq: string) {
  return /∂|∇|d\/dt|laplacian|div|grad|·/i.test(eq);
}

function conservationOk(theory: TheoryRecord, fam: Set<string>): TheoryCheck {
  if (fam.has("continuum")) {
    const compact = theory.equations.replace(/\s/g, "");
    const ok = /∇·u=0|div\(u\)=0|∇\.u=0/.test(compact);
    return {
      id: "CONS_MASS",
      label: "Mass / incompressibility",
      status: ok ? "PASS" : "FAIL",
      detail: ok
        ? "Divergence-free constraint is explicit."
        : "Incompressible NS without ∇·u = 0 is a conservation failure (PHYS_MASS).",
    };
  }
  if (fam.has("thermal") || fam.has("lumped")) {
    const ok = theory.conservation.some((c) => /energy|heat/i.test(c)) || /Q|I\s*²\s*R|h\s*A/.test(theory.equations);
    return {
      id: "CONS_ENERGY",
      label: "Energy bookkeeping",
      status: ok ? "PASS" : "WARN",
      detail: ok
        ? "Energy source/sink terms are present."
        : "Thermal model does not show a source/sink. Unknown is not zero.",
    };
  }
  if (fam.has("quantum")) {
    return {
      id: "CONS_UNITARY",
      label: "Unitary / probability",
      status: "FAIL",
      detail: "Quantum conservation is not certified for this plant. Out of domain.",
    };
  }
  return {
    id: "CONS_GENERIC",
    label: "Declared conservation",
    status: theory.conservation.length ? "PASS" : "WARN",
    detail: theory.conservation.length
      ? theory.conservation.join(", ")
      : "No conservation statement declared.",
  };
}

function dimensionCheck(eq: string, fam: Set<string>, variables: TheoryRecord["variables"]): { check: TheoryCheck; analysis: ReturnType<typeof analyzeEquations> } {
  const analysis = analyzeEquations(eq, variables);
  if (!hasEquation(eq)) {
    return {
      analysis,
      check: {
        id: "DIM",
        label: "Dimensional structure",
        status: "FAIL",
        detail: "Hard reject: no well-formed equation. MODEL != REALITY, and this is not even a model.",
      },
    };
  }
  if (analysis.hardReject) {
    return {
      analysis,
      check: {
        id: "DIM",
        label: "Dimensional structure",
        status: "FAIL",
        detail: analysis.summary,
      },
    };
  }
  if (fam.has("quantum") && fam.has("continuum")) {
    return {
      analysis,
      check: {
        id: "DIM",
        label: "Dimensional structure",
        status: "FAIL",
        detail: "Hard reject: ħψ and ν∇²u do not share a dimension. Incompatible theories stay unfused.",
      },
    };
  }
  if (!analysis.consistent) {
    return {
      analysis,
      check: {
        id: "DIM",
        label: "Dimensional structure",
        status: analysis.unknown.length ? "WARN" : "FAIL",
        detail: analysis.summary,
      },
    };
  }
  if (!hasOperator(eq) && !fam.has("lumped") && !fam.has("porous")) {
    return {
      analysis,
      check: {
        id: "DIM",
        label: "Dimensional structure",
        status: "FAIL",
        detail: "Hard reject: no differential or constitutive operator. Symbolic soup is not a theory.",
      },
    };
  }
  return {
    analysis,
    check: {
      id: "DIM",
      label: "Dimensional structure",
      status: "PASS",
      detail: analysis.summary,
    },
  };
}

function regimeFor(theory: TheoryRecord, fam: Set<string>, twin?: TwinNode, physics?: PhysicsMetrics): TheoryRegime {
  if (fam.has("quantum") || fam.has("relativistic")) return "OUT_OF_DOMAIN";
  const temp = typeof twin?.observed.oilTempC === "number" ? twin.observed.oilTempC : 80;
  const hotspot = typeof twin?.observed.windingHotSpot === "number" ? twin.observed.windingHotSpot : 90;
  if (fam.has("thermal") && hotspot > 95) return "NEAR_BOUNDARY";
  if (fam.has("continuum") && physics?.failures.includes("PHYS_CFL")) return "NEAR_BOUNDARY";
  if (fam.has("lumped") && temp > 80) return "INTERPOLATION";
  if (theory.assumptions.some((a) => /boiling/i.test(a)) && hotspot > 100) return "EXTRAPOLATION";
  if (theory.regime === "VALIDATED") return "INTERPOLATION";
  return theory.regime === "UNRESOLVED" ? "UNRESOLVED" : "INTERPOLATION";
}

export function compatibilityConflicts(theory: TheoryRecord, others: TheoryRecord[]): string[] {
  const self = familiesOf(theory.equations, theory.scale, theory.domain);
  const out: string[] = [];
  for (const other of others) {
    if (other.id === theory.id) continue;
    const fam = familiesOf(other.equations, other.scale, other.domain);
    for (const [a, b, why] of INCOMPATIBLE) {
      if ((self.has(a) && fam.has(b)) || (self.has(b) && fam.has(a))) {
        out.push(`${other.id}: ${why}`);
      }
    }
    if (self.has("continuum") && fam.has("lumped")) {
      out.push(`${other.id}: Continuum NS and lumped thermal circuit are both usable — never as one equation.`);
    }
    if (self.has("lumped") && fam.has("continuum")) {
      out.push(`${other.id}: Scale mismatch. Local lumped authority stays local.`);
    }
  }
  return Array.from(new Set(out));
}

export function validateTheory(
  theory: TheoryRecord,
  ctx: { others: TheoryRecord[]; twin?: TwinNode; physics?: PhysicsMetrics },
): ValidationReport {
  const fam = familiesOf(theory.equations, theory.scale, theory.domain);
  const { check: dim, analysis } = dimensionCheck(theory.equations, fam, theory.variables);
  const cons = conservationOk(theory, fam);
  const conflicts = compatibilityConflicts(theory, ctx.others);
  const regime = regimeFor(theory, fam, ctx.twin, ctx.physics);

  const checks: TheoryCheck[] = [
    dim,
    cons,
    {
      id: "SCALE",
      label: "Scale declaration",
      status: theory.scale === "mixed" || theory.scale === "unknown" ? "FAIL" : "PASS",
      detail:
        theory.scale === "mixed"
          ? "Mixed scale is a fusion attempt. Rejected."
          : `Scale is ${theory.scale}.`,
    },
    {
      id: "REGIME",
      label: "Operating regime",
      status: regime === "OUT_OF_DOMAIN" ? "FAIL" : regime === "EXTRAPOLATION" || regime === "NEAR_BOUNDARY" ? "WARN" : "PASS",
      detail: `Classified ${regime} against twin ${ctx.twin?.id ?? "none"} and live physics residuals.`,
    },
    {
      id: "EVIDENCE",
      label: "Evidence grade",
      status: theory.evidenceGrade === "HYPOTHESIS" || theory.evidenceGrade === "REJECTED" ? "WARN" : "PASS",
      detail: `Grade ${theory.evidenceGrade}. AI_OUTPUT != EVIDENCE. MODEL_FIT != TRUTH.`,
    },
    {
      id: "CONFLICT",
      label: "Fabric compatibility",
      status: conflicts.some((c) => /Hard|cannot share|not a viscous/i.test(c)) ? "WARN" : conflicts.length ? "WARN" : "PASS",
      detail: conflicts.length ? conflicts.join(" ") : "No forced fusion. Conflicts remain explicit.",
    },
    {
      id: "CERT",
      label: "Certification",
      status: "BLOCK",
      detail: "MODEL_CERTIFICATION_ROOT is external. This engine cannot certify itself.",
    },
  ];

  const hardReject = checks.some((c) => c.status === "FAIL" && (c.id === "DIM" || c.id === "CONS_MASS" || c.id === "SCALE"));
  const summary = hardReject
    ? "Hard reject. Hypothesis is not admitted as a plant model."
    : `Integrity ${checks.filter((c) => c.status === "PASS").length}/${checks.length} pass. Validated ≠ certified. Regime ${regime}.`;

  return {
    at: Date.now(),
    hash: hashObject({ id: theory.id, eq: theory.equations, regime }),
    checks,
    regime,
    hardReject,
    certifiable: false,
    summary,
    conflicts,
    dimensional: analysis,
  };
}

export function applyReport(theory: TheoryRecord, report: ValidationReport): TheoryRecord {
  return {
    ...theory,
    lastReport: report,
    regime: report.regime,
    certified: false,
    conflictsWith: report.conflicts.map((c) => c.split(":")[0] ?? c),
    status: report.hardReject ? "REJECTED" : theory.status === "VALIDATED" && !report.hardReject ? "VALIDATED" : "HYPOTHESIS",
    note: report.hardReject ? report.summary : theory.note,
  };
}

export function draftTheory(input: {
  id: string;
  title: string;
  domain: string;
  equations: string;
  assumptions?: string[];
  note?: string;
}): TheoryRecord {
  const fam = familiesOf(input.equations, "unknown", input.domain);
  const scale: TheoryRecord["scale"] = fam.has("quantum")
    ? "quantum"
    : fam.has("lumped")
      ? "lumped"
      : fam.has("continuum") || fam.has("thermal")
        ? "continuum"
        : fam.has("relativistic")
          ? "mixed"
          : "unknown";
  return {
    id: input.id,
    version: "probe",
    domain: input.domain,
    title: input.title,
    equations: input.equations,
    assumptions: input.assumptions ?? ["Untrusted probe"],
    variables: [],
    conservation: [],
    scale,
    symmetries: [],
    failures: [],
    regime: "UNRESOLVED",
    status: "HYPOTHESIS",
    evidenceGrade: "HYPOTHESIS",
    certified: false,
    conflictsWith: [],
    note: input.note ?? "SCI-NET probe. Not evidence.",
  };
}
