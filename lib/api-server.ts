import { cookies } from "next/headers";
import { envs } from "@/config/env";
import { TENANT_COOKIE } from "./tenant";

/**
 * Thrown when the upstream KSE Sentinel API returns a non-2xx response.
 * Route handlers catch this and translate it into a clean JSON error
 * for the browser, without ever leaking the API key or raw backend URL.
 */
export class BackendError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

/**
 * Calls the KSE Sentinel backend from the server only. Never import this
 * from a "use client" component — the API key must never reach the browser.
 *
 * X-Tenant-ID is attached automatically from the kse_tenant_id cookie
 * (set by /api/login on a successful sign-in) unless the caller already
 * supplied one in `init.headers`.
 */
export async function backendFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get(TENANT_COOKIE)?.value;

  const headers: Record<string, string> = {
    "X-API-Key": envs.API_KEY,
    "Content-Type": "application/json",
    ...(tenantId ? { "X-Tenant-ID": tenantId } : {}),
    ...((init?.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${envs.BACKEND_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    let message = bodyText;
    try {
      const parsed = JSON.parse(bodyText);
      message = parsed?.detail ? formatDetail(parsed.detail) : bodyText;
    } catch {
      // response wasn't JSON — use the raw text as-is
    }
    throw new BackendError(message || `Backend request failed (${res.status})`, res.status);
  }

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
