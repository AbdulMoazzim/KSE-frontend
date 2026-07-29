export function StatCard({
  label,
  value,
  sub,
  tone = "navy",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "navy" | "green" | "red";
}) {
  const valueColor =
    tone === "green" ? "text-brand-green" : tone === "red" ? "text-brand-red" : "text-navy";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <div className="mb-2 text-[12px] font-medium uppercase tracking-wide text-slate">{label}</div>
      <div className={`font-mono text-[26px] font-medium ${valueColor}`}>{value}</div>
      {sub && <div className="mt-1.5 text-[12.5px] text-slate">{sub}</div>}
    </div>
  );
}
