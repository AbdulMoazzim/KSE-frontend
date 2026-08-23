import { NextResponse } from "next/server";
import { envs } from "@/config/env";
import { extractTenantId, TENANT_COOKIE } from "@/lib/tenant";
import { logger, newRequestId } from "@/lib/logger";

/**
 * Strips the backend's own Domain attribute (which points at
 * kse-sentinel-backend-docker.onrender.com and would be silently rejected
 * by the browser on our own origin) and re-issues everything else as-is,
 * so the browser stores this cookie against *our* frontend origin instead.
 *
 * NOTE: not verified against a live login response — the exact cookie name
 * and attributes the backend sends weren't confirmed. If the refresh flow
 * doesn't work end-to-end, start by logging the raw `set-cookie` header
 * here to confirm the shape.
 */
function rehostCookie(rawSetCookie: string): string {
  const parts = rawSetCookie.split(";").map((p) => p.trim());
  const [nameValue, ...attrs] = parts;
  const filtered = attrs.filter((a) => {
    const lower = a.toLowerCase();
    return !lower.startsWith("domain=") && !lower.startsWith("path=");
  });
  return [nameValue, "Path=/", ...filtered].join("; ");
}

export async function POST(req: Request) {
  const requestId = newRequestId();
  const startedAt = Date.now();
  const { email, password } = await req.json();

  let backendRes: Response;
  try {
    backendRes = await fetch(`${envs.BACKEND_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": envs.API_KEY,
      },
      body: JSON.stringify({ email, password }),
    });
  } catch (networkErr) {
    logger.error("login_network_error", {
      requestId,
      durationMs: Date.now() - startedAt,
      error: networkErr instanceof Error ? networkErr.message : String(networkErr),
    });
    return NextResponse.json(
      { error: `Something went wrong. Please try again. (ref: ${requestId})` },
      { status: 502 }
    );
  }

  const durationMs = Date.now() - startedAt;

  if (!backendRes.ok) {
    // Log the real reason (wrong password vs. unknown email vs. locked
    // account, whatever the backend says) server-side only. The browser
    // always gets the same generic message regardless of status, on
    // purpose — distinguishing "no such user" from "wrong password" is
    // exactly what lets an attacker enumerate valid accounts.
    const errBody = await backendRes.text().catch(() => "");
    logger.warn("login_failed", {
      requestId,
      email, // audit trail of the attempted email; never log the password
      status: backendRes.status,
      durationMs,
      detail: errBody,
    });

    if (backendRes.status === 429) {
      return NextResponse.json(
        { error: "Too many sign-in attempts. Please wait a moment and try again." },
        { status: 429 }
      );
    }
    if (backendRes.status >= 500) {
      return NextResponse.json(
        { error: `Something went wrong. Please try again. (ref: ${requestId})` },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const data = await backendRes.json();
  logger.info("login_succeeded", { requestId, durationMs });
  const response = NextResponse.json(data);

  // Forward the backend's refresh-token cookie(s), rehosted onto our own origin.
  const setCookies =
    typeof backendRes.headers.getSetCookie === "function"
      ? backendRes.headers.getSetCookie()
      : backendRes.headers.get("set-cookie")
      ? [backendRes.headers.get("set-cookie") as string]
      : [];
  for (const raw of setCookies) {
    response.headers.append("Set-Cookie", rehostCookie(raw));
  }

  // Remember the tenant id for every subsequent backendFetch call this session.
  const tenantId = extractTenantId(data);
  if (tenantId) {
    response.cookies.set(TENANT_COOKIE, tenantId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return response;
}
