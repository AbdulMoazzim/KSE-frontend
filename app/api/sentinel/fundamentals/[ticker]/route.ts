import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-server";
import { handleBackendError } from "@/lib/route-helpers";

export async function GET(_req: Request, { params }: { params: { ticker: string } }) {
  try {
    const data = await backendFetch(`/sentinel/fundamentals/${encodeURIComponent(params.ticker)}`);
    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
