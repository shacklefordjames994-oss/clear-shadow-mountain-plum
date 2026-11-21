/*
 * ATLAS detector envelopes — literature geometry for DHC-TWIN.
 * Run 2 / Run 3 Inner Detector (IBL + Pixel + SCT + TRT).
 * ITk is the HL-LHC replacement and is NOT this layout.
 *
 * GEOMETRY != DETECTOR
 * LITERATURE_ENVELOPE != SURVEY
 * A drawing of ATLAS is not ATLAS.
 */

export const ATLAS_LAYOUT = "RUN2-RUN3-LITERATURE" as const;

export type AtlasFamily =
  | "BEAMPIPE"
  | "PIXEL"
  | "SCT"
  | "TRT"
  | "SOLENOID"
  | "EMCAL"
  | "HCAL"
  | "MUON"
  | "FORWARD";

export interface AtlasLayer {
  id: string;
  name: string;
  family: AtlasFamily;
  rMinM: number;
  rMaxM: number;
  zMaxM: number;
  etaMax: number;
  role: string;
  evidence: "LITERATURE";
}

export const ATLAS_LAYERS: AtlasLayer[] = [
  {
    id: "BEAMPIPE",
    name: "Beam pipe",
    family: "BEAMPIPE",
    rMinM: 0.024,
    rMaxM: 0.036,
    zMaxM: 3.5,
    etaMax: 4.9,
    role: "Beryllium vacuum envelope. Not a tracker.",
    evidence: "LITERATURE",
  },
  {
    id: "IBL",
    name: "Insertable B-Layer",
    family: "PIXEL",
    rMinM: 0.033,
    rMaxM: 0.04,
    zMaxM: 0.33,
    etaMax: 2.5,
    role: "Innermost pixels, installed 2014. Vertexing.",
    evidence: "LITERATURE",
  },
  {
    id: "PIX0",
    name: "Pixel layer 0",
    family: "PIXEL",
    rMinM: 0.0505,
    rMaxM: 0.052,
    zMaxM: 0.4,
    etaMax: 2.5,
    role: "Original B-layer at 50.5 mm.",
    evidence: "LITERATURE",
  },
  {
    id: "PIX1",
    name: "Pixel layer 1",
    family: "PIXEL",
    rMinM: 0.0885,
    rMaxM: 0.09,
    zMaxM: 0.4,
    etaMax: 2.5,
    role: "Pixel barrel 88.5 mm.",
    evidence: "LITERATURE",
  },
  {
    id: "PIX2",
    name: "Pixel layer 2",
    family: "PIXEL",
    rMinM: 0.1225,
    rMaxM: 0.124,
    zMaxM: 0.4,
    etaMax: 2.5,
    role: "Pixel barrel 122.5 mm.",
    evidence: "LITERATURE",
  },
  {
    id: "SCT0",
    name: "SCT layer 0",
    family: "SCT",
    rMinM: 0.299,
    rMaxM: 0.305,
    zMaxM: 0.75,
    etaMax: 2.5,
    role: "Silicon-strip barrel 299 mm.",
    evidence: "LITERATURE",
  },
  {
    id: "SCT1",
    name: "SCT layer 1",
    family: "SCT",
    rMinM: 0.371,
    rMaxM: 0.377,
    zMaxM: 0.75,
    etaMax: 2.5,
    role: "Silicon-strip barrel 371 mm.",
    evidence: "LITERATURE",
  },
  {
    id: "SCT2",
    name: "SCT layer 2",
    family: "SCT",
    rMinM: 0.443,
    rMaxM: 0.449,
    zMaxM: 0.75,
    etaMax: 2.5,
    role: "Silicon-strip barrel 443 mm.",
    evidence: "LITERATURE",
  },
  {
    id: "SCT3",
    name: "SCT layer 3",
    family: "SCT",
    rMinM: 0.514,
    rMaxM: 0.52,
    zMaxM: 0.75,
    etaMax: 2.5,
    role: "Silicon-strip barrel 514 mm.",
    evidence: "LITERATURE",
  },
  {
    id: "TRT",
    name: "TRT barrel",
    family: "TRT",
    rMinM: 0.563,
    rMaxM: 1.066,
    zMaxM: 0.712,
    etaMax: 2.0,
    role: "Straw tubes. ~36 hits on a central track.",
    evidence: "LITERATURE",
  },
  {
    id: "SOLENOID",
    name: "Solenoid",
    family: "SOLENOID",
    rMinM: 1.23,
    rMaxM: 1.28,
    zMaxM: 2.9,
    etaMax: 2.5,
    role: "2 T axial field. Inner/outer 2.46 / 2.56 m diameter, 5.8 m long.",
    evidence: "LITERATURE",
  },
  {
    id: "EMB",
    name: "EM calorimeter barrel",
    family: "EMCAL",
    rMinM: 1.4,
    rMaxM: 2.0,
    zMaxM: 3.2,
    etaMax: 1.475,
    role: "LAr accordion. Electrons and photons. |η| < 1.475.",
    evidence: "LITERATURE",
  },
  {
    id: "TILE",
    name: "Tile calorimeter",
    family: "HCAL",
    rMinM: 2.28,
    rMaxM: 4.25,
    zMaxM: 2.9,
    etaMax: 1.7,
    role: "Steel / scintillator. 2.28–4.25 m. Central + extended barrels.",
    evidence: "LITERATURE",
  },
  {
    id: "MS_INNER",
    name: "Muon inner station",
    family: "MUON",
    rMinM: 4.5,
    rMaxM: 5.5,
    zMaxM: 6.5,
    etaMax: 2.7,
    role: "MDT tracking ~5 m. Independent of the Inner Detector.",
    evidence: "LITERATURE",
  },
  {
    id: "MS_MIDDLE",
    name: "Muon middle station",
    family: "MUON",
    rMinM: 7.0,
    rMaxM: 8.0,
    zMaxM: 10,
    etaMax: 2.7,
    role: "MDT + RPC ~7.5 m. Trigger in the barrel.",
    evidence: "LITERATURE",
  },
  {
    id: "MS_OUTER",
    name: "Muon outer station",
    family: "MUON",
    rMinM: 9.5,
    rMaxM: 11.0,
    zMaxM: 12,
    etaMax: 2.7,
    role: "MDT ~10 m. Spectrometer outer radius ~11 m.",
    evidence: "LITERATURE",
  },
  {
    id: "ZDC",
    name: "Zero Degree Calorimeter",
    family: "FORWARD",
    rMinM: 0,
    rMaxM: 0.1,
    zMaxM: 140,
    etaMax: 8,
    role: "At |z| ≈ 140 m. Neutral spectators in ion runs. Not drawn to scale.",
    evidence: "LITERATURE",
  },
];

