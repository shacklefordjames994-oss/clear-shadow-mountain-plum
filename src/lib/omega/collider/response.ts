/*
 * ATLAS literature response on top of atlas.ts envelopes.
 * A ray through TileCal is not a cluster.
 *
 * GEOMETRY != RESPONSE
 * SMEARING != CALIBRATION
 * CLUSTER != DEPOSIT
 * RESPONSE != OBSERVATION
 *
 * Resolutions are pedagogical stand-ins for the published
 * stochastic ⊕ constant forms, not a tuned ATLAS config.
 */

import { layersForEta, type AtlasFamily } from "./atlas";
import type { ChargedTrack } from "./generators";
import { RNG } from "../scinet/master";

export type AtlasId = "TRACK" | "ELECTRON" | "PHOTON" | "MUON" | "JET" | "INVISIBLE";

export interface TruthProbe {
  eta: number;
  phi: number;
  pT: number;
  energy: number;
  charge: number;
  name: "electron" | "muon" | "photon" | "jet" | "neutrino" | "dark" | "pion" | "proton";
}

export interface AtlasObject {
  id: string;
  idGuess: AtlasId;
  eta: number;
  phi: number;
  truthPT: number;
  measuredPT: number;
  emGeV: number;
  hadGeV: number;
  muonStations: number;
  trackerLayers: number;
  families: AtlasFamily[];
  triggered: boolean;
  evidence: "SIMULATED";
}

export interface AtlasResponse {
  objects: AtlasObject[];
  nMuon: number;
  nElectron: number;
  nPhoton: number;
  nJet: number;
  nTrack: number;
  sumET: number;
  met: number;
  meanEmFrac: number;
  note: string;
  discoveryEligible: false;
}

function gauss(rng: RNG): number {
  return rng.gaussian();
}

function smear(value: number, rel: number, rng: RNG): number {
  return Math.max(0, value * (1 + gauss(rng) * rel));
}

/** σE/E = a/√E ⊕ b  — literature-shaped toys. */
function emRel(energy: number): number {
  const e = Math.max(energy, 0.3);
  return Math.hypot(0.1 / Math.sqrt(e), 0.007);
}

function hadRel(energy: number): number {
  const e = Math.max(energy, 0.5);
  return Math.hypot(0.5 / Math.sqrt(e), 0.03);
}

function idRel(pT: number): number {
  return 0.015 * (pT / 100) + 0.01;
}

function splitTruth(probe: TruthProbe): { em: number; had: number; mip: number } {
  const e = Math.max(probe.energy, probe.pT);
  if (probe.name === "neutrino" || probe.name === "dark") return { em: 0, had: 0, mip: 0 };
  if (probe.name === "electron" || probe.name === "photon") return { em: 0.96 * e, had: 0.04 * e, mip: 0 };
  if (probe.name === "muon") return { em: 0.2, had: 2.8, mip: e };
  return { em: 0.28 * e, had: 0.72 * e, mip: 0 };
}

function guessId(args: {
  probe: TruthProbe;
  em: number;
  had: number;
  muonStations: number;
  trackerLayers: number;
}): AtlasId {
  if (args.probe.name === "neutrino" || args.probe.name === "dark") return "INVISIBLE";
  const cal = args.em + args.had;
  const emFrac = cal > 0.2 ? args.em / cal : 0;
  const mipLike = cal < 6 && args.had < 4;
  if (args.probe.name === "muon" && args.muonStations >= 2 && args.trackerLayers >= 3) return "MUON";
  if (mipLike && args.probe.name === "muon") return "MUON";
  if (emFrac > 0.88 && args.trackerLayers >= 3 && (args.probe.name === "electron" || args.probe.charge !== 0)) {
    return "ELECTRON";
  }
  if (emFrac > 0.88 && args.trackerLayers === 0) return "PHOTON";
  if (args.trackerLayers >= 2 && args.had < 1.5 && args.muonStations === 0 && args.probe.charge !== 0) {
    return "TRACK";
  }
  return "JET";
}

