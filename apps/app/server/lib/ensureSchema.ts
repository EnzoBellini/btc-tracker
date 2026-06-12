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

let ensured = false;

/** Migrações SQL idempotentes — evita 500 no login quando o schema ficou atrás do código. */
export async function ensureProductionSchema(log?: (msg: string, source?: string) => void): Promise<void> {
  if (ensured || process.env.NODE_ENV !== "production") return;
  if (!getPgConnectionString()) return;

  const scriptDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../script");
  const pool = createPgPool();
  const client = await pool.connect();

  try {
    for (const file of MIGRATION_FILES) {
      try {
        const sqlPath = path.join(scriptDir, file);
        const sql = readFileSync(sqlPath, "utf8");
        await client.query(sql);
        log?.(`migration ok: ${file}`, "db");
      } catch (err) {
        console.error(`[db] migration failed: ${file}`, err);
      }
    }

    // Garantias críticas (drizzle quebra se faltar)
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS affiliate_ref TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
    `);
    log?.("critical user columns ok", "db");

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
  error?: string;
}> {
  if (!getPgConnectionString()) {
    return { ok: true, users: 0, emailVerificationTokens: false };
  }

  const pool = createPgPool();
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
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
      ok: true,
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
