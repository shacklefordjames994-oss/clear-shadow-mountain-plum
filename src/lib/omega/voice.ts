import type { OmegaState } from "./types";
import type { VoiceFocus } from "./spacetime";

export interface VoiceTurn {
  role: string;
  speaker: string;
  text: string;
  pitch: number;
  rate: number;
  clip?: string;
  focus: VoiceFocus;
}

export function focusForRole(role: string): VoiceFocus {
  if (role === "PHYSICS") return "T14";
  if (role === "RESEARCH") return "TPC";
  if (role === "RED_TEAM") return "SPACETIME";
  if (role === "SECURITY") return "GUARD";
  return "SPACETIME";
}

export function buildAgentBriefing(state: OmegaState): VoiceTurn[] {
  const t14 = state.twins.find((t) => t.id === "t14");
  const oil = typeof t14?.observed.oilTempC === "number" ? t14.observed.oilTempC.toFixed(1) : "unknown";
  const rec = state.decisions[0]?.options.find((o) => o.id === state.decisions[0]?.recommendationId);
  const dm = state.darkMatter.lastSummary;
  const denial = state.events.find((e) => e.rejected);
  const faultNote =
    state.physicsFault === "FAN_STALL"
      ? "DigiSim is running a fan-stall branch. Hotspot is simulated."
      : state.physicsFault === "BLOCKAGE"
        ? "DigiSim is running a blockage branch. Do not write it to the twin."
        : "DigiSim is nominal.";

  return [
    {
      role: "COORDINATOR",
      speaker: "Coordinator-1",
      pitch: 0.92,
      rate: 1.0,
      clip: "/voice/coordinator.mp3",
      focus: "SPACETIME",
      text: `Coordinator. Session authority ${state.authority}. Observed T-14 oil is ${oil} degrees. ${faultNote} Simulated hotspot ${state.physics.simHotspotC.toFixed(1)} degrees. ${rec ? `Standing recommendation: ${rec.label}. Not authorized.` : "No recommendation locked."} I may speak. I may not actuate.`,
    },
    {
      role: "PHYSICS",
      speaker: "Physics-04",
      pitch: 1.02,
      rate: 1.02,
      clip: "/voice/physics.mp3",
      focus: "T14",
      text: `Physics. Cooling analogue is ${state.physics.turbulence}. Divergence ${state.physics.maxDivergence.toFixed(4)}. Kinetic ${state.physics.kineticEnergy.toFixed(2)}. ${faultNote} Simulation is not observation. The twin was not written.`,
    },
    {
      role: "RESEARCH",
      speaker: "Research-6",
      pitch: 1.12,
      rate: 1.04,
      clip: "/voice/research.mp3",
      focus: "TPC",
      text: dm
        ? `Research. Dark-matter lab last run is ${dm.state}. Accepted ${dm.accepted}, NR-like ${dm.nrLike}. Preferred ${dm.preferred}. Discovery gate ${dm.discoveryGate ? "open" : "closed"}. Simulated recoils are not evidence.`
        : "Research. No dark-matter run is on the bus yet. The laboratory remains simulated. The discovery gate stays closed.",
    },
    {
      role: "RED_TEAM",
      speaker: "RedTeam-11",
      pitch: 0.78,
      rate: 0.96,
      clip: "/voice/redteam.mp3",
      focus: "SPACETIME",
      text: "Red team. Dissent stays visible. Sensor lag may hide a hotspot. A nicer chi-square is not a halo detection. A pretty cluster in a four-D slice can vanish when you rotate W. Anomaly is not discovery.",
    },
    {
      role: "SECURITY",
      speaker: "Guard-L3",
      pitch: 0.7,
      rate: 0.94,
      clip: "/voice/gate-closed.mp3",
      focus: "GUARD",
      text: `Guard. Security ${state.security}. Rejected writes ${state.rejectedCount}. ${denial?.rejectedReason ?? "Fail closed at rest."} Voice cannot rewrite trust roots. Speech cannot grant A5.`,
    },
  ];
}

export const STUDIO_CLIPS = [
  { id: "briefing", label: "Studio five-agent briefing", src: "/voice/agent-briefing.mp3", note: "Recorded. Not live state.", focus: "SPACETIME" as VoiceFocus },
  { id: "coordinator", label: "Coordinator A2", src: "/voice/coordinator.mp3", note: "Recommend ≠ authorize", focus: "SPACETIME" as VoiceFocus },
  { id: "physics", label: "Physics DigiSim", src: "/voice/physics.mp3", note: "Twin was not written", focus: "T14" as VoiceFocus },
  { id: "research", label: "Research SCI:SIM", src: "/voice/research.mp3", note: "SCI:DISC locked", focus: "TPC" as VoiceFocus },
  { id: "spacetime", label: "Visual fabric 2D–4D", src: "/voice/spacetime.mp3", note: "Pictures ≠ evidence", focus: "SPACETIME" as VoiceFocus },
  { id: "redteam", label: "Red-team dissent", src: "/voice/redteam.mp3", note: "Contradiction kept", focus: "SPACETIME" as VoiceFocus },
  { id: "gate", label: "Discovery gate", src: "/voice/gate-closed.mp3", note: "SCI:DISC locked", focus: "GUARD" as VoiceFocus },
  { id: "a5", label: "A5 refusal", src: "/voice/a5-refused.mp3", note: "Voice cannot grant A5", focus: "GUARD" as VoiceFocus },
] as const;
