import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/omega/panel";
import { GradeBadge } from "@/components/omega/badges";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { THEORY_DOMAINS } from "@/lib/omega/constants";
import { omegaHash } from "@/lib/omega/hash";
import { synthesizeTheory } from "@/lib/omega/research";
import { HYPOTHESES, SCINET_PIPELINE, SCINET_VERSION } from "@/lib/omega/scinet/master";
import { useOmegaStore } from "@/lib/omega/store";
import { draftTheory } from "@/lib/omega/theory-validate";

export const Route = createFileRoute("/_app/research")({ component: ResearchPage });

function ResearchPage() {
  const theories = useOmegaStore((s) => s.theories);
  const addTheory = useOmegaStore((s) => s.addTheory);
  const [domain, setDomain] = useState("fluid_dynamics");
  const [prompt, setPrompt] = useState(
    "Propose the governing equations for transformer cooling oil as an incompressible Newtonian fluid with temperature-dependent viscosity. State the validity regime.",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSynthesize() {
    setPending(true);
    setError(null);
    try {
      const result = await synthesizeTheory({ data: { prompt, domain } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const draft = draftTheory({
        id: omegaHash(result.theory.title + Date.now()),
        title: result.theory.title,
        domain,
        equations: result.theory.equations,
        assumptions: result.theory.assumptions,
        note: `${result.theory.note} Independent validation required. Not certified.`,
      });
      addTheory(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Synthesis failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <PageHeader
        kicker="SCI-NET v2"
        title="Scientific intelligence network"
        description="Generated models are hypotheses. Hard reject dimensional nonsense. Never convert synthesis into observation, evidence, or certification. SCI-NET contracts stay frozen."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/package">Open package v13</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dark-matter">Open Dark Matter Lab</Link>
            </Button>
          </>
        }
      />

      <Panel title={`SCI-NET ${SCINET_VERSION} contract`} className="mb-4">
        <p className="text-sm text-muted-foreground">
          OBSERVED ≠ DERIVED ≠ INFERRED ≠ HYPOTHETICAL ≠ SIMULATED. The inference chain is frozen before unblinding. Synthetic events are controls only.
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {SCINET_PIPELINE.map((stage) => (
            <span key={stage} className="rounded-md bg-secondary px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {stage}
            </span>
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          Hypotheses: {HYPOTHESES.map((h) => h.id.replace("_", " ")).join(" · ")}
        </p>
      </Panel>

      <Panel title="Theory agent">
        <label className="text-xs text-muted-foreground">
          Domain
          <select
            className="mt-1 flex h-11 w-full rounded-sm border border-input bg-secondary px-3 text-sm text-foreground"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          >
            {THEORY_DOMAINS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-xs text-muted-foreground">
          Question
          <Textarea className="mt-1" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button onClick={onSynthesize} disabled={pending || prompt.trim().length < 8}>
            {pending ? "Synthesizing…" : "Synthesize hypothesis"}
          </Button>
          <span className="text-xs text-muted-foreground">User-initiated. Capped. Not evidence.</span>
        </div>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </Panel>

      <Panel title="Hypothesis ledger" className="mt-4">
        <div className="space-y-3">
          {theories.map((t) => (
            <article key={t.id} className="rounded-lg bg-secondary p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium">{t.title}</h3>
                <GradeBadge grade={t.evidenceGrade} />
                <span className="font-mono text-[10px] text-muted-foreground">
                  {t.status} · {t.regime}
                </span>
              </div>
              <p className="mt-2 font-mono text-xs leading-relaxed">{t.equations}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t.note}</p>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
