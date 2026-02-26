"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  Linkedin,
  StickyNote,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import Badge from "@/components/shared/Badge";

const typeIcons: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  signal: MessageCircle,
  linkedin: Linkedin,
  note: StickyNote,
  other: HelpCircle,
};

interface Interaction {
  id: string;
  type: string;
  direction?: string | null;
  occurred_at: string;
  summary?: string | null;
  raw_content?: string | null;
  extracted_data?: unknown;
  source?: string;
  contact_name?: string;
  company_name?: string | null;
}

export default function InteractionItem({
  interaction,
  showContact = false,
}: {
  interaction: Interaction;
  showContact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = typeIcons[interaction.type] || HelpCircle;
  const extractedData = interaction.extracted_data as Record<string, unknown> | null;
  const topics = Array.isArray(extractedData?.topics)
    ? (extractedData.topics as string[])
    : [];
  const sentiment = extractedData?.sentiment as string | undefined;
  const isAgent =
    interaction.source === "coordinator_agent" ||
    interaction.source === "call_transcript";

  return (
    <div className="flex gap-3 p-3 border-b border-[--border]">
      <div className="flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-[--text-dim]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-[--text-dim]">
              {formatDistanceToNow(new Date(interaction.occurred_at), {
                addSuffix: true,
              })}
            </span>
            {isAgent && <Zap size={10} className="text-[--accent]" />}
          </div>
          <div className="flex items-center gap-1.5">
            {interaction.direction && (
              <Badge variant="default">{interaction.direction}</Badge>
            )}
            {sentiment && (
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  sentiment === "positive"
                    ? "bg-[--green]"
                    : sentiment === "negative"
                      ? "bg-[--red]"
                      : "bg-[--text-muted]"
                }`}
              />
            )}
          </div>
        </div>

        {showContact && interaction.contact_name && (
          <div className="font-mono text-[10px] text-[--text] mt-0.5">
            {interaction.contact_name}
            {interaction.company_name && (
              <span className="text-[--text-dim]">
                {" "}
                · {interaction.company_name}
              </span>
            )}
          </div>
        )}

        {interaction.summary && (
          <p className="text-xs text-[--text-dim] mt-1 line-clamp-2">
            {interaction.summary}
          </p>
        )}

        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {topics.map((topic) => (
              <Badge key={topic} variant="default">
                {topic}
              </Badge>
            ))}
          </div>
        )}

        {interaction.raw_content && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 font-mono text-[9px] text-[--text-muted] mt-1.5 hover:text-[--text-dim] transition-colors"
          >
            {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            {expanded ? "Hide" : "Show"} content
          </button>
        )}

        {expanded && interaction.raw_content && (
          <pre className="mt-2 p-2 bg-[--bg] border border-[--border] rounded text-[10px] font-mono text-[--text-dim] whitespace-pre-wrap max-h-48 overflow-y-auto">
            {interaction.raw_content}
          </pre>
        )}
      </div>
    </div>
  );
}
