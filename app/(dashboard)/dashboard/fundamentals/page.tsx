"use client";

import { FormEvent, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { LoadingState, ErrorState } from "@/components/dashboard/async-state";
import { KeyValueCard } from "@/components/dashboard/kv-block";
import { apiGet, apiPost, ApiError } from "@/lib/api-client";

export default function FundamentalsPage() {
  const [ticker, setTicker] = useState("");
  const [submittedTicker, setSubmittedTicker] = useState<string | null>(null);
  const [fundamentals, setFundamentals] = useState<unknown>(null);
  const [analysis, setAnalysis] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sentimentText, setSentimentText] = useState("");
  const [sentimentTicker, setSentimentTicker] = useState("");
  const [sentimentResult, setSentimentResult] = useState<unknown>(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [sentimentError, setSentimentError] = useState<string | null>(null);

  async function runLookup(t: string) {
    setSubmittedTicker(t);
    setLoading(true);
    setError(null);
    setFundamentals(null);
    setAnalysis(null);
    try {
      const [fundRes, analysisRes] = await Promise.allSettled([
        apiGet(`/api/sentinel/fundamentals/${encodeURIComponent(t)}`),
        apiGet(`/api/corporate/analyze/${encodeURIComponent(t)}`),
      ]);
      if (fundRes.status === "fulfilled") setFundamentals(fundRes.value);
      if (analysisRes.status === "fulfilled") setAnalysis(analysisRes.value);
      if (fundRes.status === "rejected" && analysisRes.status === "rejected") {
        const err = fundRes.reason;
        setError(err instanceof ApiError ? err.message : `We couldn't find anything for ${t}.`);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleLookup(e: FormEvent) {
    e.preventDefault();
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    runLookup(t);
  }

  async function handleSentiment(e: FormEvent) {
    e.preventDefault();
    if (!sentimentTicker.trim() || !sentimentText.trim()) return;
    setSentimentLoading(true);
    setSentimentError(null);
    setSentimentResult(null);
    try {
      const result = await apiPost("/api/corporate/sentiment", {
        ticker: sentimentTicker.trim().toUpperCase(),
        text_payload: sentimentText.trim(),
      });
      setSentimentResult(result);
    } catch (err) {
      setSentimentError(err instanceof ApiError ? err.message : "Couldn't score that text right now.");
    } finally {
      setSentimentLoading(false);
    }
  }

  return (
    <>
      <Topbar
        title="Fundamentals"
        subtitle="Look up a company's real financials and a quick DCF-style valuation read."
        showTimeframe={false}
      />
      <main className="flex-1 space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-7 lg:px-8">
        <form onSubmit={handleLookup} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 flex-1 sm:min-w-[220px]">
            <label htmlFor="ticker" className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-slate">
              Ticker
            </label>
            <input
              id="ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="e.g. HUBC"
              className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-2.5 text-[16px] uppercase text-ink placeholder:normal-case placeholder:text-slate focus:border-gold focus:bg-panel focus:outline-none sm:text-[14px]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full shrink-0 rounded-full bg-navy px-6 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-navy-soft disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Looking up…" : "Look up"}
          </button>
        </form>

        {submittedTicker && (
          <>
            {loading ? (
              <LoadingState label={`Pulling ${submittedTicker}'s fundamentals…`} />
            ) : error ? (
              <ErrorState message={error} onRetry={() => submittedTicker && runLookup(submittedTicker)} />
            ) : (
              <div className="grid gap-5 sm:gap-6 xl:grid-cols-2">
                <KeyValueCard
                  title={`${submittedTicker} · Fundamentals`}
                  data={fundamentals}
                  note={fundamentals === null ? `No fundamentals on file for ${submittedTicker} yet.` : undefined}
                />
                <KeyValueCard
                  title={`${submittedTicker} · Corporate Analysis`}
                  data={analysis}
                  note={
                    analysis === null
                      ? "No analysis available."
                      : "DCF-style read using default WACC 12% / high growth 15% / terminal growth 4%."
                  }
                />
              </div>
            )}
          </>
        )}

        <div className="rounded-2xl border border-line bg-card shadow-sm p-5 sm:p-6">
          <h2 className="mb-1 text-[15px] font-semibold text-ink sm:text-[15.5px]">Sentiment scratchpad</h2>
          <p className="mb-4 text-[12.5px] text-slate">
            Paste a headline, filing excerpt, or analyst note to get a quick sentiment read against a ticker.
          </p>
          <form onSubmit={handleSentiment} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
              <input
                value={sentimentTicker}
                onChange={(e) => setSentimentTicker(e.target.value)}
                placeholder="Ticker"
                className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-2.5 text-[16px] uppercase text-ink placeholder:normal-case placeholder:text-slate focus:border-gold focus:bg-panel focus:outline-none sm:text-[14px]"
              />
              <input
                value={sentimentText}
                onChange={(e) => setSentimentText(e.target.value)}
                placeholder="Paste text to score…"
                className="w-full min-w-0 rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-2.5 text-[16px] text-ink placeholder:text-slate focus:border-gold focus:bg-panel focus:outline-none sm:text-[14px]"
              />
            </div>
            <button
              type="submit"
              disabled={sentimentLoading}
              className="w-full rounded-full border border-line px-5 py-2 text-[13px] font-semibold text-ink transition-colors hover:border-navy disabled:opacity-50 sm:w-auto"
            >
              {sentimentLoading ? "Scoring…" : "Score sentiment"}
            </button>
          </form>

          {sentimentError && (
            <div className="mt-4 break-words rounded-xl border border-brand-red/30 bg-tint-red px-4 py-3 text-[13px] text-brand-red">
              {sentimentError}
            </div>
          )}
          {sentimentResult !== null && (
            <div className="mt-4">
              <KeyValueCard title="Result" data={sentimentResult} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
