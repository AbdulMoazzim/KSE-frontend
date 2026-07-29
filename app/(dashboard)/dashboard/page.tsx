import Link from "next/link";
import { Topbar } from "@/components/dashboard/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { StepChart } from "@/components/step-chart";
import { liveSignals, openPositions } from "@/lib/mock-data";

function outcomeTone(outcome: string) {
  if (outcome === "WIN") return "text-brand-green";
  if (outcome === "LOSS") return "text-brand-red";
  if (outcome === "OPEN") return "text-gold";
  return "text-slate";
}

export default function DashboardOverviewPage() {
  const recentSignals = liveSignals.slice(0, 5);
  const totalUnrealized = openPositions.reduce((sum, p) => sum + p.unrealizedPct, 0) / openPositions.length;

  return (
    <>
      <Topbar title="Overview" />
      <main className="flex-1 space-y-6 px-8 py-7">
        <div className="grid gap-5 md:grid-cols-4">
          <StatCard label="Open positions" value={String(openPositions.length)} sub="Across 1H + 1D engines" />
          <StatCard
            label="Avg. unrealized"
            value={`${totalUnrealized >= 0 ? "+" : ""}${totalUnrealized.toFixed(2)}%`}
            tone={totalUnrealized >= 0 ? "green" : "red"}
            sub="Mark-to-market, blended"
          />
          <StatCard label="Signals today" value="2" sub="1 win · 1 open" />
          <StatCard label="Kill switch" value="OFF" tone="green" sub="Trading active tenant-wide" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <StepChart />

          <div className="rounded-2xl border border-line bg-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15.5px] font-semibold text-navy">Recent live signals</h2>
              <Link href="/dashboard/signals" className="text-[12.5px] font-medium text-gold hover:text-gold-bright">
                View all →
              </Link>
            </div>
            <div className="space-y-1">
              {recentSignals.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl px-2.5 py-2.5 text-[13.5px] hover:bg-tint"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-16 font-mono font-medium text-navy">{s.ticker}</span>
                    <span className="rounded-full bg-tint px-2 py-0.5 font-mono text-[10.5px] text-slate">
                      {s.timeframe}
                    </span>
                    <span className={s.direction === "LONG" ? "text-brand-green" : "text-brand-red"}>
                      {s.direction}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[12.5px] text-slate">
                      conf. {s.confluenceScore.toFixed(2)}
                    </span>
                    <span className={`font-mono text-[12.5px] font-medium ${outcomeTone(s.outcome)}`}>
                      {s.outcome}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15.5px] font-semibold text-navy">Open positions</h2>
            <Link href="/dashboard/trade-log" className="text-[12.5px] font-medium text-gold hover:text-gold-bright">
              Full trade log →
            </Link>
          </div>
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
              {openPositions.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="py-3 font-mono font-medium text-navy">{p.ticker}</td>
                  <td className="py-3 text-slate">{p.timeframe}</td>
                  <td className={`py-3 ${p.direction === "LONG" ? "text-brand-green" : "text-brand-red"}`}>
                    {p.direction}
                  </td>
                  <td className="py-3 font-mono text-slate">{p.entryPrice.toFixed(2)}</td>
                  <td className="py-3 font-mono text-slate">{p.markPrice.toFixed(2)}</td>
                  <td className="py-3 font-mono text-slate">{p.qty}</td>
                  <td
                    className={`py-3 text-right font-mono font-medium ${
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
      </main>
    </>
  );
}
