"use client";

import { StatusPill } from "@/components/badge";
import { useKillSwitch } from "@/context/kill-switch-context";

export function Topbar({ title }: { title: string }) {
  const { status } = useKillSwitch();

  return (
    <div className="flex items-center justify-between border-b border-line bg-panel/80 px-8 py-5 backdrop-blur-md">
      <div>
        <h1 className="font-serif text-[21px] font-semibold text-navy">{title}</h1>
        <p className="font-mono text-[11px] tracking-wide text-slate">
          EMPIRIC DESK · TIMEFRAME-AWARE · TRADER
        </p>
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
