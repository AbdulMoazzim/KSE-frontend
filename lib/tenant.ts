/** Name of the httpOnly cookie that remembers which tenant a signed-in user belongs to. */
export const TENANT_COOKIE = "kse_tenant_id";

/**
 * Pulls the tenant id out of a /auth/login response. Tries the shapes the
 * backend is known to use, falls back to null if none match (the caller
 * just won't set the cookie, which only affects auto-attaching
 * X-Tenant-ID on later requests — login itself still succeeds).
 */
export function extractTenantId(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;
  const record = data as Record<string, unknown>;

  const direct = record.tenant_id ?? record.tenantId;
  if (direct !== undefined && direct !== null) return String(direct);

  const tenant = record.tenant;
  if (typeof tenant === "object" && tenant !== null) {
    const id = (tenant as Record<string, unknown>).id;
    if (id !== undefined && id !== null) return String(id);
  }

  const user = record.user;
  if (typeof user === "object" && user !== null) {
    const id = (user as Record<string, unknown>).tenant_id;
    if (id !== undefined && id !== null) return String(id);
  }

  return null;
}
