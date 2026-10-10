import { Request, Response, NextFunction } from "express";
import { supabaseAuthClient } from "../lib/supabase.js";
import { cache } from "../lib/cache.js";
import { readAuthToken } from "../lib/authSession.js";

const tokenValidationPromises = new Map<string, Promise<string>>();
const MAX_TOKEN_CACHE_TTL_MS = 30 * 60 * 1000;

function getTokenCacheTtlMs(token: string) {
  const [, payload] = token.split(".");
  if (!payload) {
    return 5 * 60 * 1000;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(Buffer.from(normalizedPayload, "base64").toString("utf8")) as { exp?: number };
    if (!decoded.exp) {
      return 5 * 60 * 1000;
    }

    const expiresInMs = decoded.exp * 1000 - Date.now() - 30_000;
    return Math.max(30_000, Math.min(expiresInMs, MAX_TOKEN_CACHE_TTL_MS));
  } catch {
    return 5 * 60 * 1000;
  }
}

async function validateToken(token: string) {
  const inFlightValidation = tokenValidationPromises.get(token);
  if (inFlightValidation) {
    return inFlightValidation;
  }

  const validation = (async () => {
    const t0 = Date.now();
    const { data: { user }, error } = await supabaseAuthClient.auth.getUser(token);
    console.log(`[authMiddleware] Supabase token validation → ${Date.now() - t0}ms`);

    if (error || !user) {
      console.warn(`[authMiddleware] Supabase getUser failed:`, error?.message ?? "No user object returned");
      throw new Error("Invalid token");
    }

    await cache.set(`auth:token:${token}`, user.id, getTokenCacheTtlMs(token));
    return user.id;
  })();

  tokenValidationPromises.set(token, validation);
  void validation.finally(() => tokenValidationPromises.delete(token)).catch(() => undefined);

  return validation;
}

export async function authMiddleware(request: Request, response: Response, next: NextFunction) {
  const token = readAuthToken(request);

  if (!token) {
    console.warn(`[authMiddleware] No auth header provided for ${request.method} ${request.originalUrl}`);
    return response.status(401).json({ message: "No token provided" });
  }

  // Fast path: cached validation
  const cacheKey = `auth:token:${token}`;
  const cachedUserId = await cache.get<string>(cacheKey);
  if (cachedUserId) {
    (request as any).user = { id: cachedUserId };
    return next();
  }

  try {
    const userId = await validateToken(token);
    (request as any).user = { id: userId };

    return next();
  } catch (err) {
    console.warn(`[authMiddleware] Auth failed for ${request.method} ${request.originalUrl}:`, err instanceof Error ? err.message : err);
    return response.status(401).json({ message: "Authentication failed" });
  }
}
