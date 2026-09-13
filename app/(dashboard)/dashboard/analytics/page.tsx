"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/dashboard/topbar";
import { LoadingState, ErrorState, EmptyState } from "@/components/dashboard/async-state";
import { apiGet, ApiError } from "@/lib/api-client";
import { extractArray, normalizeScreenerRow } from "@/lib/normalize";
import { ScreenerRow } from "@/lib/types";
import { useTimeframe } from "@/context/timeframe-context";

function zscoreTone(z: number | null) {
  if (z === null) return "text-slate";
  if (z >= 1.5 || z <= -1.5) return "text-brand-red";
  if (z >= 0.75 || z <= -0.75) return "text-gold";
  return "text-slate";
}

function signedTone(v: number | null) {
  if (v === null) return "text-slate";
  return v >= 0 ? "text-brand-green" : "text-brand-red";
}

function formatSigned(v: number | null, digits = 2) {
  if (v === null) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

function formatSector(sector: string | null) {
  if (!sector) return "—";
  return sector.replace(/_/g, " ");
}

function formatNotional(pkr: number | null) {
  if (pkr === null) return "—";
  if (pkr >= 1_000_000_000) return `₨${(pkr / 1_000_000_000).toFixed(2)}B`;
  if (pkr >= 1_000_000) return `₨${(pkr / 1_000_000).toFixed(1)}M`;
  return `₨${pkr.toLocaleString()}`;
}

export default function AnalyticsPage() {
  const { timeframe } = useTimeframe();
  const [rows, setRows] = useState<ScreenerRow[] | null>(null);
  const [asOfDate, setAsOfDate] = useState<string | null>(null);
  const [poolSize, setPoolSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await apiGet<{ as_of_date?: string; pool_size?: number }>(
        `/api/sentinel/analytics/screener?timeframe=${timeframe}`,
        { "X-Tenant-ID": "1" }
      );
      setAsOfDate(raw?.as_of_date ?? null);
      setPoolSize(typeof raw?.pool_size === "number" ? raw.pool_size : null);
      setRows(extractArray(raw, ["results", "screener"]).map(normalizeScreenerRow));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load the screener right now.");
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    load();
  }, [load]);

  const sectors = rows
    ? Array.from(new Set(rows.map((r) => r.sector).filter((s): s is string => s !== null))).sort()
    : [];
  const visibleRows = rows && activeSector ? rows.filter((r) => r.sector === activeSector) : rows;

  return (
    <>
      <Topbar
        title="Analytics · Screener"
        subtitle={
          rows
            ? `${rows.length} of ${poolSize ?? rows.length} loaded${asOfDate ? ` · as of ${asOfDate}` : ""}`
            : "One pass over the whole watchlist: how stretched, how liquid, and how it's doing versus its sector."
        }
      />
      <main className="flex-1 space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-7 lg:px-8">
        <div className="rounded-lg border border-line bg-tint/40 p-4 text-[13px] leading-relaxed text-slate">
          <strong className="text-ink">How to read this:</strong> a mean-reversion z-score near zero means a
          ticker is trading close to its own recent average — the further from zero (either direction), the more
          stretched it is. Liquidity percentile is against the ticker's <em>own</em> trailing year, not the whole
          market. Relative strength compares a ticker's return to its real sector peers, not the KSE-100 index
          (that comparison isn't available yet).
        </div>

        {rows && rows.length > 0 && sectors.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveSector(null)}
              className={`rounded-full border px-2.5 py-1 text-[12px] transition-colors ${
                activeSector === null
                  ? "border-navy bg-navy text-white"
                  : "border-line text-slate hover:border-navy hover:text-ink"
              }`}
            >
              All
            </button>
            {sectors.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSector((cur) => (cur === s ? null : s))}
                className={`rounded-full border px-2.5 py-1 text-[12px] transition-colors ${
                  activeSector === s
                    ? "border-navy bg-navy text-white"
                    : "border-line text-slate hover:border-navy hover:text-ink"
                }`}
              >
                {formatSector(s)}
              </button>
            ))}
          </div>
        )}

        {loading && !rows ? (
          <LoadingState label="Scanning the watchlist…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !rows || rows.length === 0 ? (
          <EmptyState
            title="Nothing to screen yet"
            description="The screener covers the live trading universe — check back once tickers have price history synced."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wide text-slate">
                    <th className="px-4 py-2.5 font-medium">Ticker</th>
                    <th className="px-4 py-2.5 font-medium">Sector</th>
                    <th className="px-4 py-2.5 font-medium">Close (PKR)</th>
                    <th className="px-4 py-2.5 font-medium">Mean-reversion Z</th>
                    <th className="px-4 py-2.5 font-medium">Dist. from mean</th>
                    <th className="px-4 py-2.5 font-medium">Liquidity</th>
                    <th className="px-4 py-2.5 font-medium">Relative strength</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows?.map((r) => (
                    <tr key={r.ticker} className="border-b border-line last:border-0 hover:bg-tint/60">
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/dashboard/analytics/${encodeURIComponent(r.ticker)}`}
                          className="font-mono font-medium text-ink underline decoration-line decoration-1 underline-offset-4 hover:text-navy hover:decoration-navy"
                        >
                          {r.ticker}
                        </Link>
                        {r.error && <div className="mt-0.5 text-[11px] text-brand-red">{r.error}</div>}
                      </td>
                      <td className="px-4 py-2.5 text-slate">{formatSector(r.sector)}</td>
                      <td className="px-4 py-2.5 font-mono text-ink">
                        {r.close !== null ? r.close.toFixed(2) : "—"}
                      </td>
                      <td className={`px-4 py-2.5 font-mono ${zscoreTone(r.meanReversionZScore)}`}>
                        {r.meanReversionZScore !== null ? r.meanReversionZScore.toFixed(2) : "—"}
                      </td>
                      <td className={`px-4 py-2.5 font-mono ${signedTone(r.distFromMeanPct)}`}>
                        {formatSigned(r.distFromMeanPct)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-mono text-ink">
                          {r.liquidityPercentile !== null ? `${r.liquidityPercentile.toFixed(0)}th pctl` : "—"}
                        </div>
                        <div className="mt-0.5 font-mono text-[11.5px] text-slate">
                          {formatNotional(r.advNotionalPkr)}/day
                        </div>
                      </td>
                      <td className={`px-4 py-2.5 font-mono ${signedTone(r.relativeStrengthPct)}`}>
                        {formatSigned(r.relativeStrengthPct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
