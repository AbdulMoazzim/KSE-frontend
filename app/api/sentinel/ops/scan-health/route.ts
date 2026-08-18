import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

export async function GET() {
  try {
    const data = await backendFetch("/sentinel/ops/scan-health");
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
