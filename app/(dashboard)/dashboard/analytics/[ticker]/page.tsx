"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { LoadingState, ErrorState, EmptyState } from "@/components/dashboard/async-state";
import { KeyValueCard } from "@/components/dashboard/kv-block";
import PriceChart, { toChartTime, type DataWindowPos, type OhlcPoint, type VolumePoint } from "@/components/charts/price-chart";
import { apiGet, ApiError } from "@/lib/api-client";
import { extractArray, normalizeMarketDataPoint } from "@/lib/normalize";
import { StockPricePoint } from "@/lib/types";
import { useTimeframe } from "@/context/timeframe-context";

export default function TickerDetailPage({ params }: { params: { ticker: string } }) {
  const ticker = decodeURIComponent(params.ticker).toUpperCase();
  const { timeframe } = useTimeframe();

  const [points, setPoints] = useState<StockPricePoint[] | null>(null);
  /** Anything in the response besides the OHLCV series — response shape wasn't confirmed, so extra fields (company name, exchange, last-updated, ...) still get shown rather than silently dropped. */
  const [extra, setExtra] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Lives here (not inside PriceChart) so the draggable legend keeps its
  // position across re-renders within this page mount — see the
  // DataWindow comment in price-chart.tsx for why.
  const [dataWindowPos, setDataWindowPos] = useState<DataWindowPos>({ x: 12, y: 12 });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await apiGet(`/api/sentinel/market-data/${encodeURIComponent(ticker)}?timeframe=${timeframe}`);
      const rows = extractArray(raw, ["bars", "candles", "prices", "history"]);
      const normalized = rows.map(normalizeMarketDataPoint).filter((p): p is StockPricePoint => p !== null);
      setPoints(normalized);

      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        const { bars, candles, prices, history, results, items, data, ...rest } = raw as Record<string, unknown>;
        setExtra(Object.keys(rest).length > 0 ? rest : null);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `We couldn't load price history for ${ticker}.`);
    } finally {
      setLoading(false);
    }
  }, [ticker, timeframe]);

  useEffect(() => {
    load();
  }, [load]);

  // Memoized: PriceChart rebuilds its whole chart whenever these arrays
  // change identity, so recomputing them on every render (e.g. while
  // dragging the legend, which updates state on this same page) would
  // tear down and rebuild the chart on every mouse-move.
  const ohlcData: OhlcPoint[] = useMemo(
    () => (points ?? []).map((p) => ({ time: toChartTime(p.date), open: p.open, high: p.high, low: p.low, close: p.close })),
    [points]
  );
  const volumeData: VolumePoint[] | null = useMemo(() => {
    if (!points || !points.some((p) => p.volume !== null)) return null;
    return points.map((p) => ({ time: toChartTime(p.date), value: p.volume ?? 0 }));
  }, [points]);

  return (
    <>
      <Topbar
        title={ticker}
        subtitle="Price history, from the live market-data feed."
      />
      <main className="flex-1 space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-7 lg:px-8">
        <Link
          href="/dashboard/analytics"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate hover:text-ink"
        >
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
            <path d="M8.5 3L4.5 7l4 4" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to screener
        </Link>

        {loading && !points ? (
          <LoadingState label={`Pulling ${ticker}'s price history…`} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !points || points.length === 0 ? (
          <EmptyState
            title="No price history yet"
            description={`The market-data feed hasn't synced price history for ${ticker} yet — check back once it has.`}
          />
        ) : (
          <>
            <PriceChart
              symbol={ticker}
              ohlcData={ohlcData}
              volumeData={volumeData}
              height={420}
              dataWindowPos={dataWindowPos}
              onDataWindowPosChange={setDataWindowPos}
            />
            {extra && <KeyValueCard title="Additional data" data={extra} />}
          </>
        )}
      </main>
    </>
  );
}
