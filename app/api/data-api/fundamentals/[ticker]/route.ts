import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

/** Fundamentals are shared reference data, not tenant-scoped — same X-Data-API-Key auth as the rest of the Data-as-a-Service group. */
export async function GET(req: NextRequest, { params }: { params: { ticker: string } }) {
  try {
    const apiKey = req.headers.get("x-data-api-key");
    const data = await backendFetch(`/data-api/fundamentals/${encodeURIComponent(params.ticker)}`, {
      headers: apiKey ? { "X-Data-API-Key": apiKey } : {},
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
