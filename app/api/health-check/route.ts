import { envs } from "@/config/env";
import { NextResponse } from "next/server";

export async function GET() {
  let response: Response;
  try {
    response = await fetch(`${envs.BACKEND_BASE_URL}/sentinel/health`);
  } catch {
    return NextResponse.json({ error: "Server Down" }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json({ error: "Server Down" }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
