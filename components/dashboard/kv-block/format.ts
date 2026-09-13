/** Turns a snake_case/backend field name into a readable label: "adv_percentile_252d" -> "Adv Percentile 252d". */
export function formatLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Formats a scalar value for display. Objects/arrays are handled by the caller, not here. */
export function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(4);
  return String(value);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** True for null/undefined/empty-array/empty-object — anywhere we'd otherwise render nothing useful. */
export function isEmptyData(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false;
}
