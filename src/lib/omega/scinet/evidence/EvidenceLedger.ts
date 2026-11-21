/*
 * Append-only evidence ledger. A hashed simulation is still a simulation.
 * No entry may promote synthetic data to SCI:DISC.
 */

import { hashObject } from "../../hash";
import type { EvidenceGraph } from "./EvidenceGraph";
import { validateEvidenceGraph } from "./EvidenceGraph";

export interface LedgerEntry {
  seq: number;
  at: string;
  kind: "NODE" | "EDGE" | "GATE" | "WARNING" | "REJECT";
  ref: string;
  state: string;
  hash: string;
  note: string;
}

export interface EvidenceLedger {
  ledgerId: string;
  contractHash: string;
  entries: LedgerEntry[];
  terminal: string;
}

export function createEvidenceLedger(ledgerId: string, contractHash: string): EvidenceLedger {
  return { ledgerId, contractHash, entries: [], terminal: "SCI:SIMULATED" };
}

export function appendEntry(
  ledger: EvidenceLedger,
  kind: LedgerEntry["kind"],
  ref: string,
  state: string,
  note: string,
): EvidenceLedger {
  if (state === "SCI:DISC") {
    return {
      ...ledger,
      entries: [
        ...ledger.entries,
        {
          seq: ledger.entries.length + 1,
          at: new Date().toISOString(),
          kind: "REJECT",
          ref,
          state: "SCI:REJECTED",
          hash: hashObject({ ref, note, contract: ledger.contractHash }),
          note: "LEDGER_REFUSED_SCI_DISC",
        },
      ],
      terminal: "SCI:REJECTED",
    };
  }
  const entry: LedgerEntry = {
    seq: ledger.entries.length + 1,
    at: new Date().toISOString(),
    kind,
    ref,
    state,
    hash: hashObject({ kind, ref, state, note, prev: ledger.entries.at(-1)?.hash ?? "genesis" }),
    note,
  };
  return { ...ledger, entries: [...ledger.entries, entry], terminal: state };
}

export function ledgerFromGraph(graph: EvidenceGraph, contractHash: string): EvidenceLedger {
  let ledger = createEvidenceLedger(graph.graphId, contractHash);
  for (const n of graph.nodes) {
    ledger = appendEntry(ledger, "NODE", n.id, n.epistemicState, n.label);
  }
  const check = validateEvidenceGraph(graph);
  if (!check.valid) {
    for (const err of check.errors) ledger = appendEntry(ledger, "WARNING", graph.graphId, "SCI:REJECTED", err);
  }
  ledger = appendEntry(ledger, "GATE", "SCI:DISC", "SCI:REJECTED", "Gate closed. Simulation is not evidence.");
  return ledger;
}
