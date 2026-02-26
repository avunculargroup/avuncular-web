import type { BitcoinLiteracy } from "@/lib/database.types";

const LEVELS: BitcoinLiteracy[] = [
  "unknown",
  "none",
  "basic",
  "intermediate",
  "advanced",
];

const recommendations: Record<BitcoinLiteracy, string> = {
  unknown: "Assess bitcoin literacy level",
  none: "Recommended: Bitcoin Basics Introduction",
  basic: "Recommended: Treasury Fundamentals Module",
  intermediate: "Recommended: Board Basics Module",
  advanced: "Ready for advanced treasury strategy",
};

export default function BitcoinLiteracyBar({
  level,
}: {
  level: BitcoinLiteracy;
}) {
  const activeIndex = LEVELS.indexOf(level);

  return (
    <div>
      <div className="flex gap-1">
        {LEVELS.map((l, i) => (
          <div key={l} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                i <= activeIndex
                  ? "bg-[--accent]"
                  : "bg-[--surface-2]"
              }`}
            />
            <div
              className={`font-mono text-[7px] uppercase tracking-wider mt-1 text-center ${
                i === activeIndex
                  ? "text-[--accent]"
                  : "text-[--text-muted]"
              }`}
            >
              {l}
            </div>
          </div>
        ))}
      </div>
      <p className="font-mono text-[9px] text-[--text-dim] mt-2">
        {recommendations[level]}
      </p>
    </div>
  );
}
