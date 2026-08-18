import { NextRequest, NextResponse } from "next/server";
import { envs } from "@/config/env";

/**
 * See the comment in app/api/login/route.ts — this relies on the refresh
 * cookie the login route rehosted onto our own origin. Not verified
 * end-to-end against a live login (the exact backend cookie shape wasn't
 * confirmed), so treat this as a best-effort proxy and check the network
 * tab if refresh doesn't silently keep the session alive as expected.
 */
export async function POST(req: NextRequest) {
  const backendRes = await fetch(`${envs.BACKEND_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "X-API-Key": envs.API_KEY,
      Cookie: req.headers.get("cookie") ?? "",
    },
  });

  if (!backendRes.ok) {
    const text = await backendRes.text().catch(() => "");
    return NextResponse.json({ error: text || "Session expired. Please sign in again." }, { status: backendRes.status });
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
