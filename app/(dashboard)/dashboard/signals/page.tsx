import { Topbar } from "@/components/dashboard/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { liveSignals } from "@/lib/mock-data";

function outcomeTone(outcome: string) {
  if (outcome === "WIN") return "bg-tint-green text-brand-green";
  if (outcome === "LOSS") return "bg-tint-red text-brand-red";
  if (outcome === "OPEN") return "bg-tint-gold text-gold";
  return "bg-tint text-slate";
}

export default function LiveSignalsPage() {
  const wins = liveSignals.filter((s) => s.outcome === "WIN").length;
  const losses = liveSignals.filter((s) => s.outcome === "LOSS").length;
  const decided = wins + losses;
  const winRate = decided ? ((wins / decided) * 100).toFixed(0) : "—";
  const avgReturn =
    liveSignals.filter((s) => s.returnPct !== null).reduce((sum, s) => sum + (s.returnPct ?? 0), 0) /
    liveSignals.filter((s) => s.returnPct !== null).length;

  return (
    <>
      <Topbar title="Live Signals" />
      <main className="flex-1 space-y-6 px-8 py-7">
        <p className="max-w-[640px] text-[13.5px] leading-relaxed text-slate">
          A day-by-day record of live and forward-paper signals and their real outcomes — this is the honest
          ledger, not a backtest summary.
        </p>

        <div className="grid gap-5 md:grid-cols-4">
          <StatCard label="Win rate" value={`${winRate}%`} sub={`${wins}W / ${losses}L, decided signals`} />
          <StatCard
            label="Avg. return"
            value={`${avgReturn >= 0 ? "+" : ""}${avgReturn.toFixed(2)}%`}
            tone={avgReturn >= 0 ? "green" : "red"}
            sub="Across all logged outcomes"
          />
          <StatCard label="Open signals" value={String(liveSignals.filter((s) => s.outcome === "OPEN").length)} />
          <StatCard label="Total tracked" value={String(liveSignals.length)} sub="This view, most recent first" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-panel">
          <table className="w-full text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-slate">
                <th className="px-5 py-3.5 font-medium">Date</th>
                <th className="px-5 py-3.5 font-medium">Ticker</th>
                <th className="px-5 py-3.5 font-medium">Timeframe</th>
                <th className="px-5 py-3.5 font-medium">Direction</th>
                <th className="px-5 py-3.5 font-medium">Confluence</th>
                <th className="px-5 py-3.5 font-medium">Entry</th>
                <th className="px-5 py-3.5 font-medium">Exit</th>
                <th className="px-5 py-3.5 font-medium">Outcome</th>
                <th className="px-5 py-3.5 text-right font-medium">Return</th>
              </tr>
            </thead>
            <tbody>
              {liveSignals.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0 hover:bg-tint/60">
                  <td className="px-5 py-3.5 font-mono text-slate">{s.date}</td>
                  <td className="px-5 py-3.5 font-mono font-medium text-navy">{s.ticker}</td>
                  <td className="px-5 py-3.5 text-slate">{s.timeframe}</td>
                  <td className={`px-5 py-3.5 ${s.direction === "LONG" ? "text-brand-green" : "text-brand-red"}`}>
                    {s.direction}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate">{s.confluenceScore.toFixed(2)}</td>
                  <td className="px-5 py-3.5 font-mono text-slate">{s.entryPrice.toFixed(2)}</td>
                  <td className="px-5 py-3.5 font-mono text-slate">
                    {s.exitPrice ? s.exitPrice.toFixed(2) : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 font-mono text-[10.5px] ${outcomeTone(s.outcome)}`}>
                      {s.outcome}
                    </span>
                  </td>
                  <td
                    className={`px-5 py-3.5 text-right font-mono font-medium ${
                      s.returnPct === null ? "text-slate" : s.returnPct >= 0 ? "text-brand-green" : "text-brand-red"
                    }`}
                  >
                    {s.returnPct === null ? "—" : `${s.returnPct >= 0 ? "+" : ""}${s.returnPct.toFixed(2)}%`}
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
