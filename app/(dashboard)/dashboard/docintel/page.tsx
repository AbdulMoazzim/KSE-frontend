"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { EmptyState } from "@/components/dashboard/async-state";
import { apiGet, apiPostForm, ApiError } from "@/lib/api-client";
import { normalizeDocIntelResult, normalizeDocIntelStatus } from "@/lib/normalize";
import { ConfidenceBucket, DocIntelJob, DocIntelStatus } from "@/lib/types";

const TENANT_HEADER = { "X-Tenant-ID": "1" };
const POLL_INTERVAL_MS = 4000;

const FILTERS = ["All", "Needs review", "Processing", "Failed"] as const;
type Filter = (typeof FILTERS)[number];

function formatType(t: string | null) {
  if (!t) return "Unclassified";
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function confidenceLabel(bucket: ConfidenceBucket) {
  if (bucket === "high") return "High";
  if (bucket === "mid") return "Review suggested";
  if (bucket === "low") return "Manual check";
  return "—";
}

export default function DocIntelPage() {
  const [jobs, setJobs] = useState<DocIntelJob[]>([]);
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  const [filter, setFilter] = useState<Filter>("All");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResult = useCallback(async (jobId: string) => {
    try {
      const raw = await apiGet(`/api/sentinel/docintel/result/${encodeURIComponent(jobId)}`, TENANT_HEADER);
      const parsed = normalizeDocIntelResult(raw);
      setJobs((cur) => cur.map((j) => (j.jobId === jobId ? { ...j, ...parsed } : j)));
    } catch {
      // Result not ready yet, or fetch failed — leave the row as "Done"
      // with unknown type/confidence rather than blocking on it.
    }
  }, []);

  const pollJob = useCallback(
    async (jobId: string) => {
      try {
        const raw = await apiGet(`/api/sentinel/docintel/status/${encodeURIComponent(jobId)}`, TENANT_HEADER);
        const { status, error } = normalizeDocIntelStatus(raw);
        setJobs((cur) => cur.map((j) => (j.jobId === jobId ? { ...j, status, error } : j)));
        if (status === "done") fetchResult(jobId);
      } catch (err) {
        setJobs((cur) =>
          cur.map((j) =>
            j.jobId === jobId
              ? { ...j, status: "failed", error: err instanceof ApiError ? err.message : "Couldn't check this document's status." }
              : j
          )
        );
      }
    },
    [fetchResult]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      jobsRef.current.filter((j) => j.status === "processing").forEach((j) => pollJob(j.jobId));
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pollJob]);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const raw = await apiPostForm<{ job_id?: string; jobId?: string }>(
        "/api/sentinel/docintel/submit",
        formData,
        TENANT_HEADER
      );
      const jobId = raw.job_id ?? raw.jobId;
      if (!jobId) throw new Error("The upload succeeded but no job id came back.");

      const job: DocIntelJob = {
        jobId: String(jobId),
        filename: file.name,
        uploadedAt: new Date(),
        status: "processing",
        documentType: null,
        company: null,
        confidence: null,
        confidenceBucket: null,
        error: null,
      };
      setJobs((cur) => [job, ...cur]);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "We couldn't upload that document. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const visibleJobs = jobs.filter((j) => {
    if (filter === "All") return true;
    if (filter === "Processing") return j.status === "processing";
    if (filter === "Failed") return j.status === "failed";
    if (filter === "Needs review") return j.status === "done" && (j.confidenceBucket === "mid" || j.confidenceBucket === "low");
    return true;
  });

  return (
    <>
      <Topbar
        title="Document Intelligence"
        subtitle="Upload any filing or invoice for structured extraction — any company, not limited to the covered universe."
        showTimeframe={false}
      />
      <main className="flex-1 space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-7 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-2.5 py-1 text-[12px] transition-colors ${
                  filter === f ? "border-navy bg-navy text-white" : "border-line text-slate hover:border-navy hover:text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {jobs.length > 0 && <span className="text-[12px] text-slate">{jobs.length} uploaded this session</span>}
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-md bg-gold px-4 py-2 text-[13px] font-semibold text-on-gold shadow-soft transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-55"
            >
              {uploading ? "Uploading…" : "+ Upload document"}
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="rounded-lg border border-brand-red/30 bg-tint-red px-4 py-3 text-[13px] text-brand-red">{uploadError}</div>
        )}

        {jobs.length === 0 ? (
          <EmptyState
            title="No documents yet"
            description="Upload a filing or invoice to get a structured extraction. There's no document archive yet, so this list only covers what you upload this session."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wide text-slate">
                    <th className="px-4 py-2.5 font-medium">Document</th>
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="px-4 py-2.5 font-medium">Company / Ticker</th>
                    <th className="px-4 py-2.5 font-medium">Uploaded</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleJobs.map((j) => (
                    <tr key={j.jobId} className="border-b border-line last:border-0 hover:bg-tint/60">
                      <td className="px-4 py-2.5 font-medium text-ink">{j.filename}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-block rounded-md bg-tint px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-navy">
                          {formatType(j.documentType)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate">{j.company ?? "—"}</td>
                      <td className="px-4 py-2.5 font-mono text-slate">
                        {j.uploadedAt.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={j.status} />
                        {j.error && <div className="mt-0.5 text-[11px] text-brand-red">{j.error}</div>}
                      </td>
                      <td className="px-4 py-2.5">
                        {j.status === "done" ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-block h-2.5 w-2.5 shrink-0 rotate-45 ${
                                j.confidenceBucket === "high"
                                  ? "bg-brand-green"
                                  : j.confidenceBucket === "mid"
                                  ? "bg-gold"
                                  : j.confidenceBucket === "low"
                                  ? "bg-brand-red"
                                  : "bg-slate"
                              }`}
                            />
                            <span className="text-[12px] text-slate">{confidenceLabel(j.confidenceBucket)}</span>
                          </div>
                        ) : (
                          <span className="text-[12px] text-slate">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function StatusBadge({ status }: { status: DocIntelStatus }) {
  if (status === "done")
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand-green">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />Done
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand-red">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />Failed
      </span>
    );
  if (status === "processing")
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate" />Extracting
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate">
      <span className="h-1.5 w-1.5 rounded-full bg-slate" />Unknown
    </span>
  );
}
