import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, Stat } from "@/components/omega/panel";
import { VoiceConsole } from "@/components/omega/voice-console";
import { Button } from "@/components/ui/button";
import { buildAgentBriefing } from "@/lib/omega/voice";
import { speechEngine } from "@/lib/omega/speech";
import { useOmegaStore } from "@/lib/omega/store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/voice")({ component: VoicePage });

function VoicePage() {
  const authority = useOmegaStore((s) => s.authority);
  const security = useOmegaStore((s) => s.security);
  const rejectedCount = useOmegaStore((s) => s.rejectedCount);
  const voiceSpeaker = useOmegaStore((s) => s.voiceSpeaker);
  const voiceFocus = useOmegaStore((s) => s.voiceFocus);
  const state = useOmegaStore.getState();
  const turns = buildAgentBriefing(state);
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    return speechEngine.subscribe((st) => setIndex(st.index));
  }, []);

  return (
    <div>
      <PageHeader
        kicker="Agent fabric · voice"
        title="Agents may speak. They may not rule."
        description="Live briefing reads the bus. Studio reels are recordings. Voice-authorize A5 is refused. Speech is an A2 channel."
        actions={
          <Button variant="outline" asChild>
            <Link to="/visuals">Open visuals</Link>
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Session" value={authority} hint="SPEAK requires A2" />
        <Stat label="Speaking" value={voiceSpeaker ?? "idle"} hint={voiceFocus ? `focus ${voiceFocus}` : "A2 only"} />
        <Stat label="Guard" value={security} hint={`${rejectedCount} rejected writes`} />
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <VoiceConsole />
        <Panel title="Script from live state">
          <ol className="space-y-3">
            {turns.map((t, i) => (
              <li
                key={t.role}
                className={cn("rounded-md p-3", index === i ? "bg-accent" : "bg-secondary")}
              >
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t.speaker} · {t.role} · look {t.focus}
                </div>
                <p className="mt-1 text-sm leading-relaxed">{t.text}</p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
}
