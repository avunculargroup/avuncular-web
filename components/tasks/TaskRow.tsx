import { formatDistanceToNow } from "date-fns";
import Badge from "@/components/shared/Badge";
import { Zap } from "lucide-react";

const priorityColors: Record<string, string> = {
  urgent: "bg-[--red]",
  high: "bg-[--accent]",
  medium: "bg-[--blue]",
  low: "bg-[--text-muted]",
};

interface TaskData {
  id: string;
  title: string;
  priority: string;
  due_date?: string | null;
  source?: string;
  assigned_to_name?: string | null;
  related_contact_name?: string | null;
  project_name?: string | null;
  status?: string;
  description?: string | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TaskRow({ task }: { task: TaskData }) {
  const isAgent =
    task.source === "coordinator_agent" || task.source === "signal";
  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";

  return (
    <div className="flex items-start gap-3 p-3 border-b border-[--border] hover:bg-[--surface-2] transition-colors">
      <div
        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityColors[task.priority] || priorityColors.medium}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-[--text] truncate flex items-center gap-1">
            {task.title}
            {isAgent && <Zap size={10} className="text-[--accent]" />}
          </span>
          {task.due_date && (
            <Badge variant={isOverdue ? "red" : "default"}>
              {formatDistanceToNow(new Date(task.due_date), {
                addSuffix: true,
              })}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="font-mono text-[10px] text-[--text-dim] truncate">
            {[task.related_contact_name, task.project_name]
              .filter(Boolean)
              .join(" · ")}
          </span>
          {task.assigned_to_name && (
            <span className="font-mono text-[9px] text-[--text-muted]">
              {getInitials(task.assigned_to_name)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
