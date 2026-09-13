import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

/** Returns the extracted content once a job is DONE — the backend sends an explicit error (not a silent empty success) if the job isn't finished yet or failed, which flows through as a normal BackendError here. */
export async function GET(req: NextRequest, { params }: { params: { job_id: string } }) {
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const data = await backendFetch(`/sentinel/docintel/result/${encodeURIComponent(params.job_id)}`, {
      headers: tenantId ? { "x-tenant-id": tenantId } : {},
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
