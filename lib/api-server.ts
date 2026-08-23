import { cookies } from "next/headers";
import { envs } from "@/config/env";
import { TENANT_COOKIE } from "./tenant";
import { logger, newRequestId } from "./logger";

/**
 * Thrown when the upstream KSE Sentinel API returns a non-2xx response,
 * or when the request to it fails outright (network error, timeout).
 * Route handlers catch this and translate it into a short, generic JSON
 * error for the browser — the full detail (`message`) is for server
 * logs only and must never be sent to the client as-is. `requestId`
 * lets support correlate a user's bug report with the matching log line.
 */
export class BackendError extends Error {
  status: number;
  requestId: string;
  constructor(message: string, status: number, requestId: string) {
    super(message);
    this.name = "BackendError";
    this.status = status;
    this.requestId = requestId;
  }
}

/**
 * Calls the KSE Sentinel backend from the server only. Never import this
 * from a "use client" component — the API key must never reach the browser.
 *
 * X-Tenant-ID is attached automatically from the kse_tenant_id cookie
 * (set by /api/login on a successful sign-in) unless the caller already
 * supplied one in `init.headers`.
 *
 * Every call is logged (method, path, status, duration) with a short
 * requestId for correlation. Response bodies are never logged on success;
 * on failure the upstream detail is logged server-side only.
 */
export async function backendFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const requestId = newRequestId();
  const method = init?.method ?? "GET";
  const startedAt = Date.now();

  const cookieStore = await cookies();
  const tenantId = cookieStore.get(TENANT_COOKIE)?.value;

  const headers: Record<string, string> = {
    "X-API-Key": envs.API_KEY,
    "Content-Type": "application/json",
    ...(tenantId ? { "X-Tenant-ID": tenantId } : {}),
    ...((init?.headers as Record<string, string>) ?? {}),
  };

  let res: Response;
  try {
    res = await fetch(`${envs.BACKEND_BASE_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch (networkErr) {
    const durationMs = Date.now() - startedAt;
    logger.error("backend_request_network_error", {
      requestId,
      method,
      path,
      durationMs,
      error: networkErr instanceof Error ? networkErr.message : String(networkErr),
    });
    throw new BackendError("Could not reach the trading engine.", 502, requestId);
  }

  const durationMs = Date.now() - startedAt;

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    let message = bodyText;
    try {
      const parsed = JSON.parse(bodyText);
      message = parsed?.detail ? formatDetail(parsed.detail) : bodyText;
    } catch {
      // response wasn't JSON — use the raw text as-is
    }
    message = message || `Backend request failed (${res.status})`;

    logger.error("backend_request_failed", {
      requestId,
      method,
      path,
      status: res.status,
      durationMs,
      detail: message,
    });

    throw new BackendError(message, res.status, requestId);
  }

  logger.info("backend_request_complete", { requestId, method, path, status: res.status, durationMs });

  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** FastAPI 422s send `detail` as an array of validation errors, not a string. */
function formatDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => (typeof d === "object" && d && "msg" in d ? String((d as { msg: unknown }).msg) : JSON.stringify(d)))
      .join("; ");
  }
  return JSON.stringify(detail);
}
