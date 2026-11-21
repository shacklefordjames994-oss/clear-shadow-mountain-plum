/** SI dimensional analysis for theory-fabric equations. Not a CAS. Not certification. */

export type DimVec = { M: number; L: number; T: number; Theta: number; I: number; N: number };

export interface DimTerm {
  raw: string;
  side: "LHS" | "RHS";
  dim: DimVec | null;
  formatted: string;
  ok: boolean;
  note: string;
}

export interface DimEquation {
  raw: string;
  consistent: boolean;
  hardReject: boolean;
  target: string;
  terms: DimTerm[];
  unknown: string[];
  summary: string;
}

export interface DimAnalysis {
  equations: DimEquation[];
  consistent: boolean;
  hardReject: boolean;
  unknown: string[];
  summary: string;
}

const ZERO: DimVec = { M: 0, L: 0, T: 0, Theta: 0, I: 0, N: 0 };
const KEYS: (keyof DimVec)[] = ["M", "L", "T", "Theta", "I", "N"];

export function dim(partial: Partial<DimVec> = {}): DimVec {
  return { ...ZERO, ...partial };
}

export function dimEq(a: DimVec, b: DimVec) {
  return KEYS.every((k) => Math.abs(a[k] - b[k]) < 1e-9);
}

export function dimAdd(a: DimVec, b: DimVec): DimVec {
  const out = dim();
  for (const k of KEYS) out[k] = a[k] + b[k];
  return out;
}

export function dimSub(a: DimVec, b: DimVec): DimVec {
  const out = dim();
  for (const k of KEYS) out[k] = a[k] - b[k];
  return out;
}

export function dimScale(a: DimVec, n: number): DimVec {
  const out = dim();
  for (const k of KEYS) out[k] = a[k] * n;
  return out;
}

export function formatDim(d: DimVec | null): string {
  if (!d) return "?";
  const parts: string[] = [];
  const label: Record<keyof DimVec, string> = { M: "M", L: "L", T: "T", Theta: "Θ", I: "I", N: "N" };
  for (const k of KEYS) {
    const n = d[k];
    if (Math.abs(n) < 1e-9) continue;
    const exp = Math.abs(n - Math.round(n)) < 1e-9 ? String(Math.round(n)) : n.toFixed(1);
    parts.push(n === 1 ? label[k] : `${label[k]}^${exp}`);
  }
  return parts.length ? parts.join(" ") : "1";
}

export function parseDimString(src: string): DimVec | null {
  const s = src.replace(/θ|Θ|theta/gi, "Theta").replace(/\s+/g, " ").trim();
  if (!s || s === "?" || s === "1" || s === "dimensionless") return dim();
  const out = dim();
  const re = /(Theta|[MLTIN])\s*(?:\^\s*(-?\d+(?:\.\d+)?))?/g;
  let m: RegExpExecArray | null;
  let any = false;
  while ((m = re.exec(s))) {
    any = true;
    const key = (m[1] === "Theta" ? "Theta" : m[1]) as keyof DimVec;
    out[key] += m[2] ? Number(m[2]) : 1;
  }
  return any ? out : null;
}

