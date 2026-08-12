"use client";

import { StatusPill } from "@/components/badge";
import { useKillSwitch } from "@/context/kill-switch-context";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { status } = useKillSwitch();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-panel/80 px-8 py-5 backdrop-blur-md">
      <div>
        <h1 className="font-serif text-[21px] font-semibold text-navy">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[13px] text-slate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {status.active ? (
          <StatusPill label="KILL SWITCH ACTIVE" tone="red" pulse />
        ) : (
          <StatusPill label="TRADING ACTIVE" tone="green" pulse />
        )}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tint font-mono text-[12px] font-medium text-navy">
          AR
        </div>
      </div>
    </div>
  );
}
