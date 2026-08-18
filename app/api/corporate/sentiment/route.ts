import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

export async function POST(req: NextRequest) {
  try {
    const { ticker, text_payload } = await req.json();
    const qs = new URLSearchParams({ ticker, text_payload }).toString();
    const data = await backendFetch(`/corporate/sentiment?${qs}`, { method: "POST" });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
