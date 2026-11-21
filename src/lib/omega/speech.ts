import type { VoiceTurn } from "./voice";

export type SpeechStatus = {
  live: boolean;
  index: number;
  total: number;
  role: string | null;
  speaker: string | null;
};

type Listener = (status: SpeechStatus) => void;

const IDLE: SpeechStatus = { live: false, index: -1, total: 0, role: null, speaker: null };

class SpeechEngine {
  private listeners = new Set<Listener>();
  private turns: VoiceTurn[] = [];
  private index = -1;
  private live = false;
  private status: SpeechStatus = IDLE;
  private onDone: (() => void) | null = null;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.status);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    this.status = {
      live: this.live,
      index: this.index,
      total: this.turns.length,
      role: this.turns[this.index]?.role ?? null,
      speaker: this.turns[this.index]?.speaker ?? null,
    };
    for (const fn of this.listeners) fn(this.status);
  }

  private voices() {
    return window.speechSynthesis?.getVoices() ?? [];
  }

  private pickVoice(turn: VoiceTurn, i: number) {
    const voices = this.voices();
    if (voices.length === 0) return null;
    const prefer =
      turn.pitch < 0.85
        ? /male|daniel|david|fred|alex|google uk english male/i
        : /female|samantha|karen|zira|samantha|google uk english female/i;
    return voices.find((v) => prefer.test(v.name)) ?? voices[i % voices.length] ?? null;
  }

  private speakAt(i: number) {
    const synth = window.speechSynthesis;
    if (!synth) {
      this.stop();
      this.onDone?.();
      return;
    }
    if (i >= this.turns.length) {
      this.stop();
      this.onDone?.();
      return;
    }
    this.index = i;
    this.live = true;
    this.emit();
    const turn = this.turns[i];
    const u = new SpeechSynthesisUtterance(turn.text);
    u.rate = turn.rate;
    u.pitch = turn.pitch;
    const voice = this.pickVoice(turn, i);
    if (voice) u.voice = voice;
    u.onend = () => {
      if (!this.live) return;
      this.speakAt(i + 1);
    };
    u.onerror = () => {
      if (!this.live) return;
      this.speakAt(i + 1);
    };
    synth.speak(u);
  }

  speak(turns: VoiceTurn[], from = 0, onDone?: () => void) {
    this.stop();
    this.turns = turns;
    this.onDone = onDone ?? null;
    if (typeof window !== "undefined" && window.speechSynthesis && this.voices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        if (this.live || this.turns.length) this.speakAt(from);
      };
    }
    this.speakAt(from);
  }

  skip() {
    if (!this.live) return;
    window.speechSynthesis?.cancel();
    this.speakAt(this.index + 1);
  }

  stop() {
    this.live = false;
    this.index = -1;
    window.speechSynthesis?.cancel();
    this.emit();
  }
}

export const speechEngine = new SpeechEngine();
