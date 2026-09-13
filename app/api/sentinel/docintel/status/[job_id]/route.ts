import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

/** Cheap/fast — designed to be polled repeatedly while a job is in flight. */
export async function GET(req: NextRequest, { params }: { params: { job_id: string } }) {
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const data = await backendFetch(`/sentinel/docintel/status/${encodeURIComponent(params.job_id)}`, {
      headers: tenantId ? { "x-tenant-id": tenantId } : {},
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
