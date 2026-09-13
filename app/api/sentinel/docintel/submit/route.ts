import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

/**
 * Accepts one multipart file upload and forwards it as-is to the
 * backend, which stores it and queues it for processing — this route
 * never talks to Azure Document Intelligence itself, only the backend's
 * worker does. Returns a job_id immediately; poll it via
 * /api/sentinel/docintel/status/[job_id].
 */
export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const formData = await req.formData();
    const data = await backendFetch("/sentinel/docintel/submit", {
      method: "POST",
      body: formData,
      headers: tenantId ? { "x-tenant-id": tenantId } : {},
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
