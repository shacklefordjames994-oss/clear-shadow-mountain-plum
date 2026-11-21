import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, Stat } from "@/components/omega/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CONTACT_BRIEF,
  CONTACT_HANDLE,
  CONTACT_NAME,
  CONTACT_ORG,
  CONTACT_PHONE,
  CONTACT_TEL,
  OMEGA_ARCHITECT,
  OMEGA_TITLE,
  PRIMARY_BOUNDARY,
} from "@/lib/omega/constants";

export const Route = createFileRoute("/_app/partner")({ component: PartnerPage });

const LANES = [
  {
    id: "COLLABORATE",
    title: "Collaborate",
    body: "Joint research desks, academy modules, and governed-agent workflows. You keep authorization. We keep provenance.",
  },
  {
    id: "PARTNER",
    title: "Partner",
    body: "Lab, campus, and industry twins that share the same Guard, evidence graph, and human gate.",
  },
  {
    id: "SALE",
    title: "Sale / license",
    body: "Physics DigiSim, DHC-TWIN, and the OMEGA fabric as a sandbox — simulation only, never a control system.",
  },
  {
    id: "INTEGRATE",
    title: "Integrate",
    body: "Drop SCI-NETv2 evidence, the CERN kernel, or the swarm into an existing research stack without duplicating Guard.",
  },
];

function PartnerPage() {
  return (
    <div>
      <PageHeader
        kicker={`${CONTACT_ORG} · ${CONTACT_HANDLE}`}
        title="Build with the architect"
        description={`${CONTACT_BRIEF} ${PRIMARY_BOUNDARY}.`}
        actions={
          <>
            <Button asChild>
              <a href={`tel:${CONTACT_TEL}`}>Call {CONTACT_PHONE}</a>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Command</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Architect" value={CONTACT_NAME} hint={OMEGA_TITLE} />
        <Stat label="Handle" value={CONTACT_HANDLE} hint="OMEGA / Physics DigiSim" />
        <Stat label="Direct" value={CONTACT_PHONE} hint="Voice, not a bot" />
        <Stat label="Desk" value={CONTACT_ORG} hint="Collaboration · sale · partnering" />
      </div>

      <Panel className="mt-4" title={OMEGA_ARCHITECT} meta={<Badge>HUMAN GATE</Badge>}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          James Marcelle Shackelford designed OMEGA so agents may organize, never authorize. AI Teams is the
          collaboration desk for labs, operators, and partners who want that boundary in the product — not in a slide.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Call {CONTACT_PHONE}. Say whether you want to collaborate, partner, license, or integrate. The swarm does not
          take the meeting.
        </p>
      </Panel>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {LANES.map((lane) => (
          <Panel key={lane.id} title={lane.title} meta={<Badge>{lane.id}</Badge>}>
            <p className="text-sm text-muted-foreground">{lane.body}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
