import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/omega/panel";
import { GradeBadge } from "@/components/omega/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { DIM_CATALOG, DIM_EXAMPLES, analyzeEquations, formatDim } from "@/lib/omega/dimensions";
import type { DimAnalysis, DimEquation } from "@/lib/omega/dimensions";
import { THEORY_DOMAINS } from "@/lib/omega/constants";
import { omegaHash } from "@/lib/omega/hash";
import { useOmegaStore } from "@/lib/omega/store";
import { draftTheory } from "@/lib/omega/theory-validate";
import type { CheckStatus, TheoryRecord } from "@/lib/omega/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/theory")({ component: TheoryPage });

function TheoryPage() {
  const theories = useOmegaStore((s) => s.theories);
  const selectedId = useOmegaStore((s) => s.selectedTheoryId);
  const selectTheory = useOmegaStore((s) => s.selectTheory);
  const runTheoryValidation = useOmegaStore((s) => s.runTheoryValidation);
  const attemptCertify = useOmegaStore((s) => s.attemptCertify);
  const addTheory = useOmegaStore((s) => s.addTheory);
  const lastCert = useOmegaStore((s) => s.events.find((e) => e.type === "CERTIFY_MODEL"));
  const theory = theories.find((t) => t.id === selectedId) ?? theories[0];

  const [probeEq, setProbeEq] = useState<string>(DIM_EXAMPLES[0].eq);
  const [probeDomain, setProbeDomain] = useState("fluid_dynamics");
  const live = useMemo(
    () => (theory ? analyzeEquations(theory.equations, theory.variables) : null),
    [theory],
  );
  const probe = useMemo(() => analyzeEquations(probeEq), [probeEq]);

  function admitProbe() {
    const draft = draftTheory({
      id: omegaHash(probeEq + Date.now()),
      title: "Admitted probe",
      domain: probeDomain,
      equations: probeEq,
      note: probe.summary,
    });
    addTheory(draft);
  }

  function runSelected() {
    if (!theory) return;
    runTheoryValidation(theory.id);
  }

  return (
    <div>
      <PageHeader
        kicker="Theory fabric v5.3"
        title="Dimensional structure"
        description="Every additive term must share one SI vector. Operators change exponents: ∂/∂t subtracts T, ∇ subtracts L. Catalog is an assumption, not truth. Match is not certification."
      />

      <div className="grid min-w-0 gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Panel title="Contracts">
          <ul className="space-y-1">
            {theories.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => selectTheory(t.id)}
                  className={cn(
                    "flex h-auto min-h-11 w-full flex-col items-start rounded-md px-3 py-2 text-left",
                    t.id === theory?.id ? "bg-accent" : "hover:bg-accent/60",
                  )}
                >
                  <span className="text-sm">{t.title}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {t.status} · {t.regime}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        {theory ? (
          <div className="min-w-0 space-y-4">
            <Panel
              title={theory.title}
              meta={<GradeBadge grade={theory.evidenceGrade} />}
              action={
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={runSelected}>
                    Run validation
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => attemptCertify(theory.id)}>
                    Attempt certify
                  </Button>
                </div>
              }
            >
              <p className="font-mono text-xs text-muted-foreground">
                {theory.id} · v{theory.version} · {theory.domain} · scale {theory.scale}
              </p>
              <p className="mt-3 font-mono text-sm leading-relaxed break-all">{theory.equations}</p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                <Meta k="Regime" v={theory.regime} />
                <Meta k="Status" v={theory.status} />
                <Meta k="Certified" v={theory.certified ? "yes" : "no"} />
              </dl>
              {theory.variables.length > 0 ? (
                <ul className="mt-4 space-y-1">
                  {theory.variables.map((v) => (
                    <li key={v.symbol} className="flex justify-between gap-2 font-mono text-xs">
                      <span>
                        {v.symbol} — {v.meaning}
                      </span>
                      <span className="text-muted-foreground">{v.dimension}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-3 text-sm text-muted-foreground">{theory.note}</p>
            </Panel>

            {live ? (
              <Panel
                title="Term ledger"
                meta={<StatusChip status={live.hardReject ? "FAIL" : live.consistent ? "PASS" : "WARN"} />}
              >
                <p className="mb-3 text-sm text-muted-foreground">{live.summary}</p>
                <DimLedger analysis={live} />
              </Panel>
            ) : null}

            <Panel
              title="Independent checks"
              meta={
                <span className="font-mono text-[10px] text-muted-foreground">
                  {theory.lastReport?.hash ?? "not run this session"}
                </span>
              }
            >
              {theory.lastReport ? (
                <>
                  <ul className="space-y-2">
                    {theory.lastReport.checks.map((c) => (
                      <li key={c.id} className="rounded-md bg-secondary px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm">{c.label}</span>
                          <StatusChip status={c.status} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{c.detail}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm">{theory.lastReport.summary}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Term ledger above is live SI arithmetic. Run validation to bind a hashed report to the twin and physics residuals.
                </p>
              )}
            </Panel>
          </div>
        ) : null}
      </div>

      {lastCert?.rejectedReason ? (
        <p className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{lastCert.rejectedReason}</p>
      ) : null}

      <Panel title="Equation probe" className="mt-4">
        <p className="mb-3 text-sm text-muted-foreground">
          Paste an equation or load a case. Additive terms must share one vector. Zero inherits. Unknown is not a pass.
        </p>
        <div className="mb-3 flex flex-wrap gap-1">
          {DIM_EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              className={cn(
                "h-11 rounded-md px-3 font-mono text-xs",
                probeEq === ex.eq ? "bg-accent text-foreground" : "bg-secondary text-muted-foreground",
              )}
              onClick={() => setProbeEq(ex.eq)}
            >
              {ex.label}
            </button>
          ))}
        </div>
        <label className="text-xs text-muted-foreground">
          Domain
          <select
            className="mt-1 flex h-11 w-full rounded-sm border border-input bg-secondary px-3 text-sm text-foreground"
            value={probeDomain}
            onChange={(e) => setProbeDomain(e.target.value)}
          >
            {THEORY_DOMAINS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-xs text-muted-foreground">
          Equation
          <Textarea className="mt-1 font-mono" rows={3} value={probeEq} onChange={(e) => setProbeEq(e.target.value)} />
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusChip status={probe.hardReject ? "FAIL" : probe.consistent ? "PASS" : "WARN"} />
          <span className="text-sm text-muted-foreground">{probe.summary}</span>
        </div>
        <div className="mt-3">
          <DimLedger analysis={probe} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" onClick={admitProbe} disabled={probeEq.trim().length < 4}>
            Admit as hypothesis
          </Button>
        </div>
      </Panel>

      <Panel title="Assumed catalog" className="mt-4">
        <p className="mb-3 text-xs text-muted-foreground">
          These exponents are declared, not measured. A contract may override them. MODEL != REALITY.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="pb-2 font-mono font-medium">symbol</th>
                <th className="pb-2 font-mono font-medium">meaning</th>
                <th className="pb-2 font-mono font-medium">M</th>
                <th className="pb-2 font-mono font-medium">L</th>
                <th className="pb-2 font-mono font-medium">T</th>
                <th className="pb-2 font-mono font-medium">Θ</th>
                <th className="pb-2 font-mono font-medium">I</th>
                <th className="pb-2 font-mono font-medium">SI</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(DIM_CATALOG).map(([sym, meta]) => (
                <tr key={sym} className="border-t border-border">
                  <td className="py-1.5 font-mono">{sym}</td>
                  <td className="py-1.5 text-muted-foreground">{meta.meaning}</td>
                  <td className="py-1.5 font-mono">{meta.dim.M}</td>
                  <td className="py-1.5 font-mono">{meta.dim.L}</td>
                  <td className="py-1.5 font-mono">{meta.dim.T}</td>
                  <td className="py-1.5 font-mono">{meta.dim.Theta}</td>
                  <td className="py-1.5 font-mono">{meta.dim.I}</td>
                  <td className="py-1.5 font-mono text-muted-foreground">{formatDim(meta.dim)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Compatibility matrix" className="mt-4">
        <p className="mb-3 text-xs text-muted-foreground">
          Never force incompatible theories into one equation. A cell is a relation, not a fusion.
        </p>
        <Matrix theories={theories} />
      </Panel>
    </div>
  );
}

function DimLedger({ analysis }: { analysis: DimAnalysis }) {
  if (!analysis.equations.length) {
    return <p className="text-sm text-muted-foreground">No A = B structure to score.</p>;
  }
  return (
    <div className="space-y-4">
      {analysis.equations.map((eq) => (
        <EquationTable key={eq.raw} eq={eq} />
      ))}
    </div>
  );
}

function EquationTable({ eq }: { eq: DimEquation }) {
  return (
    <div>
      <p className="mb-2 font-mono text-xs text-muted-foreground">
        target {eq.target} · {eq.consistent ? "consistent" : eq.hardReject ? "rejected" : "unresolved"}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="pb-2 font-mono font-medium">side</th>
              <th className="pb-2 font-mono font-medium">term</th>
              <th className="pb-2 font-mono font-medium">M</th>
              <th className="pb-2 font-mono font-medium">L</th>
              <th className="pb-2 font-mono font-medium">T</th>
              <th className="pb-2 font-mono font-medium">Θ</th>
              <th className="pb-2 font-mono font-medium">I</th>
              <th className="pb-2 font-mono font-medium">SI</th>
            </tr>
          </thead>
          <tbody>
            {eq.terms.map((t, i) => (
              <tr key={`${t.side}-${t.raw}-${i}`} className="border-t border-border">
                <td className="py-1.5 font-mono text-muted-foreground">{t.side}</td>
                <td className="py-1.5 font-mono">{t.raw}</td>
                <td className="py-1.5 font-mono">{t.dim ? t.dim.M : "—"}</td>
                <td className="py-1.5 font-mono">{t.dim ? t.dim.L : "—"}</td>
                <td className="py-1.5 font-mono">{t.dim ? t.dim.T : "—"}</td>
                <td className="py-1.5 font-mono">{t.dim ? t.dim.Theta : "—"}</td>
                <td className="py-1.5 font-mono">{t.dim ? t.dim.I : "—"}</td>
                <td className={cn("py-1.5 font-mono", t.ok ? "text-ok" : "text-danger")}>{t.formatted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {eq.terms.some((t) => t.note) ? (
        <ul className="mt-2 space-y-1">
          {eq.terms
            .filter((t) => t.note)
            .map((t, i) => (
              <li key={t.raw + i} className={cn("text-xs", t.ok ? "text-muted-foreground" : "text-danger")}>
                {t.raw}: {t.note}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-secondary p-3">
      <div className="font-mono text-[10px] uppercase text-muted-foreground">{k}</div>
      <div className="font-mono text-sm">{v}</div>
    </div>
  );
}

function StatusChip({ status }: { status: CheckStatus }) {
  const tone = status === "PASS" ? "ok" : status === "WARN" ? "warn" : status === "BLOCK" ? "info" : "danger";
  return <Badge tone={tone}>{status}</Badge>;
}

function Matrix({ theories }: { theories: TheoryRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr>
            <th className="pb-2 font-mono font-medium text-muted-foreground"> </th>
            {theories.map((t) => (
              <th key={t.id} className="pb-2 pr-3 font-mono font-medium whitespace-nowrap text-muted-foreground">
                {t.id}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {theories.map((row) => (
            <tr key={row.id} className="border-t border-border">
              <th className="py-2 pr-3 font-mono font-medium whitespace-nowrap">{row.id}</th>
              {theories.map((col) => {
                const self = row.id === col.id;
                const conflict = row.conflictsWith.includes(col.id) || col.conflictsWith.includes(row.id);
                const label = self ? "self" : conflict ? "conflict" : "adjacent";
                return (
                  <td key={col.id} className="py-2">
                    <span className={cn(conflict ? "text-warn" : "text-muted-foreground")}>{label}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
