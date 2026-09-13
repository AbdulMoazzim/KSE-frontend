"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { LoadingState, ErrorState, EmptyState } from "@/components/dashboard/async-state";
import { KeyValueBlock } from "@/components/dashboard/kv-block";
import { StatusCard } from "@/components/dashboard/ops/status-card";
import { ForwardPaperProgressCard } from "@/components/dashboard/ops/forward-paper-progress-card";
import { StrategyBreakdownCard } from "@/components/dashboard/ops/strategy-breakdown-card";
import { LotSizeVerificationCard } from "@/components/dashboard/ops/lot-size-verification-card";
import { apiGet, apiPost, ApiError } from "@/lib/api-client";
import { extractArray, normalizeForwardPaperProgress, normalizeLotSizeStatus, normalizeStrategyBreakdown } from "@/lib/normalize";
import { useTimeframe } from "@/context/timeframe-context";

interface HealthData {
  heartbeat: unknown;
  scanHealth: unknown;
  forwardPaperProgress: unknown;
  strategyBreakdown: unknown;
  lotSizeStatus: unknown;
}

export default function OpsHealthPage() {
  const { timeframe } = useTimeframe();
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [incidents, setIncidents] = useState<unknown[] | null>(null);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [incidentsError, setIncidentsError] = useState<string | null>(null);

  const [noteText, setNoteText] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [heartbeat, scanHealth, forwardPaperProgress, strategyBreakdown, lotSizeStatus] = await Promise.all([
        apiGet(`/api/sentinel/ops/heartbeat?timeframe=${timeframe}`,{"X-tenant-ID": "1"}),
        apiGet("/api/sentinel/ops/scan-health"),
        apiGet(`/api/sentinel/ops/forward-paper-progress?timeframe=${timeframe}`, {"X-tenant-ID": "1"}),
        apiGet(`/api/sentinel/ops/strategy-breakdown?timeframe=${timeframe}`, {"X-tenant-ID": "1"}),
        apiGet("/api/sentinel/ops/lot-size-status"),
      ]);
      setData({ heartbeat, scanHealth, forwardPaperProgress, strategyBreakdown, lotSizeStatus });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load system health right now.");
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  const loadIncidents = useCallback(async () => {
    setIncidentsLoading(true);
    setIncidentsError(null);
    try {
      const raw = await apiGet("/api/sentinel/ops/incidents",{"X-tenant-ID": "1"});
      setIncidents(extractArray(raw, ["incidents"]));
    } catch (err) {
      setIncidentsError(err instanceof ApiError ? err.message : "We couldn't load the incident log.");
    } finally {
      setIncidentsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  async function handleNoteSubmit(e: FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNoteSubmitting(true);
    setNoteError(null);
    try {
      await apiPost("/api/sentinel/ops/incidents", {
        note_date: new Date().toISOString().slice(0, 10),
        note_text: noteText.trim(),
        author: noteAuthor.trim() || null,
      });
      setNoteText("");
      loadIncidents();
    } catch (err) {
      setNoteError(err instanceof ApiError ? err.message : "That note didn't save. Please try again.");
    } finally {
      setNoteSubmitting(false);
    }
  }

  const scanHealthUnavailable =
    typeof data?.scanHealth === "object" &&
    data?.scanHealth !== null &&
    "status" in data.scanHealth &&
    (data.scanHealth as { status: unknown }).status === "no_log_found";
  const heartbeatUnavailable =
    typeof data?.heartbeat === "object" &&
    data?.heartbeat !== null &&
    "status" in data.heartbeat &&
    (data.heartbeat as { status: unknown }).status === "NO_DATA";

  return (
    <>
      <Topbar
        title="Ops · System Health"
        subtitle="Internal monitoring — did today's run actually happen, and is anything stale."
      />
      <main className="flex-1 space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-7 lg:px-8">
        {loading && !data ? (
          <LoadingState label="Checking system health…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          data && (
            <>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <ForwardPaperProgressCard data={normalizeForwardPaperProgress(data.forwardPaperProgress)} />
                <StrategyBreakdownCard rows={normalizeStrategyBreakdown(data.strategyBreakdown)} />
              </div>

              {(!scanHealthUnavailable || !heartbeatUnavailable) && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {!scanHealthUnavailable && (
                    <StatusCard
                      title="Scan health"
                      note="Confirms the daily forward-paper scan actually ran, independent of whether it traded."
                      data={data.scanHealth}
                    />
                  )}
                  {!heartbeatUnavailable && (
                    <StatusCard title="Heartbeat" note="Is today's scan run current, or stale?" data={data.heartbeat} />
                  )}
                </div>
              )}

              <LotSizeVerificationCard data={normalizeLotSizeStatus(data.lotSizeStatus)} />
            </>
          )
        )}

        <div className="rounded-lg border border-line bg-card shadow-sm p-6">
          <h2 className="mb-1 text-[15.5px] font-semibold text-ink">Incident log</h2>
          <p className="mb-4 text-[12.5px] text-slate">
            A running, timestamped notebook for anything worth flagging — not tied to a single ticker or trade.
          </p>

          <form onSubmit={handleNoteSubmit} className="mb-5 space-y-2.5">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={2}
              placeholder="What happened?"
              className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-slate focus:border-gold focus:bg-panel focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                value={noteAuthor}
                onChange={(e) => setNoteAuthor(e.target.value)}
                placeholder="Your name (optional)"
                className="rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-2 text-[13px] text-ink placeholder:text-slate focus:border-gold focus:bg-panel focus:outline-none"
              />
              <button
                type="submit"
                disabled={noteSubmitting || !noteText.trim()}
                className="rounded-full bg-navy px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-navy-soft disabled:opacity-50"
              >
                {noteSubmitting ? "Saving…" : "Log incident"}
              </button>
            </div>
            {noteError && <p className="text-[12.5px] text-brand-red">{noteError}</p>}
          </form>

          {incidentsLoading ? (
            <LoadingState label="Loading incident log…" />
          ) : incidentsError ? (
            <ErrorState message={incidentsError} onRetry={loadIncidents} />
          ) : !incidents || incidents.length === 0 ? (
            <EmptyState title="No incidents logged" description="Anything logged above will show up here." />
          ) : (
            <div className="space-y-3">
              {incidents.map((incident, i) => (
                <div key={i} className="rounded-xl border border-line bg-tint/40 p-4">
                  <KeyValueBlock data={incident} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
