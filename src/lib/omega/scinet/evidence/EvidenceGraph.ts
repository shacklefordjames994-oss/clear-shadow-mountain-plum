/*
 * Canonical evidence graph.
 * Claims cannot be supported directly by simulation.
 * Edges are typed. Provenance is required. Fail closed on unknown nodes.
 */

export type EvidenceNodeType =
  | "DATASET"
  | "EVENT"
  | "CALIBRATION"
  | "MODEL"
  | "HYPOTHESIS"
  | "BACKGROUND"
  | "LIKELIHOOD"
  | "POSTERIOR"
  | "STATISTIC"
  | "REPLICATION"
  | "EXPERIMENT"
  | "CLAIM";

export type EvidenceEdgeType =
  | "DERIVED_FROM"
  | "CALIBRATED_BY"
  | "PREDICTED_BY"
  | "TESTED_BY"
  | "SUPPORTED_BY"
  | "CONTRADICTED_BY"
  | "REPLICATED_BY"
  | "REJECTED_BY"
  | "DEPENDS_ON";

export interface EvidenceNode {
  id: string;
  type: EvidenceNodeType;
  epistemicState: string;
  label: string;
  provenance: string[];
  hash?: string;
  metadata: Record<string, unknown>;
}

export interface EvidenceEdge {
  id: string;
  from: string;
  to: string;
  type: EvidenceEdgeType;
  provenance: string[];
  metadata: Record<string, unknown>;
}

