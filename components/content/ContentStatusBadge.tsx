import Badge from "@/components/shared/Badge";
import type { ContentStatus } from "@/lib/database.types";

const statusVariants: Record<ContentStatus, "muted" | "blue" | "accent" | "green" | "default"> = {
  idea: "muted",
  draft: "blue",
  review: "accent",
  approved: "green",
  scheduled: "green",
  published: "green",
  archived: "muted",
};

export default function ContentStatusBadge({
  status,
}: {
  status: ContentStatus;
}) {
  return <Badge variant={statusVariants[status]}>{status}</Badge>;
}
