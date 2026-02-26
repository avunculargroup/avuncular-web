export default function SectionHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`font-mono text-[9px] uppercase tracking-[0.12em] text-[--text-muted] ${className}`}
    >
      {children}
    </h2>
  );
}
