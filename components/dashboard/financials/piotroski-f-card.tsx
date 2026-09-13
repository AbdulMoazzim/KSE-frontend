import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatLabel } from "@/components/dashboard/kv-block/format";
import { PiotroskiFScore } from "@/lib/types";

export function PiotroskiFCard({ data }: { data: PiotroskiFScore | null }) {
  if (!data) return null;
  const filled = data.score ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Piotroski F-Score</CardTitle>
        <CardDescription>Nine yes/no fundamental strength checks — higher is stronger.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="font-mono text-[32px] font-semibold tabular-nums text-ink">
            {data.score !== null ? data.score : "—"}
            <span className="text-[16px] font-normal text-slate">/{data.maxScore}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: data.maxScore }).map((_, i) => (
              <span
                key={i}
                className={`h-3 w-3 rounded-full ${i < filled ? "bg-brand-green" : "bg-tint border border-line"}`}
              />
            ))}
          </div>
          {data.strengthRating && (
            <span className="rounded-full bg-tint-green px-3 py-1 font-mono text-[10.5px] tracking-wide text-brand-green">
              {data.strengthRating}
            </span>
          )}
        </div>

        {data.breakdown && Object.keys(data.breakdown).length > 0 && (
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate">Criteria</div>
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {Object.entries(data.breakdown).map(([key, passed]) => (
                <li key={key} className="flex items-center gap-2 text-[12.5px]">
                  <span
                    className={`flex h-4 w-4 flex-none items-center justify-center rounded-full text-[9px] ${
                      passed ? "bg-tint-green text-brand-green" : "bg-tint-red text-brand-red"
                    }`}
                  >
                    {passed ? "✓" : "✕"}
                  </span>
                  <span className="text-slate">{formatLabel(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
