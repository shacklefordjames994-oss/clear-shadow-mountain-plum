import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/omega/panel";
import { AuthorityBadge, SecurityBadge } from "@/components/omega/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOmegaStore } from "@/lib/omega/store";
import type { AuthorityLevel } from "@/lib/omega/types";

export const Route = createFileRoute("/_app/bus")({ component: BusPage });

const TYPES = ["OBSERVE", "ANALYZE", "RECOMMEND", "SIMULATE", "EXECUTE_PHYSICAL", "AUTHORIZE_SELF", "ERASE_AUDIT"] as const;

function BusPage() {
  const events = useOmegaStore((s) => s.events);
  const publish = useOmegaStore((s) => s.publish);
  const authority = useOmegaStore((s) => s.authority);
  const [type, setType] = useState<(typeof TYPES)[number]>("OBSERVE");
  const [note, setNote] = useState("manual bus publish");

  return (
    <div>
      <PageHeader
        kicker="JMS Master Bus"
        title="Authenticated fabric transport"
        description="Every material communication is authenticated, schema-checked, hashed, policy-enforced, authority-gated, audited, then routed. Agents do not write state directly."
      />

      <Panel title="Publish">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            publish({
              type,
              source: "session",
              authority,
              payload: { note },
            });
          }}
        >
          <label className="block flex-1 text-xs text-muted-foreground">
            Type
            <select
              className="mt-1 flex h-11 w-full rounded-sm border border-input bg-secondary px-3 text-sm text-foreground"
              value={type}
              onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
            >
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block flex-[2] text-xs text-muted-foreground">
            Payload note
            <Input className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <Button type="submit">Publish</Button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">
          Session authority is {authority}. EXECUTE_PHYSICAL, AUTHORIZE_SELF, and ERASE_AUDIT are hard-rejected.
        </p>
      </Panel>

      <Panel title="Event log" className="mt-4" meta={<span className="font-mono text-xs">{events.length} retained</span>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="pb-2 font-medium">Seq</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Source</th>
                <th className="pb-2 font-medium">Auth</th>
                <th className="pb-2 font-medium">Hash</th>
                <th className="pb-2 font-medium">Gate</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.eventId} className="border-t border-border align-top">
                  <td className="py-2 font-mono text-xs tabular-nums">{e.sequence}</td>
                  <td className="py-2">
                    <div className="font-mono text-xs">{e.type}</div>
                    {e.rejectedReason ? (
                      <div className="max-w-xs text-xs text-danger">{e.rejectedReason}</div>
                    ) : null}
                  </td>
                  <td className="py-2 text-xs text-muted-foreground">{e.source}</td>
                  <td className="py-2">
                    <AuthorityBadge level={e.authority as AuthorityLevel} />
                  </td>
                  <td className="py-2 font-mono text-[10px] text-muted-foreground">{e.payloadHash}</td>
                  <td className="py-2">
                    <SecurityBadge status={e.security} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
