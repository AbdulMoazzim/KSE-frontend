import { envs } from "@/config/env";

export async function POST(req: Request) {
  const { email, password, company_name } = await req.json();

  const res = await fetch(`${envs.BACKEND_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": envs.API_KEY,
    },
    body: JSON.stringify({ email, password, company_name }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    let message = errBody;
    try {
      const parsed = JSON.parse(errBody);
      // Retail signup is gated behind RETAIL_SIGNUP_ENABLED server-side and
      // returns 403 with a clear message when disabled — surface it as-is.
      message = typeof parsed?.detail === "string" ? parsed.detail : errBody;
    } catch {
      // not JSON — use raw text
    }
    return Response.json({ error: message || "Registration failed." }, { status: res.status });
  }

  const data = await res.json();
  return Response.json(data);
}
