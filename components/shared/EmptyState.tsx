import { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  message,
}: {
  icon?: LucideIcon;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon size={32} className="text-[--text-muted] mb-3" />}
      <p className="font-mono text-xs text-[--text-dim]">{message}</p>
    </div>
  );
}
