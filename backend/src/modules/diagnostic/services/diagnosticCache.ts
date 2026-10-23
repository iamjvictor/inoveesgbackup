import { cache } from "../../../lib/cache.js";

export async function invalidateCurrentDiagnosticCache(organizationId: string): Promise<void> {
  const key = `diagnostic:current:${organizationId}`;
  await Promise.all([
    cache.delete(key),
    cache.delete(`${key}:PRE_DIAGNOSTIC,FULL_DIAGNOSTIC`),
    cache.delete(`${key}:FULL_DIAGNOSTIC`),
  ]);
}
