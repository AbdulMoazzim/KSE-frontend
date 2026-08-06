import { envs } from "@/config/env";

export async function POST(req: Request) {
  const { email, password, company_name } = await req.json();

  const res = await fetch(`${envs.BACKEND_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": envs.API_KEY,
    },
    body: JSON.stringify({ email, password,company_name }),
  });

  if (!res.ok) {
  const errBody = await res.text();
  console.log(errBody)
  return Response.json({ error: errBody }, { status: res.status });
}

  const data = await res.json();
  return Response.json(data);
}