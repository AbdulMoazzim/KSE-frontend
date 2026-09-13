import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "./stat-tile";
import { isEmptyData } from "@/components/dashboard/kv-block/format";

function toNumericEntries(bucket: Record<string, unknown>): [string, number | null][] {
  return Object.entries(bucket)
    .filter(([, v]) => v === null || typeof v === "number" || (typeof v === "string" && v !== ""))
    .map(([k, v]) => [k, v === null ? null : typeof v === "number" ? v : Number(v)]);
}

function StatementCard({ title, bucket }: { title: string; bucket: Record<string, unknown> }) {
  const entries = toNumericEntries(bucket);
  if (entries.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[13.5px]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2.5 pt-4 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <StatTile key={key} label={key} value={value !== null && Number.isFinite(value) ? value : null} unit="amount" />
        ))}
      </CardContent>
    </Card>
  );
}

/** Compact, glanceable snapshot of the three core statements — not the full line-item detail Financials' tabs show, just enough for a quick read. */
export function StatementSnapshot({
  income,
  balance,
  cashflow,
}: {
  income: Record<string, unknown>;
  balance: Record<string, unknown>;
  cashflow: Record<string, unknown>;
}) {
  if (isEmptyData(income) && isEmptyData(balance) && isEmptyData(cashflow)) return null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatementCard title="Income Statement" bucket={income} />
      <StatementCard title="Balance Sheet" bucket={balance} />
      <StatementCard title="Cash Flow" bucket={cashflow} />
    </div>
  );
}
