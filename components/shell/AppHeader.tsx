"use client";

interface TeamMember {
  id: string;
  full_name: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AppHeader({
  teamMembers,
  hasPendingAgentActivity,
}: {
  teamMembers: TeamMember[];
  hasPendingAgentActivity?: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 bg-[--surface]/80 backdrop-blur border-b border-[--border] px-3 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-[28px] h-[28px] bg-accent rounded-[4px] flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-black text-sm font-semibold">
              ₿
            </span>
          </div>
          <div className="leading-none">
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[--text]">
              Treasury
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[--text-dim]">
              Console
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPendingAgentActivity && (
            <div className="w-2 h-2 rounded-full bg-[--green] animate-pulse" />
          )}
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="w-[28px] h-[28px] rounded-[4px] bg-[--surface-2] border border-[--border] flex items-center justify-center"
              title={member.full_name}
            >
              <span className="font-mono text-[9px] text-[--text-dim]">
                {getInitials(member.full_name)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
