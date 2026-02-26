"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, GitBranch } from "lucide-react";
import ContactCard from "@/components/crm/ContactCard";
import SectionHeader from "@/components/shared/SectionHeader";
import EmptyState from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase/client";
import type { PipelineStage, BitcoinLiteracy } from "@/lib/database.types";

const STAGES: PipelineStage[] = ["lead", "warm", "active", "client", "dormant"];
const LITERACY_LEVELS: BitcoinLiteracy[] = [
  "unknown",
  "none",
  "basic",
  "intermediate",
  "advanced",
];

interface ContactOverview {
  id: string;
  full_name: string;
  job_title: string | null;
  pipeline_stage: PipelineStage;
  bitcoin_literacy: BitcoinLiteracy;
  tags: string[] | null;
  company_name: string | null;
  industry: string | null;
  owner_name: string | null;
  open_tasks: number;
}

interface Company {
  id: string;
  name: string;
}

interface TeamMember {
  id: string;
  full_name: string;
}

export default function PipelineClient({
  initialContacts,
  stageCounts,
  teamMembers,
  companies,
}: {
  initialContacts: ContactOverview[];
  stageCounts: Record<string, number>;
  teamMembers: TeamMember[];
  companies: Company[];
}) {
  const router = useRouter();
  const [filterStage, setFilterStage] = useState<string>("");
  const [filterOwner, setFilterOwner] = useState<string>("");
  const [filterLiteracy, setFilterLiteracy] = useState<string>("");
  const [showNewContact, setShowNewContact] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    job_title: "",
    email: "",
    phone: "",
    linkedin_url: "",
    company_id: "",
    pipeline_stage: "lead",
    bitcoin_literacy: "unknown",
    owner_id: "",
  });

  const total = Object.values(stageCounts).reduce((a, b) => a + b, 0);

  // Filter contacts
  let filtered = initialContacts;
  if (filterStage) {
    filtered = filtered.filter((c) => c.pipeline_stage === filterStage);
  } else {
    filtered = filtered.filter((c) => c.pipeline_stage !== "dormant");
  }
  if (filterOwner) {
    filtered = filtered.filter((c) => c.owner_name === filterOwner);
  }
  if (filterLiteracy) {
    filtered = filtered.filter((c) => c.bitcoin_literacy === filterLiteracy);
  }

  // Group by stage
  const grouped = STAGES.reduce(
    (acc, stage) => {
      const stageContacts = filtered.filter(
        (c) => c.pipeline_stage === stage
      );
      if (stageContacts.length > 0) {
        acc[stage] = stageContacts;
      }
      return acc;
    },
    {} as Record<string, ContactOverview[]>
  );

  const handleCreate = async () => {
    if (!form.first_name || !form.last_name) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("contacts").insert({
      first_name: form.first_name,
      last_name: form.last_name,
      job_title: form.job_title || null,
      email: form.email || null,
      phone: form.phone || null,
      linkedin_url: form.linkedin_url || null,
      company_id: form.company_id || null,
      pipeline_stage: form.pipeline_stage,
      bitcoin_literacy: form.bitcoin_literacy,
      owner_id: form.owner_id || null,
    });
    setSaving(false);
    setShowNewContact(false);
    setForm({
      first_name: "",
      last_name: "",
      job_title: "",
      email: "",
      phone: "",
      linkedin_url: "",
      company_id: "",
      pipeline_stage: "lead",
      bitcoin_literacy: "unknown",
      owner_id: "",
    });
    router.refresh();
  };

  return (
    <div className="py-4 space-y-4">
      {/* Stage Funnel */}
      <div className="flex gap-1">
        {STAGES.map((stage) => {
          const count = stageCounts[stage] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <button
              key={stage}
              onClick={() =>
                setFilterStage(filterStage === stage ? "" : stage)
              }
              className={`flex-1 p-2 rounded-[4px] border transition-colors ${
                filterStage === stage
                  ? "border-[--accent] bg-[--accent-dim]"
                  : "border-[--border] bg-[--surface]"
              }`}
            >
              <div className="font-mono text-[8px] uppercase tracking-wider text-[--text-muted] text-center">
                {stage}
              </div>
              <div className="font-mono text-sm text-[--text] text-center">
                {count}
              </div>
              <div className="mt-1 h-1 bg-[--bg] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[--accent] rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        <select
          value={filterOwner}
          onChange={(e) => setFilterOwner(e.target.value)}
          className="bg-[--bg] border border-[--border-2] rounded px-2 py-1 font-mono text-[10px] text-[--text] outline-none"
        >
          <option value="">All Owners</option>
          {teamMembers.map((m) => (
            <option key={m.id} value={m.full_name}>
              {m.full_name}
            </option>
          ))}
        </select>
        <select
          value={filterLiteracy}
          onChange={(e) => setFilterLiteracy(e.target.value)}
          className="bg-[--bg] border border-[--border-2] rounded px-2 py-1 font-mono text-[10px] text-[--text] outline-none"
        >
          <option value="">All Literacy</option>
          {LITERACY_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Contact List */}
      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped).map(([stage, contacts]) => (
          <section key={stage}>
            <SectionHeader className="mb-1 px-1">
              {stage} ({contacts.length})
            </SectionHeader>
            <div className="bg-[--surface] border border-[--border] rounded-[6px] overflow-hidden">
              {contacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <EmptyState
          icon={GitBranch}
          message="No contacts found. Add your first contact to get started."
        />
      )}

      {/* New Contact Button */}
      <button
        onClick={() => setShowNewContact(!showNewContact)}
        className="fixed bottom-16 right-4 max-w-app w-12 h-12 bg-[--accent] rounded-[6px] flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity z-40"
      >
        <Plus size={20} className="text-black" />
      </button>

      {/* New Contact Form */}
      {showNewContact && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="w-full max-w-app bg-[--surface] border-t border-[--border] rounded-t-[6px] p-4 space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <SectionHeader>New Contact</SectionHeader>
              <button
                onClick={() => setShowNewContact(false)}
                className="font-mono text-[10px] text-[--text-muted]"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="First name *"
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
                className="bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none"
              />
              <input
                placeholder="Last name *"
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
                className="bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none"
              />
            </div>
            <input
              placeholder="Job title"
              value={form.job_title}
              onChange={(e) =>
                setForm({ ...form, job_title: e.target.value })
              }
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none"
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none"
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none"
            />
            <input
              placeholder="LinkedIn URL"
              value={form.linkedin_url}
              onChange={(e) =>
                setForm({ ...form, linkedin_url: e.target.value })
              }
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none"
            />
            <select
              value={form.company_id}
              onChange={(e) =>
                setForm({ ...form, company_id: e.target.value })
              }
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] outline-none"
            >
              <option value="">No company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.pipeline_stage}
                onChange={(e) =>
                  setForm({ ...form, pipeline_stage: e.target.value })
                }
                className="bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] outline-none"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={form.bitcoin_literacy}
                onChange={(e) =>
                  setForm({ ...form, bitcoin_literacy: e.target.value })
                }
                className="bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] outline-none"
              >
                {LITERACY_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    ₿ {l}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={form.owner_id}
              onChange={(e) =>
                setForm({ ...form, owner_id: e.target.value })
              }
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] outline-none"
            >
              <option value="">No owner</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>

            <button
              onClick={handleCreate}
              disabled={saving || !form.first_name || !form.last_name}
              className="w-full bg-accent text-black font-mono text-xs uppercase tracking-wider py-2.5 rounded-[4px] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Contact"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
