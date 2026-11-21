import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/omega/panel";
import { VoiceVisualizer } from "@/components/omega/voice-visualizer";
import { STUDIO_CLIPS, buildAgentBriefing, focusForRole, type VoiceTurn } from "@/lib/omega/voice";
import { speechEngine } from "@/lib/omega/speech";
import { useOmegaStore } from "@/lib/omega/store";
import { cn } from "@/lib/utils";

export function VoiceConsole({ compact = false }: { compact?: boolean }) {
  const [live, setLive] = useState(false);
  const [clip, setClip] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [turnIndex, setTurnIndex] = useState(-1);
  const [speaker, setSpeaker] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakBriefing = useOmegaStore((s) => s.speakBriefing);
  const attemptVoiceAuthorize = useOmegaStore((s) => s.attemptVoiceAuthorize);
  const setVoiceRuntime = useOmegaStore((s) => s.setVoiceRuntime);
  const lastVoice = useOmegaStore((s) =>
    s.events.find((e) => e.type === "SPEAK" || e.type === "VOICE_AUTHORIZE"),
  );

  useEffect(() => {
    const unsub = speechEngine.subscribe((st) => {
      setLive(st.live);
      setTurnIndex(st.index);
      setSpeaker(st.speaker);
      useOmegaStore.getState().setVoiceRuntime(st.speaker, st.role ? focusForRole(st.role) : null);
      if (!st.live) setActive((a) => (a === "live" ? null : a));
    });
    return () => {
      unsub();
      speechEngine.stop();
      audioRef.current?.pause();
      useOmegaStore.getState().setVoiceRuntime(null, null);
    };
  }, []);

  function stopAll() {
    speechEngine.stop();
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setLive(false);
    setClip(null);
    setActive(null);
    setSpeaker(null);
    setTurnIndex(-1);
    setVoiceRuntime(null, null);
  }

  function playClip(src: string, id: string, focus: ReturnType<typeof focusForRole>) {
    speechEngine.stop();
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.src = src;
    void audio.play();
    audio.onended = () => {
      setClip(null);
      setActive(null);
      setSpeaker(null);
      setVoiceRuntime(null, null);
    };
    setClip(src);
    setLive(false);
    setActive(id);
    setSpeaker(id);
    setVoiceRuntime(id, focus);
    speakBriefing("STUDIO", id);
  }

  function speakLive(from = 0) {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    const turns = buildAgentBriefing(useOmegaStore.getState());
    speechEngine.speak(turns, from, () => {
      setActive(null);
      setVoiceRuntime(null, null);
    });
    setClip(null);
    setActive("live");
    speakBriefing("LIVE", turns.map((t) => t.role).join(","));
  }

  function speakOne(turn: VoiceTurn) {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    speechEngine.speak([turn], 0, () => {
      setActive(null);
      setVoiceRuntime(null, null);
    });
    setClip(null);
    setActive(turn.role);
    setVoiceRuntime(turn.speaker, turn.focus);
    speakBriefing("LIVE", turn.role);
  }

  function onVoiceA5() {
    stopAll();
    const evt = attemptVoiceAuthorize();
    playClip("/voice/a5-refused.mp3", "a5", "GUARD");
    void evt;
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={live ? stopAll : () => speakLive(0)}>
            {live ? "Stop voice" : "Speak live briefing"}
          </Button>
          {live ? (
            <Button size="sm" variant="outline" onClick={() => speechEngine.skip()}>
              Next agent
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => playClip("/voice/agent-briefing.mp3", "briefing", "SPACETIME")}>
              Studio reel
            </Button>
          )}
        </div>
        <VoiceVisualizer active={live || Boolean(clip)} speaker={speaker} />
      </div>
    );
  }

  const turns = buildAgentBriefing(useOmegaStore.getState());

  return (
    <Panel
      title="Agentic voice"
      meta={<Badge tone={live || clip ? "info" : "default"}>{live ? "LIVE" : clip ? "STUDIO" : "IDLE"}</Badge>}
      action={
        <Button size="sm" variant="outline" onClick={stopAll}>
          Silence
        </Button>
      }
    >
      <p className="text-sm text-muted-foreground">
        Agents may speak a recommendation. Speech is not authority. Studio clips are recordings. Live briefing reads the bus.
      </p>
      <div className="mt-3">
        <VoiceVisualizer active={live || Boolean(clip)} speaker={speaker} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={live ? stopAll : () => speakLive(0)}>{live ? "Stop live" : "Speak live state"}</Button>
        {live ? (
          <Button variant="outline" onClick={() => speechEngine.skip()}>
            Skip turn
          </Button>
        ) : null}
        <Button variant="destructive" onClick={onVoiceA5}>
          Voice-authorize A5
        </Button>
      </div>
      <ul className="mt-4 space-y-2">
        {turns.map((t, i) => (
          <li key={t.role}>
            <button
              type="button"
              onClick={() => (live && turnIndex === i ? speechEngine.skip() : speakOne(t))}
              className={cn(
                "flex h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm",
                live && turnIndex === i ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent/60",
              )}
            >
              <span>{t.speaker}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{t.role} · A2</span>
            </button>
          </li>
        ))}
      </ul>
      <ul className="mt-4 space-y-2">
        {STUDIO_CLIPS.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => (active === c.id ? stopAll() : playClip(c.src, c.id, c.focus))}
              className={cn(
                "flex h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm",
                active === c.id ? "bg-accent" : "bg-secondary hover:bg-accent/60",
              )}
            >
              <span>{c.label}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{c.note}</span>
            </button>
          </li>
        ))}
      </ul>
      {lastVoice?.rejectedReason ? <p className="mt-3 text-sm text-danger">{lastVoice.rejectedReason}</p> : null}
      {lastVoice && !lastVoice.rejected ? (
        <p className="mt-3 font-mono text-[10px] text-muted-foreground">
          {lastVoice.type} · {lastVoice.eventId}
        </p>
      ) : null}
    </Panel>
  );
}
