import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPgPool, getPgConnectionString } from "./pg";
import { storage } from "../storage";

const MIGRATION_FILES = [
  "migrate-auth-email.sql",
  "migrate-billing.sql",
  "migrate-affiliates.sql",
] as const;

const CRITICAL_USER_COLUMNS = [
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_step INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS trader_profile TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_used_at TIMESTAMP`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS affiliate_ref TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`,
];

let ensured = false;

async function runStatements(client: import("pg").PoolClient, sql: string, label: string) {
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    try {
      await client.query(`${statement};`);
    } catch (err) {
      console.error(`[db] statement failed (${label}):`, statement.slice(0, 80), err);
    }
  }
}

/** Migrações SQL idempotentes — cada statement isolado para não reverter ALTERs. */
export async function ensureProductionSchema(log?: (msg: string, source?: string) => void): Promise<void> {
  if (ensured || process.env.NODE_ENV !== "production") return;
  if (!getPgConnectionString()) return;

  const scriptDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../script");
  const pool = createPgPool();
  const client = await pool.connect();

  try {
    for (const statement of CRITICAL_USER_COLUMNS) {
      try {
        await client.query(`${statement};`);
      } catch (err) {
        console.error("[db] critical column failed:", statement, err);
      }
    }
    log?.("critical user columns ok", "db");

    for (const file of MIGRATION_FILES) {
      const sqlPath = path.join(scriptDir, file);
      const sql = readFileSync(sqlPath, "utf8");
      await runStatements(client, sql, file);
      log?.(`migration ok: ${file}`, "db");
    }

    ensured = true;
  } finally {
    client.release();
    await pool.end();
  }
}

export async function checkDatabaseHealth(): Promise<{
  ok: boolean;
  users?: number;
  emailVerificationTokens?: boolean;
  userColumns?: string[];
  drizzleUsers?: string;
  error?: string;
}> {
  if (!getPgConnectionString()) {
    return { ok: true, users: 0, emailVerificationTokens: false };
  }

  const pool = createPgPool();
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    for (const statement of CRITICAL_USER_COLUMNS) {
      try {
        await client.query(`${statement};`);
      } catch {
        /* best effort */
      }
    }
    const users = await client.query<{ n: number }>("SELECT COUNT(*)::int AS n FROM users");
    const tokens = await client.query<{ has_tokens: boolean }>(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'email_verification_tokens'
      ) AS has_tokens
    `);
    const columns = await client.query<{ column_name: string }>(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `);
    let sampleUser: string | undefined;
    try {
      await storage.getUserByEmail("health-check-nonexistent@trackion.app");
      sampleUser = "drizzle_ok";
    } catch (err) {
      sampleUser = err instanceof Error ? err.message : String(err);
    }
    return {
      ok: sampleUser === "drizzle_ok",
      users: users.rows[0]?.n ?? 0,
      emailVerificationTokens: tokens.rows[0]?.has_tokens ?? false,
      userColumns: columns.rows.map((r) => r.column_name),
      drizzleUsers: sampleUser,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    client.release();
    await pool.end();
  }
}
