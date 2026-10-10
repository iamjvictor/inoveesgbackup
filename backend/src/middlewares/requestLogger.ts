import type { Request, Response, NextFunction } from "express";

export function requestLogger(request: Request, response: Response, next: NextFunction) {
  const start = Date.now();
  const { method, url } = request;

  response.on("finish", () => {
    const duration = Date.now() - start;
    const status = response.statusCode;
    const level = duration > 500 ? "⚠ SLOW" : duration > 200 ? "⟳" : "✓";
    console.log(`[HTTP] ${level} ${method} ${url} → ${status} (${duration}ms)`);
  });

  next();
}
