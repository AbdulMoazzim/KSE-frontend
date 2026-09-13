import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function fmtCurrency(value: number | null) {
  if (value === null) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function DcfCard({
  data,
}: {
  data: {
    valuationPkr: number | null;
    presentValueOperatingCashFlows: number | null;
    discountedTerminalValue: number | null;
    calculatedEnterpriseValue: number | null;
    adjustedEquityValue: number | null;
  } | null;
}) {
  if (!data) return null;
  const rows = [
    { label: "Present Value — Operating Cash Flows", value: data.presentValueOperatingCashFlows },
    { label: "Discounted Terminal Value", value: data.discountedTerminalValue },
    { label: "Calculated Enterprise Value", value: data.calculatedEnterpriseValue },
    { label: "Adjusted Equity Value", value: data.adjustedEquityValue },
  ];
  const hasBreakdown = rows.some((r) => r.value !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intrinsic Valuation (DCF)</CardTitle>
        <CardDescription>Discounted cash flow model output — a modeled estimate, not a target price.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="rounded-lg border border-line bg-tint/40 px-4 py-4">
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate">DCF Valuation</div>
          <div className="mt-1 font-mono text-[24px] font-semibold tabular-nums text-ink">
            {data.valuationPkr !== null ? `PKR ${fmtCurrency(data.valuationPkr)}` : "—"}
          </div>
        </div>

        {hasBreakdown && (
          <dl className="space-y-2">
            {rows.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-3 border-b border-line/60 pb-2 last:border-none last:pb-0">
                <dt className="text-[12.5px] text-slate">{r.label}</dt>
                <dd className="font-mono text-[13px] tabular-nums text-ink">{fmtCurrency(r.value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
