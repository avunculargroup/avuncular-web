"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <AlertTriangle size={32} className="text-[--red] mb-3" />
      <p className="text-xs text-[--text-dim] mb-4">
        {error.message || "Something went wrong loading this page."}
      </p>
      <button
        onClick={reset}
        className="font-mono text-[10px] uppercase tracking-wider px-4 py-2 rounded-[4px] border border-[--border] text-[--text-dim] hover:border-[--accent] hover:text-[--accent] transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
