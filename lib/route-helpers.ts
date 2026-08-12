import { NextResponse } from "next/server";
import { BackendError } from "./api-server";

export function handleBackendError(err: unknown) {
  if (err instanceof BackendError) {
    // 401/403 from upstream almost always means the server's own API key
    // is missing/wrong — not something the signed-in user did.
    if (err.status === 401 || err.status === 403) {
      console.log(err)
      return NextResponse.json(
        { error: "The dashboard couldn't authenticate with the trading engine. Please contact an admin." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json(
    { error: "We couldn't reach the trading engine right now. Please try again in a moment." },
    { status: 502 }
  );
}
