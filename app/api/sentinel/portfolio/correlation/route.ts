import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

/** Whole-book pairwise correlation across every ticker currently held open by any live strategy. Read-only/informational — doesn't gate any strategy's own entries. */
export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const data = await backendFetch(`/sentinel/portfolio/correlation${req.nextUrl.search}`, {
      headers: tenantId ? { "x-tenant-id": tenantId } : {},
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
