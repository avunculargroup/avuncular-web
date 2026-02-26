import { Suspense } from "react";
import StatCard from "@/components/shared/StatCard";
import SectionHeader from "@/components/shared/SectionHeader";
import InteractionItem from "@/components/crm/InteractionItem";
import TaskRow from "@/components/tasks/TaskRow";
import AgentApprovalCard from "@/components/agents/AgentApprovalCard";
import EmptyState from "@/components/shared/EmptyState";
import LoadingRows from "@/components/shared/LoadingRows";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { getRecentInteractions } from "@/lib/queries/interactions";
import { getAllOpenTasks } from "@/lib/queries/tasks";
import { getPendingApprovals } from "@/lib/queries/agents";
import { getCurrentUser } from "@/lib/auth";
import { Activity, CheckSquare } from "lucide-react";

export default async function DashboardPage() {
  const [stats, recentActivity, openTasks, pendingApprovals, user] =
    await Promise.all([
      getDashboardStats(),
      getRecentInteractions(8),
      getAllOpenTasks(),
      getPendingApprovals(),
      getCurrentUser(),
    ]);

  const myTasks = openTasks.slice(0, 5);

  return (
    <div className="py-4 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Pipeline" value={stats.pipelineContacts} />
        <StatCard label="Active Clients" value={stats.activeClients} />
        <StatCard label="Content Drafts" value={stats.contentDrafts} />
        <StatCard label="Open Tasks" value={stats.openTasks} />
      </div>

      {/* Agent Approvals */}
      {pendingApprovals.length > 0 && (
        <section>
          <SectionHeader className="mb-2">
            Approvals Needed ({pendingApprovals.length})
          </SectionHeader>
          <div className="space-y-2">
            {pendingApprovals.map((approval) => (
              <AgentApprovalCard
                key={approval.id}
                activity={approval}
                currentUserId={user?.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section>
        <SectionHeader className="mb-2">Recent Activity</SectionHeader>
        <Suspense fallback={<LoadingRows count={4} />}>
          {recentActivity.length > 0 ? (
            <div className="bg-[--surface] border border-[--border] rounded-[6px] overflow-hidden">
              {recentActivity.map((interaction) => (
                <InteractionItem
                  key={interaction.id}
                  interaction={interaction}
                  showContact
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={Activity} message="No recent activity" />
          )}
        </Suspense>
      </section>

      {/* My Open Tasks */}
      <section>
        <SectionHeader className="mb-2">Open Tasks</SectionHeader>
        {myTasks.length > 0 ? (
          <div className="bg-[--surface] border border-[--border] rounded-[6px] overflow-hidden">
            {myTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <EmptyState icon={CheckSquare} message="All caught up! No open tasks." />
        )}
      </section>
    </div>
  );
}
