import { envs } from "@/config/env";

/** Same allowlist approach as lib/route-helpers.ts — only forward backend
 *  text to the client if it looks like a short, deliberate product
 *  message rather than an internal error leaking through. */
function looksSafeToForward(message: string): boolean {
  if (!message || message.length > 300) return false;
  const suspicious = /(traceback|at\s+\S+\.(py|ts|js):\d|\/(home|usr|app|var)\/|exception|stack|sql|password|secret|token|api[_-]?key)/i;
  return !suspicious.test(message);
}

/**
 * POST /api/v1/auth/institutional/register — public self-service signup
 * for institutional prospects. Creates a tenant in PENDING_REVIEW with no
 * access granted until a super_admin approves it; the user is created
 * with email_verified=False. Requires `tier` (which tier they're
 * requesting) alongside the usual email/password/company_name.
 *
 * This replaced the older gated /auth/register (retail) endpoint for our
 * "Request institutional access" flow — that endpoint created a
 * role=viewer retail tenant behind a feature flag, which was never the
 * right fit for this page's actual copy/intent.
 */
export async function POST(req: Request) {
  const { email, password, company_name, tier } = await req.json();

  let res: Response;
  try {
    res = await fetch(`${envs.BACKEND_BASE_URL}/auth/institutional/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": envs.API_KEY,
      },
      body: JSON.stringify({ email, password, company_name, tier }),
    });
  } catch {
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    let detail = errBody;
    try {
      const parsed = JSON.parse(errBody);
      detail = typeof parsed?.detail === "string" ? parsed.detail : errBody;
    } catch {
      // not JSON — use raw text
    }

    if (res.status === 409) {
      return Response.json({ error: "An account with that email already exists." }, { status: 409 });
    }
    if (res.status === 403 && looksSafeToForward(detail)) {
      // e.g. the one-trial-per-IP anti-abuse block
      return Response.json({ error: detail }, { status: 403 });
    }
    if (res.status === 422 && looksSafeToForward(detail)) {
      return Response.json({ error: detail }, { status: 422 });
    }
    if (res.status >= 500) {
      return Response.json({ error: "Something went wrong. Please try again." }, { status: 502 });
    }
    return Response.json(
      { error: "We couldn't submit that request. Please check your details and try again." },
      { status: res.status }
    );
  }

  const data = await res.json();
  return Response.json(data);
}
