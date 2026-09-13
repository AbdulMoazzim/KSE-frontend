import { formatLabel } from "@/components/dashboard/kv-block/format";
import { FundamentalsFiling } from "@/lib/types";

function statusTone(status: string | null): string {
  if (!status) return "bg-tint text-slate";
  const s = status.toLowerCase();
  if (s.includes("fail")) return "bg-tint-red text-brand-red";
  if (s.includes("verified") || s.includes("success") || s.includes("pass")) return "bg-tint-green text-brand-green";
  return "bg-tint-gold text-gold";
}

export function FilingVerificationCard({ data }: { data: FundamentalsFiling }) {
  const rows: [string, string | null][] = [
    ["Company", data.companyName],
    ["Sector", data.sector],
    ["Filing Period End", data.filingPeriodEnd],
    ["Consolidated", data.consolidated === null ? null : data.consolidated ? "Yes" : "No"],
    ["Unit", data.unit],
  ].filter(([, v]) => v !== null) as [string, string][];

  return (
    <details className="group rounded-lg border border-line bg-panel" open>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[13px] font-medium text-slate marker:content-none">
        <span className="flex items-center gap-2">
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none" className="text-slate">
            <rect x="2" y="1.5" width="10" height="11" rx="1.2" stroke="currentColor" strokeWidth={1.3} />
            <path d="M4.5 4.5h5M4.5 7h5M4.5 9.5h3" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" />
          </svg>
          Filing &amp; verification details
          {data.extractionStatus && (
            <span className={`ml-1 rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wide ${statusTone(data.extractionStatus)}`}>
              {data.extractionStatus.replace(/_/g, " ")}
            </span>
          )}
        </span>
        <svg width={14} height={14} viewBox="0 0 14 14" fill="none" className="text-slate transition-transform group-open:rotate-180">
          <path d="M3.5 5.5L7 9l3.5-3.5" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <div className="space-y-3 border-t border-line px-4 py-4">
        {rows.length > 0 && (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-3 text-[12.5px] sm:justify-start sm:gap-2">
                <dt className="text-slate">{label}</dt>
                <dd className="text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {data.verificationNotes && (
          <div>
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate">Verification notes</div>
            <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-slate">{data.verificationNotes}</p>
          </div>
        )}

        {data.sourceDocumentUrl && (
          <div>
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate">Source document</div>
            <a
              href={data.sourceDocumentUrl}
              target="_blank"
              rel="noreferrer"
              className="break-all font-mono text-[12px] text-navy underline decoration-line hover:decoration-navy"
            >
              {data.sourceDocumentUrl}
            </a>
          </div>
        )}

        {data.sourceDocumentHash && (
          <div>
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate">Document hash</div>
            <p className="break-all font-mono text-[11px] text-slate">{data.sourceDocumentHash}</p>
          </div>
        )}
      </div>
    </details>
  );
}
