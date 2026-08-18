"use client";

import { useTimeframe } from "@/context/timeframe-context";

export function TimeframeToggle({ className = "" }: { className?: string }) {
  const { timeframe, setTimeframe } = useTimeframe();

  return (
    <div className={`inline-flex overflow-hidden rounded-md border border-line bg-tint ${className}`}>
      {(["1D", "1H"] as const).map((tf) => (
        <button
          key={tf}
          onClick={() => setTimeframe(tf)}
          className={`px-3 py-1.5 text-[11px] font-semibold transition-colors ${
            timeframe === tf ? "bg-navy text-white" : "text-slate hover:text-ink"
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
