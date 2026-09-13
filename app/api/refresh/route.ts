import { NextRequest, NextResponse } from "next/server";
import { envs } from "@/config/env";

/**
 * See the comment in app/api/login/route.ts — this relies on the refresh
 * cookie the login route rehosted onto our own origin.
 */
export async function POST(req: NextRequest) {
  let backendRes: Response;
  try {
    backendRes = await fetch(`${envs.BACKEND_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "X-API-Key": envs.API_KEY,
        Cookie: req.headers.get("cookie") ?? "",
      },
    });
  } catch {
    return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 502 });
  }

  if (!backendRes.ok) {
    return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: backendRes.status });
  }

  const data = await backendRes.json();
  const response = NextResponse.json(data);

  const setCookies =
    typeof backendRes.headers.getSetCookie === "function"
      ? backendRes.headers.getSetCookie()
      : backendRes.headers.get("set-cookie")
      ? [backendRes.headers.get("set-cookie") as string]
      : [];
  for (const raw of setCookies) {
    const parts = raw.split(";").map((p) => p.trim());
    const [nameValue, ...attrs] = parts;
    const filtered = attrs.filter((a) => !a.toLowerCase().startsWith("domain=") && !a.toLowerCase().startsWith("path="));
    response.headers.append("Set-Cookie", [nameValue, "Path=/", ...filtered].join("; "));
  }

  return response;
}
