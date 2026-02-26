"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone as PhoneIcon,
  Linkedin,
  MessageCircle,
  ClipboardList,
  Edit,
  Zap,
} from "lucide-react";
import PipelineStageBadge from "@/components/crm/PipelineStageBadge";
import BitcoinLiteracyBadge from "@/components/crm/BitcoinLiteracyBadge";
import BitcoinLiteracyBar from "@/components/crm/BitcoinLiteracyBar";
import InteractionFeed from "@/components/crm/InteractionFeed";
import LogInteractionSheet from "@/components/crm/LogInteractionSheet";
import Badge from "@/components/shared/Badge";
import SectionHeader from "@/components/shared/SectionHeader";
import EmptyState from "@/components/shared/EmptyState";
import type { PipelineStage, BitcoinLiteracy } from "@/lib/database.types";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  pipeline_stage: PipelineStage;
  bitcoin_literacy: BitcoinLiteracy;
  tags: string[] | null;
  companies: { name: string; industry: string | null } | null;
  team_members: { full_name: string } | null;
}

interface Interaction {
  id: string;
  type: string;
  direction?: string | null;
  occurred_at: string;
  summary?: string | null;
  raw_content?: string | null;
  extracted_data: unknown;
  source: string;
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ContactDetailView({
  contact,
  interactions,
  tasks,
}: {
  contact: Contact;
  interactions: Interaction[];
  tasks: Task[];
}) {
  const [showLogInteraction, setShowLogInteraction] = useState(false);
  const fullName = `${contact.first_name} ${contact.last_name}`;
  const ownerInitials = contact.team_members
    ? getInitials(contact.team_members.full_name)
    : null;

  return (
    <div className="py-4 space-y-5">
      {/* Back */}
      <Link
        href="/pipeline"
        className="flex items-center gap-1 font-mono text-[10px] text-[--text-dim] hover:text-[--text] transition-colors"
      >
        <ArrowLeft size={12} />
        Back
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[4px] bg-[--surface-2] border border-[--border] flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-xs text-[--text-dim]">
              {getInitials(fullName)}
            </span>
          </div>
          <div>
            <h1 className="text-base font-medium text-[--text]">{fullName}</h1>
            {contact.job_title && (
              <p className="text-xs text-[--text-dim]">{contact.job_title}</p>
            )}
            {contact.companies && (
              <p className="font-mono text-[10px] text-[--text-dim]">
                {contact.companies.name}
                {contact.companies.industry &&
                  ` · ${contact.companies.industry}`}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <PipelineStageBadge stage={contact.pipeline_stage} />
          <BitcoinLiteracyBadge level={contact.bitcoin_literacy} />
          {ownerInitials && (
            <span className="font-mono text-[9px] text-[--text-muted] px-1.5 py-0.5 bg-[--surface-2] rounded-[3px]">
              {ownerInitials}
            </span>
          )}
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-3 flex-wrap">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-1 font-mono text-[10px] text-[--text-dim] hover:text-[--accent] transition-colors"
            >
              <Mail size={10} />
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-1 font-mono text-[10px] text-[--text-dim] hover:text-[--accent] transition-colors"
            >
              <PhoneIcon size={10} />
              {contact.phone}
            </a>
          )}
          {contact.linkedin_url && (
            <a
              href={contact.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[--text-dim] hover:text-[--accent] transition-colors"
            >
              <Linkedin size={12} />
            </a>
          )}
        </div>

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {contact.tags.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowLogInteraction(true)}
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-3 py-2 rounded-[4px] border border-[--border] text-[--text-dim] hover:border-[--accent] hover:text-[--accent] transition-colors"
        >
          <MessageCircle size={12} />
          Log Interaction
        </button>
        <button className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-3 py-2 rounded-[4px] border border-[--border] text-[--text-dim] hover:border-[--accent] hover:text-[--accent] transition-colors">
          <ClipboardList size={12} />
          Add Task
        </button>
        <button className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-3 py-2 rounded-[4px] border border-[--border] text-[--text-dim] hover:border-[--accent] hover:text-[--accent] transition-colors">
          <Edit size={12} />
          Edit
        </button>
      </div>

      {/* Bitcoin Literacy Bar */}
      <section>
        <SectionHeader className="mb-2">Bitcoin Literacy</SectionHeader>
        <div className="bg-[--surface] border border-[--border] rounded-[6px] p-3">
          <BitcoinLiteracyBar level={contact.bitcoin_literacy} />
        </div>
      </section>

      {/* Interaction Feed */}
      <InteractionFeed interactions={interactions} />

      {/* Open Tasks */}
      <section>
        <SectionHeader className="mb-2">
          Open Tasks ({tasks.length})
        </SectionHeader>
        {tasks.length > 0 ? (
          <div className="bg-[--surface] border border-[--border] rounded-[6px] overflow-hidden">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 border-b border-[--border] last:border-0"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    task.priority === "urgent"
                      ? "bg-[--red]"
                      : task.priority === "high"
                        ? "bg-[--accent]"
                        : task.priority === "medium"
                          ? "bg-[--blue]"
                          : "bg-[--text-muted]"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-[--text] flex items-center gap-1">
                    {task.title}
                    {task.source !== "manual" && (
                      <Zap size={10} className="text-[--accent]" />
                    )}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={task.status === "blocked" ? "red" : "default"}>
                      {task.status}
                    </Badge>
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
        ) : (
          <EmptyState message="No open tasks for this contact" />
        )}
      </section>

      {/* Log Interaction Sheet */}
      {showLogInteraction && (
        <LogInteractionSheet
          contactId={contact.id}
          onClose={() => setShowLogInteraction(false)}
        />
      )}
    </div>
  );
}
