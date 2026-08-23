import { NextRequest, NextResponse } from "next/server";
import { envs } from "@/config/env";
import { TENANT_COOKIE } from "@/lib/tenant";
import { logger, newRequestId } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const requestId = newRequestId();
  const startedAt = Date.now();

  // Idempotent per the backend's own docs — still call it even if we have
  // no cookie, since there's nothing wrong with confirming there was
  // nothing to log out of.
  await fetch(`${envs.BACKEND_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "X-API-Key": envs.API_KEY,
      Cookie: req.headers.get("cookie") ?? "",
    },
  })
    .then((res) => {
      logger.info("logout_complete", { requestId, status: res.status, durationMs: Date.now() - startedAt });
    })
    .catch((networkErr) => {
      // Non-fatal — we clear the local session cookie regardless.
      logger.warn("logout_backend_unreachable", {
        requestId,
        durationMs: Date.now() - startedAt,
        error: networkErr instanceof Error ? networkErr.message : String(networkErr),
      });
    });

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(TENANT_COOKIE);
  return response;
}