export interface EvidenceGraph {
  graphId: string;
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

const SIMULATED_STATES = new Set(["SCI:SIMULATED", "SCI:CONTROL", "SCI:HYPOTHETICAL", "SIMULATED", "CONTROL"]);

export function createEvidenceGraph(graphId: string): EvidenceGraph {
  return { graphId, nodes: [], edges: [] };
}

export function addEvidenceNode(graph: EvidenceGraph, node: EvidenceNode): EvidenceGraph {
  if (graph.nodes.some((existing) => existing.id === node.id)) {
    throw new Error(`DUPLICATE_EVIDENCE_NODE:${node.id}`);
  }
  return { ...graph, nodes: [...graph.nodes, node] };
}

export function addEvidenceEdge(graph: EvidenceGraph, edge: EvidenceEdge): EvidenceGraph {
  const fromExists = graph.nodes.some((n) => n.id === edge.from);
  const toExists = graph.nodes.some((n) => n.id === edge.to);
  if (!fromExists || !toExists) throw new Error("EVIDENCE_EDGE_REFERENCES_UNKNOWN_NODE");
  return { ...graph, edges: [...graph.edges, edge] };
}

function connect(
  from: string,
  to: string,
  type: EvidenceEdgeType,
): EvidenceEdge {
  return {
    id: `EDGE-${from}-${to}-${type}`,
    from,
    to,
    type,
    provenance: [],
    metadata: {},
  };
}

export function buildEvidenceChain(
  graph: EvidenceGraph,
  ids: {
    dataset: string;
    calibration: string;
    model: string;
    reconstruction: string;
    likelihood: string;
    statistic: string;
    replication?: string;
    claim?: string;
  },
): EvidenceGraph {
  const edges: EvidenceEdge[] = [
    connect(ids.calibration, ids.reconstruction, "CALIBRATED_BY"),
    connect(ids.dataset, ids.reconstruction, "DERIVED_FROM"),
    connect(ids.model, ids.likelihood, "PREDICTED_BY"),
    connect(ids.reconstruction, ids.likelihood, "DERIVED_FROM"),
    connect(ids.likelihood, ids.statistic, "TESTED_BY"),
  ];
  if (ids.replication) edges.push(connect(ids.statistic, ids.replication, "REPLICATED_BY"));
  if (ids.claim) {
    edges.push(connect(ids.replication ?? ids.statistic, ids.claim, "SUPPORTED_BY"));
  }
  let result = graph;
  for (const edge of edges) result = addEvidenceEdge(result, edge);
  return result;
}

export function validateEvidenceGraph(graph: EvidenceGraph): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));

  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.from)) errors.push(`MISSING_SOURCE:${edge.from}`);
    if (!nodeIds.has(edge.to)) errors.push(`MISSING_TARGET:${edge.to}`);
  }

  for (const node of graph.nodes) {
    if (node.type !== "CLAIM") continue;
    const incoming = graph.edges.filter((e) => e.to === node.id);
    if (incoming.length === 0) {
      errors.push(`CLAIM_UNGROUNDED:${node.id}`);
      continue;
    }
    for (const edge of incoming) {
      if (edge.type === "SUPPORTED_BY") {
        const src = byId.get(edge.from);
        if (!src) continue;
        if (src.type !== "REPLICATION" && src.type !== "STATISTIC") {
          errors.push(`CLAIM_SUPPORTED_BY_NON_REPLICATION:${node.id}<-${src.type}`);
        }
        if (SIMULATED_STATES.has(src.epistemicState)) {
          errors.push(`CLAIM_SUPPORTED_BY_SIMULATION:${node.id}<-${src.id}`);
        }
      }
    }
  }

  for (const edge of graph.edges) {
    if (edge.type !== "SUPPORTED_BY") continue;
    const src = byId.get(edge.from);
    const dst = byId.get(edge.to);
    if (!src || !dst) continue;
    if (dst.type === "CLAIM" && SIMULATED_STATES.has(src.epistemicState)) {
      errors.push(`SIMULATION_CANNOT_SUPPORT_CLAIM:${src.id}->${dst.id}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function node(
  id: string,
  type: EvidenceNodeType,
  label: string,
  epistemicState: string,
  provenance: string[] = [],
  metadata: Record<string, unknown> = {},
): EvidenceNode {
  return { id, type, label, epistemicState, provenance, metadata };
}

export function assembleLabGraph(args: {
  graphId: string;
  dataState: string;
  preferred: string;
  logBayes: number;
  replicated: boolean;
  ppcPassed: boolean;
  contractHash: string;
}): EvidenceGraph {
  const sim = args.dataState !== "OBSERVED";
  const ds = sim ? "SCI:SIMULATED" : "SCI:OBSERVED";
  let graph = createEvidenceGraph(args.graphId);
  const nodes: EvidenceNode[] = [
    node("dataset", "DATASET", "Lab dataset", ds, [args.contractHash], { synthetic: sim }),
    node("calibration", "CALIBRATION", "Nuisance / yield", "SCI:CALIBRATED", [args.contractHash]),
    node("background", "BACKGROUND", "Background mixture", "SCI:CONTROL", [args.contractHash]),
    node("model", "MODEL", args.preferred, "SCI:HYPOTHETICAL", [args.contractHash]),
    node("reconstruction", "EVENT", "S1/S2 reconstruction", "SCI:RECONSTRUCTED", [args.contractHash]),
    node("likelihood", "LIKELIHOOD", "Joint likelihood", "SCI:DERIVED", [args.contractHash], { logBayes: args.logBayes }),
    node("posterior", "POSTERIOR", "Hypothesis posterior", "SCI:DERIVED", [args.contractHash]),
    node(
      "statistic",
      "STATISTIC",
      "Likelihood ratio",
      args.logBayes > 3 ? "SCI:MODEL_SUPPORTED" : "SCI:HYPOTHETICAL",
      [args.contractHash],
    ),
    node(
      "replication",
      "REPLICATION",
      "Cross-target replica",
      args.replicated ? "SCI:CONTROL" : "SCI:REJECTED",
      [args.contractHash],
      { independent: false },
    ),
    node("ppc", "STATISTIC", "PPC", args.ppcPassed ? "SCI:MODEL_SUPPORTED" : "SCI:MODEL_CHECK_FAILED", [args.contractHash]),
    node("claim", "CLAIM", "SCI:DISC", "SCI:REJECTED", [args.contractHash], { requested: "SCI:DISC" }),
  ];
  for (const n of nodes) graph = addEvidenceNode(graph, n);
  graph = buildEvidenceChain(graph, {
    dataset: "dataset",
    calibration: "calibration",
    model: "model",
    reconstruction: "reconstruction",
    likelihood: "likelihood",
    statistic: "statistic",
    replication: "replication",
    claim: "claim",
  });
  graph = addEvidenceEdge(graph, connect("background", "likelihood", "DEPENDS_ON"));
  graph = addEvidenceEdge(graph, connect("likelihood", "posterior", "DERIVED_FROM"));
  graph = addEvidenceEdge(graph, connect("ppc", "statistic", "TESTED_BY"));
  graph = addEvidenceEdge(graph, connect("replication", "claim", "REJECTED_BY"));
  return graph;
}
