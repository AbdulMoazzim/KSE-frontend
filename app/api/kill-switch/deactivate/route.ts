import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const tenantId = req.headers.get("x-tenant-id");
    const data = await backendFetch("/kill-switch/deactivate", {
      method: "POST",
      headers: tenantId ? { "x-tenant-id": tenantId } : {},
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
