/**
 * Minimal structured logger for server-side (route handler / lib) code
 * only. Never import this from a "use client" component.
 *
 * Emits one JSON line per call so it's easy to grep or ship to a log
 * aggregator (Render/Vercel/etc. all capture stdout/stderr as-is). This
 * is deliberately the ONLY place that should ever see full upstream
 * error detail, request bodies, or backend response text — route
 * handlers log here, then send a short, generic message to the browser.
 * Never pass API keys, passwords, or full cookie headers into `meta`.
 */

type LogMeta = Record<string, unknown>;
type Level = "info" | "warn" | "error";

function emit(level: Level, message: string, meta?: LogMeta) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, meta?: LogMeta) => emit("info", message, meta),
  warn: (message: string, meta?: LogMeta) => emit("warn", message, meta),
  error: (message: string, meta?: LogMeta) => emit("error", message, meta),
};

/** Short, log-friendly correlation id. Safe to show to users as "(ref: xxxxxxxx)". */
export function newRequestId(): string {
  return crypto.randomUUID().split("-")[0];
}
