"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GitBranch, Users, FileText, Bot } from "lucide-react";

const tabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Pipeline", href: "/pipeline", icon: GitBranch },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Content", href: "/content", icon: FileText },
  { label: "Agents", href: "/agents", icon: Bot },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[--surface]/95 backdrop-blur border-t border-[--border]">
      <div className="max-w-app mx-auto flex items-center">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${
                active
                  ? "text-[--accent] border-t-2 border-[--accent]"
                  : "text-[--text-muted] border-t-2 border-transparent"
              }`}
            >
              <tab.icon size={18} />
              <span className="font-mono text-[8px] uppercase tracking-wider">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