/** Declared catalog. Assumptions, not truth. */
export const DIM_CATALOG: Record<string, { dim: DimVec; meaning: string }> = {
  u: { dim: dim({ L: 1, T: -1 }), meaning: "velocity" },
  v: { dim: dim({ L: 1, T: -1 }), meaning: "velocity" },
  t: { dim: dim({ T: 1 }), meaning: "time" },
  x: { dim: dim({ L: 1 }), meaning: "length" },
  y: { dim: dim({ L: 1 }), meaning: "length" },
  z: { dim: dim({ L: 1 }), meaning: "length" },
  p: { dim: dim({ M: 1, L: -1, T: -2 }), meaning: "pressure" },
  rho: { dim: dim({ M: 1, L: -3 }), meaning: "density" },
  nu: { dim: dim({ L: 2, T: -1 }), meaning: "kinematic viscosity" },
  mu: { dim: dim({ M: 1, L: -1, T: -1 }), meaning: "dynamic viscosity" },
  T: { dim: dim({ Theta: 1 }), meaning: "temperature" },
  theta: { dim: dim({ Theta: 1 }), meaning: "temperature" },
  thetaamb: { dim: dim({ Theta: 1 }), meaning: "ambient temperature" },
  alpha: { dim: dim({ L: 2, T: -1 }), meaning: "thermal diffusivity" },
  Q: { dim: dim({ M: 1, L: -1, T: -3 }), meaning: "volumetric heat source" },
  cp: { dim: dim({ L: 2, T: -2, Theta: -1 }), meaning: "specific heat" },
  f: { dim: dim({ L: 1, T: -2 }), meaning: "body force / mass" },
  C: { dim: dim({ M: 1, L: 2, T: -2, Theta: -1 }), meaning: "thermal capacitance" },
  I: { dim: dim({ I: 1 }), meaning: "electric current" },
  R: { dim: dim({ M: 1, L: 2, T: -3, I: -2 }), meaning: "resistance" },
  h: { dim: dim({ M: 1, T: -3, Theta: -1 }), meaning: "heat-transfer coefficient" },
  A: { dim: dim({ L: 2 }), meaning: "area" },
  m: { dim: dim({ M: 1 }), meaning: "mass" },
  c: { dim: dim({ L: 1, T: -1 }), meaning: "speed of light" },
  E: { dim: dim({ M: 1, L: 2, T: -2 }), meaning: "energy" },
  hbar: { dim: dim({ M: 1, L: 2, T: -1 }), meaning: "reduced Planck constant" },
  psi: { dim: dim({ L: -1.5 }), meaning: "wavefunction (3-space)" },
  i: { dim: dim(), meaning: "imaginary unit" },
  k: { dim: dim({ L: 2 }), meaning: "permeability (Darcy)" },
  g: { dim: dim({ L: 1, T: -2 }), meaning: "gravity" },
};

const ALIAS: Record<string, string> = {
  ρ: "rho",
  ν: "nu",
  μ: "mu",
  α: "alpha",
  θ: "theta",
  ψ: "psi",
  ħ: "hbar",
  θamb: "thetaamb",
  Tamb: "thetaamb",
};

export const DIM_EXAMPLES = [
  { id: "ns", label: "Navier–Stokes", eq: "∂u/∂t + (u·∇)u = -∇p/ρ + ν∇²u + f" },
  { id: "div", label: "Incompressibility", eq: "∇·u = 0" },
  { id: "heat", label: "Advection–diffusion", eq: "∂T/∂t + u·∇T = α∇²T + Q/(ρ cp)" },
  { id: "lump", label: "Lumped circuit", eq: "C dθ/dt = I²R - h A (θ - θamb)" },
  { id: "emc", label: "Rest energy", eq: "E = m c^2" },
  { id: "badp", label: "p = ρ u", eq: "p = ρ u" },
  { id: "mash", label: "Mashup", eq: "iħ ∂ψ/∂t = ν∇²u + m c^2" },
  { id: "grad", label: "∇p vs viscosity", eq: "∇p = ν∇²u" },
] as const;

function normalize(src: string): string {
  let s = src;
  s = s.replace(/θamb/g, "thetaamb");
  for (const [from, to] of Object.entries(ALIAS)) s = s.replaceAll(from, to);
  s = s.replace(/∂/g, "d");
  s = s.replace(/∇\s*²|∇\s*\^\s*2/g, " LAP ");
  s = s.replace(/∇\s*·/g, " DIV ");
  s = s.replace(/∇/g, " GRAD ");
  s = s.replace(/·/g, "*");
  s = s.replace(/²/g, "^2");
  s = s.replace(/³/g, "^3");
  s = s.replace(/d\s*([A-Za-z]+)\s*\/\s*d\s*t/g, " DT $1 ");
  s = s.replace(/d\s*([A-Za-z]+)\s*\/\s*d\s*([A-Za-z]+)/g, " ( $1 / $2 ) ");
  s = s.replace(/\(\s*([A-Za-z]+)\s*\*\s*GRAD\s*\)/g, " $1 * GRAD ");
  return s.replace(/\s+/g, " ").trim();
}

type Tok = { k: "id" | "num" | "op"; v: string };

