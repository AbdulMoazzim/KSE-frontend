"use client";

import { useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { closedTrades, openPositions } from "@/lib/mock-data";

type Tab = "open" | "closed";

export default function TradeLogPage() {
  const [tab, setTab] = useState<Tab>("open");

  const realizedTotal = closedTrades.reduce((sum, t) => sum + t.realizedPct, 0);
  const winCount = closedTrades.filter((t) => t.realizedPct > 0).length;

  return (
    <>
      <Topbar title="Trade Log" />
      <main className="flex-1 space-y-6 px-8 py-7">
        <div className="grid gap-5 md:grid-cols-4">
          <StatCard label="Open positions" value={String(openPositions.length)} />
          <StatCard label="Closed trades" value={String(closedTrades.length)} sub="Filterable &amp; paginated in production" />
          <StatCard
            label="Realized (sum)"
            value={`${realizedTotal >= 0 ? "+" : ""}${realizedTotal.toFixed(2)}%`}
            tone={realizedTotal >= 0 ? "green" : "red"}
          />
          <StatCard label="Win count" value={`${winCount} / ${closedTrades.length}`} />
        </div>

        <div className="inline-flex rounded-full border border-line bg-panel p-1">
          <button
            onClick={() => setTab("open")}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
              tab === "open" ? "bg-navy text-white" : "text-slate hover:text-navy"
            }`}
          >
            Open positions
          </button>
          <button
            onClick={() => setTab("closed")}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
              tab === "closed" ? "bg-navy text-white" : "text-slate hover:text-navy"
            }`}
          >
            Closed trades
          </button>
        </div>

        {tab === "open" ? (
          <div className="overflow-hidden rounded-2xl border border-line bg-panel">
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
                    <td className="px-5 py-3.5 font-mono font-medium text-navy">{p.ticker}</td>
                    <td className="px-5 py-3.5 text-slate">{p.timeframe}</td>
                    <td className={`px-5 py-3.5 ${p.direction === "LONG" ? "text-brand-green" : "text-brand-red"}`}>
                      {p.direction}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate">{p.entryPrice.toFixed(2)}</td>
                    <td className="px-5 py-3.5 font-mono text-slate">{p.markPrice.toFixed(2)}</td>
                    <td className="px-5 py-3.5 font-mono text-slate">{p.qty}</td>
                    <td className="px-5 py-3.5 font-mono text-slate">{p.openedAt}</td>
                    <td
                      className={`px-5 py-3.5 text-right font-mono font-medium ${
                        p.unrealizedPct >= 0 ? "text-brand-green" : "text-brand-red"
                      }`}
                    >
                      {p.unrealizedPct >= 0 ? "+" : ""}
                      {p.unrealizedPct.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-line bg-panel">
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
                    <td className="px-5 py-3.5 font-mono font-medium text-navy">{t.ticker}</td>
                    <td className="px-5 py-3.5 text-slate">{t.timeframe}</td>
                    <td className={`px-5 py-3.5 ${t.direction === "LONG" ? "text-brand-green" : "text-brand-red"}`}>
                      {t.direction}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate">{t.entryPrice.toFixed(2)}</td>
                    <td className="px-5 py-3.5 font-mono text-slate">{t.exitPrice.toFixed(2)}</td>
                    <td className="px-5 py-3.5 font-mono text-slate">{t.openedAt}</td>
                    <td className="px-5 py-3.5 font-mono text-slate">{t.closedAt}</td>
                    <td
                      className={`px-5 py-3.5 text-right font-mono font-medium ${
                        t.realizedPct >= 0 ? "text-brand-green" : "text-brand-red"
                      }`}
                    >
                      {t.realizedPct >= 0 ? "+" : ""}
                      {t.realizedPct.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
