import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

/** Combined open-position list + per-ticker exposure across ALL live strategies — the "am I secretly concentrated" view, not available from any single strategy's own dashboard slice. */
export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const data = await backendFetch(`/sentinel/portfolio/overview${req.nextUrl.search}`, {
      headers: tenantId ? { "x-tenant-id": tenantId } : {},
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
