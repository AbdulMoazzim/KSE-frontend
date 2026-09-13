import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

/** Combined equity/drawdown curve across all strategies for this tenant+timeframe. Per-strategy breakdown is explicitly deferred (not available from this endpoint). */
export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const data = await backendFetch(`/sentinel/portfolio/equity${req.nextUrl.search}`, {
      headers: tenantId ? { "x-tenant-id": tenantId } : {},
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
