import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StrategyBreakdownRow } from "@/lib/types";

export function StrategyBreakdownCard({ rows }: { rows: StrategyBreakdownRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Breakdown</CardTitle>
        <CardDescription>Open positions, closed trades, and realized P&amp;L per strategy.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line bg-tint/30 px-4 py-6 text-center text-[13px] text-slate">
            No strategies have reported activity for this window yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[10.5px] uppercase tracking-wide text-slate">
                  <th className="py-2 pr-3 font-medium">Strategy</th>
                  <th className="py-2 pr-3 font-medium">Open</th>
                  <th className="py-2 pr-3 font-medium">Closed</th>
                  <th className="py-2 text-right font-medium">Realized P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.strategyName} className="border-b border-line/60 last:border-0">
                    <td className="py-2 pr-3 font-medium text-ink">{r.strategyName}</td>
                    <td className="py-2 pr-3 font-mono text-slate">{r.openCount ?? "—"}</td>
                    <td className="py-2 pr-3 font-mono text-slate">{r.closedCount ?? "—"}</td>
                    <td
                      className={`py-2 text-right font-mono ${
                        r.realizedPnl === null ? "text-slate" : r.realizedPnl >= 0 ? "text-brand-green" : "text-brand-red"
                      }`}
                    >
                      {r.realizedPnl === null ? "—" : `${r.realizedPnl >= 0 ? "+" : ""}${r.realizedPnl.toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
