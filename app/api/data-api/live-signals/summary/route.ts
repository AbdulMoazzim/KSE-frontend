import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

/** Aggregate win-rate/PnL view — not in the original 8-route DaaS spec, added for UI parity with the tenant-scoped version. */
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-data-api-key");
    const data = await backendFetch(`/data-api/live-signals/summary${req.nextUrl.search}`, {
      headers: apiKey ? { "X-Data-API-Key": apiKey } : {},
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
