import { Badge } from "@/components/ui/badge";
import type {
  AuthorityLevel,
  EvidenceGrade,
  SecurityStatus,
  StateClass,
} from "@/lib/omega/types";

export function AuthorityBadge({ level }: { level: AuthorityLevel }) {
  const tone = level === "A5" || level === "A4" ? "danger" : level === "A0" ? "default" : "info";
  return <Badge tone={tone}>{level}</Badge>;
}

export function SecurityBadge({ status }: { status: SecurityStatus }) {
  const tone =
    status === "CLEAR" ? "ok" : status === "WATCH" ? "warn" : status === "REJECTED" ? "danger" : "warn";
  return <Badge tone={tone}>{status}</Badge>;
}

export function StateBadge({ cls }: { cls: StateClass }) {
  const tone =
    cls === "TRUSTED" || cls === "OBSERVED" || cls === "MEASURED"
      ? "ok"
      : cls === "QUARANTINED" || cls === "UNKNOWN"
        ? "danger"
        : cls === "SIMULATED" || cls === "SCENARIO" || cls === "FORECAST" || cls === "COUNTERFACTUAL"
          ? "info"
          : "warn";
  return <Badge tone={tone}>{cls}</Badge>;
}

export function GradeBadge({ grade }: { grade: EvidenceGrade }) {
  const tone =
    grade === "STRONG"
      ? "ok"
      : grade === "REJECTED" || grade === "UNKNOWN"
        ? "danger"
        : grade === "HYPOTHESIS" || grade === "PRELIMINARY"
          ? "info"
          : "warn";
  return <Badge tone={tone}>{grade}</Badge>;
}
