import assert from "node:assert/strict";
import test from "node:test";

import { createRateLimiter } from "./keepalive.js";

test("rate limiter permite o limite configurado e bloqueia excesso por IP", () => {
  let now = 1_000;
  const limiter = createRateLimiter({
    maxRequests: 2,
    windowMs: 60_000,
    now: () => now,
  });

  assert.equal(limiter("203.0.113.10"), true);
  assert.equal(limiter("203.0.113.10"), true);
  assert.equal(limiter("203.0.113.10"), false);
  assert.equal(limiter("203.0.113.11"), true);

  now += 60_001;
  assert.equal(limiter("203.0.113.10"), true);
});
