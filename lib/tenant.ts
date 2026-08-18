/** Name of the cookie that carries the signed-in user's tenant id to every backend call. */
export const TENANT_COOKIE = "kse_tenant_id";

/**
 * The exact field name for tenant id in the login/register response wasn't
 * pinned down against the live schema (the Swagger export only shows a
 * generic "string" example, not the real response model). This tries a
 * short list of likely candidates — snake_case first, since the backend is
 * FastAPI — including one level of nesting under `user` / `tenant`.
 *
 * If none match, sign-in still succeeds; every backend call will just go
 * out without X-Tenant-ID, and the backend will (correctly) reject
 * tenant-scoped endpoints with a clear error until this is confirmed.
 */
export function extractTenantId(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const record = payload as Record<string, unknown>;

  const direct = [
    "tenant_id",
    "tenantId",
    "X-Tenant-ID",
    "x_tenant_id",
  ];
  for (const key of direct) {
    const value = record[key];
    if (value !== undefined && value !== null) return String(value);
  }

  for (const wrapperKey of ["user", "tenant", "data"]) {
    const wrapper = record[wrapperKey];
    if (typeof wrapper === "object" && wrapper !== null) {
      const nested = wrapper as Record<string, unknown>;
      for (const key of ["tenant_id", "tenantId", "id"]) {
        const value = nested[key];
        if (value !== undefined && value !== null) return String(value);
      }
    }
  }

  return null;
}
