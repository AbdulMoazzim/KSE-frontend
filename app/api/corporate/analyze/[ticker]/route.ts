import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

export async function GET(req: NextRequest, { params }: { params: { ticker: string } }) {
  try {
    const data = await backendFetch(`/corporate/analyze/${encodeURIComponent(params.ticker)}${req.nextUrl.search}`);
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
