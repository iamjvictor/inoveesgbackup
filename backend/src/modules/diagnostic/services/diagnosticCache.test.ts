import test from "node:test";
import assert from "node:assert/strict";
import { cache } from "../../../lib/cache.js";
import { invalidateCurrentDiagnosticCache } from "./diagnosticCache.js";

test("invalidates every current-diagnostic cache variant for an organization", async () => {
  const organizationId = "cache-test-organization";
  const keys = [
    `diagnostic:current:${organizationId}`,
    `diagnostic:current:${organizationId}:PRE_DIAGNOSTIC,FULL_DIAGNOSTIC`,
    `diagnostic:current:${organizationId}:FULL_DIAGNOSTIC`,
  ];

  await Promise.all(keys.map((key) => cache.set(key, { cached: true })));

  await invalidateCurrentDiagnosticCache(organizationId);

  assert.deepEqual(await Promise.all(keys.map((key) => cache.get(key))), [undefined, undefined, undefined]);
});
