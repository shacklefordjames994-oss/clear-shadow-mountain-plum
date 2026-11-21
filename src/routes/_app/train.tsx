import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, Stat } from "@/components/omega/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FINAL_QUIZ, LESSONS, PASSING, type DrillKind, type Lesson } from "@/lib/omega/train";
import { useOmegaStore } from "@/lib/omega/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/train")({ component: TrainPage });

const STORAGE_KEY = "omega-academy-v1";

type Progress = {
  done: string[];
  missed: string[];
  finalScore: number | null;
};

const EMPTY: Progress = { done: [], missed: [], finalScore: null };

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Progress;
    return {
      done: Array.isArray(parsed.done) ? parsed.done : [],
      missed: Array.isArray(parsed.missed) ? parsed.missed : [],
      finalScore: typeof parsed.finalScore === "number" ? parsed.finalScore : null,
    };
  } catch {
    return EMPTY;
  }
}

function TrainPage() {
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [lessonId, setLessonId] = useState(LESSONS[0]?.id ?? "map");
  const [picked, setPicked] = useState<number | null>(null);
  const [mode, setMode] = useState<"lesson" | "final">("lesson");
  const [finalPicks, setFinalPicks] = useState<(number | null)[]>(() => FINAL_QUIZ.map(() => null));
  const [finalSubmitted, setFinalSubmitted] = useState(false);
  const [drillNote, setDrillNote] = useState<string | null>(null);

  const trySelfAuthorize = useOmegaStore((s) => s.trySelfAuthorize);
  const dispatchTeam = useOmegaStore((s) => s.dispatchTeam);
  const injectProbe = useOmegaStore((s) => s.injectProbe);
  const runTheoryValidation = useOmegaStore((s) => s.runTheoryValidation);
  const selectTheory = useOmegaStore((s) => s.selectTheory);
  const runScenario = useOmegaStore((s) => s.runScenario);
  const attemptDiscovery = useOmegaStore((s) => s.attemptDiscovery);
  const rejectedCount = useOmegaStore((s) => s.rejectedCount);
  const security = useOmegaStore((s) => s.security);

  useEffect(() => {
    setProgress(loadProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress, hydrated]);

  const lesson = LESSONS.find((l) => l.id === lessonId) ?? LESSONS[0];
  const doneCount = progress.done.length;
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const finalScore = useMemo(() => {
    if (!finalSubmitted) return null;
    return FINAL_QUIZ.reduce((n, q, i) => n + (finalPicks[i] === q.answer ? 1 : 0), 0);
  }, [finalSubmitted, finalPicks]);

  function mark(id: string, ok: boolean) {
    setProgress((p) => ({
      ...p,
      done: ok ? Array.from(new Set([...p.done, id])) : p.done.filter((x) => x !== id),
      missed: ok ? p.missed.filter((x) => x !== id) : Array.from(new Set([...p.missed, id])),
    }));
  }

  function onPick(choice: number) {
    if (!lesson) return;
    setPicked(choice);
    mark(lesson.id, choice === lesson.quiz.answer);
  }

  function go(delta: number) {
    const next = LESSONS[idx + delta];
    if (!next) return;
    setLessonId(next.id);
    setPicked(null);
    setDrillNote(null);
    setMode("lesson");
  }

  function runDrill(kind: DrillKind) {
    if (kind === "self-authorize") {
      const evt = trySelfAuthorize();
      setDrillNote(evt.rejectedReason ?? "Rejected. Self-organization is not a key.");
      return;
    }
    if (kind === "dispatch") {
      dispatchTeam("ENGINEERING", "Hold Transformer T-14 inside the safe operating envelope through peak load.");
      setDrillNote("Engineering pattern is on the bus. They can recommend. They cannot authorize.");
      return;
    }
    if (kind === "probe") {
      injectProbe("AI_tools");
      setDrillNote("Unsigned probe held. Guard fails closed.");
      return;
    }
    if (kind === "validate-mash") {
      selectTheory("th-mash");
      runTheoryValidation("th-mash");
      setDrillNote("Mashup walked the SI checker. Hard reject is the correct grade.");
      return;
    }
    if (kind === "validate-ns") {
      selectTheory("th-ns");
      runTheoryValidation("th-ns");
      setDrillNote("Navier–Stokes terms share L T^-2. Validated is still not certified.");
      return;
    }
    if (kind === "run-scenario") {
      runScenario("sc-adv");
      setDrillNote("Adverse branch ran in isolation. Trusted T-14 did not move.");
      return;
    }
    if (kind === "declare-discovery") {
      const evt = attemptDiscovery("SCI:ANOMALY");
      setDrillNote(evt.rejectedReason ?? "Discovery blocked. Simulation is not evidence.");
    }
  }

  function submitFinal() {
    setFinalSubmitted(true);
    const score = FINAL_QUIZ.reduce((n, q, i) => n + (finalPicks[i] === q.answer ? 1 : 0), 0);
    setProgress((p) => ({ ...p, finalScore: score }));
  }

  if (!lesson) return null;

  return (
    <div>
      <PageHeader
        kicker="OMEGA Academy"
        title="How to run this room"
        description="Eleven short lessons, written for a sharp senior. Read the rule, press the live control, then prove you did not mix up seeing, guessing, and doing."
        actions={
          <Button variant={mode === "final" ? "default" : "outline"} onClick={() => setMode(mode === "final" ? "lesson" : "final")}>
            {mode === "final" ? "Back to lessons" : "Final check"}
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Lessons cleared" value={`${doneCount}/${LESSONS.length}`} hint="Correct check on the first or a later try" />
        <Stat label="Bus rejections" value={rejectedCount} hint="Failures are part of the log" />
        <Stat
          label="Final"
          value={progress.finalScore == null ? "—" : `${progress.finalScore}/${FINAL_QUIZ.length}`}
          hint={progress.finalScore == null ? "Not taken" : progress.finalScore >= PASSING ? "Pass" : "Retry"}
        />
      </div>

      {mode === "final" ? (
        <FinalExam
          picks={finalPicks}
          submitted={finalSubmitted}
          score={finalScore}
          onPick={(i, c) => {
            if (finalSubmitted) return;
            setFinalPicks((prev) => {
              const next = [...prev];
              next[i] = c;
              return next;
            });
          }}
          onSubmit={submitFinal}
          onReset={() => {
            setFinalSubmitted(false);
            setFinalPicks(FINAL_QUIZ.map(() => null));
          }}
        />
      ) : (
        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <Panel title="Syllabus">
            <ol className="space-y-1">
              {LESSONS.map((l) => {
                const cleared = progress.done.includes(l.id);
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setLessonId(l.id);
                        setPicked(null);
                        setDrillNote(null);
                      }}
                      className={cn(
                        "flex h-auto min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-left",
                        l.id === lesson.id ? "bg-accent" : "hover:bg-accent/60",
                      )}
                    >
                      <span className="font-mono text-[10px] text-muted-foreground">{String(l.n).padStart(2, "0")}</span>
                      <span className="flex-1 text-sm">{l.title}</span>
                      {cleared ? <Badge tone="ok">cleared</Badge> : null}
                    </button>
                  </li>
                );
              })}
            </ol>
          </Panel>

          <LessonView
            lesson={lesson}
            picked={picked}
            drillNote={drillNote}
            security={security}
            onPick={onPick}
            onDrill={runDrill}
            onPrev={() => go(-1)}
            onNext={() => go(1)}
            hasPrev={idx > 0}
            hasNext={idx < LESSONS.length - 1}
          />
        </div>
      )}
    </div>
  );
}

