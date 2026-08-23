"use client";

import { useCallback, useEffect, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { LoadingState, ErrorState, EmptyState } from "@/components/dashboard/async-state";
import { apiGet, ApiError } from "@/lib/api-client";
import { normalizeDailyReport } from "@/lib/normalize";
import { DailyReport } from "@/lib/types";
import { useTimeframe } from "@/context/timeframe-context";

function fmtPct(value: number | null) {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default function DailyReportPage() {
  const { timeframe } = useTimeframe();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await apiGet(`/api/daily-report?timeframe=${timeframe}`,{"X-Tenant-ID": "1"});
      setReport(normalizeDailyReport(raw));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load today's report right now.");
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Topbar title="Daily Report" subtitle="A short, plain summary of what happened today — no jargon required." />
      <main className="flex-1 space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-7 lg:px-8">
        {loading ? (
          <LoadingState label="Putting together today's report…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !report ? (
          <EmptyState title="No report yet" description="Check back once the trading day has started." />
        ) : (
          <>
            <div className="rounded-2xl border border-line bg-card shadow-sm p-6">
              <p className="text-[13px] uppercase tracking-wide text-slate">{report.date ?? "Today"}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink">
                {report.notes ?? "No additional notes were provided for today."}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-4">
              <StatCard label="Signals" value={report.signalsCount !== null ? String(report.signalsCount) : "—"} sub="Found across both engines" />
              <StatCard label="Entries" value={report.entriesCount !== null ? String(report.entriesCount) : "—"} sub="New positions opened" />
              <StatCard label="Closed" value={report.closedCount !== null ? String(report.closedCount) : "—"} sub="Trades exited" />
              <StatCard
                label="Equity move"
                value={fmtPct(report.equityMovePct)}
                tone={report.equityMovePct !== null && report.equityMovePct >= 0 ? "green" : "red"}
              />
            </div>

            <div className="rounded-2xl border border-line bg-card shadow-sm p-6">
              <h2 className="mb-3 text-[15.5px] font-semibold text-ink">Risk flags</h2>
              {report.riskFlags.length === 0 ? (
                <p className="text-[13.5px] text-slate">Nothing flagged today — no unusual activity to review.</p>
              ) : (
                <ul className="space-y-2">
                  {report.riskFlags.map((flag, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 rounded-xl border border-brand-red/20 bg-tint-red px-4 py-3 text-[13.5px] text-brand-red"
                    >
                      <svg width={14} height={14} viewBox="0 0 14 14" fill="none" className="mt-0.5 flex-none">
                        <circle cx="7" cy="7" r="6" stroke="rgb(var(--c-brand-red))" strokeWidth={1.3} />
                        <path d="M7 4v3.5" stroke="rgb(var(--c-brand-red))" strokeWidth={1.3} strokeLinecap="round" />
                        <circle cx="7" cy="9.6" r="0.8" fill="rgb(var(--c-brand-red))" />
                      </svg>
                      {flag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
