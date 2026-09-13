import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

/** entry_price is a required query param per the spec — left to the backend's own 422 validation rather than duplicated here. */
export async function GET(req: NextRequest, { params }: { params: { ticker: string } }) {
  try {
    const apiKey = req.headers.get("x-data-api-key");
    const data = await backendFetch(`/data-api/atr-trade-setup/${encodeURIComponent(params.ticker)}${req.nextUrl.search}`, {
      headers: apiKey ? { "X-Data-API-Key": apiKey } : {},
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
