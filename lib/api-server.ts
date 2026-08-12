import { envs } from "@/config/env";

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

export async function backendFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${envs.BACKEND_BASE_URL}${path}`, {
    ...init,
    headers: {
      "X-API-Key": envs.API_KEY,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const bodyText = await res.json().catch(() => "");
    let message = bodyText;
    try {
      const parsed = JSON.parse(bodyText);
      message = parsed?.detail ? String(parsed.detail) : bodyText;
      console.log(message)
    } catch {
      // response wasn't JSON — use the raw text as-is
    }
    throw new BackendError(message || `Backend request failed (${res.status})`, res.status);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}
