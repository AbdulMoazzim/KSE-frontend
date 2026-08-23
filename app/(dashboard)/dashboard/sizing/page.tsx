"use client";

import { useCallback, useEffect, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { LoadingState, ErrorState, EmptyState } from "@/components/dashboard/async-state";
import { KeyValueCard } from "@/components/dashboard/kv-block";
import { apiGet, apiPost, ApiError } from "@/lib/api-client";
import { extractArray, normalizeSizingTier } from "@/lib/normalize";
import { SizingTier } from "@/lib/types";
import { useTimeframe } from "@/context/timeframe-context";

export default function SizingTiersPage() {
  const { timeframe } = useTimeframe();
  const [tiers, setTiers] = useState<SizingTier[] | null>(null);
  const [status, setStatus] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selecting, setSelecting] = useState<string | null>(null);
  const [confirmOverride, setConfirmOverride] = useState(false);
  const [selectError, setSelectError] = useState<string | null>(null);
  const [selectSubmitting, setSelectSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tiersRes, statusRes] = await Promise.all([
        apiGet("/api/sentinel/sizing-tiers", {"X-Tenant-ID": "1"}),
        apiGet(`/api/sentinel/ops/sizing-tier-status?timeframe=${timeframe}`,{"X-Tenant-ID": "1"}),
      ]);
      setTiers(extractArray(tiersRes, ["tiers"]).map(normalizeSizingTier));
      setStatus(statusRes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load sizing tiers right now.");
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSelect(tierId: string, needsOverride: boolean) {
    if (needsOverride && !confirmOverride) return;
    setSelectSubmitting(true);
    setSelectError(null);
    try {
      await apiPost("/api/sentinel/sizing-tiers/select", {
        tier_id: tierId,
        override_confirmed: confirmOverride,
      });
      setSelecting(null);
      setConfirmOverride(false);
      load();
    } catch (err) {
      setSelectError(err instanceof ApiError ? err.message : "That selection didn't go through.");
    } finally {
      setSelectSubmitting(false);
    }
  }

  return (
    <>
      <Topbar
        title="Position Sizing"
        subtitle="Every tier here is real and validated — nothing shown is aspirational. Selection is enforced server-side, not just a UI warning."
      />
      <main className="flex-1 space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-7 lg:px-8">
        {loading && !tiers ? (
          <LoadingState label="Loading sizing tiers…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            {status !== null && <KeyValueCard title="Current tier status for this tenant" data={status} />}

            {selectError && (
              <div className="rounded-xl border border-brand-red/30 bg-tint-red px-4 py-3 text-[13px] text-brand-red">
                {selectError}
              </div>
            )}

            {!tiers || tiers.length === 0 ? (
              <EmptyState title="No tiers returned" description="Check back once sizing tiers are configured." />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {tiers.map((tier) => (
                  <div key={tier.id} className="flex flex-col rounded-2xl border border-line bg-card shadow-sm p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-[15px] font-semibold text-ink">{tier.name}</h3>
                      {tier.gated && (
                        <span className="rounded-full bg-tint-gold px-2.5 py-1 font-mono text-[10px] text-gold">
                          GATED
                        </span>
                      )}
                    </div>
                    {tier.riskPerTradePct !== null && (
                      <p className="mb-2 font-mono text-[20px] font-medium text-ink">
                        {tier.riskPerTradePct.toFixed(2)}%<span className="ml-1 text-[11px] font-normal text-slate">risk / trade</span>
                      </p>
                    )}
                    {tier.description && <p className="mb-4 flex-1 text-[13px] leading-relaxed text-slate">{tier.description}</p>}
                    <p className="mb-4 text-[11.5px] text-slate">
                      {tier.validated === true ? "✓ Real, validated backing" : tier.validated === false ? "Not yet validated" : ""}
                    </p>

                    {selecting === tier.id ? (
                      <div className="space-y-2.5 rounded-xl border border-line bg-tint/40 p-3">
                        {tier.gated && (
                          <label className="flex items-start gap-2 text-[12px] text-slate">
                            <input
                              type="checkbox"
                              checked={confirmOverride}
                              onChange={(e) => setConfirmOverride(e.target.checked)}
                              className="mt-0.5"
                            />
                            This tier is gated — I understand and want to override.
                          </label>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSelect(tier.id, Boolean(tier.gated))}
                            disabled={selectSubmitting || (Boolean(tier.gated) && !confirmOverride)}
                            className="flex-1 rounded-full bg-navy py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
                          >
                            {selectSubmitting ? "Setting…" : "Confirm"}
                          </button>
                          <button
                            onClick={() => {
                              setSelecting(null);
                              setConfirmOverride(false);
                            }}
                            className="rounded-full border border-line px-3 py-2 text-[12.5px] text-slate hover:text-ink"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelecting(tier.id)}
                        className="rounded-full border border-line py-2 text-[12.5px] font-semibold text-ink transition-colors hover:border-navy"
                      >
                        Set as active tier
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
