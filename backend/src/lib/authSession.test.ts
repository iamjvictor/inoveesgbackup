import assert from "node:assert/strict";
import test from "node:test";

import { AUTH_MODE_COOKIE_NAME, getAdminCookieOptions, getAuthClearCookieOptions, readAuthMode, readAuthToken } from "./authSession.js";

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

test("auth mode defaults to client and reads the HttpOnly mode cookie value", () => {
  assert.equal(readAuthMode({ headers: {} }), "client");
  assert.equal(readAuthMode({ headers: { cookie: `${AUTH_MODE_COOKIE_NAME}=admin` } }), "admin");
  assert.equal(readAuthMode({ headers: { cookie: `${AUTH_MODE_COOKIE_NAME}=client` } }), "client");
});
