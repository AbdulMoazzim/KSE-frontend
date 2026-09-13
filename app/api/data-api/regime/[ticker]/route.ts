import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

export async function GET(req: NextRequest, { params }: { params: { ticker: string } }) {
  try {
    const apiKey = req.headers.get("x-data-api-key");
    const data = await backendFetch(`/data-api/regime/${encodeURIComponent(params.ticker)}${req.nextUrl.search}`, {
      headers: apiKey ? { "X-Data-API-Key": apiKey } : {},
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
