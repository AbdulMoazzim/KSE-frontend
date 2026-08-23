import { NextResponse } from "next/server";
import { BackendError } from "./api-server";
import { logger, newRequestId } from "./logger";

/**
 * A short list of validation phrases FastAPI/Pydantic commonly send in a
 * 422 `detail` that are safe and genuinely useful to show a user filling
 * out a form (e.g. "field required", "value is not a valid email
 * address"). Anything that doesn't look like one of these — a stack
 * trace, a file path, a SQL fragment, an internal exception name — is
 * replaced with a generic message instead of forwarded verbatim.
 */
function looksLikeSafeValidationMessage(message: string): boolean {
  if (message.length > 300) return false;
  const suspicious = /(traceback|at\s+\S+\.(py|ts|js):\d|\/(home|usr|app|var)\/|exception|stack|sql|password|secret|token|api[_-]?key)/i;
  return !suspicious.test(message);
}

/**
 * Turns an upstream failure into a short, generic response for the
 * browser. The real detail always goes to the server log (with a
 * requestId for correlation) — it never reaches the client directly,
 * so a probing client can't use our error responses to learn anything
 * about the backend's internals, stack, schema, or infrastructure.
 */
export function handleBackendError(err: unknown) {
  if (err instanceof BackendError) {
    const ref = `(ref: ${err.requestId})`;

    // 401/403 from upstream almost always means the server's own API key
    // is missing/wrong — not something the signed-in user did.
    if (err.status === 401 || err.status === 403) {
      return NextResponse.json(
        { error: `The dashboard couldn't authenticate with the trading engine. Please contact an admin. ${ref}` },
        { status: 502 }
      );
    }
    if (err.status === 422) {
      const safe = looksLikeSafeValidationMessage(err.message);
      return NextResponse.json(
        {
          error: safe
            ? err.message
            : `That request was missing something the trading engine needs. ${ref}`,
        },
        { status: 422 }
      );
    }
    if (err.status === 404) {
      return NextResponse.json({ error: `We couldn't find that.` }, { status: 404 });
    }
    if (err.status === 429) {
      return NextResponse.json(
        { error: "Too many requests — please slow down and try again shortly." },
        { status: 429 }
      );
    }
    if (err.status >= 500) {
      return NextResponse.json(
        { error: `The trading engine hit a problem on its end. Please try again in a moment. ${ref}` },
        { status: 502 }
      );
    }
    // Any other 4xx: don't forward upstream text verbatim.
    return NextResponse.json(
      { error: `That request couldn't be completed. ${ref}` },
      { status: err.status }
    );
  }

  const requestId = newRequestId();
  logger.error("route_handler_unhandled_error", {
    requestId,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  return NextResponse.json(
    { error: `We couldn't reach the trading engine right now. Please try again in a moment. (ref: ${requestId})` },
    { status: 502 }
  );
}
