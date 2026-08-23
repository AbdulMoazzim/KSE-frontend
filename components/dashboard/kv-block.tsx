import { Card } from "@/components/ui/card";

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(4);
  return String(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function KeyValueBlock({ data }: { data: unknown }) {
  if (data === null || data === undefined) {
    return <p className="text-[13px] text-slate">No data returned.</p>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="text-[13px] text-slate">No data returned.</p>;
    return (
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="rounded-xl border border-line bg-tint/40 p-3 sm:p-4">
            <KeyValueBlock data={item} />
          </div>
        ))}
      </div>
    );
  }

  if (isPlainObject(data)) {
    const entries = Object.entries(data);
    if (entries.length === 0) return <p className="text-[13px] text-slate">No data returned.</p>;
    return (
      <>
        <dl className={`grid grid-cols-1 gap-x-6 gap-y-3`}>
          {entries.filter(([key]) => (key !== "symbols")).map(([key, value]) => (
            <div key={key} className="min-w-0">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate">{formatLabel(key)}</dt>
              <dd className="mt-0.5 break-words text-[13.5px] text-ink">
                {isPlainObject(value) || Array.isArray(value) ? (
                  <div className="mt-1 rounded-lg border border-line bg-tint/40 p-2.5 sm:p-3">
                    <KeyValueBlock data={value} />
                  </div>
                ) : (
                  <span className="font-mono break-all">{formatPrimitive(value)}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        {entries.filter(([key]) => (key === "symbols")).map(([key, value]) => (
          <div key={key} className="mt-3 min-w-0 sm:mt-4">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate">{formatLabel(key)}</dt>
            <dd className="mt-0.5 break-words text-[13.5px] text-ink">
              {isPlainObject(value) || Array.isArray(value) ? (
                <div className="mt-1 rounded-lg border border-line bg-tint/40 p-2.5 sm:p-3">
                  <KeyValueBlock data={value} />
                </div>
              ) : (
                <span className="font-mono break-all">{formatPrimitive(value)}</span>
              )}
            </dd>
          </div>
        ))}
      </>
    );
  }

  return <span className="font-mono text-[13.5px] text-ink break-all">{formatPrimitive(data)}</span>;
}

export function KeyValueCard({ title, data, note }: { title: string; data: unknown; note?: string }) {
  return (
    <Card className="p-4 sm:p-6">
      <h2 className="mb-1 text-[14.5px] font-semibold text-foreground sm:text-[15.5px]">{title}</h2>
      {note && <p className="mb-4 text-[12.5px] leading-relaxed text-muted-foreground">{note}</p>}
      <div className={note ? "" : "mt-4"}>
        <KeyValueBlock data={data} />
      </div>
    </Card>
  );
}