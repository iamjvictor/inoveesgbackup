import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

export type ClaimedEmail = {
  id: string;
  eventType: string;
  recipient: string;
  payload: Prisma.JsonValue;
  attempts: number;
  leaseToken: string;
};

export interface EmailOutboxStore {
  claim(batchSize: number, leaseSeconds: number, maxAttempts: number): Promise<ClaimedEmail[]>;
  accept(id: string, leaseToken: string, providerMessageId: string): Promise<boolean>;
  retry(id: string, leaseToken: string, delaySeconds: number, errorMessage: string): Promise<boolean>;
  fail(id: string, leaseToken: string, errorMessage: string): Promise<boolean>;
}

export class PrismaEmailOutboxStore implements EmailOutboxStore {
  async claim(batchSize: number, leaseSeconds: number, maxAttempts: number): Promise<ClaimedEmail[]> {
    const rows = await prisma.$queryRaw<ClaimedEmail[]>(Prisma.sql`
      WITH exhausted AS (
        UPDATE "email_outbox"
        SET "status" = 'FAILED',
            "leaseToken" = NULL,
            "leaseUntil" = NULL,
            "lastError" = 'Limite de tentativas excedido',
            "updatedAt" = NOW()
        WHERE "attempts" >= ${maxAttempts}
          AND (("status" = 'PENDING' AND "nextAttemptAt" <= NOW()) OR
               ("status" = 'PROCESSING' AND "leaseUntil" <= NOW()))
        RETURNING "id"
      ), candidates AS (
        SELECT "id"
        FROM "email_outbox"
        WHERE "attempts" < ${maxAttempts}
          AND (("status" = 'PENDING' AND "nextAttemptAt" <= NOW()) OR
               ("status" = 'PROCESSING' AND "leaseUntil" <= NOW()))
        ORDER BY "createdAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT ${batchSize}
      )
      UPDATE "email_outbox" AS outbox
      SET "status" = 'PROCESSING',
          "attempts" = outbox."attempts" + 1,
          "leaseToken" = gen_random_uuid()::text,
          "leaseUntil" = NOW() + (${leaseSeconds} * INTERVAL '1 second'),
          "updatedAt" = NOW()
      FROM candidates
      WHERE outbox."id" = candidates."id"
      RETURNING outbox."id", outbox."eventType", outbox."recipient", outbox."payload",
                outbox."attempts", outbox."leaseToken"
    `);
    return rows;
  }

  async accept(id: string, leaseToken: string, providerMessageId: string) {
    const result = await prisma.emailOutbox.updateMany({
      where: { id, status: "PROCESSING", leaseToken },
      data: { status: "ACCEPTED", providerMessageId, leaseToken: null, leaseUntil: null, lastError: null },
    });
    return result.count === 1;
  }

  async retry(id: string, leaseToken: string, delaySeconds: number, errorMessage: string) {
    const nextAttemptAt = new Date(Date.now() + delaySeconds * 1000);
    const result = await prisma.emailOutbox.updateMany({
      where: { id, status: "PROCESSING", leaseToken },
      data: { status: "PENDING", nextAttemptAt, leaseToken: null, leaseUntil: null, lastError: errorMessage.slice(0, 2000) },
    });
    return result.count === 1;
  }

  async fail(id: string, leaseToken: string, errorMessage: string) {
    const result = await prisma.emailOutbox.updateMany({
      where: { id, status: "PROCESSING", leaseToken },
      data: { status: "FAILED", leaseToken: null, leaseUntil: null, lastError: errorMessage.slice(0, 2000) },
    });
    return result.count === 1;
  }
}

export function createLeaseToken() { return randomUUID(); }
