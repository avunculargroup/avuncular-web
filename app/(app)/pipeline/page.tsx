import { getContactsOverview } from "@/lib/queries/contacts";
import { getContactStageCounts } from "@/lib/queries/pipeline";
import { getTeamMembers } from "@/lib/queries/team";
import { getCompanies } from "@/lib/queries/companies";
import PipelineClient from "./PipelineClient";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: { stage?: string; owner?: string; literacy?: string };
}) {
  const [contacts, stageCounts, teamMembers, companies] = await Promise.all([
    getContactsOverview({
      stage: searchParams.stage,
      owner: searchParams.owner,
      literacy: searchParams.literacy,
    }),
    getContactStageCounts(),
    getTeamMembers(),
    getCompanies(),
  ]);

  return (
    <PipelineClient
      initialContacts={contacts}
      stageCounts={stageCounts}
      teamMembers={teamMembers}
      companies={companies}
    />
  );
}