function splitIdent(name: string): string[] {
  if (name in DIM_CATALOG || name === "GRAD" || name === "DIV" || name === "LAP" || name === "DT") return [name];
  const keys = Object.keys(DIM_CATALOG).sort((a, b) => b.length - a.length);
  const out: string[] = [];
  let rest = name;
  while (rest) {
    const hit = keys.find((k) => rest.startsWith(k));
    if (!hit) {
      out.push(rest);
      break;
    }
    out.push(hit);
    rest = rest.slice(hit.length);
  }
  return out;
}

function tokenize(src: string): Tok[] {
  const s = normalize(src);
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === " ") {
      i++;
      continue;
    }
    const rest = s.slice(i);
    const opWord = rest.match(/^(GRAD|DIV|LAP|DT)\b/);
    if (opWord) {
      out.push({ k: "id", v: opWord[1] });
      i += opWord[1].length;
      continue;
    }
    const id = rest.match(/^[A-Za-z][A-Za-z0-9]*/);
    if (id) {
      for (const part of splitIdent(id[0])) out.push({ k: "id", v: part });
      i += id[0].length;
      continue;
    }
    const num = rest.match(/^\d+(?:\.\d+)?/);
    if (num) {
      out.push({ k: "num", v: num[0] });
      i += num[0].length;
      continue;
    }
    const ch = s[i];
    if ("+-*/^=(),".includes(ch)) {
      out.push({ k: "op", v: ch });
      i++;
      continue;
    }
    i++;
  }
  const withMul: Tok[] = [];
  for (let n = 0; n < out.length; n++) {
    const cur = out[n];
    const prev = withMul[withMul.length - 1];
    if (prev && cur) {
      const unary = prev.v === "GRAD" || prev.v === "DIV" || prev.v === "LAP" || prev.v === "DT";
      const left = !unary && (prev.k === "id" || prev.k === "num" || prev.v === ")");
      const right =
        cur.k === "id" || cur.k === "num" || cur.v === "(" || ["GRAD", "DIV", "LAP", "DT"].includes(cur.v);
      if (left && right) withMul.push({ k: "op", v: "*" });
    }
    withMul.push(cur);
  }
  return withMul;
}

type Node =
  | { t: "sym"; name: string }
  | { t: "num"; value: number }
  | { t: "zero" }
  | { t: "add" | "sub" | "mul" | "div"; left: Node; right: Node }
  | { t: "pow"; base: Node; exp: number }
  | { t: "grad" | "divop" | "lap" | "dt"; arg: Node };

class Parser {
  i = 0;
  tokens: Tok[];
  constructor(tokens: Tok[]) {
    this.tokens = tokens;
  }
  peek() {
    return this.tokens[this.i];
  }
  eat(v?: string) {
    const t = this.tokens[this.i];
    if (!t || (v && t.v !== v)) return undefined;
    this.i++;
    return t;
  }
  parseExpr(): Node {
    let n = this.parseTerm();
    while (this.peek()?.v === "+" || this.peek()?.v === "-") {
      const op = this.eat()!.v;
      const r = this.parseTerm();
      n = { t: op === "+" ? "add" : "sub", left: n, right: r };
    }
    return n;
  }
  parseTerm(): Node {
    let n = this.parseUnary();
    while (this.peek()?.v === "*" || this.peek()?.v === "/") {
      const op = this.eat()!.v;
      const r = this.parseUnary();
      n = { t: op === "*" ? "mul" : "div", left: n, right: r };
    }
    return n;
  }
  parseUnary(): Node {
    const t = this.peek();
    if (t?.v === "GRAD") {
      this.eat();
      return { t: "grad", arg: this.parseUnary() };
    }
    if (t?.v === "DIV") {
      this.eat();
      return { t: "divop", arg: this.parseUnary() };
    }
    if (t?.v === "LAP") {
      this.eat();
      return { t: "lap", arg: this.parseUnary() };
    }
    if (t?.v === "DT") {
      this.eat();
      return { t: "dt", arg: this.parseUnary() };
    }
    if (t?.v === "+" || t?.v === "-") {
      this.eat();
      const inner = this.parseUnary();
      return t.v === "-" ? { t: "mul", left: { t: "num", value: -1 }, right: inner } : inner;
    }
    return this.parsePower();
  }
  parsePower(): Node {
    const b = this.parsePrimary();
    if (this.peek()?.v === "^") {
      this.eat();
      const expTok = this.eat();
      const exp = expTok?.k === "num" ? Number(expTok.v) : expTok?.v === "-" ? -Number(this.eat()?.v ?? 1) : 1;
      return { t: "pow", base: b, exp };
    }
    return b;
  }
  parsePrimary(): Node {
    if (this.peek()?.v === "(") {
      this.eat();
      const inner = this.parseExpr();
      this.eat(")");
      return inner;
    }
    const t = this.eat();
    if (!t) return { t: "num", value: 1 };
    if (t.k === "num") return Number(t.v) === 0 ? { t: "zero" } : { t: "num", value: Number(t.v) };
    return { t: "sym", name: t.v };
  }
}

