const RETRYABLE_DATABASE_CODES = new Set([
  "40001", // serialization failure
  "40P01", // deadlock detected
  "P2034", // Prisma transaction write conflict/deadlock
  "P1001", // database temporarily unreachable
  "P1002", // database connection timed out
  "P1017", // server closed the connection
  "P2024", // connection pool timeout
]);
const MAX_TRANSACTION_ATTEMPTS = 3;

function getDatabaseCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as { code?: unknown; meta?: { code?: unknown }; cause?: unknown };
  if (typeof candidate.code === "string") return candidate.code;
  if (typeof candidate.meta?.code === "string") return candidate.meta.code;
  return getDatabaseCode(candidate.cause);
}

export function isRetryableDiagnosticTransactionError(error: unknown): boolean {
  const code = getDatabaseCode(error);
  return code !== undefined && RETRYABLE_DATABASE_CODES.has(code);
}

export async function retryTransientDiagnosticTransaction<T>(
  operation: (attempt: number) => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: (attempt: number) => number;
    onRetry?: (error: unknown, failedAttempt: number) => void;
  } = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? MAX_TRANSACTION_ATTEMPTS;
  const delay = options.delay ?? ((attempt: number) => 50 * 2 ** (attempt - 1));

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      if (attempt >= maxAttempts || !isRetryableDiagnosticTransactionError(error)) throw error;
      options.onRetry?.(error, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay(attempt)));
    }
  }

  throw new Error("Transação do diagnóstico excedeu o limite de tentativas");
}
