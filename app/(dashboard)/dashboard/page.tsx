"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { LoadingState, ErrorState, EmptyState } from "@/components/dashboard/async-state";
import { StepChart } from "@/components/step-chart";
import { apiGet, ApiError } from "@/lib/api-client";
import { extractArray, normalizeOpenPosition, normalizeSignal, normalizeSignalSummary } from "@/lib/normalize";
import { LiveSignal, LiveSignalSummary, OpenPosition } from "@/lib/types";
import { useKillSwitch } from "@/context/kill-switch-context";
import { useTimeframe } from "@/context/timeframe-context";

function outcomeTone(outcome: string | null) {
  if (outcome === "WIN") return "text-brand-green";
  if (outcome === "LOSS") return "text-brand-red";
  if (outcome === "OPEN") return "text-gold";
  return "text-slate";
}

function fmtPct(value: number | null) {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default function DashboardOverviewPage() {
  const { status: killSwitchStatus } = useKillSwitch();
  const { timeframe } = useTimeframe();

  const [signals, setSignals] = useState<LiveSignal[] | null>(null);
  const [summary, setSummary] = useState<LiveSignalSummary | null>(null);
  const [positions, setPositions] = useState<OpenPosition[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [signalsRes, summaryRes, positionsRes] = await Promise.all([
        apiGet(`/api/live-signals?timeframe=${timeframe}`, {"X-Tenant-ID": "1"}),
        apiGet(`/api/live-signals/summary?timeframe=${timeframe}`,{"X-Tenant-ID": "1"}),
        apiGet(`/api/trade-log/open?timeframe=${timeframe}`,{"X-Tenant-ID": "1"}),
      ]);
      setSignals(extractArray(signalsRes, ["signals"]).map(normalizeSignal));
      setSummary(normalizeSignalSummary(summaryRes));
      setPositions(extractArray(positionsRes, ["positions", "open"]).map(normalizeOpenPosition));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We couldn't load your dashboard right now. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    load();
  }, [load]);

  const avgUnrealized =
    positions && positions.length
      ? positions.reduce((sum, p) => sum + (p.unrealizedPct ?? 0), 0) / positions.length
      : null;

  return (
    <>
      <Topbar title="Overview" subtitle="Everything that matters on your desk, in one place." />
      <main className="flex-1 space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-7 lg:px-8">
        {loading && !signals ? (
          <LoadingState label="Loading your desk…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-4">
              <StatCard
                label="Open positions"
                value={positions ? String(positions.length) : "—"}
                sub="Across the 1H + 1D engines"
              />
              <StatCard
                label="Avg. unrealized"
                value={fmtPct(avgUnrealized)}
                tone={avgUnrealized !== null && avgUnrealized >= 0 ? "green" : "red"}
                sub="Mark-to-market, blended across open positions"
              />
              <StatCard
                label="Signals today"
                value={summary?.totalCount !== null && summary?.totalCount !== undefined ? String(summary.totalCount) : "—"}
                sub={
                  summary?.wins !== null && summary?.losses !== null
                    ? `${summary?.wins ?? 0} win · ${summary?.losses ?? 0} loss`
                    : "Waiting on today's activity"
                }
              />
              <StatCard
                label="Kill switch"
                value={killSwitchStatus.active ? "ON" : "OFF"}
                tone={killSwitchStatus.active ? "red" : "green"}
                sub={killSwitchStatus.active ? "New orders are paused tenant-wide" : "Trading active tenant-wide"}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <StepChart />

              <div className="rounded-2xl border border-line bg-card shadow-sm p-6">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-[15.5px] font-semibold text-ink">Recent live signals</h2>
                  <Link href="/dashboard/signals" className="text-[12.5px] font-medium text-gold hover:text-gold-bright">
                    View all →
                  </Link>
                </div>
                <p className="mb-4 text-[12.5px] text-slate">
                  The engine's most recent decisions — what it found, and whether it worked out.
                </p>

                {!signals || signals.length === 0 ? (
                  <EmptyState
                    title="No signals yet today"
                    description="Once the engine finds a setup on the 1H or 1D timeframe, it will show up here automatically."
                  />
                ) : (
                  <div className="space-y-1">
                    {signals.slice(0, 5).map((s) => (
                      <div
                        key={s.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-2.5 py-2.5 text-[13.5px] hover:bg-tint"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-16 font-mono font-medium text-ink">{s.ticker}</span>
                          {s.timeframe && (
                            <span className="rounded-full bg-tint px-2 py-0.5 font-mono text-[10.5px] text-slate">
                              {s.timeframe}
                            </span>
                          )}
                          {s.direction && (
                            <span className={s.direction === "LONG" ? "text-brand-green" : "text-brand-red"}>
                              {s.direction}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-[12.5px] text-slate">
                            conf. {s.confluenceScore !== null ? s.confluenceScore.toFixed(2) : "—"}
                          </span>
                          <span className={`font-mono text-[12.5px] font-medium ${outcomeTone(s.outcome)}`}>
                            {s.outcome ?? "—"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-card shadow-sm p-6">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-[15.5px] font-semibold text-ink">Open positions</h2>
                <Link href="/dashboard/trade-log" className="text-[12.5px] font-medium text-gold hover:text-gold-bright">
                  Full trade log →
                </Link>
              </div>
              <p className="mb-4 text-[12.5px] text-slate">Trades that are currently live and being marked-to-market.</p>

              {!positions || positions.length === 0 ? (
                <EmptyState
                  title="No open positions right now"
                  description="When a signal turns into a trade, it will appear here with a live mark-to-market price."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13.5px]">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wide text-slate">
                        <th className="pb-2.5 font-medium">Ticker</th>
                        <th className="pb-2.5 font-medium">Timeframe</th>
                        <th className="pb-2.5 font-medium">Direction</th>
                        <th className="pb-2.5 font-medium">Entry</th>
                        <th className="pb-2.5 font-medium">Mark</th>
                        <th className="pb-2.5 font-medium">Qty</th>
                        <th className="pb-2.5 text-right font-medium">Unrealized</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((p) => (
                        <tr key={p.id} className="border-t border-line">
                          <td className="py-3 font-mono font-medium text-ink">{p.ticker}</td>
                          <td className="py-3 text-slate">{p.timeframe ?? "—"}</td>
                          <td
                            className={`py-3 ${
                              p.direction === "LONG"
                                ? "text-brand-green"
                                : p.direction === "SHORT"
                                ? "text-brand-red"
                                : "text-slate"
                            }`}
                          >
                            {p.direction ?? "—"}
                          </td>
                          <td className="py-3 font-mono text-slate">{p.entryPrice?.toFixed(2) ?? "—"}</td>
                          <td className="py-3 font-mono text-slate">{p.markPrice?.toFixed(2) ?? "—"}</td>
                          <td className="py-3 font-mono text-slate">{p.qty ?? "—"}</td>
                          <td
                            className={`py-3 text-right font-mono font-medium ${
                              p.unrealizedPct !== null
                                ? p.unrealizedPct >= 0
                                  ? "text-brand-green"
                                  : "text-brand-red"
                                : "text-slate"
                            }`}
                          >
                            {fmtPct(p.unrealizedPct)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
