import { envs } from "@/config/env";

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
  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

/**
 * Calls the KSE Sentinel backend from the server only. Never import this
 * from a "use client" component — the API key must never reach the browser.
 */
export async function backendFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {

  // FormData bodies (docintel/submit) need fetch to set its own
  // multipart boundary — forcing application/json here would break the upload.
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;

  const headers: Record<string, string> = {
    "X-API-Key": envs.API_KEY,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...((init?.headers as Record<string, string>) ?? {}),
  };

  let res: Response;
  try {
    res = await fetch(`${envs.BACKEND_BASE_URL}${path}`, {
      ...init,
      headers
    });
  } catch (networkErr) {

    throw new BackendError("Could not reach the trading engine.", 502);
  }


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



    throw new BackendError(message, res.status);
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
