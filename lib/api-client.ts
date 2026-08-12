export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.error === "string") return body.error;
  } catch {
    // response wasn't JSON — fall through to the generic message
  }
  return `Something went wrong (${res.status}). Please try again.`;
}

/** GET one of our own /api/... routes. Never call the KSE Sentinel backend directly from the browser. */
export async function apiGet<T = unknown>(path: string, headers?: HeadersInit): Promise<T> {
  console.log("Hitting api endpont")
  console.log("headersdasdasd",headers)
  const res = await fetch(path, { cache: "no-store", headers });
  if (!res.ok) throw new ApiError(await readError(res), res.status);
  return res.json();
}

/** POST to one of our own /api/... routes. */
export async function apiPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new ApiError(await readError(res), res.status);
  return res.json();
}
