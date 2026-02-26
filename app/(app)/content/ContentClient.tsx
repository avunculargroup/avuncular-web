"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, Zap } from "lucide-react";
import ContentStatusBadge from "@/components/content/ContentStatusBadge";
import Badge from "@/components/shared/Badge";
import SectionHeader from "@/components/shared/SectionHeader";
import EmptyState from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase/client";
import type { ContentStatus, ContentType } from "@/lib/database.types";
import { formatDistanceToNow } from "date-fns";

const FILTER_TABS = ["all", "idea", "draft", "review", "published"] as const;
const CONTENT_TYPES: ContentType[] = [
  "linkedin",
  "twitter_x",
  "newsletter",
  "blog",
  "idea",
];
const TOPIC_PRESETS = [
  "treasury",
  "regulation",
  "education",
  "macro",
  "case-study",
  "how-to",
];

interface ContentItem {
  id: string;
  title: string | null;
  type: ContentType;
  status: ContentStatus;
  topic_tags: string[] | null;
  source: string;
  updated_at: string;
  team_members: { full_name: string } | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ContentClient({
  initialItems,
}: {
  initialItems: ContentItem[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "linkedin" as ContentType,
    topic_tags: [] as string[],
    body: "",
  });

  const filtered =
    filter === "all"
      ? initialItems
      : initialItems.filter((i) => i.status === filter);

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      topic_tags: prev.topic_tags.includes(tag)
        ? prev.topic_tags.filter((t) => t !== tag)
        : [...prev.topic_tags, tag],
    }));
  };

  const handleCreate = async () => {
    if (!form.title) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("content_items").insert({
      title: form.title,
      type: form.type,
      topic_tags: form.topic_tags.length > 0 ? form.topic_tags : null,
      body: form.body || null,
    });
    setSaving(false);
    setShowNew(false);
    setForm({ title: "", type: "linkedin", topic_tags: [], body: "" });
    router.refresh();
  };

  return (
    <div className="py-4 space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-[4px] transition-colors whitespace-nowrap ${
              filter === tab
                ? "bg-[--accent-dim] text-[--accent] border border-[--accent]"
                : "bg-[--surface] text-[--text-muted] border border-[--border]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content List */}
      {filtered.length > 0 ? (
        <div className="bg-[--surface] border border-[--border] rounded-[6px] overflow-hidden">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/content/${item.id}`}
              className="flex items-start gap-3 p-3 border-b border-[--border] hover:bg-[--surface-2] cursor-pointer transition-colors last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="default">{item.type}</Badge>
                    <span className="text-xs text-[--text] truncate">
                      {item.title || "Untitled"}
                    </span>
                    {(item.source === "content_agent" ||
                      item.source === "coordinator_agent") && (
                      <Zap size={10} className="text-[--accent]" />
                    )}
                  </div>
                  <ContentStatusBadge status={item.status} />
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <div className="flex flex-wrap gap-1">
                    {item.topic_tags?.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[8px] text-[--text-muted] bg-[--surface-2] px-1 py-0.5 rounded-[2px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-[9px] text-[--text-muted]">
                      {formatDistanceToNow(new Date(item.updated_at), {
                        addSuffix: true,
                      })}
                    </span>
                    {item.team_members && (
                      <span className="font-mono text-[9px] text-[--text-muted]">
                        {getInitials(item.team_members.full_name)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={FileText} message="No content items found" />
      )}

      {/* New Content Button */}
      <button
        onClick={() => setShowNew(true)}
        className="fixed bottom-16 right-4 max-w-app w-12 h-12 bg-[--accent] rounded-[6px] flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity z-40"
      >
        <Plus size={20} className="text-black" />
      </button>

      {/* New Content Sheet */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="w-full max-w-app bg-[--surface] border-t border-[--border] rounded-t-[6px] p-4 space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <SectionHeader>New Content</SectionHeader>
              <button
                onClick={() => setShowNew(false)}
                className="font-mono text-[10px] text-[--text-muted]"
              >
                Cancel
              </button>
            </div>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as ContentType })
              }
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] outline-none"
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              placeholder="Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none"
            />
            <div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-[--text-muted] mb-1">
                Topics
              </div>
              <div className="flex flex-wrap gap-1">
                {TOPIC_PRESETS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`font-mono text-[9px] px-2 py-1 rounded-[3px] transition-colors ${
                      form.topic_tags.includes(tag)
                        ? "bg-[--accent-dim] text-[--accent] border border-[--accent]"
                        : "bg-[--surface-2] text-[--text-muted] border border-[--border]"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Initial content body"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={4}
              className="w-full bg-[--bg] border border-[--border-2] rounded px-3 py-2 font-mono text-xs text-[--text] focus:border-[--accent] outline-none resize-none"
            />
            <button
              onClick={handleCreate}
              disabled={saving || !form.title}
              className="w-full bg-accent text-black font-mono text-xs uppercase tracking-wider py-2.5 rounded-[4px] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Content"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
