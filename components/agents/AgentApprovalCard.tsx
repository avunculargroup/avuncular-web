"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AgentActivity {
  id: string;
  agent_name: string;
  action: string;
  trigger_type?: string | null;
  proposed_actions: unknown;
  clarifications: unknown;
  created_at: string;
}

export default function AgentApprovalCard({
  activity,
  currentUserId,
}: {
  activity: AgentActivity;
  currentUserId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [resolved, setResolved] = useState(false);

  const proposedActions = Array.isArray(activity.proposed_actions)
    ? (activity.proposed_actions as Record<string, unknown>[])
    : [];

  const clarifications = Array.isArray(activity.clarifications)
    ? (activity.clarifications as Record<string, unknown>[])
    : [];

  const handleAction = async (status: "approved" | "rejected") => {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("agent_activity")
      .update({
        status,
        approved_by: currentUserId,
        approved_at: new Date().toISOString(),
      })
      .eq("id", activity.id);
    setResolved(true);
    setLoading(false);
  };

  if (resolved) return null;

  return (
    <div className="bg-[--surface] border border-[--border] border-l-2 border-l-[--accent] rounded-[6px] overflow-hidden">
      <div className="px-3 py-2 border-b border-[--border]">
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-[--accent]" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-[--accent]">
            {activity.agent_name} Agent
          </span>
          <span className="font-mono text-[9px] text-[--text-muted] ml-auto">
            {formatDistanceToNow(new Date(activity.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
        {activity.trigger_type && (
          <div className="font-mono text-[9px] text-[--text-dim] mt-0.5">
            Triggered by: {activity.trigger_type}
          </div>
        )}
      </div>

      {proposedActions.length > 0 && (
        <div className="px-3 py-2 border-b border-[--border]">
          <div className="font-mono text-[9px] uppercase tracking-wider text-[--text-muted] mb-1">
            Proposed Actions
          </div>
          <ol className="space-y-1">
            {proposedActions.map((action, i) => (
              <li
                key={i}
                className="text-xs text-[--text-dim] flex items-start gap-1.5"
              >
                <span className="font-mono text-[9px] text-[--text-muted] mt-0.5">
                  {i + 1}.
                </span>
                {typeof action === "string"
                  ? action
                  : (action.description as string) || JSON.stringify(action)}
              </li>
            ))}
          </ol>
        </div>
      )}

      {clarifications.length > 0 && (
        <div className="px-3 py-2 border-b border-[--border]">
          {clarifications.map((c, i) => (
            <div key={i} className="text-xs text-[--text-dim]">
              <span className="text-[--text]">Q:</span>{" "}
              {(c.question as string) || ""}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 px-3 py-2">
        <button
          onClick={() => handleAction("rejected")}
          disabled={loading}
          className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-[4px] border border-[--border] text-[--text-dim] hover:border-[--red] hover:text-[--red] transition-colors disabled:opacity-50"
        >
          Reject
        </button>
        <button
          onClick={() => handleAction("approved")}
          disabled={loading}
          className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-[4px] bg-[--accent] text-black hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Approve All
        </button>
      </div>
    </div>
  );
}
