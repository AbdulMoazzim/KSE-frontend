import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

export async function POST(req: NextRequest) {
  try {
    const { ticker, observation, category } = await req.json();
    const qs = new URLSearchParams({ ticker, observation, ...(category ? { category } : {}) }).toString();
    const data = await backendFetch(`/sentinel/observe?${qs}`, { method: "POST" });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
