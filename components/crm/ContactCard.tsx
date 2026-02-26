import Link from "next/link";
import PipelineStageBadge from "./PipelineStageBadge";
import BitcoinLiteracyBadge from "./BitcoinLiteracyBadge";
import type { PipelineStage, BitcoinLiteracy } from "@/lib/database.types";

interface ContactOverview {
  id: string;
  full_name: string;
  job_title: string | null;
  pipeline_stage: PipelineStage;
  bitcoin_literacy: BitcoinLiteracy;
  company_name: string | null;
  owner_name: string | null;
  open_tasks: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ContactCard({
  contact,
}: {
  contact: ContactOverview;
}) {
  return (
    <Link
      href={`/pipeline/${contact.id}`}
      className="flex items-start gap-3 p-3 border-b border-[--border] hover:bg-[--surface-2] cursor-pointer transition-colors"
    >
      <div className="w-8 h-8 rounded-[4px] bg-[--surface-2] border border-[--border] flex items-center justify-center flex-shrink-0">
        <span className="font-mono text-[9px] text-[--text-dim]">
          {getInitials(contact.full_name)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-[--text] truncate">
            {contact.full_name}
          </span>
          <PipelineStageBadge stage={contact.pipeline_stage} />
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="font-mono text-[10px] text-[--text-dim] truncate">
            {[contact.job_title, contact.company_name]
              .filter(Boolean)
              .join(" · ")}
          </span>
          {contact.owner_name && (
            <span className="font-mono text-[9px] text-[--text-muted]">
              {getInitials(contact.owner_name)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <BitcoinLiteracyBadge level={contact.bitcoin_literacy} />
          {contact.open_tasks > 0 && (
            <span className="font-mono text-[9px] text-[--text-dim]">
              {contact.open_tasks} task{contact.open_tasks !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
