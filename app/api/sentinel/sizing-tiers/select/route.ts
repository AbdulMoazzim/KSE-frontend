import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tenantId = req.headers.get("x-tenant-id");
    const data = await backendFetch("/sentinel/sizing-tiers/select", {
      method: "POST",
      body: JSON.stringify(body),
      headers: tenantId ? { "x-tenant-id": tenantId } : {},
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
