export default function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="bg-[--surface] border border-[--border] rounded-[6px] p-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[--text-muted] mb-1">
        {label}
      </div>
      <div className="font-mono text-2xl text-[--text]">{value}</div>
      {subtext && (
        <div className="font-mono text-[9px] text-[--text-dim] mt-0.5">
          {subtext}
        </div>
      )}
    </div>
  );
}
