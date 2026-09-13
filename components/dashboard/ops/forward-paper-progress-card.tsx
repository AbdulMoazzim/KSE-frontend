import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ForwardPaperProgress } from "@/lib/types";

export function ForwardPaperProgressCard({ data }: { data: ForwardPaperProgress }) {
  const pct = data.pctComplete !== null ? Math.max(0, Math.min(100, data.pctComplete)) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forward-Paper Progress</CardTitle>
        <CardDescription>Real progress through the 60-trading-day window.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="font-mono text-[22px] font-semibold tabular-nums text-ink">
              {data.daysCompleted ?? "—"}
              <span className="text-[14px] font-normal text-slate"> / {data.targetDays ?? "—"} days</span>
            </span>
            <span className="font-mono text-[13px] text-slate">{pct !== null ? `${pct.toFixed(0)}%` : "—"}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-tint">
            <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct ?? 0}%` }} />
          </div>
          {data.daysRemaining !== null && (
            <p className="mt-1.5 text-[12px] text-slate">{data.daysRemaining} trading days remaining</p>
          )}
        </div>

        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 border-t border-line pt-3 sm:grid-cols-2">
          <Row label="Window start" value={data.windowStartDate} />
          <Row label="Calendar days elapsed" value={data.calendarDaysElapsed?.toString() ?? null} />
          <Row label="First snapshot" value={data.firstSnapshotDate} />
          <Row label="Last snapshot" value={data.lastSnapshotDate} />
        </dl>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
      <dt className="text-slate">{label}</dt>
      <dd className="font-mono text-ink">{value ?? "—"}</dd>
    </div>
  );
}
