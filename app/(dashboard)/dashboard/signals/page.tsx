"use client";

import { useCallback, useEffect, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { LoadingState, ErrorState, EmptyState } from "@/components/dashboard/async-state";
import { apiGet, ApiError } from "@/lib/api-client";
import { extractArray, normalizeSignal, normalizeSignalSummary } from "@/lib/normalize";
import { LiveSignal, LiveSignalSummary } from "@/lib/types";
import { useTimeframe } from "@/context/timeframe-context";

function outcomeTone(outcome: string | null) {
  if (outcome === "WIN") return "bg-tint-green text-brand-green";
  if (outcome === "LOSS") return "bg-tint-red text-brand-red";
  if (outcome === "OPEN") return "bg-tint-gold text-gold";
  return "bg-tint text-slate";
}

function fmtPct(value: number | null) {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default function LiveSignalsPage() {
  const { timeframe } = useTimeframe();
  const [signals, setSignals] = useState<LiveSignal[] | null>(null);
  const [summary, setSummary] = useState<LiveSignalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [signalsRes, summaryRes] = await Promise.all([
        apiGet(`/api/live-signals?timeframe=${timeframe}`,{"X-Tenant-ID": "1"}),
        apiGet(`/api/live-signals/summary?timeframe=${timeframe}`,{"X-Tenant-ID": "1"}),
      ]);
      setSignals(extractArray(signalsRes, ["signals"]).map(normalizeSignal));
      setSummary(normalizeSignalSummary(summaryRes));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "We couldn't load your live signals right now."
      );
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Topbar
        title="Live Signals"
        subtitle="What the engine has found and traded — a plain, honest record, not a projection."
      />
      <main className="flex-1 space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-7 lg:px-8">
        {loading && !signals ? (
          <LoadingState label="Loading live signals…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-4">
              <StatCard
                label="Win rate"
                value={summary?.winRatePct !== null && summary?.winRatePct !== undefined ? `${summary.winRatePct.toFixed(0)}%` : "—"}
                sub={
                  summary?.wins !== null && summary?.losses !== null
                    ? `${summary?.wins ?? 0} win · ${summary?.losses ?? 0} loss, decided signals`
                    : "Decided signals only"
                }
              />
              <StatCard
                label="Avg. return"
                value={fmtPct(summary?.avgReturnPct ?? null)}
                tone={summary?.avgReturnPct !== null && summary?.avgReturnPct !== undefined && summary.avgReturnPct >= 0 ? "green" : "red"}
                sub="Across all logged outcomes"
              />
              <StatCard
                label="Open signals"
                value={summary?.openCount !== null && summary?.openCount !== undefined ? String(summary.openCount) : "—"}
              />
              <StatCard
                label="Total tracked"
                value={signals ? String(signals.length) : "—"}
                sub="This view, most recent first"
              />
            </div>

            {!signals || signals.length === 0 ? (
              <EmptyState
                title="No live signals yet"
                description="Signals appear here the moment the intraday or investment engine finds a setup worth tracking."
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13.5px]">
                    <thead>
                      <tr className="border-b border-line text-[11px] uppercase tracking-wide text-slate">
                        <th className="px-5 py-3.5 font-medium">Date</th>
                        <th className="px-5 py-3.5 font-medium">Ticker</th>
                        <th className="px-5 py-3.5 font-medium">Timeframe</th>
                        <th className="px-5 py-3.5 font-medium">Direction</th>
                        <th className="px-5 py-3.5 font-medium">Confluence</th>
                        <th className="px-5 py-3.5 font-medium">Entry</th>
                        <th className="px-5 py-3.5 font-medium">Exit</th>
                        <th className="px-5 py-3.5 font-medium">Outcome</th>
                        <th className="px-5 py-3.5 text-right font-medium">Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {signals.map((s) => (
                        <tr key={s.id} className="border-b border-line last:border-0 hover:bg-tint/60">
                          <td className="px-5 py-3.5 font-mono text-slate">{s.date ?? "—"}</td>
                          <td className="px-5 py-3.5 font-mono font-medium text-ink">{s.ticker}</td>
                          <td className="px-5 py-3.5 text-slate">{s.timeframe ?? "—"}</td>
                          <td
                            className={`px-5 py-3.5 ${
                              s.direction === "LONG"
                                ? "text-brand-green"
                                : s.direction === "SHORT"
                                ? "text-brand-red"
                                : "text-slate"
                            }`}
                          >
                            {s.direction ?? "—"}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate">
                            {s.confluenceScore !== null ? s.confluenceScore.toFixed(2) : "—"}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate">
                            {s.entryPrice !== null ? s.entryPrice.toFixed(2) : "—"}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate">
                            {s.exitPrice !== null ? s.exitPrice.toFixed(2) : "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`rounded-full px-2.5 py-1 font-mono text-[10.5px] ${outcomeTone(s.outcome)}`}>
                              {s.outcome ?? "—"}
                            </span>
                          </td>
                          <td
                            className={`px-5 py-3.5 text-right font-mono font-medium ${
                              s.returnPct === null ? "text-slate" : s.returnPct >= 0 ? "text-brand-green" : "text-brand-red"
                            }`}
                          >
                            {fmtPct(s.returnPct)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
