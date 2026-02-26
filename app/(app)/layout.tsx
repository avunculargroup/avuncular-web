import AppHeader from "@/components/shell/AppHeader";
import TickerBar from "@/components/shell/TickerBar";
import BottomNav from "@/components/shell/BottomNav";
import { getTeamMembers } from "@/lib/queries/team";
import { getPendingApprovals, getAgentsOnlineCount } from "@/lib/queries/agents";
import { getOpenTasksCount } from "@/lib/queries/tasks";
import { getPipelineTotal } from "@/lib/queries/pipeline";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [teamMembers, pendingApprovals, pipelineTotal, openTasks, agentsOnline] =
    await Promise.all([
      getTeamMembers(),
      getPendingApprovals(),
      getPipelineTotal(),
      getOpenTasksCount(),
      getAgentsOnlineCount(),
    ]);

  return (
    <div className="flex flex-col min-h-screen max-w-app mx-auto">
      <AppHeader
        teamMembers={teamMembers}
        hasPendingAgentActivity={pendingApprovals.length > 0}
      />
      <TickerBar
        initialData={{
          pipelineTotal,
          openTasks,
          agentsOnline,
        }}
      />
      <main className="flex-1 overflow-y-auto pb-20 px-4">{children}</main>
      <BottomNav />
    </div>
  );
}
