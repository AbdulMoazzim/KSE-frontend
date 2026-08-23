import { envs } from "@/config/env";
import { NextResponse } from "next/server";
import { logger, newRequestId } from "@/lib/logger";

export async function GET() {
  const requestId = newRequestId();
  const startedAt = Date.now();

  let response: Response;
  try {
    response = await fetch(`${envs.BACKEND_BASE_URL}/sentinel/health`);
  } catch (networkErr) {
    logger.error("health_check_network_error", {
      requestId,
      durationMs: Date.now() - startedAt,
      error: networkErr instanceof Error ? networkErr.message : String(networkErr),
    });
    return NextResponse.json({ error: "Server Down" }, { status: 502 });
  }

  const durationMs = Date.now() - startedAt;

  if (!response.ok) {
    logger.warn("health_check_failed", { requestId, status: response.status, durationMs });
    return NextResponse.json({ error: "Server Down" }, { status: response.status });
  }

  logger.info("health_check_ok", { requestId, durationMs });
  const data = await response.json();
  return NextResponse.json(data);
}
