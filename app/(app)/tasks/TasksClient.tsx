"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, CheckSquare, Check } from "lucide-react";
import TaskRow from "@/components/tasks/TaskRow";
import SectionHeader from "@/components/shared/SectionHeader";
import EmptyState from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase/client";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  source: string;
  assigned_to_name: string | null;
  related_contact_name: string | null;
  project_name: string | null;
}

interface TeamMember {
  id: string;
  full_name: string;
}

type ViewMode = "my" | "all" | "by_contact";

export default function TasksClient({
  initialTasks,
  teamMembers,
  currentUserName,
}: {
  initialTasks: Task[];
  teamMembers: TeamMember[];
  currentUserName: string | null;
}) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("all");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigned_to: "",
    due_date: "",
  });

  // Filter tasks
  let filtered = initialTasks;
  if (view === "my" && currentUserName) {
    filtered = filtered.filter((t) => t.assigned_to_name === currentUserName);
  }

  // Group by contact if needed
  const groupedByContact: Record<string, Task[]> = {};
  if (view === "by_contact") {
    for (const task of filtered) {
      const key = task.related_contact_name || "Unlinked";
      if (!groupedByContact[key]) groupedByContact[key] = [];
      groupedByContact[key].push(task);
    }
  }

  const handleMarkDone = async (taskId: string) => {
    const supabase = createClient();
    await supabase
      .from("tasks")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", taskId);
    router.refresh();
  };

  const handleCreate = async () => {
    if (!form.title) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("tasks").insert({
      title: form.title,
      description: form.description || null,
      priority: form.priority,
      assigned_to: form.assigned_to || null,
      due_date: form.due_date || null,
    });
    setSaving(false);
    setShowAddTask(false);
    setForm({ title: "", description: "", priority: "medium", assigned_to: "", due_date: "" });
    router.refresh();
  };

  const renderTaskList = (tasks: Task[]) => (
    <div className="bg-[--surface] border border-[--border] rounded-[6px] overflow-hidden">
      {tasks.map((task) => (
        <div key={task.id}>
          <div
            onClick={() =>
              setExpandedTask(expandedTask === task.id ? null : task.id)
            }
            className="cursor-pointer"
          >
            <TaskRow task={task} />
          </div>
          {expandedTask === task.id && (
            <div className="px-3 pb-3 pt-0 border-b border-[--border] bg-[--surface-2]">
              {task.description && (
                <p className="text-xs text-[--text-dim] mb-2">
                  {task.description}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleMarkDone(task.id)}
                  className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded-[3px] border border-[--border] text-[--green] hover:border-[--green] transition-colors"
                >
                  <Check size={10} />
                  Mark Done
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="py-4 space-y-4">
      {/* View Toggle */}
      <div className="flex gap-1">
        {([
          ["my", "My Tasks"],
          ["all", "All Tasks"],
          ["by_contact", "By Contact"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-[4px] transition-colors ${
              view === key
                ? "bg-[--accent-dim] text-[--accent] border border-[--accent]"
                : "bg-[--surface] text-[--text-muted] border border-[--border]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Task List */}
      {view === "by_contact" ? (
        Object.keys(groupedByContact).length > 0 ? (
          Object.entries(groupedByContact).map(([contactName, tasks]) => (
            <section key={contactName}>
              <SectionHeader className="mb-1">
                {contactName} ({tasks.length})
              </SectionHeader>
              {renderTaskList(tasks)}
            </section>
          ))
        ) : (
          <EmptyState icon={CheckSquare} message="No open tasks" />
        )
      ) : filtered.length > 0 ? (
        renderTaskList(filtered)
      ) : (
        <EmptyState icon={CheckSquare} message="All caught up! No open tasks." />
      )}

      {/* Add Task Button */}
      <button
        onClick={() => setShowAddTask(true)}
        className="fixed bottom-16 right-4 max-w-app w-12 h-12 bg-[--accent] rounded-[6px] flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity z-40"
      >
        <Plus size={20} className="text-black" />
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
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <select
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                className="bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] outline-none"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none"
            />
            <button
              onClick={handleCreate}
              disabled={saving || !form.title}
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