type EvalResult = { dim: DimVec | null; any: boolean; unknown: string[]; error?: string };

function evalNode(n: Node, table: Record<string, DimVec>): EvalResult {
  switch (n.t) {
    case "zero":
      return { dim: null, any: true, unknown: [] };
    case "num":
      return { dim: dim(), any: false, unknown: [] };
    case "sym": {
      const d = table[n.name];
      if (!d) return { dim: null, any: false, unknown: [n.name] };
      return { dim: d, any: false, unknown: [] };
    }
    case "add":
    case "sub": {
      const l = evalNode(n.left, table);
      const r = evalNode(n.right, table);
      const unknown = [...l.unknown, ...r.unknown];
      if (l.any) return { dim: r.dim, any: r.any, unknown };
      if (r.any) return { dim: l.dim, any: l.any, unknown };
      if (!l.dim || !r.dim) return { dim: null, any: false, unknown };
      if (!dimEq(l.dim, r.dim)) {
        return {
          dim: null,
          any: false,
          unknown,
          error: `add/sub mismatch ${formatDim(l.dim)} vs ${formatDim(r.dim)}`,
        };
      }
      return { dim: l.dim, any: false, unknown };
    }
    case "mul": {
      const l = evalNode(n.left, table);
      const r = evalNode(n.right, table);
      const unknown = [...l.unknown, ...r.unknown];
      if (!l.dim || !r.dim) return { dim: l.dim && r.any ? l.dim : r.dim && l.any ? r.dim : null, any: false, unknown };
      return { dim: dimAdd(l.dim, r.dim), any: false, unknown };
    }
    case "div": {
      const l = evalNode(n.left, table);
      const r = evalNode(n.right, table);
      const unknown = [...l.unknown, ...r.unknown];
      if (!l.dim || !r.dim) return { dim: null, any: false, unknown };
      return { dim: dimSub(l.dim, r.dim), any: false, unknown };
    }
    case "pow": {
      const b = evalNode(n.base, table);
      if (!b.dim) return b;
      return { dim: dimScale(b.dim, n.exp), any: false, unknown: b.unknown };
    }
    case "grad":
    case "divop": {
      const a = evalNode(n.arg, table);
      if (!a.dim) return a;
      return { dim: dimAdd(a.dim, dim({ L: -1 })), any: false, unknown: a.unknown };
    }
    case "lap": {
      const a = evalNode(n.arg, table);
      if (!a.dim) return a;
      return { dim: dimAdd(a.dim, dim({ L: -2 })), any: false, unknown: a.unknown };
    }
    case "dt": {
      const a = evalNode(n.arg, table);
      if (!a.dim) return a;
      return { dim: dimAdd(a.dim, dim({ T: -1 })), any: false, unknown: a.unknown };
    }
  }
}

