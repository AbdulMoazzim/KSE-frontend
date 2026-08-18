import { NextResponse } from "next/server";
import { envs } from "@/config/env";
import { extractTenantId, TENANT_COOKIE } from "@/lib/tenant";

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
  const { email, password } = await req.json();

  const backendRes = await fetch(`${envs.BACKEND_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": envs.API_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!backendRes.ok) {
    const errBody = await backendRes.text();
    let message = errBody;
    try {
      const parsed = JSON.parse(errBody);
      message = typeof parsed?.detail === "string" ? parsed.detail : errBody;
    } catch {
      // not JSON — use raw text
    }
    return NextResponse.json({ error: message || "Sign-in failed." }, { status: backendRes.status });
  }

  const data = await backendRes.json();
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
