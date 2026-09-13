import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

/**
 * Full-universe scan — the spec calls out an asymmetric rate limit here
 * (6 req/min, not the usual 60) since this is the most computationally
 * expensive route in the router. Requires the caller's own
 * X-Data-API-Key, not our server's X-API-Key — this is the Tier 1 /
 * Data-as-a-Service product, meant to be called with a customer-
 * provisioned key.
 */
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-data-api-key");
    const data = await backendFetch(`/data-api/screener${req.nextUrl.search}`, {
      headers: apiKey ? { "X-Data-API-Key": apiKey } : {},
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
