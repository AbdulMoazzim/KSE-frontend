"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/dashboard/topbar";

export default function FinancialsLandingPage() {
  const router = useRouter();
  const [ticker, setTicker] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    router.push(`/dashboard/financials/${encodeURIComponent(t)}`);
  }

  return (
    <>
      <Topbar
        title="Financials"
        subtitle="Normalized statements built from Document Intelligence extractions and fundamentals data."
        showTimeframe={false}
      />
      <main className="flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 sm:min-w-[220px]">
            <label htmlFor="ticker" className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-slate">
              Ticker
            </label>
            <input
              id="ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="e.g. LUCK"
              className="w-full rounded-md border-[1.5px] border-transparent px-3.5 py-2.5 text-[16px] uppercase text-ink placeholder:normal-case placeholder:text-slate focus:border-gold bg-panel focus:outline-none sm:text-[14px]"
            />
          </div>
          <button
            type="submit"
            className="w-full shrink-0 rounded-md bg-navy px-6 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-navy-soft sm:w-auto"
          >
            View financials
          </button>
        </form>
      </main>
    </>
  );
}
