import { setTimeout as delay } from "node:timers/promises";
import { env } from "../config/env.js";
import { EmailService } from "../modules/email/emailService.js";
import { SesEmailAdapter } from "../modules/email/sesEmailAdapter.js";
import { EmailWorker } from "../modules/email/worker.js";
import { PrismaEmailOutboxStore } from "../modules/email/workerStore.js";
import { prisma } from "../lib/prisma.js";

const pollIntervalMs = Number(process.env.EMAIL_WORKER_POLL_MS ?? 5_000);
if (!Number.isFinite(pollIntervalMs) || pollIntervalMs < 250) throw new Error("EMAIL_WORKER_POLL_MS deve ser pelo menos 250ms");

const provider = env.email.enabled
  ? new SesEmailAdapter({ region: env.email.awsRegion })
  : { send: async () => { throw new Error("Envio desabilitado"); } };
const service = new EmailService(provider, {
  enabled: env.email.enabled,
  from: env.email.from,
  appUrl: env.frontendUrl,
  contactEmail: env.email.contactEmail,
});
const worker = new EmailWorker(new PrismaEmailOutboxStore(), service, { enabled: env.email.enabled });

let stopping = false;
process.on("SIGINT", () => { stopping = true; });
process.on("SIGTERM", () => { stopping = true; });

console.info("[email-worker] iniciado", { enabled: env.email.enabled, pollIntervalMs });
try {
  while (!stopping) {
    try {
      const count = await worker.runOnce();
      if (count > 0) console.info("[email-worker] lote processado", { claimed: count });
    } catch (error) {
      console.error("[email-worker] falha ao processar lote", { error: error instanceof Error ? error.message : String(error) });
    }
    await delay(pollIntervalMs);
  }
} finally {
  await prisma.$disconnect();
  console.info("[email-worker] encerrado");
}