export function respondProbe(probe: TruthProbe, rng: RNG, index: number): AtlasObject {
  const hit = layersForEta(probe.eta);
  const families = [...new Set(hit.map((l) => l.family))];
  const has = (f: AtlasFamily) => families.includes(f);
  const trackerLayers = hit.filter((l) => l.family === "PIXEL" || l.family === "SCT" || l.family === "TRT").length;
  const muonStations = hit.filter((l) => l.family === "MUON").length;
  const truth = splitTruth(probe);
  const emGeV = has("EMCAL") ? smear(truth.em, emRel(truth.em), rng) : 0;
  const hadGeV = has("HCAL") ? smear(truth.had, hadRel(truth.had), rng) : 0;
  const idGuess = guessId({ probe, em: emGeV, had: hadGeV, muonStations, trackerLayers });
  let measuredPT = 0;
  if (idGuess === "INVISIBLE") measuredPT = 0;
  else if (idGuess === "MUON" && has("PIXEL")) {
    const id = smear(probe.pT, idRel(probe.pT), rng);
    const ms = smear(probe.pT, 0.03 + 0.01 * (probe.pT / 100), rng);
    measuredPT = 0.6 * id + 0.4 * ms;
  } else if ((idGuess === "ELECTRON" || idGuess === "PHOTON") && emGeV > 0) {
    measuredPT = emGeV / Math.cosh(probe.eta);
  } else if (idGuess === "JET") {
    measuredPT = (emGeV + hadGeV) / Math.max(1e-3, Math.cosh(probe.eta));
  } else if (trackerLayers >= 2) {
    measuredPT = smear(probe.pT, idRel(probe.pT), rng);
  } else {
    measuredPT = (emGeV + hadGeV) / Math.max(1e-3, Math.cosh(probe.eta));
  }
  return {
    id: `atlas-${index}`,
    idGuess,
    eta: probe.eta,
    phi: probe.phi,
    truthPT: probe.pT,
    measuredPT: Math.max(0, measuredPT),
    emGeV,
    hadGeV,
    muonStations,
    trackerLayers,
    families,
    triggered: measuredPT > (idGuess === "JET" ? 40 : 8),
    evidence: "SIMULATED",
  };
}

export function tracksToProbes(tracks: ChargedTrack[]): TruthProbe[] {
  return tracks.map((t) => ({
    eta: t.eta,
    phi: t.phi,
    pT: t.pT,
    energy: t.energy,
    charge: t.charge,
    name: "pion" as const,
  }));
}

export function respondProbes(probes: TruthProbe[], seed: number): AtlasResponse {
  const rng = new RNG(seed ^ 0x41544c53);
  const objects = probes.slice(0, 80).map((p, i) => respondProbe(p, rng, i));
  const visible = objects.filter((o) => o.idGuess !== "INVISIBLE");
  let sx = 0;
  let sy = 0;
  let sumET = 0;
  let em = 0;
  let had = 0;
  for (const o of visible) {
    sumET += o.measuredPT;
    em += o.emGeV;
    had += o.hadGeV;
    sx += o.measuredPT * Math.cos(o.phi);
    sy += o.measuredPT * Math.sin(o.phi);
  }
  const cal = em + had;
  return {
    objects,
    nMuon: objects.filter((o) => o.idGuess === "MUON").length,
    nElectron: objects.filter((o) => o.idGuess === "ELECTRON").length,
    nPhoton: objects.filter((o) => o.idGuess === "PHOTON").length,
    nJet: objects.filter((o) => o.idGuess === "JET").length,
    nTrack: objects.filter((o) => o.idGuess === "TRACK").length,
    sumET,
    met: Math.hypot(sx, sy),
    meanEmFrac: cal > 0 ? em / cal : 0,
    note: "Toy stochastic⊕constant smear on literature envelopes. Not a calibrated ATLAS config. RESPONSE != OBSERVATION.",
    discoveryEligible: false,
  };
}
