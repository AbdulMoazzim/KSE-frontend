"use client";

import { useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { StatusPill } from "@/components/badge";
import { useKillSwitch } from "@/context/kill-switch-context";
import { killSwitchHistory } from "@/lib/mock-data";

export default function KillSwitchPage() {
  const { status, activate, deactivate } = useKillSwitch();
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);

  function handleConfirm() {
    if (reason.trim().length < 8) return;
    if (status.active) {
      deactivate(reason.trim());
    } else {
      activate(reason.trim());
    }
    setReason("");
    setConfirming(false);
  }

  return (
    <>
      <Topbar title="Kill Switch" />
      <main className="flex-1 space-y-6 px-8 py-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          {/* Status card */}
          <div
            className={`rounded-2xl border p-7 ${
              status.active ? "border-brand-red/30 bg-tint-red" : "border-line bg-panel"
            }`}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="text-[13px] font-medium uppercase tracking-wide text-slate">Current status</span>
              <StatusPill label={status.active ? "ACTIVE" : "DISENGAGED"} tone={status.active ? "red" : "green"} pulse />
            </div>

            <p className="mb-6 text-[14px] leading-relaxed text-slate">
              {status.active
                ? "New order entry is paused tenant-wide. Existing positions are still marked-to-market and visible in the trade log."
                : "Trading is active. Signals can enter new positions per the sizing tier and correlation-gating rules."}
            </p>

            {status.active && status.reason && (
              <div className="mb-6 rounded-xl border border-line bg-panel px-4 py-3.5 text-[13px]">
                <div className="mb-1 font-mono text-[10.5px] uppercase tracking-wide text-slate">
                  Activated by {status.activatedBy} · {status.activatedAt}
                </div>
                <div className="text-navy">{status.reason}</div>
              </div>
            )}

            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className={`w-full rounded-full py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-px ${
                  status.active
                    ? "bg-brand-green hover:bg-[#357a5c]"
                    : "bg-brand-red hover:bg-[#a8453f]"
                }`}
              >
                {status.active ? "Release kill switch" : "Activate kill switch"}
              </button>
            ) : (
              <div className="space-y-3 rounded-xl border border-line bg-panel p-4">
                <label className="block text-[11.5px] font-semibold uppercase tracking-wide text-slate">
                  Reason (required, min. 8 characters)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder={
                    status.active
                      ? "e.g. Data feed latency resolved, confirmed with infra team."
                      : "e.g. Elevated data feed latency on 1H engine, pausing entries as a precaution."
                  }
                  className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[13.5px] text-navy placeholder:text-[#A2A9C4] focus:border-gold focus:bg-white focus:outline-none"
                />
                <div className="flex gap-2.5">
                  <button
                    onClick={handleConfirm}
                    disabled={reason.trim().length < 8}
                    className="flex-1 rounded-full bg-navy py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Confirm {status.active ? "release" : "activation"}
                  </button>
                  <button
                    onClick={() => {
                      setConfirming(false);
                      setReason("");
                    }}
                    className="rounded-full border border-line px-4 py-2.5 text-[13.5px] font-medium text-slate hover:text-navy"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Explanation card */}
          <div className="rounded-2xl border border-line bg-panel p-7">
            <h2 className="mb-4 text-[15.5px] font-semibold text-navy">How the kill switch works</h2>
            <ul className="space-y-3.5 text-[13.5px] leading-relaxed text-slate">
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-tint font-mono text-[10px] text-navy">
                  1
                </span>
                Activating pauses new order entry across the entire tenant, on both the 1H and 1D engines.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-tint font-mono text-[10px] text-navy">
                  2
                </span>
                Existing open positions are left untouched and continue to mark-to-market normally.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-tint font-mono text-[10px] text-navy">
                  3
                </span>
                Every activation and release requires a typed reason and is permanently recorded below.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-tint font-mono text-[10px] text-navy">
                  4
                </span>
                Only admins and super admins can trigger this control — traders can view status and history only.
              </li>
            </ul>
          </div>
        </div>

        {/* History */}
        <div className="overflow-hidden rounded-2xl border border-line bg-panel">
          <div className="border-b border-line px-6 py-4">
            <h2 className="text-[15.5px] font-semibold text-navy">Activation history</h2>
          </div>
          <table className="w-full text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-slate">
                <th className="px-6 py-3 font-medium">Action</th>
                <th className="px-6 py-3 font-medium">Reason</th>
                <th className="px-6 py-3 font-medium">Actor</th>
                <th className="px-6 py-3 text-right font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {killSwitchHistory.map((ev) => (
                <tr key={ev.id} className="border-b border-line last:border-0 hover:bg-tint/60">
                  <td className="px-6 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 font-mono text-[10.5px] ${
                        ev.action === "ACTIVATED" ? "bg-tint-red text-brand-red" : "bg-tint-green text-brand-green"
                      }`}
                    >
                      {ev.action}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate">{ev.reason}</td>
                  <td className="px-6 py-3.5 font-mono text-[12.5px] text-slate">{ev.actor}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-[12.5px] text-slate">{ev.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
