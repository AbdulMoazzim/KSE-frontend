"use client";

import Link from "next/link";
import { useKillSwitch } from "@/context/kill-switch-context";

export function KillSwitchBanner() {
  const { status } = useKillSwitch();

  if (!status.active) return null;

  return (
    <div className="flex items-center justify-between gap-4 bg-brand-red px-8 py-3 text-white">
      <div className="flex items-center gap-2.5 text-[13px]">
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="white" strokeWidth={1.4} />
          <path d="M8 4.5v4" stroke="white" strokeWidth={1.4} strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.9" fill="white" />
        </svg>
        <span>
          <strong className="font-semibold">Kill switch is active.</strong> New order entry is paused
          tenant-wide.{" "}
          {status.reason && <span className="opacity-90">Reason: {status.reason}</span>}
        </span>
      </div>
      <Link
        href="/dashboard/kill-switch"
        className="whitespace-nowrap rounded-full border border-white/50 px-3.5 py-1.5 text-[12px] font-medium hover:bg-white/10"
      >
        Review &amp; release
      </Link>
    </div>
  );
}
