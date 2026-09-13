import { NextResponse } from "next/server";
import { envs } from "@/config/env";
import { extractTenantId, TENANT_COOKIE } from "@/lib/tenant";

/**
 * Strips the backend's own Domain attribute (which points at
 * kse-sentinel-backend-docker.onrender.com and would be silently rejected
 * by the browser on our own origin) and re-issues everything else as-is,
 * so the browser stores this cookie against *our* frontend origin instead.
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

/**
 * As of Aug 26 2026 the backend deliberately returns specific, actionable
 * text for account-state blocks — tenant status (PENDING_REVIEW / REJECTED
 * / SUSPENDED / TRIAL_EXPIRED, checked before the password) and
 * email-not-verified (checked after the password succeeds). Those are
 * meant to be shown as-is. Anything else — wrong password, unknown email,
 * a locked-out account — stays a single generic message, so a 401 never
 * lets a caller tell "wrong password" apart from "no such account" and
 * enumerate real emails.
 *
 * The exact wording wasn't confirmed against a live response (the Swagger
 * export doesn't show real example text), so this matches by the state
 * keywords the backend's own docs use. If the real message text doesn't
 * contain these, extend the list rather than assume the message layout.
 */
function isAccountStateMessage(detail: string): boolean {
  const stateKeywords =
    /pending.?review|rejected|suspended|trial.?expired|trial has expired|verify.?your.?email|email.?not.?verified|email.?verification/i;
  return stateKeywords.test(detail);
}

export async function POST(req: Request) {
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
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }

  if (!backendRes.ok) {
    if (backendRes.status === 429) {
      return NextResponse.json(
        { error: "Too many sign-in attempts. Please wait a moment and try again." },
        { status: 429 }
      );
    }
    if (backendRes.status >= 500) {
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
    }

    const errBody = await backendRes.text().catch(() => "");
    let detail = "";
    try {
      const parsed = JSON.parse(errBody);
      detail = typeof parsed?.detail === "string" ? parsed.detail : "";
    } catch {
      // not JSON — treat as no usable detail
    }

    if (detail && isAccountStateMessage(detail)) {
      return NextResponse.json({ error: detail }, { status: backendRes.status });
    }

    // Wrong password / unknown email / locked account — deliberately generic.
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
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
