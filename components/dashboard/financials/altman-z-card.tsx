import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatLabel } from "@/components/dashboard/kv-block/format";
import { AltmanZScore } from "@/lib/types";

function zoneTone(zone: string | null): "green" | "gold" | "red" | "slate" {
  if (!zone) return "slate";
  const z = zone.toLowerCase();
  if (z.includes("safe")) return "green";
  if (z.includes("grey") || z.includes("gray")) return "gold";
  if (z.includes("distress") || z.includes("danger") || z.includes("high")) return "red";
  return "slate";
}

function zoneLabel(zone: string | null): string {
  if (!zone) return "Not reported";
  return zone
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AltmanZCard({ data }: { data: AltmanZScore | null }) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Altman Z-Score</CardTitle>
        <CardDescription>Bankruptcy/insolvency risk, from the classic five-ratio model.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center gap-4">
          <div className="font-mono text-[32px] font-semibold tabular-nums text-ink">
            {data.score !== null ? data.score.toFixed(2) : "—"}
          </div>
          <Badge variant={zoneTone(data.insolvencyRiskZone)}>{zoneLabel(data.insolvencyRiskZone)}</Badge>
        </div>

        {data.components && Object.keys(data.components).length > 0 && (
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate">Components</div>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {Object.entries(data.components).map(([key, value]) => (
                <div key={key} className="flex items-baseline justify-between gap-3 border-b border-line/60 py-1.5 sm:border-none sm:py-0">
                  <dt className="text-[12.5px] text-slate">{formatLabel(key)}</dt>
                  <dd className="font-mono text-[12.5px] tabular-nums text-ink">{value.toFixed(4)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
