"use client";

import { useCallback, useEffect, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { LoadingState, ErrorState, EmptyState } from "@/components/dashboard/async-state";
import { apiGet, ApiError } from "@/lib/api-client";
import {
  extractArray,
  normalizeClosedTrade,
  normalizeOpenPosition,
  normalizeTradeLogSummary,
} from "@/lib/normalize";
import { ClosedTrade, OpenPosition, TradeLogSummary } from "@/lib/types";
import { useTimeframe } from "@/context/timeframe-context";

type Tab = "open" | "closed";

function fmtPct(value: number | null) {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default function TradeLogPage() {
  const { timeframe } = useTimeframe();
  const [tab, setTab] = useState<Tab>("open");
  const [openPositions, setOpenPositions] = useState<OpenPosition[] | null>(null);
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[] | null>(null);
  const [summary, setSummary] = useState<TradeLogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [openRes, closedRes, summaryRes] = await Promise.all([
        apiGet(`/api/trade-log/open?timeframe=${timeframe}`,{"X-Tenant-ID": "1"}),
        apiGet(`/api/trade-log/closed?timeframe=${timeframe}`,{"X-Tenant-ID": "1"}),
        apiGet(`/api/trade-log/summary?timeframe=${timeframe}`,{"X-Tenant-ID": "1"}),
      ]);
      setOpenPositions(extractArray(openRes, ["positions", "open"]).map(normalizeOpenPosition));
      setClosedTrades(extractArray(closedRes, ["trades", "closed"]).map(normalizeClosedTrade));
      setSummary(normalizeTradeLogSummary(summaryRes));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load the trade log right now.");
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
        title="Trade Log"
        subtitle="Every position the engine has opened — what's still running, and what's already closed."
      />
      <main className="flex-1 space-y-6 px-8 py-7">
        {loading && !openPositions && !closedTrades ? (
          <LoadingState label="Loading the trade log…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-4">
              <StatCard label="Open positions" value={openPositions ? String(openPositions.length) : "—"} />
              <StatCard
                label="Closed trades"
                value={closedTrades ? String(closedTrades.length) : "—"}
                sub="Filterable & paginated in a future pass"
              />
              <StatCard
                label="Realized (sum)"
                value={fmtPct(summary?.realizedTotalPct ?? null)}
                tone={summary?.realizedTotalPct !== null && summary?.realizedTotalPct !== undefined && summary.realizedTotalPct >= 0 ? "green" : "red"}
              />
              <StatCard
                label="Win count"
                value={
                  summary?.winCount !== null && summary?.winCount !== undefined && closedTrades
                    ? `${summary.winCount} / ${closedTrades.length}`
                    : "—"
                }
              />
            </div>

            <div className="inline-flex rounded-full border border-line bg-panel p-1">
              <button
                onClick={() => setTab("open")}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  tab === "open" ? "bg-navy text-white" : "text-slate hover:text-ink"
                }`}
              >
                Open positions
              </button>
              <button
                onClick={() => setTab("closed")}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  tab === "closed" ? "bg-navy text-white" : "text-slate hover:text-ink"
                }`}
              >
                Closed trades
              </button>
            </div>

            {tab === "open" ? (
              !openPositions || openPositions.length === 0 ? (
                <EmptyState
                  title="No open positions right now"
                  description="When a live signal turns into a trade, it will show up here with a live mark-to-market price."
                />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13.5px]">
                      <thead>
                        <tr className="border-b border-line text-[11px] uppercase tracking-wide text-slate">
                          <th className="px-5 py-3.5 font-medium">Ticker</th>
                          <th className="px-5 py-3.5 font-medium">Timeframe</th>
                          <th className="px-5 py-3.5 font-medium">Direction</th>
                          <th className="px-5 py-3.5 font-medium">Entry</th>
                          <th className="px-5 py-3.5 font-medium">Mark</th>
                          <th className="px-5 py-3.5 font-medium">Qty</th>
                          <th className="px-5 py-3.5 font-medium">Opened</th>
                          <th className="px-5 py-3.5 text-right font-medium">Unrealized</th>
                        </tr>
                      </thead>
                      <tbody>
                        {openPositions.map((p) => (
                          <tr key={p.id} className="border-b border-line last:border-0 hover:bg-tint/60">
                            <td className="px-5 py-3.5 font-mono font-medium text-ink">{p.ticker}</td>
                            <td className="px-5 py-3.5 text-slate">{p.timeframe ?? "—"}</td>
                            <td
                              className={`px-5 py-3.5 ${
                                p.direction === "LONG"
                                  ? "text-brand-green"
                                  : p.direction === "SHORT"
                                  ? "text-brand-red"
                                  : "text-slate"
                              }`}
                            >
                              {p.direction ?? "—"}
                            </td>
                            <td className="px-5 py-3.5 font-mono text-slate">{p.entryPrice?.toFixed(2) ?? "—"}</td>
                            <td className="px-5 py-3.5 font-mono text-slate">{p.markPrice?.toFixed(2) ?? "—"}</td>
                            <td className="px-5 py-3.5 font-mono text-slate">{p.qty ?? "—"}</td>
                            <td className="px-5 py-3.5 font-mono text-slate">{p.openedAt ?? "—"}</td>
                            <td
                              className={`px-5 py-3.5 text-right font-mono font-medium ${
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
                </div>
              )
            ) : !closedTrades || closedTrades.length === 0 ? (
              <EmptyState
                title="No closed trades yet"
                description="Once a position is exited, it moves here with its full entry-to-exit record."
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13.5px]">
                    <thead>
                      <tr className="border-b border-line text-[11px] uppercase tracking-wide text-slate">
                        <th className="px-5 py-3.5 font-medium">Ticker</th>
                        <th className="px-5 py-3.5 font-medium">Timeframe</th>
                        <th className="px-5 py-3.5 font-medium">Direction</th>
                        <th className="px-5 py-3.5 font-medium">Entry</th>
                        <th className="px-5 py-3.5 font-medium">Exit</th>
                        <th className="px-5 py-3.5 font-medium">Opened</th>
                        <th className="px-5 py-3.5 font-medium">Closed</th>
                        <th className="px-5 py-3.5 text-right font-medium">Realized</th>
                      </tr>
                    </thead>
                    <tbody>
                      {closedTrades.map((t) => (
                        <tr key={t.id} className="border-b border-line last:border-0 hover:bg-tint/60">
                          <td className="px-5 py-3.5 font-mono font-medium text-ink">{t.ticker}</td>
                          <td className="px-5 py-3.5 text-slate">{t.timeframe ?? "—"}</td>
                          <td
                            className={`px-5 py-3.5 ${
                              t.direction === "LONG"
                                ? "text-brand-green"
                                : t.direction === "SHORT"
                                ? "text-brand-red"
                                : "text-slate"
                            }`}
                          >
                            {t.direction ?? "—"}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate">{t.entryPrice?.toFixed(2) ?? "—"}</td>
                          <td className="px-5 py-3.5 font-mono text-slate">{t.exitPrice?.toFixed(2) ?? "—"}</td>
                          <td className="px-5 py-3.5 font-mono text-slate">{t.openedAt ?? "—"}</td>
                          <td className="px-5 py-3.5 font-mono text-slate">{t.closedAt ?? "—"}</td>
                          <td
                            className={`px-5 py-3.5 text-right font-mono font-medium ${
                              t.realizedPct !== null
                                ? t.realizedPct >= 0
                                  ? "text-brand-green"
                                  : "text-brand-red"
                                : "text-slate"
                            }`}
                          >
                            {fmtPct(t.realizedPct)}
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
