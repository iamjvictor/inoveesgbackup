import type { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

type RateLimiterOptions = {
  maxRequests: number;
  windowMs: number;
  now?: () => number;
};

export function createRateLimiter({ maxRequests, windowMs, now = Date.now }: RateLimiterOptions) {
  const requests = new Map<string, { count: number; windowStartedAt: number }>();

  return (key: string): boolean => {
    const currentTime = now();
    const current = requests.get(key);

    if (!current || currentTime - current.windowStartedAt >= windowMs) {
      requests.set(key, { count: 1, windowStartedAt: currentTime });
      return true;
    }

    if (current.count >= maxRequests) {
      return false;
    }

    current.count += 1;
    return true;
  };
}

const allowKeepaliveRequest = createRateLimiter({
  maxRequests: 10,
  windowMs: 60_000,
});

export function keepaliveRateLimit(request: Request, response: Response, next: NextFunction) {
  if (!allowKeepaliveRequest(request.ip ?? "unknown")) {
    response.setHeader("Retry-After", "60");
    return response.status(429).json({ ok: false, error: "Too many requests" });
  }

  return next();
}

export async function keepalive(request: Request, response: Response) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return response.json({ ok: true });
  } catch (error) {
    console.error("[keepalive] Database probe failed:", error);
    return response.status(503).json({ ok: false });
  }
}
