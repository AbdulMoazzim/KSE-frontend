import { envs } from "@/config/env";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const res = await fetch(`${envs.BACKEND_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": envs.API_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
  const errBody = await res.text();
  console.log(errBody)
  return Response.json({ error: errBody }, { status: res.status });
}

  const data = await res.json();
  return Response.json(data);
}