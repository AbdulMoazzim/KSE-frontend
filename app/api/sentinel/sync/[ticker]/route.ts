import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

export async function POST(req: NextRequest, { params }: { params: { ticker: string } }) {
  try {
    const data = await backendFetch(`/sentinel/sync/${encodeURIComponent(params.ticker)}${req.nextUrl.search}`, {
      method: "POST",
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
