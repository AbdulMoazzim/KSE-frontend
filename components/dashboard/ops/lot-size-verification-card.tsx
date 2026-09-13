import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LotSizeStatus } from "@/lib/types";

function statusTone(status: string | null): string {
  if (!status) return "bg-tint text-slate";
  const s = status.toLowerCase();
  if (s.includes("confirm") || s.includes("verified")) return "bg-tint-green text-brand-green";
  if (s.includes("stale")) return "bg-tint-red text-brand-red";
  if (s.includes("fallback")) return "bg-tint-gold text-gold";
  return "bg-tint text-slate";
}

export function LotSizeVerificationCard({ data }: { data: LotSizeStatus }) {
  const stats: [string, number | null][] = [
    ["Total symbols", data.totalSymbols],
    ["Confirmed", data.confirmedCount],
    ["Fallback", data.fallbackCount],
    ["Unverified", data.unverifiedCount],
    ["Stale", data.staleCount],
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lot-Size Verification</CardTitle>
        <CardDescription>Coverage across the real trading universe, not a raw table dump.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line bg-panel px-3 py-2.5 text-center">
              <div className="font-mono text-[18px] font-medium text-ink">{value ?? "—"}</div>
              <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate">{label}</div>
            </div>
          ))}
        </div>

        {data.symbols.length > 0 && (
          <div className="max-h-[420px] overflow-y-auto overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-left text-[12.5px]">
              <thead className="sticky top-0 bg-tint">
                <tr className="text-[10px] uppercase tracking-wide text-slate">
                  <th className="px-3 py-2 font-medium">Symbol</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Row exists</th>
                  <th className="px-3 py-2 font-medium">Lot size</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {data.symbols.map((s) => (
                  <tr key={s.symbol} className="border-t border-line/60 bg-panel">
                    <td className="px-3 py-2 font-mono font-medium text-ink">{s.symbol}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wide ${statusTone(s.status)}`}>
                        {s.status ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate">{s.rowExists === null ? "—" : s.rowExists ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 font-mono text-slate">{s.lotSize ?? "—"}</td>
                    <td className="px-3 py-2 text-slate">{s.lotSizeSource ?? "—"}</td>
                    <td className="px-3 py-2 text-slate">{s.symbolConfidence ?? "—"}</td>
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
