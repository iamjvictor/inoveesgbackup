import assert from "node:assert/strict";
import test from "node:test";

import { getAdminCookieOptions, getAuthClearCookieOptions, readAuthToken } from "./authSession.js";

test("admin session cookie is HttpOnly and secure in production", () => {
  assert.deepEqual(getAdminCookieOptions(true), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
    path: "/",
  });
});

test("auth token prefers Authorization header and falls back to session cookie", () => {
  assert.equal(
    readAuthToken({ headers: { authorization: "Bearer header-token" }, headersRaw: "" }),
    "header-token",
  );
  assert.equal(
    readAuthToken({ headers: { cookie: "inoveesg_token=cookie-token; other=value" } }),
    "cookie-token",
  );
});

test("auth cookie clearing options omit maxAge", () => {
  assert.deepEqual(getAuthClearCookieOptions(), { path: "/" });
});
