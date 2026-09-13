import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DuPontBreakdown } from "@/lib/types";

function fmt(value: number | null, decimals = 2) {
  return value === null ? "—" : value.toFixed(decimals);
}

export function DuPontCard({ data }: { data: DuPontBreakdown | null }) {
  if (!data) return null;
  const { netProfitMarginPct, assetTurnoverRatio, equityMultiplierLeverage, resolvedReturnOnEquityPct } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>DuPont Profitability Breakdown</CardTitle>
        <CardDescription>Margin × Turnover × Leverage — what&rsquo;s actually driving ROE.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-line bg-tint/40 py-5 sm:gap-4">
          <Factor label="Net Margin" value={netProfitMarginPct !== null ? `${netProfitMarginPct.toFixed(2)}%` : "—"} />
          <Operator symbol="×" />
          <Factor label="Asset Turnover" value={fmt(assetTurnoverRatio)} />
          <Operator symbol="×" />
          <Factor label="Equity Multiplier" value={fmt(equityMultiplierLeverage)} />
          <Operator symbol="=" emphasis />
          <Factor
            label="Return on Equity"
            value={resolvedReturnOnEquityPct !== null ? `${resolvedReturnOnEquityPct.toFixed(2)}%` : "—"}
            emphasis
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Factor({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="text-center">
      <div className={`font-mono text-[19px] font-semibold tabular-nums ${emphasis ? "text-gold" : "text-ink"}`}>
        {value}
      </div>
      <div className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate">{label}</div>
    </div>
  );
}

function Operator({ symbol, emphasis = false }: { symbol: string; emphasis?: boolean }) {
  return (
    <div className={`text-[18px] ${emphasis ? "font-semibold text-slate" : "text-slate/60"}`} aria-hidden>
      {symbol}
    </div>
  );
}
