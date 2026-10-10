type PrismaLikeError = {
  code?: unknown;
  message?: unknown;
};

export function isDatabaseUnavailableError(error: unknown): boolean {
  const candidate = (error ?? {}) as PrismaLikeError;
  const code = typeof candidate.code === "string" ? candidate.code : "";
  const message = typeof candidate.message === "string" ? candidate.message.toLowerCase() : "";

  return ["P1001", "P1002", "P2024"].includes(code) || [
    "can't reach database server",
    "cannot reach database server",
    "timed out fetching a new connection",
    "connection refused",
    "connection reset",
    "econnrefused",
    "etimedout",
  ].some((fragment) => message.includes(fragment));
}

export function getDatabaseErrorStatusCode(error: unknown): 400 | 503 {
  return isDatabaseUnavailableError(error) ? 503 : 400;
}

export function getDatabaseErrorPayload(error: unknown, fallbackMessage: string) {
  const unavailable = isDatabaseUnavailableError(error);

  return {
    ...(unavailable ? { code: "DATABASE_UNAVAILABLE" } : {}),
    message: unavailable
      ? "O serviço está temporariamente indisponível. Tente novamente em instantes."
      : error instanceof Error
        ? error.message
        : fallbackMessage,
  };
}
