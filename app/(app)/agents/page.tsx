import {
  getAgentStatuses,
  getPendingApprovals,
  getRecentAgentActivity,
} from "@/lib/queries/agents";
import { getCurrentUser } from "@/lib/auth";
import AgentsClient from "./AgentsClient";

export default async function AgentsPage() {
  const [statuses, pendingApprovals, recentActivity, user] = await Promise.all([
    getAgentStatuses(),
    getPendingApprovals(),
    getRecentAgentActivity(50),
    getCurrentUser(),
  ]);

  return (
    <AgentsClient
      agentStatuses={statuses}
      pendingApprovals={pendingApprovals}
      recentActivity={recentActivity}
      currentUserId={user?.id}
    />
  );
}
