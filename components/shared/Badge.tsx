import { ReactNode } from "react";

const variants = {
  default: "bg-[--surface-2] text-[--text-dim]",
  accent: "bg-[--accent-dim] text-[--accent]",
  green: "bg-[--green-dim] text-[--green]",
  blue: "bg-[--blue-dim] text-[--blue]",
  red: "bg-red/10 text-[--red]",
  muted: "bg-[--surface] text-[--text-muted]",
  agent: "bg-[--accent-dim] text-[--accent]",
} as const;

export default function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] inline-flex items-center ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
