import { NextRequest, NextResponse } from "next/server";
import { envs } from "@/config/env";
import { logger, newRequestId } from "@/lib/logger";

/**
 * See the comment in app/api/login/route.ts — this relies on the refresh
 * cookie the login route rehosted onto our own origin. Not verified
 * end-to-end against a live login (the exact backend cookie shape wasn't
 * confirmed), so treat this as a best-effort proxy and check the network
 * tab if refresh doesn't silently keep the session alive as expected.
 */
export async function POST(req: NextRequest) {
  const requestId = newRequestId();
  const startedAt = Date.now();

  let backendRes: Response;
  try {
    backendRes = await fetch(`${envs.BACKEND_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "X-API-Key": envs.API_KEY,
        Cookie: req.headers.get("cookie") ?? "",
      },
    });
  } catch (networkErr) {
    logger.error("refresh_network_error", {
      requestId,
      durationMs: Date.now() - startedAt,
      error: networkErr instanceof Error ? networkErr.message : String(networkErr),
    });
    return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 502 });
  }

  const durationMs = Date.now() - startedAt;

  if (!backendRes.ok) {
    const text = await backendRes.text().catch(() => "");
    logger.warn("refresh_failed", { requestId, status: backendRes.status, durationMs, detail: text });
    return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: backendRes.status });
  }

  logger.info("refresh_succeeded", { requestId, durationMs });
  const data = await backendRes.json();
  const response = NextResponse.json(data);

  const setCookies =
    typeof backendRes.headers.getSetCookie === "function"
      ? backendRes.headers.getSetCookie()
      : backendRes.headers.get("set-cookie")
      ? [backendRes.headers.get("set-cookie") as string]
      : [];
  for (const raw of setCookies) {
    const parts = raw.split(";").map((p) => p.trim());
    const [nameValue, ...attrs] = parts;
    const filtered = attrs.filter((a) => !a.toLowerCase().startsWith("domain=") && !a.toLowerCase().startsWith("path="));
    response.headers.append("Set-Cookie", [nameValue, "Path=/", ...filtered].join("; "));
  }

  return response;
}
