import type { Request } from "express";

export const AUTH_COOKIE_NAME = "inoveesg_token";
const SESSION_MAX_AGE_MS = 60 * 60 * 1000;

export function getAdminCookieOptions(isProduction = process.env.NODE_ENV === "production") {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE_MS,
    path: "/",
  };
}

export function getAuthClearCookieOptions() {
  return { path: "/" };
}

function readCookie(rawCookieHeader: string | undefined, name: string) {
  const item = rawCookieHeader?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : undefined;
}

export function readAuthToken(request: Pick<Request, "headers"> & { headersRaw?: string }) {
  const authorization = request.headers.authorization;
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7).trim() || undefined;
  return readCookie(request.headers.cookie ?? request.headersRaw, AUTH_COOKIE_NAME);
}
