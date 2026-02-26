import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { getAgentActivityById } from "@/lib/queries/agents";
import Badge from "@/components/shared/Badge";
import SectionHeader from "@/components/shared/SectionHeader";
import type { Database } from "@/lib/database.types";

type AgentActivity = Database["public"]["Tables"]["agent_activity"]["Row"];

const statusVariants: Record<string, "default" | "accent" | "green" | "red" | "muted"> = {
  pending: "accent",
  approved: "green",
  rejected: "red",
  auto: "muted",
};

export default async function AgentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const activity = (await getAgentActivityById(params.id).catch(() => null)) as AgentActivity | null;
  if (!activity) notFound();

  return (
    <div className="py-4 space-y-5">
      <Link
        href="/agents"
        className="flex items-center gap-1 font-mono text-[10px] text-[--text-dim] hover:text-[--text] transition-colors"
      >
        <ArrowLeft size={12} />
        Back
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-[--accent]" />
          <span className="font-mono text-sm uppercase tracking-wider text-[--text]">
            {activity.agent_name} Agent
          </span>
          <Badge variant={statusVariants[activity.status] || "default"}>
            {activity.status}
          </Badge>
        </div>
        <div className="font-mono text-xs text-[--text-dim]">
          {activity.action}
        </div>
        <div className="font-mono text-[9px] text-[--text-muted]">
          {new Date(activity.created_at).toLocaleString()}
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3">
        {activity.trigger_type && (
          <div>
            <SectionHeader className="mb-1">Trigger Type</SectionHeader>
            <span className="font-mono text-xs text-[--text-dim]">
              {activity.trigger_type}
            </span>
          </div>
        )}
        {activity.trigger_ref && (
          <div>
            <SectionHeader className="mb-1">Trigger Ref</SectionHeader>
            <span className="font-mono text-[9px] text-[--text-dim] break-all">
              {activity.trigger_ref}
            </span>
          </div>
        )}
        {activity.workflow_run_id && (
          <div>
            <SectionHeader className="mb-1">Workflow Run</SectionHeader>
            <span className="font-mono text-[9px] text-[--text-dim] break-all">
              {activity.workflow_run_id}
            </span>
          </div>
        )}
        {activity.approved_at && (
          <div>
            <SectionHeader className="mb-1">Approved At</SectionHeader>
            <span className="font-mono text-xs text-[--text-dim]">
              {new Date(activity.approved_at).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Proposed Actions */}
      <section>
        <SectionHeader className="mb-2">Proposed Actions</SectionHeader>
        <pre className="p-3 bg-[--surface] border border-[--border] rounded-[6px] text-[10px] font-mono text-[--text-dim] whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
          {JSON.stringify(activity.proposed_actions, null, 2)}
        </pre>
      </section>

      {/* Approved Actions */}
      <section>
        <SectionHeader className="mb-2">Approved Actions</SectionHeader>
        <pre className="p-3 bg-[--surface] border border-[--border] rounded-[6px] text-[10px] font-mono text-[--text-dim] whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
          {JSON.stringify(activity.approved_actions, null, 2)}
        </pre>
      </section>

      {/* Clarifications */}
      <section>
        <SectionHeader className="mb-2">Clarifications</SectionHeader>
        <pre className="p-3 bg-[--surface] border border-[--border] rounded-[6px] text-[10px] font-mono text-[--text-dim] whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
          {JSON.stringify(activity.clarifications, null, 2)}
        </pre>
      </section>
    </div>
  );
}
