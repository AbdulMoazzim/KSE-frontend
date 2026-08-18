import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    tone === "green" ? "text-brand-green" : tone === "red" ? "text-brand-red" : "text-ink";

  return (
    <Card className={cn("p-5 transition-shadow hover:shadow-card")}>
      <div className="mb-2 text-[12px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`font-mono text-[26px] font-medium ${valueColor}`}>{value}</div>
      {sub && <div className="mt-1.5 text-[12.5px] text-muted-foreground">{sub}</div>}
    </Card>
  );
}
