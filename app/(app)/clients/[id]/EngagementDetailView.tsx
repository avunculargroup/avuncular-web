"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Zap } from "lucide-react";
import Badge from "@/components/shared/Badge";
import SectionHeader from "@/components/shared/SectionHeader";
import EmptyState from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase/client";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  companies: { name: string } | null;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  source: string;
  team_members: { full_name: string } | null;
}

const STATUS_ORDER = ["todo", "in_progress", "blocked", "done"];

const priorityColors: Record<string, string> = {
  urgent: "bg-[--red]",
  high: "bg-[--accent]",
  medium: "bg-[--blue]",
  low: "bg-[--text-muted]",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function EngagementDetailView({
  project,
  tasks,
}: {
  project: Project;
  tasks: Task[];
}) {
  const router = useRouter();
  const [showAddTask, setShowAddTask] = useState(false);
  const [saving, setSaving] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "" });

  const grouped = STATUS_ORDER.reduce(
    (acc, status) => {
      const statusTasks = tasks.filter((t) => t.status === status);
      if (statusTasks.length > 0) acc[status] = statusTasks;
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleAddTask = async () => {
    if (!taskForm.title) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("tasks").insert({
      title: taskForm.title,
      description: taskForm.description || null,
      project_id: project.id,
    });
    setSaving(false);
    setShowAddTask(false);
    setTaskForm({ title: "", description: "" });
    router.refresh();
  };

  return (
    <div className="py-4 space-y-5">
      <Link
        href="/clients"
        className="flex items-center gap-1 font-mono text-[10px] text-[--text-dim] hover:text-[--text] transition-colors"
      >
        <ArrowLeft size={12} />
        Back
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-base font-medium text-[--text]">{project.name}</h1>
        {project.companies && (
          <p className="font-mono text-[10px] text-[--text-dim] mt-0.5">
            {project.companies.name}
          </p>
        )}
        {project.description && (
          <p className="text-xs text-[--text-dim] mt-1">
            {project.description}
          </p>
        )}

        {/* Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[9px] text-[--text-muted]">
              Progress
            </span>
            <span className="font-mono text-[9px] text-[--text-dim]">
              {doneTasks}/{totalTasks} tasks ({progress}%)
            </span>
          </div>
          <div className="h-1.5 bg-[--surface-2] rounded-full overflow-hidden">
            <div
              className="h-full bg-[--green] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tasks by Status */}
      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped).map(([status, statusTasks]) => (
          <section key={status}>
            <SectionHeader className="mb-1">
              {status.replace("_", " ")} ({statusTasks.length})
            </SectionHeader>
            <div className="bg-[--surface] border border-[--border] rounded-[6px] overflow-hidden">
              {statusTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 border-b border-[--border] last:border-0"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityColors[task.priority] || priorityColors.medium}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-[--text] truncate flex items-center gap-1">
                        {task.title}
                        {task.source !== "manual" && (
                          <Zap size={10} className="text-[--accent]" />
                        )}
                      </span>
                      <Badge variant={task.priority === "urgent" ? "red" : "default"}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.due_date && (
                        <span className="font-mono text-[9px] text-[--text-muted]">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {task.team_members && (
                        <span className="font-mono text-[9px] text-[--text-muted]">
                          {getInitials(task.team_members.full_name)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      ) : (
        <EmptyState message="No tasks yet. Add one to get started." />
      )}

      {/* Add Task Button */}
      <button
        onClick={() => setShowAddTask(true)}
        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-3 py-2 rounded-[4px] border border-[--border] text-[--text-dim] hover:border-[--accent] hover:text-[--accent] transition-colors"
      >
        <Plus size={12} />
        Add Task
      </button>

      {/* Add Task Sheet */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="w-full max-w-app bg-[--surface] border-t border-[--border] rounded-t-[6px] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <SectionHeader>Add Task</SectionHeader>
              <button
                onClick={() => setShowAddTask(false)}
                className="font-mono text-[10px] text-[--text-muted]"
              >
                Cancel
              </button>
            </div>
            <input
              placeholder="Task title *"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none"
            />
            <textarea
              placeholder="Description"
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
              rows={3}
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none resize-none"
            />
            <button
              onClick={handleAddTask}
              disabled={saving || !taskForm.title}
              className="w-full bg-accent text-black font-mono text-xs uppercase tracking-wider py-2.5 rounded-[4px] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Task"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