export const ATLAS_NOTE =
  "Run 2/3 literature envelopes (JINST 3 S08003 and later public notes). ITk pixels/strips replace this Inner Detector at HL-LHC and are not drawn. LITERATURE_ENVELOPE != SURVEY. GEOMETRY != DETECTOR.";

export const ATLAS_SCENE_SCALE = 0.38;

export const ATLAS_SCENE = [
  { id: "PIXEL", rM: 0.124, zM: 0.65, color: 0x8fa3b8, opacity: 0.28 },
  { id: "SCT", rM: 0.52, zM: 0.75, color: 0x8fa3b8, opacity: 0.22 },
  { id: "TRT", rM: 1.066, zM: 0.71, color: 0x7a9a80, opacity: 0.18 },
  { id: "SOLENOID", rM: 1.28, zM: 2.9, color: 0x5c6370, opacity: 0.16 },
  { id: "EMCAL", rM: 2.0, zM: 3.2, color: 0x7a9a80, opacity: 0.14 },
  { id: "HCAL", rM: 4.25, zM: 3.1, color: 0xc4a574, opacity: 0.12 },
  { id: "MS_I", rM: 5.0, zM: 6.5, color: 0x8b919c, opacity: 0.1 },
  { id: "MS_M", rM: 7.5, zM: 8.5, color: 0x8b919c, opacity: 0.09 },
  { id: "MS_O", rM: 10.0, zM: 10, color: 0x8b919c, opacity: 0.08 },
] as const;

export function layersForEta(eta: number): AtlasLayer[] {
  const a = Math.abs(eta);
  return ATLAS_LAYERS.filter((layer) => layer.family !== "FORWARD" && a <= layer.etaMax);
}

export interface HitCensus {
  eta: number;
  families: Record<AtlasFamily, number>;
  layers: string[];
  evidence: "SIMULATED";
}

export function censusTracks(etas: number[]): {
  perTrack: HitCensus[];
  familyTotals: Record<AtlasFamily, number>;
  meanLayers: number;
} {
  const families: AtlasFamily[] = [
    "BEAMPIPE",
    "PIXEL",
    "SCT",
    "TRT",
    "SOLENOID",
    "EMCAL",
    "HCAL",
    "MUON",
    "FORWARD",
  ];
  const familyTotals = Object.fromEntries(families.map((f) => [f, 0])) as Record<AtlasFamily, number>;
  const perTrack = etas.map((eta) => {
    const hit = layersForEta(eta);
    const row: Record<AtlasFamily, number> = Object.fromEntries(families.map((f) => [f, 0])) as Record<
      AtlasFamily,
      number
    >;
    for (const layer of hit) {
      row[layer.family] += 1;
      familyTotals[layer.family] += 1;
    }
    return { eta, families: row, layers: hit.map((l) => l.id), evidence: "SIMULATED" as const };
  });
  const meanLayers = perTrack.length ? perTrack.reduce((s, t) => s + t.layers.length, 0) / perTrack.length : 0;
  return { perTrack, familyTotals, meanLayers };
}
