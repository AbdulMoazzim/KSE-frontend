import { NextRequest, NextResponse } from "next/server";
import { envs } from "@/config/env";
import { TENANT_COOKIE } from "@/lib/tenant";

export async function POST(req: NextRequest) {
  // Idempotent per the backend's own docs — still call it even if we have
  // no cookie, since there's nothing wrong with confirming there was
  // nothing to log out of.
  await fetch(`${envs.BACKEND_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "X-API-Key": envs.API_KEY,
      Cookie: req.headers.get("cookie") ?? "",
    },
  }).catch(() => null);

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(TENANT_COOKIE);
  return response;
}