function splitTop(src: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of src) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === sep && depth === 0) {
      if (buf.trim()) out.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function splitTerms(side: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = "";
  for (let i = 0; i < side.length; i++) {
    const ch = side[i];
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if ((ch === "+" || ch === "-") && depth === 0 && buf.trim()) {
      out.push(buf.trim());
      buf = ch === "-" ? "-" : "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function evalTerm(raw: string, table: Record<string, DimVec>): EvalResult {
  const tokens = tokenize(raw);
  if (!tokens.length) return { dim: dim(), any: true, unknown: [] };
  const node = new Parser(tokens).parseExpr();
  return evalNode(node, table);
}

export function catalogTable(overrides?: { symbol: string; dimension: string }[]): Record<string, DimVec> {
  const table: Record<string, DimVec> = {};
  for (const [k, v] of Object.entries(DIM_CATALOG)) table[k] = v.dim;
  for (const o of overrides ?? []) {
    const parsed = parseDimString(o.dimension);
    const name = ALIAS[o.symbol] ?? o.symbol;
    if (parsed) table[name] = parsed;
  }
  return table;
}

export function analyzeEquations(src: string, overrides?: { symbol: string; dimension: string }[]): DimAnalysis {
  const table = catalogTable(overrides);
  const chunks = splitTop(src.replace(/;/g, ","), ",").filter((c) => c.includes("="));
  if (!chunks.length && src.trim()) {
    return {
      equations: [],
      consistent: false,
      hardReject: true,
      unknown: [],
      summary: "Hard reject: no well-formed equation.",
    };
  }
  const equations = chunks.map((raw) => analyzeOne(raw, table));
  const hardReject = equations.some((e) => e.hardReject);
  const consistent = equations.length > 0 && equations.every((e) => e.consistent);
  const unknown = Array.from(new Set(equations.flatMap((e) => e.unknown)));
  const summary = hardReject
    ? equations.find((e) => e.hardReject)?.summary ?? "Hard reject: dimensional inconsistency."
    : consistent
      ? `Dimensional structure holds (${equations.length} equation${equations.length === 1 ? "" : "s"}). Catalog is an assumption, not truth.`
      : unknown.length
        ? `Unresolved symbols: ${unknown.join(", ")}. Unknown is not a pass.`
        : "Dimensional structure could not be confirmed.";
  return { equations, consistent, hardReject, unknown, summary };
}

function analyzeOne(raw: string, table: Record<string, DimVec>): DimEquation {
  const parts = splitTop(raw, "=");
  if (parts.length !== 2) {
    return {
      raw,
      consistent: false,
      hardReject: true,
      target: "?",
      terms: [],
      unknown: [],
      summary: "Hard reject: equation is not A = B.",
    };
  }
  const [lhs, rhs] = parts;
  const sides: DimTerm[] = [];
  const unknown: string[] = [];
  const errors: string[] = [];

  for (const [side, text] of [
    ["LHS", lhs],
    ["RHS", rhs],
  ] as const) {
    for (const term of splitTerms(text ?? "")) {
      const result = evalTerm(term, table);
      unknown.push(...result.unknown);
      if (result.error) errors.push(`${term}: ${result.error}`);
      sides.push({
        raw: term,
        side,
        dim: result.any ? null : result.dim,
        formatted: result.any ? "0 (any)" : formatDim(result.dim),
        ok: true,
        note: result.error ?? (result.unknown.length ? `unknown ${result.unknown.join(", ")}` : result.any ? "zero inherits" : ""),
      });
    }
  }

  const known = sides.filter((t) => t.dim);
  const target = known[0]?.dim ?? null;
  let mismatch = false;
  for (const t of sides) {
    if (t.formatted === "0 (any)") {
      t.ok = true;
      t.note = "zero is dimension-free; inherits the opposing side";
      continue;
    }
    if (!t.dim) {
      t.ok = false;
      continue;
    }
    if (target && !dimEq(t.dim, target)) {
      t.ok = false;
      t.note = `expected ${formatDim(target)}, got ${formatDim(t.dim)}`;
      mismatch = true;
    }
  }

  const hardReject = mismatch || errors.length > 0;
  const consistent = !hardReject && unknown.length === 0 && known.length > 0;
  const summary = hardReject
    ? `Hard reject: terms do not share ${formatDim(target)}. ${errors.join("; ")}`.trim()
    : unknown.length
      ? `Unresolved: ${Array.from(new Set(unknown)).join(", ")}`
      : `All terms are ${formatDim(target)}.`;

  return {
    raw,
    consistent,
    hardReject,
    target: formatDim(target),
    terms: sides,
    unknown: Array.from(new Set(unknown)),
    summary,
  };
}
