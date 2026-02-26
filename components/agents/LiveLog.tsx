"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Badge from "@/components/shared/Badge";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AgentActivity {
  id: string;
  agent_name: string;
  action: string;
  status: string;
  proposed_actions: unknown;
  approved_actions: unknown;
  approved_by: string | null;
  created_at: string;
}

const statusVariants: Record<string, "default" | "accent" | "green" | "red" | "muted"> = {
  pending: "accent",
  approved: "green",
  rejected: "red",
  auto: "muted",
};

export default function LiveLog({
  activities,
}: {
  activities: AgentActivity[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="bg-[--surface] border border-[--border] rounded-[6px] overflow-hidden">
      {activities.map((a) => (
        <div key={a.id} className="border-b border-[--border] last:border-0">
          <div
            className="flex items-center gap-2 p-3 cursor-pointer hover:bg-[--surface-2] transition-colors"
            onClick={() => setExpanded(expanded === a.id ? null : a.id)}
          >
            <span className="font-mono text-[9px] text-[--text-muted] w-16 flex-shrink-0">
              {formatDistanceToNow(new Date(a.created_at), {
                addSuffix: true,
              })}
            </span>
            <span className="font-mono text-[10px] text-[--text-dim] uppercase tracking-wider w-20 flex-shrink-0">
              {a.agent_name}
            </span>
            <span className="text-xs text-[--text] truncate flex-1">
              {a.action}
            </span>
            <Badge variant={statusVariants[a.status] || "default"}>
              {a.status}
            </Badge>
            {expanded === a.id ? (
              <ChevronUp size={12} className="text-[--text-muted]" />
            ) : (
              <ChevronDown size={12} className="text-[--text-muted]" />
            )}
          </div>

          {expanded === a.id && (
            <div className="px-3 pb-3 space-y-2 bg-[--surface-2]">
              {a.proposed_actions != null && (
                <div>
                  <span className="font-mono text-[8px] uppercase tracking-wider text-[--text-muted]">
                    Proposed Actions
                  </span>
                  <pre className="mt-1 p-2 bg-[--bg] border border-[--border] rounded text-[9px] font-mono text-[--text-dim] whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {JSON.stringify(a.proposed_actions, null, 2)}
                  </pre>
                </div>
              )}
              {a.approved_actions != null && (
                <div>
                  <span className="font-mono text-[8px] uppercase tracking-wider text-[--text-muted]">
                    Approved Actions
                  </span>
                  <pre className="mt-1 p-2 bg-[--bg] border border-[--border] rounded text-[9px] font-mono text-[--text-dim] whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {JSON.stringify(a.approved_actions, null, 2)}
                  </pre>
                </div>
              )}
              <Link
                href={`/agents/${a.id}`}
                className="inline-block font-mono text-[9px] text-[--accent] hover:underline"
              >
                View full detail →
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
