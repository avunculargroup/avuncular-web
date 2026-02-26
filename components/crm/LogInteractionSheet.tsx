"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SectionHeader from "@/components/shared/SectionHeader";

const TYPES = ["call", "email", "meeting", "signal", "linkedin", "note"];
const DIRECTIONS = ["inbound", "outbound"];

export default function LogInteractionSheet({
  contactId,
  onClose,
}: {
  contactId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showAgentPrompt, setShowAgentPrompt] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "call",
    direction: "outbound",
    occurred_at: new Date().toISOString().slice(0, 16),
    raw_content: "",
    summary: "",
  });

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("interactions")
      .insert({
        contact_id: contactId,
        type: form.type,
        direction: form.direction,
        occurred_at: new Date(form.occurred_at).toISOString(),
        raw_content: form.raw_content || null,
        summary: form.summary || null,
      })
      .select()
      .single();

    setSaving(false);
    if (error) return;

    if (form.raw_content && data) {
      setInteractionId(data.id);
      setShowAgentPrompt(true);
    } else {
      router.refresh();
      onClose();
    }
  };

  const handleTriggerAgent = async () => {
    if (!interactionId) return;
    const supabase = createClient();
    await supabase.from("agent_activity").insert({
      agent_name: "coordinator",
      action: "process_transcript",
      status: "pending",
      trigger_type: "call_transcript",
      trigger_ref: interactionId,
    });
    router.refresh();
    onClose();
  };

  const handleSkipAgent = () => {
    router.refresh();
    onClose();
  };

  if (showAgentPrompt) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
        <div className="w-full max-w-app bg-[--surface] border-t border-[--border] rounded-t-[6px] p-4 space-y-4">
          <p className="text-xs text-[--text]">
            Run coordinator agent on this transcript?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSkipAgent}
              className="flex-1 font-mono text-[10px] uppercase tracking-wider px-3 py-2 rounded-[4px] border border-[--border] text-[--text-dim] hover:border-[--text-dim] transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleTriggerAgent}
              className="flex-1 font-mono text-[10px] uppercase tracking-wider px-3 py-2 rounded-[4px] bg-[--accent] text-black hover:opacity-90 transition-opacity"
            >
              Yes, Run
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
      <div className="w-full max-w-app bg-[--surface] border-t border-[--border] rounded-t-[6px] p-4 space-y-3 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <SectionHeader>Log Interaction</SectionHeader>
          <button
            onClick={onClose}
            className="font-mono text-[10px] text-[--text-muted]"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] outline-none"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={form.direction}
            onChange={(e) =>
              setForm({ ...form, direction: e.target.value })
            }
            className="bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] outline-none"
          >
            {DIRECTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <input
          type="datetime-local"
          value={form.occurred_at}
          onChange={(e) =>
            setForm({ ...form, occurred_at: e.target.value })
          }
          className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none"
        />

        <textarea
          placeholder="Summary"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          rows={2}
          className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none resize-none"
        />

        <textarea
          placeholder="Raw content / transcript (optional)"
          value={form.raw_content}
          onChange={(e) =>
            setForm({ ...form, raw_content: e.target.value })
          }
          rows={4}
          className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none resize-none"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-accent text-black font-mono text-xs uppercase tracking-wider py-2.5 rounded-[4px] hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Interaction"}
        </button>
      </div>
    </div>
  );
}
