import Badge from "@/components/shared/Badge";
import type { PipelineStage } from "@/lib/database.types";

const stageVariants: Record<PipelineStage, "default" | "accent" | "green" | "blue" | "muted"> = {
  lead: "default",
  warm: "accent",
  active: "green",
  client: "blue",
  dormant: "muted",
};

export default function PipelineStageBadge({
  stage,
}: {
  stage: PipelineStage;
}) {
  return <Badge variant={stageVariants[stage]}>{stage}</Badge>;
}
