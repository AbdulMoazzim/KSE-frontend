import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KeyValueBlock } from "@/components/dashboard/kv-block";
import { isPlainObject } from "@/components/dashboard/kv-block/format";

const STATUS_KEYS = ["status", "state", "health"];

function statusTone(status: string): string {
  const s = status.toLowerCase();
  if (/(ok|healthy|current|fresh|pass|success|complete|ran)/.test(s)) return "bg-tint-green text-brand-green";
  if (/(stale|warn|degraded|delay)/.test(s)) return "bg-tint-gold text-gold";
  if (/(fail|error|down|missing|no_data|no_log)/.test(s)) return "bg-tint-red text-brand-red";
  return "bg-tint text-slate";
}

/**
 * Schema for heartbeat/scan-health wasn't confirmed the way progress /
 * strategy-breakdown / lot-size-status now are, so this stays generic —
 * but pulls out anything that looks like a status field into a proper
 * badge instead of letting it sit as just another grid row.
 */
export function StatusCard({ title, note, data }: { title: string; note?: string; data: unknown }) {
  let status: string | null = null;
  let rest: unknown = data;

  if (isPlainObject(data)) {
    for (const key of STATUS_KEYS) {
      const value = data[key];
      if (typeof value === "string" && value.length < 40) {
        status = value;
        rest = Object.fromEntries(Object.entries(data).filter(([k]) => k !== key));
        break;
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          {status && (
            <span className={`whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[10px] tracking-wide ${statusTone(status)}`}>
              {status.replace(/_/g, " ")}
            </span>
          )}
        </div>
        {note && <CardDescription>{note}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-4">
        <KeyValueBlock data={rest} />
      </CardContent>
    </Card>
  );
}
