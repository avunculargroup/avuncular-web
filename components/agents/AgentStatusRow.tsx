import { formatDistanceToNow } from "date-fns";

interface AgentStatusData {
  name: string;
  latest: {
    action: string;
    created_at: string;
  } | null;
  status: string;
}

export default function AgentStatusRow({
  agent,
}: {
  agent: AgentStatusData;
}) {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-[--border] last:border-0">
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          agent.status === "active"
            ? "bg-[--green] animate-pulse"
            : agent.status === "pending"
              ? "bg-[--accent] animate-pulse"
              : "bg-[--text-muted]"
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[--text]">
            {agent.name}
          </span>
          {agent.latest && (
            <span className="font-mono text-[9px] text-[--text-muted]">
              {formatDistanceToNow(new Date(agent.latest.created_at), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
        {agent.latest && (
          <p className="font-mono text-[9px] text-[--text-dim] truncate mt-0.5">
            {agent.latest.action}
          </p>
        )}
      </div>
    </div>
  );
}
