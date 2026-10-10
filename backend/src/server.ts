import { app } from "./app.js";
import { env } from "./config/env.js";
import { warmPrismaPool } from "./lib/prisma.js";

app.listen(env.port, () => {
  console.log(`Backend running at ${env.backendUrl} (local port ${env.port})`);
  // Pre-warm the Prisma connection pool so the first request doesn't pay cold-start cost
  warmPrismaPool();
});
