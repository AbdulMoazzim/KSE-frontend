"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { LoadingState, ErrorState, EmptyState } from "@/components/dashboard/async-state";
import { KeyValueCard } from "@/components/dashboard/kv-block";
import { OtherDataView } from "@/components/dashboard/financials/other-data-view";
import { apiGet, ApiError } from "@/lib/api-client";
import { normalizeCorporateAnalysis, normalizeFundamentalsFiling } from "@/lib/normalize";

const TABS = [
  { key: "income", label: "Income Statement" },
  { key: "balance", label: "Balance Sheet" },
  { key: "cashflow", label: "Cash Flow" },
  { key: "other", label: "Other data" },
] as const;
type TabKey = (typeof TABS)[number]["key"];
type StatementBuckets = Record<"income" | "balance" | "cashflow", Record<string, unknown>>;

/**
 * There's no dedicated "normalized financials" endpoint or confirmed
 * field-name schema for the three core statements, so this groups
 * whatever /sentinel/fundamentals actually returns by statement type —
 * using real nested groups if the backend already provides them
 * (income_statement, balance_sheet, cash_flow), and falling back to
 * keyword-matching flat field names otherwise. Best-effort presentation
 * grouping, not a guarantee every field lands in the "right" tab.
 * "Other data" is handled separately by OtherDataView — its shape (filing
 * metadata + corporate analysis) is confirmed, so it gets a hand-built view.
 */
function extractStatementBuckets(raw: unknown): StatementBuckets {
  const empty: StatementBuckets = { income: {}, balance: {}, cashflow: {} };
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return empty;
  const record = raw as Record<string, unknown>;

  const pickNested = (keys: string[]): Record<string, unknown> | null => {
    for (const k of keys) {
      const v = record[k];
      if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
    }
    return null;
  };
  const incomeNested = pickNested(["income_statement", "incomeStatement", "income"]);
  const balanceNested = pickNested(["balance_sheet", "balanceSheet", "balance"]);
  const cashflowNested = pickNested(["cash_flow", "cashFlow", "cashflow"]);
  if (incomeNested || balanceNested || cashflowNested) {
    return { income: incomeNested ?? {}, balance: balanceNested ?? {}, cashflow: cashflowNested ?? {} };
  }

  const buckets: StatementBuckets = { income: {}, balance: {}, cashflow: {} };
  for (const [key, value] of Object.entries(record)) {
    if (/(cash.?flow|operating.?activit|investing.?activit|financing.?activit|capex)/i.test(key)) buckets.cashflow[key] = value;
    else if (/(asset|liabilit|equity|capital|reserve|debt|payable|receivable|inventory|borrowing)/i.test(key)) buckets.balance[key] = value;
    else if (/(revenue|sales|income|profit|earning|eps|ebitda|expense|margin|tax)/i.test(key)) buckets.income[key] = value;
  }
  return buckets;
}

function isEmptyBucket(v: Record<string, unknown>) {
  return Object.keys(v).length === 0;
}

export default function FinancialsTickerPage({ params }: { params: { ticker: string } }) {
  const ticker = decodeURIComponent(params.ticker).toUpperCase();
  const [tab, setTab] = useState<TabKey>("other");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fund, setFund] = useState<unknown>(null);
  const [analysis, setAnalysis] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fundRes, analysisRes] = await Promise.allSettled([
        apiGet(`/api/sentinel/fundamentals/${encodeURIComponent(ticker)}`),
        apiGet(`/api/corporate/analyze/${encodeURIComponent(ticker)}`),
      ]);
      const fundValue = fundRes.status === "fulfilled" ? fundRes.value : null;
      const analysisValue = analysisRes.status === "fulfilled" ? analysisRes.value : null;

      if (fundValue === null && analysisValue === null) {
        const err = fundRes.status === "rejected" ? fundRes.reason : null;
        setError(err instanceof ApiError ? err.message : `We couldn't find financials for ${ticker}.`);
        setFund(null);
        setAnalysis(null);
        return;
      }
      setFund(fundValue);
      setAnalysis(analysisValue);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    load();
  }, [load]);

  const buckets = extractStatementBuckets(fund);
  const filing = normalizeFundamentalsFiling(fund);
  const corporateAnalysis = analysis !== null ? normalizeCorporateAnalysis(analysis) : null;

  return (
    <>
      <Topbar
        title={`Financials · ${ticker}`}
        subtitle="Statements grouped best-effort; Other Data pulls from /sentinel/fundamentals and /corporate/analyze."
        showTimeframe={false}
      />
      <main className="flex-1 space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-7 lg:px-8">
        <Link
          href="/dashboard/financials"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate hover:text-ink"
        >
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
            <path d="M8.5 3L4.5 7l4 4" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Look up another ticker
        </Link>

        {loading ? (
          <LoadingState label={`Pulling ${ticker}'s financials…`} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            <div className="flex gap-1 overflow-x-auto border-b border-line">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`shrink-0 border-b-2 px-4 py-2.5 text-[12.5px] font-semibold transition-colors ${
                    tab === t.key ? "border-gold text-navy" : "border-transparent text-slate hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "other" ? (
              <OtherDataView filing={filing} analysis={corporateAnalysis} />
            ) : isEmptyBucket(buckets[tab]) ? (
              <EmptyState
                title="Nothing grouped into this tab"
                description="This is a best-effort grouping of whatever fundamentals data came back — check the other tabs, or Fundamentals for the full raw response."
              />
            ) : (
              <KeyValueCard title={TABS.find((t) => t.key === tab)!.label} data={buckets[tab]} />
            )}
          </>
        )}
      </main>
    </>
  );
}
