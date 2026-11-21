import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/omega/panel";
import { GradeBadge } from "@/components/omega/badges";
import { Button } from "@/components/ui/button";
import { useOmegaStore } from "@/lib/omega/store";

export const Route = createFileRoute("/_app/knowledge")({ component: KnowledgePage });

function KnowledgePage() {
  const evidence = useOmegaStore((s) => s.evidence);
  const theories = useOmegaStore((s) => s.theories);

  return (
    <div>
      <PageHeader
        kicker="Knowledge + evidence"
        title="Lineage that survives transformation"
        description="AI output is not evidence. Correlation is not causation. Contradictions remain visible. Every claim carries type, grade, uncertainty, and hash."
      />

      <Panel title="Evidence graph">
        <ul className="space-y-3">
          {evidence.map((e) => (
            <li key={e.id} className="rounded-lg bg-secondary p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs">{e.id}</span>
                <GradeBadge grade={e.grade} />
                <span className="font-mono text-[10px] uppercase text-muted-foreground">{e.type}</span>
              </div>
              <p className="mt-2 text-sm">{e.claim}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {e.source} · unc {e.uncertainty.toFixed(2)} · {e.hash}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1">
                {e.relations.map((r) => (
                  <li key={r.kind + r.targetId} className="rounded-full bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {r.kind} → {r.targetId}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Theory fabric v5.3"
        className="mt-4"
        action={
          <Button size="sm" variant="outline" asChild>
            <Link to="/theory">Open validation</Link>
          </Button>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          {theories.map((t) => (
            <article key={t.id} className="rounded-lg bg-secondary p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-medium">{t.title}</h3>
                <GradeBadge grade={t.evidenceGrade} />
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                {t.domain} · {t.regime} · {t.status}
              </p>
              <p className="mt-3 font-mono text-xs leading-relaxed">{t.equations}</p>
              <ul className="mt-2 list-disc pl-4 text-xs text-muted-foreground">
                {t.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">{t.note}</p>
            </article>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Incompatible theories are never forced into one equation. Conflicts stay explicit.
        </p>
      </Panel>
    </div>
  );
}
