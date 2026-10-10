import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

/** Pre-warm the connection pool on startup so the first real request doesn't pay the cold-start penalty. */
export async function warmPrismaPool(): Promise<void> {
  const t0 = Date.now();
  try {
    await Promise.all(Array.from({ length: 5 }, () => prisma.$queryRaw`SELECT 1`));
    console.log(`[prisma] Connection pool warmed with 5 probes in ${Date.now() - t0}ms`);
  } catch (err) {
    console.warn(`[prisma] Pool warm-up failed (${Date.now() - t0}ms):`, err);
  }
}
