import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/** Reads a positive integer from the environment, or falls back. */
function envInt(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

/**
 * Prisma 7 connects through a driver adapter rather than a `url` in the schema.
 * Neon's pooled connection string belongs in DATABASE_URL.
 *
 * The pool settings are the difference between "slow under load" and "down
 * under load". Every instance of this process opens its own pool, so `max`
 * is per instance: the ceiling that matters is `max × instances` against
 * whatever the database allows. Ten is right for one long-running server;
 * on a serverless platform, where instances multiply on their own, set
 * DATABASE_POOL_MAX to something like 3–5 instead.
 */
function createClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection strings.",
    );
  }

  const adapter = new PrismaPg({
    connectionString,
    max: envInt("DATABASE_POOL_MAX", 10),
    // Hand idle connections back so a traffic spike does not leave the pool
    // pinned at `max` for the rest of the instance's life.
    idleTimeoutMillis: envInt("DATABASE_POOL_IDLE_MS", 30_000),
    // Waiting forever for a free connection turns one slow query into a
    // request queue that never drains; fail fast and let the caller see a 500.
    connectionTimeoutMillis: envInt("DATABASE_POOL_ACQUIRE_MS", 10_000),
    // A runaway query cannot hold a connection hostage. Postgres cancels it
    // server-side, which also releases whatever locks it was holding.
    statement_timeout: envInt("DATABASE_STATEMENT_TIMEOUT_MS", 15_000),
    // Same idea for a transaction that opened and then stalled.
    idle_in_transaction_session_timeout: envInt(
      "DATABASE_IDLE_TX_TIMEOUT_MS",
      15_000,
    ),
    application_name: "taskflow-web",
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
