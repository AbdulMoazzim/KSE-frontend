import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

export async function GET(req: NextRequest, { params }: { params: { ticker: string } }) {
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const data = await backendFetch(
      `/sentinel/analytics/mean-reversion/${encodeURIComponent(params.ticker)}${req.nextUrl.search}`,{
      headers: tenantId ? { "x-tenant-id": tenantId } : {},
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
