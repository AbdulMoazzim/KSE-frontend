"use client";

import { useCallback, useEffect, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { LoadingState, ErrorState, EmptyState } from "@/components/dashboard/async-state";
import { useKillSwitch } from "@/context/kill-switch-context";
import { apiGet, ApiError } from "@/lib/api-client";
import { extractArray, normalizeKillSwitchEvent } from "@/lib/normalize";
import { KillSwitchEvent } from "@/lib/types";

export default function KillSwitchPage() {
  const { status, loading: statusLoading, error: statusError, activate, deactivate } = useKillSwitch();
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [history, setHistory] = useState<KillSwitchEvent[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const raw = await apiGet("/api/kill-switch/history",{"X-Tenant-ID": "1"});
      setHistory(extractArray(raw, ["history", "events"]).map(normalizeKillSwitchEvent));
    } catch (err) {
      setHistoryError(err instanceof ApiError ? err.message : "We couldn't load the activation history.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleConfirm() {
    if (reason.trim().length < 8) return;
    setSubmitting(true);
    setActionError(null);
    try {
      if (status.active) {
        await deactivate(reason.trim());
      } else {
        await activate(reason.trim());
      }
      setReason("");
      setConfirming(false);
      loadHistory();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "That didn't go through. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar
        title="Kill Switch"
        subtitle="One switch, plainly labeled: it pauses new trades for everyone on this desk."
      />
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
              {statusLoading ? (
                <span className="text-[12px] text-slate">Checking…</span>
              ) : (
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] tracking-wide ${
                    status.active ? "bg-tint-red text-brand-red" : "bg-tint-green text-brand-green"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${status.active ? "bg-brand-red" : "bg-brand-green"}`} />
                  {status.active ? "ACTIVE" : "DISENGAGED"}
                </span>
              )}
            </div>

            {statusError && (
              <div className="mb-5 rounded-xl border border-brand-red/30 bg-panel px-4 py-3 text-[13px] text-brand-red">
                {statusError}
              </div>
            )}

            <p className="mb-6 text-[14px] leading-relaxed text-slate">
              {status.active
                ? "New order entry is paused for everyone on this desk. Positions already open are unaffected and keep updating normally."
                : "Trading is active. New signals can open positions, subject to the usual sizing and correlation rules."}
            </p>

            {status.active && status.reason && (
              <div className="mb-6 rounded-xl border border-line bg-panel px-4 py-3.5 text-[13px]">
                <div className="mb-1 font-mono text-[10.5px] uppercase tracking-wide text-slate">
                  Activated by {status.activatedBy ?? "—"} · {status.activatedAt ?? "—"}
                </div>
                <div className="text-ink">{status.reason}</div>
              </div>
            )}

            {actionError && (
              <div className="mb-4 rounded-xl border border-brand-red/30 bg-panel px-4 py-3 text-[13px] text-brand-red">
                {actionError}
              </div>
            )}

            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                disabled={statusLoading}
                className={`w-full rounded-full py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${
                  status.active ? "bg-brand-green hover:opacity-90" : "bg-brand-red hover:opacity-90"
                }`}
              >
                {status.active ? "Release kill switch" : "Activate kill switch"}
              </button>
            ) : (
              <div className="space-y-3 rounded-xl border border-line bg-panel p-4">
                <label className="block text-[11.5px] font-semibold uppercase tracking-wide text-slate">
                  Why? (required, at least 8 characters — this is saved to the history below)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder={
                    status.active
                      ? "e.g. Data feed latency resolved, confirmed with infra team."
                      : "e.g. Elevated data feed latency on the 1H engine, pausing entries as a precaution."
                  }
                  className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[13.5px] text-ink placeholder:text-slate focus:border-gold focus:bg-panel focus:outline-none"
                />
                <div className="flex gap-2.5">
                  <button
                    onClick={handleConfirm}
                    disabled={reason.trim().length < 8 || submitting}
                    className="flex-1 rounded-full bg-navy py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Saving…" : `Confirm ${status.active ? "release" : "activation"}`}
                  </button>
                  <button
                    onClick={() => {
                      setConfirming(false);
                      setReason("");
                      setActionError(null);
                    }}
                    disabled={submitting}
                    className="rounded-full border border-line px-4 py-2.5 text-[13.5px] font-medium text-slate hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Explanation card */}
          <div className="rounded-2xl border border-line bg-card shadow-sm p-7">
            <h2 className="mb-4 text-[15.5px] font-semibold text-ink">What happens when you use this</h2>
            <ul className="space-y-3.5 text-[13.5px] leading-relaxed text-slate">
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-tint font-mono text-[10px] text-ink">
                  1
                </span>
                Turning it on pauses new order entry across the entire desk, on both the 1H and 1D engines.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-tint font-mono text-[10px] text-ink">
                  2
                </span>
                Any positions already open are left alone and keep updating their live price normally.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-tint font-mono text-[10px] text-ink">
                  3
                </span>
                Every time it's turned on or off, the reason you type is saved permanently in the history below.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-tint font-mono text-[10px] text-ink">
                  4
                </span>
                Only admins and super admins can use this control — everyone else can view status and history only.
              </li>
            </ul>
          </div>
        </div>

        {/* History */}
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          <div className="border-b border-line px-6 py-4">
            <h2 className="text-[15.5px] font-semibold text-ink">Activation history</h2>
          </div>
          {historyLoading ? (
            <div className="p-6">
              <LoadingState label="Loading history…" />
            </div>
          ) : historyError ? (
            <div className="p-6">
              <ErrorState message={historyError} onRetry={loadHistory} />
            </div>
          ) : !history || history.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No activity yet"
                description="Once the kill switch is used for the first time, every activation and release will be listed here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {history.map((ev) => (
                    <tr key={ev.id} className="border-b border-line last:border-0 hover:bg-tint/60">
                      <td className="px-6 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-1 font-mono text-[10.5px] ${
                            ev.action === "ACTIVATED"
                              ? "bg-tint-red text-brand-red"
                              : ev.action === "DEACTIVATED"
                              ? "bg-tint-green text-brand-green"
                              : "bg-tint text-slate"
                          }`}
                        >
                          {ev.action ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate">{ev.reason ?? "—"}</td>
                      <td className="px-6 py-3.5 font-mono text-[12.5px] text-slate">{ev.actor ?? "—"}</td>
                      <td className="px-6 py-3.5 text-right font-mono text-[12.5px] text-slate">
                        {ev.timestamp ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
