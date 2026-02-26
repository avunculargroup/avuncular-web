"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AgentStatusRow from "@/components/agents/AgentStatusRow";
import AgentApprovalCard from "@/components/agents/AgentApprovalCard";
import LiveLog from "@/components/agents/LiveLog";
import SectionHeader from "@/components/shared/SectionHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Bot } from "lucide-react";

interface AgentStatus {
  name: string;
  latest: {
    action: string;
    created_at: string;
  } | null;
  status: string;
}

interface AgentActivity {
  id: string;
  agent_name: string;
  action: string;
  status: string;
  trigger_type: string | null;
  trigger_ref: string | null;
  workflow_run_id: string | null;
  proposed_actions: unknown;
  approved_actions: unknown;
  approved_by: string | null;
  approved_at: string | null;
  clarifications: unknown;
  created_at: string;
}

export default function AgentsClient({
  agentStatuses,
  pendingApprovals: initialPending,
  recentActivity: initialActivity,
  currentUserId,
}: {
  agentStatuses: AgentStatus[];
  pendingApprovals: AgentActivity[];
  recentActivity: AgentActivity[];
  currentUserId?: string;
}) {
  const [pendingApprovals, setPendingApprovals] = useState(initialPending);
  const [recentActivity, setRecentActivity] = useState(initialActivity);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("agent_activity_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_activity" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newItem = payload.new as AgentActivity;
            setRecentActivity((prev) => [newItem, ...prev].slice(0, 50));
            if (newItem.status === "pending") {
              setPendingApprovals((prev) => [...prev, newItem]);
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as AgentActivity;
            setRecentActivity((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a))
            );
            if (updated.status !== "pending") {
              setPendingApprovals((prev) =>
                prev.filter((a) => a.id !== updated.id)
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="py-4 space-y-6">
      {/* Agent Status Panel */}
      <section>
        <SectionHeader className="mb-2">Agent Status</SectionHeader>
        <div className="bg-[--surface] border border-[--border] rounded-[6px] overflow-hidden">
          {agentStatuses.map((agent) => (
            <AgentStatusRow key={agent.name} agent={agent} />
          ))}
        </div>
      </section>

      {/* Approval Queue */}
      {pendingApprovals.length > 0 && (
        <section>
          <SectionHeader className="mb-2">
            Approval Queue ({pendingApprovals.length})
          </SectionHeader>
          <div className="space-y-2">
            {pendingApprovals.map((approval) => (
              <AgentApprovalCard
                key={approval.id}
                activity={approval}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </section>
      )}

      {/* Activity Log */}
      <section>
        <SectionHeader className="mb-2">Activity Log</SectionHeader>
        {recentActivity.length > 0 ? (
          <LiveLog activities={recentActivity} />
        ) : (
          <EmptyState icon={Bot} message="No agent activity recorded yet" />
        )}
      </section>
    </div>
  );
}
