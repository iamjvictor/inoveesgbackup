import type { EmailEventType, EmailPayload, SendResult } from "./types.js";
import type { EmailService } from "./emailService.js";
import type { ClaimedEmail, EmailOutboxStore } from "./workerStore.js";

const MAX_ATTEMPTS = 5;
const MAX_BACKOFF_SECONDS = 6 * 60 * 60;

export type EmailWorkerOptions = {
  enabled: boolean;
  batchSize?: number;
  leaseSeconds?: number;
  maxAttempts?: number;
};

export function isTransientEmailError(error: unknown): boolean {
  const candidate = error as { name?: string; code?: string; $metadata?: { httpStatusCode?: number } };
  const status = candidate?.$metadata?.httpStatusCode;
  if (status === 429 || (status !== undefined && status >= 500)) return true;
  const code = `${candidate?.name ?? ""} ${candidate?.code ?? ""}`.toLowerCase();
  return /throttl|timeout|temporar|serviceunavailable|requesttimeout|slowdown|econnreset|etimedout|network/.test(code);
}

function serializeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

function parseEvent(row: ClaimedEmail): { eventType: EmailEventType; payload: EmailPayload } {
  if (!["WELCOME", "DIAGNOSTIC_COMPLETED", "PURCHASE_CONFIRMED", "PURCHASE_FAILED"].includes(row.eventType)) {
    throw new Error(`Tipo de evento de e-mail inválido: ${row.eventType}`);
  }
  if (typeof row.payload !== "object" || row.payload === null || Array.isArray(row.payload)) {
    throw new Error("Payload de e-mail inválido");
  }
  const payload = row.payload as Record<string, unknown>;
  if (typeof payload.name !== "string") throw new Error("Payload de e-mail sem nome válido");
  if (payload.diagnosticKind !== undefined && typeof payload.diagnosticKind !== "string") throw new Error("Tipo de diagnóstico inválido no payload de e-mail");
  if (payload.serviceNames !== undefined && (!Array.isArray(payload.serviceNames) || payload.serviceNames.some((name) => typeof name !== "string"))) throw new Error("Serviços inválidos no payload de e-mail");
  return { eventType: row.eventType as EmailEventType, payload: { name: payload.name, diagnosticKind: payload.diagnosticKind as string | undefined, serviceNames: payload.serviceNames as string[] | undefined, amountCents: typeof payload.amountCents === "number" ? payload.amountCents : undefined, paymentStatus: payload.paymentStatus as "PAID" | "FAILED" | "CANCELED" | undefined } };
}

export class EmailWorker {
  private readonly batchSize: number;
  private readonly leaseSeconds: number;
  private readonly maxAttempts: number;

  constructor(
    private readonly store: EmailOutboxStore,
    private readonly emailService: EmailService,
    private readonly options: EmailWorkerOptions,
  ) {
    this.batchSize = options.batchSize ?? 20;
    this.leaseSeconds = options.leaseSeconds ?? 60;
    this.maxAttempts = options.maxAttempts ?? MAX_ATTEMPTS;
  }

  async runOnce(): Promise<number> {
    if (!this.options.enabled) return 0;
    const claimed = await this.store.claim(this.batchSize, this.leaseSeconds, this.maxAttempts);
    await Promise.all(claimed.map((row) => this.process(row)));
    return claimed.length;
  }

  private async process(row: ClaimedEmail): Promise<void> {
    if (row.attempts >= this.maxAttempts) {
      await this.store.fail(row.id, row.leaseToken, "Limite de tentativas excedido");
      return;
    }
    try {
      const { eventType, payload } = parseEvent(row);
      const result: SendResult = await this.emailService.sendEvent(eventType, row.recipient, payload);
      await this.store.accept(row.id, row.leaseToken, result.providerMessageId);
    } catch (error) {
      const message = serializeError(error);
      if (row.attempts >= this.maxAttempts || !isTransientEmailError(error)) {
        await this.store.fail(row.id, row.leaseToken, message);
        return;
      }
      const delay = Math.min(30 * (2 ** Math.max(0, row.attempts - 1)), MAX_BACKOFF_SECONDS);
      await this.store.retry(row.id, row.leaseToken, delay, message);
    }
  }
}
