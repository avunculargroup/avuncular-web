import Badge from "@/components/shared/Badge";
import type { BitcoinLiteracy } from "@/lib/database.types";

const literacyVariants: Record<BitcoinLiteracy, "default" | "red" | "accent" | "blue" | "green" | "muted"> = {
  unknown: "muted",
  none: "red",
  basic: "accent",
  intermediate: "blue",
  advanced: "green",
};

export default function BitcoinLiteracyBadge({
  level,
}: {
  level: BitcoinLiteracy;
}) {
  return (
    <Badge variant={literacyVariants[level]}>
      ₿ {level}
    </Badge>
  );
}
