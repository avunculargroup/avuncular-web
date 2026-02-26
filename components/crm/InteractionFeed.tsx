import InteractionItem from "./InteractionItem";
import SectionHeader from "@/components/shared/SectionHeader";
import EmptyState from "@/components/shared/EmptyState";
import { MessageCircle } from "lucide-react";

interface Interaction {
  id: string;
  type: string;
  direction?: string | null;
  occurred_at: string;
  summary?: string | null;
  raw_content?: string | null;
  extracted_data?: Record<string, unknown> | null;
  source?: string;
}

export default function InteractionFeed({
  interactions,
}: {
  interactions: Interaction[];
}) {
  return (
    <section>
      <SectionHeader className="mb-2">
        Interactions ({interactions.length})
      </SectionHeader>
      {interactions.length > 0 ? (
        <div className="bg-[--surface] border border-[--border] rounded-[6px] overflow-hidden">
          {interactions.map((interaction) => (
            <InteractionItem key={interaction.id} interaction={interaction} />
          ))}
        </div>
      ) : (
        <EmptyState icon={MessageCircle} message="No interactions logged yet" />
      )}
    </section>
  );
}