function LessonView({
  lesson,
  picked,
  drillNote,
  security,
  onPick,
  onDrill,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  lesson: Lesson;
  picked: number | null;
  drillNote: string | null;
  security: string;
  onPick: (n: number) => void;
  onDrill: (kind: DrillKind) => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const correct = picked === lesson.quiz.answer;
  return (
    <div className="min-w-0 space-y-4">
      <Panel
        title={`Lesson ${String(lesson.n).padStart(2, "0")}  ${lesson.title}`}
        meta={<span className="font-mono text-[10px] text-muted-foreground">{lesson.axiom}</span>}
      >
        <p className="text-base leading-relaxed text-foreground">{lesson.oneLiner}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{lesson.analogy}</p>
        {lesson.body.map((p) => (
          <p key={p.slice(0, 24)} className="mt-3 text-sm leading-relaxed">
            {p}
          </p>
        ))}
      </Panel>

      {lesson.drill.kind !== "none" || lesson.open ? (
        <Panel title="Do this, don’t just read it">
          <div className="flex flex-wrap gap-2">
            {lesson.drill.kind !== "none" ? (
              <Button onClick={() => onDrill(lesson.drill.kind)}>{lesson.drill.label}</Button>
            ) : null}
            {lesson.open ? (
              <Button variant="outline" asChild>
                <Link to={lesson.open.to}>{lesson.open.label}</Link>
              </Button>
            ) : null}
          </div>
          {lesson.drill.hint ? <p className="mt-3 text-sm text-muted-foreground">{lesson.drill.hint}</p> : null}
          {drillNote ? <p className="mt-3 text-sm">{drillNote}</p> : null}
          {lesson.drill.kind === "probe" ? (
            <p className="mt-2 font-mono text-xs text-muted-foreground">Guard status {security}</p>
          ) : null}
        </Panel>
      ) : null}

      <Panel title="Check">
        <p className="text-sm">{lesson.quiz.prompt}</p>
        <ul className="mt-3 space-y-2">
          {lesson.quiz.choices.map((c, i) => {
            const selected = picked === i;
            const show = picked != null;
            const ok = i === lesson.quiz.answer;
            return (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => onPick(i)}
                  className={cn(
                    "flex h-auto min-h-11 w-full items-start rounded-md px-3 py-2 text-left text-sm",
                    selected ? "bg-accent" : "bg-secondary hover:bg-accent/60",
                    show && ok ? "ring-1 ring-ok" : null,
                    show && selected && !ok ? "ring-1 ring-danger" : null,
                  )}
                >
                  <span className="mr-2 font-mono text-[10px] text-muted-foreground">{String.fromCharCode(65 + i)}</span>
                  <span>{c}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {picked != null ? (
          <p className={cn("mt-3 text-sm", correct ? "text-ok" : "text-danger")}>
            {correct ? "Cleared. " : "Not yet. "}
            {lesson.quiz.why}
          </p>
        ) : null}
      </Panel>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onPrev} disabled={!hasPrev}>
          Previous
        </Button>
        <Button onClick={onNext} disabled={!hasNext}>
          Next lesson
        </Button>
      </div>
    </div>
  );
}

function FinalExam({
  picks,
  submitted,
  score,
  onPick,
  onSubmit,
  onReset,
}: {
  picks: (number | null)[];
  submitted: boolean;
  score: number | null;
  onPick: (i: number, c: number) => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const ready = picks.every((p) => p != null);
  const passed = score != null && score >= PASSING;
  return (
    <Panel title="Final check — 10 questions, no curve" className="mt-4">
      <p className="mb-4 text-sm text-muted-foreground">
        Same bar as the lessons. Pass is {PASSING}/{FINAL_QUIZ.length}. You may retake.
      </p>
      <ol className="space-y-5">
        {FINAL_QUIZ.map((q, i) => (
          <li key={q.prompt} className="rounded-md bg-secondary p-3">
            <p className="text-sm">
              <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}  </span>
              {q.prompt}
            </p>
            <ul className="mt-2 space-y-1">
              {q.choices.map((c, ci) => {
                const selected = picks[i] === ci;
                const ok = ci === q.answer;
                return (
                  <li key={c}>
                    <button
                      type="button"
                      disabled={submitted}
                      onClick={() => onPick(i, ci)}
                      className={cn(
                        "flex h-auto min-h-11 w-full items-start rounded-md px-3 py-2 text-left text-sm",
                        selected ? "bg-accent" : "bg-background hover:bg-accent/60",
                        submitted && ok ? "ring-1 ring-ok" : null,
                        submitted && selected && !ok ? "ring-1 ring-danger" : null,
                      )}
                    >
                      {c}
                    </button>
                  </li>
                );
              })}
            </ul>
            {submitted ? <p className="mt-2 text-xs text-muted-foreground">{q.why}</p> : null}
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!submitted ? (
          <Button onClick={onSubmit} disabled={!ready}>
            Grade me
          </Button>
        ) : (
          <Button variant="outline" onClick={onReset}>
            Retake
          </Button>
        )}
        {score != null ? (
          <span className={cn("text-sm", passed ? "text-ok" : "text-danger")}>
            {score}/{FINAL_QUIZ.length} — {passed ? "You can sit this desk." : "Re-read the misses. The plant does not grade on a curve."}
          </span>
        ) : null}
      </div>
    </Panel>
  );
}
