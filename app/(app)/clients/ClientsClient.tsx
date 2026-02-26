"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Plus } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import EmptyState from "@/components/shared/EmptyState";
import Badge from "@/components/shared/Badge";
import { createClient } from "@/lib/supabase/client";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  companies: { name: string } | null;
  created_at: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ClientsClient({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("projects").insert({
      name: form.name,
      description: form.description || null,
    });
    setSaving(false);
    setShowNew(false);
    setForm({ name: "", description: "" });
    router.refresh();
  };

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader>Active Engagements ({initialProjects.length})</SectionHeader>
      </div>

      {initialProjects.length > 0 ? (
        <div className="bg-[--surface] border border-[--border] rounded-[6px] overflow-hidden">
          {initialProjects.map((project) => (
            <Link
              key={project.id}
              href={`/clients/${project.id}`}
              className="flex items-start gap-3 p-3 border-b border-[--border] hover:bg-[--surface-2] cursor-pointer transition-colors last:border-0"
            >
              <div className="w-8 h-8 rounded-[4px] bg-[--surface-2] border border-[--border] flex items-center justify-center flex-shrink-0">
                <span className="font-mono text-[9px] text-[--text-dim]">
                  {project.companies
                    ? getInitials(project.companies.name)
                    : "—"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-[--text] truncate">
                    {project.name}
                  </span>
                  <Badge variant="green">active</Badge>
                </div>
                {project.companies && (
                  <span className="font-mono text-[10px] text-[--text-dim]">
                    {project.companies.name}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          message="No active engagements. Create one to get started."
        />
      )}

      {/* New Engagement Button */}
      <button
        onClick={() => setShowNew(!showNew)}
        className="fixed bottom-16 right-4 max-w-app w-12 h-12 bg-[--accent] rounded-[6px] flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity z-40"
      >
        <Plus size={20} className="text-black" />
      </button>

      {/* New Engagement Form */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="w-full max-w-app bg-[--surface] border-t border-[--border] rounded-t-[6px] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <SectionHeader>New Engagement</SectionHeader>
              <button
                onClick={() => setShowNew(false)}
                className="font-mono text-[10px] text-[--text-muted]"
              >
                Cancel
              </button>
            </div>
            <input
              placeholder="Project name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none resize-none"
            />
            <button
              onClick={handleCreate}
              disabled={saving || !form.name}
              className="w-full bg-accent text-black font-mono text-xs uppercase tracking-wider py-2.5 rounded-[4px] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Engagement"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
