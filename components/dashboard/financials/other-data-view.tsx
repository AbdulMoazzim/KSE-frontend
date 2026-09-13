import { StatTileRow } from "./stat-tile";
import { DuPontCard } from "./dupont-card";
import { AltmanZCard } from "./altman-z-card";
import { PiotroskiFCard } from "./piotroski-f-card";
import { DcfCard } from "./dcf-card";
import { FilingVerificationCard } from "./filing-verification-card";
import { KeyValueCard } from "@/components/dashboard/kv-block";
import { isEmptyData } from "@/components/dashboard/kv-block/format";
import { CorporateAnalysis, FundamentalsFiling } from "@/lib/types";

export function OtherDataView({
  filing,
  analysis,
}: {
  filing: FundamentalsFiling;
  analysis: CorporateAnalysis | null;
}) {
  const hasAnalysisSections = analysis && (analysis.dupont || analysis.altmanZ || analysis.piotroskiF || analysis.dcf);

  return (
    <div className="space-y-6">
      {filing.derivedRatios && (
        <section>
          <h2 className="mb-3 text-[13.5px] font-semibold text-ink">Key Ratios</h2>
          <StatTileRow data={filing.derivedRatios} />
        </section>
      )}

      {hasAnalysisSections && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[13.5px] font-semibold text-ink">Corporate Analysis</h2>
            {analysis?.targetFiscalPeriod && (
              <span className="font-mono text-[11px] text-slate">FY {analysis.targetFiscalPeriod.replace(/_FY$/i, "")}</span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DuPontCard data={analysis!.dupont} />
            <AltmanZCard data={analysis!.altmanZ} />
            <PiotroskiFCard data={analysis!.piotroskiF} />
            <DcfCard data={analysis!.dcf} />
          </div>
          {analysis?.dataSourceMode && (
            <p className="mt-3 text-[11px] text-slate">
              Data source: <span className="font-mono">{analysis.dataSourceMode}</span>
              {analysis.evaluationTimestamp && <> · evaluated {analysis.evaluationTimestamp}</>}
            </p>
          )}
        </section>
      )}

      <FilingVerificationCard data={filing} />

      {!isEmptyData(filing.extra) && (
        <KeyValueCard
          title="Additional fields"
          data={filing.extra}
          note="Not yet mapped into a dedicated section above — shown as-is so nothing is lost."
        />
      )}
      {analysis && !isEmptyData(analysis.extra) && (
        <KeyValueCard
          title="Additional corporate-analysis fields"
          data={analysis.extra}
          note="Not yet mapped into a dedicated section above — shown as-is so nothing is lost."
        />
      )}
    </div>
  );
}
