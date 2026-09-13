import { formatLabel, formatPrimitive } from "@/components/dashboard/kv-block/format";

function fmtPct(value: number | null) {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function toneClass(tone: "neutral" | "signed" | undefined, value: number | null) {
  if (tone !== "signed" || value === null) return "text-ink";
  return value >= 0 ? "text-brand-green" : "text-brand-red";
}

/** A single headline metric — big mono number, small label above it. */
export function StatTile({
  label,
  value,
  unit = "pct",
  tone = "neutral",
}: {
  label: string;
  value: number | null;
  /** "pct" formats as a signed percentage; "raw" shows the number as-is (e.g. a ratio like 0.75); "amount" formats as a plain figure with thousands separators (currency, counts). */
  unit?: "pct" | "raw" | "amount";
  tone?: "neutral" | "signed";
}) {
  const display = unit === "pct" ? fmtPct(value) : unit === "amount" ? formatPrimitive(value) : value !== null ? value.toFixed(2) : "—";
  return (
    <div className="rounded-lg border border-line bg-panel px-4 py-3.5">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate">{formatLabel(label)}</div>
      <div className={`mt-1 font-mono text-[20px] font-medium tabular-nums ${toneClass(tone, value)}`}>{display}</div>
    </div>
  );
}

/** A row of StatTiles built directly from a flat Record<string, number> — used for "derived_ratios" and similar bags of named numbers. */
export function StatTileRow({ data, unit = "pct" }: { data: Record<string, number> | null; unit?: "pct" | "raw" | "amount" }) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-[13px] text-slate">No ratios reported.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Object.entries(data).map(([key, value]) => (
        <StatTile key={key} label={key} value={value} unit={unit} tone={unit === "pct" ? "signed" : "neutral"} />
      ))}
    </div>
  );
}
