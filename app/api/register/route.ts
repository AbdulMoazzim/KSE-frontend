import { envs } from "@/config/env";
import { logger, newRequestId } from "@/lib/logger";

/** Same allowlist approach as lib/route-helpers.ts — only forward backend
 *  text to the client if it looks like a short, deliberate product
 *  message rather than an internal error leaking through. */
function looksSafeToForward(message: string): boolean {
  if (!message || message.length > 300) return false;
  const suspicious = /(traceback|at\s+\S+\.(py|ts|js):\d|\/(home|usr|app|var)\/|exception|stack|sql|password|secret|token|api[_-]?key)/i;
  return !suspicious.test(message);
}

export async function POST(req: Request) {
  const requestId = newRequestId();
  const startedAt = Date.now();
  const { email, password, company_name } = await req.json();

  let res: Response;
  try {
    res = await fetch(`${envs.BACKEND_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": envs.API_KEY,
      },
      body: JSON.stringify({ email, password, company_name }),
    });
  } catch (networkErr) {
    logger.error("register_network_error", {
      requestId,
      durationMs: Date.now() - startedAt,
      error: networkErr instanceof Error ? networkErr.message : String(networkErr),
    });
    return Response.json(
      { error: `Something went wrong. Please try again. (ref: ${requestId})` },
      { status: 502 }
    );
  }

  const durationMs = Date.now() - startedAt;

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    let detail = errBody;
    try {
      const parsed = JSON.parse(errBody);
      detail = typeof parsed?.detail === "string" ? parsed.detail : errBody;
    } catch {
      // not JSON — use raw text
    }

    logger.warn("register_failed", {
      requestId,
      email, // audit trail; never log the password
      status: res.status,
      durationMs,
      detail,
    });

    // Retail signup is gated behind RETAIL_SIGNUP_ENABLED server-side and
    // returns 403 with a short, deliberate "signup disabled" message —
    // that one's safe and useful to show as-is. Everything else gets a
    // generic message so backend internals never reach the browser.
    if (res.status === 403 && looksSafeToForward(detail)) {
      return Response.json({ error: detail }, { status: 403 });
    }
    if (res.status === 409) {
      return Response.json({ error: "An account with that email already exists." }, { status: 409 });
    }
    if (res.status === 422 && looksSafeToForward(detail)) {
      return Response.json({ error: detail }, { status: 422 });
    }
    if (res.status >= 500) {
      return Response.json(
        { error: `Something went wrong. Please try again. (ref: ${requestId})` },
        { status: 502 }
      );
    }
    return Response.json(
      { error: `We couldn't create that account. Please check your details and try again. (ref: ${requestId})` },
      { status: res.status }
    );
  }

  const data = await res.json();
  logger.info("register_succeeded", { requestId, durationMs });
  return Response.json(data);
}
