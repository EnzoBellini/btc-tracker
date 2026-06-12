import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPgPool, getPgConnectionString } from "./pg";

const MIGRATION_FILES = [
  "migrate-auth-email.sql",
  "migrate-billing.sql",
  "migrate-affiliates.sql",
] as const;

let ensured = false;

/** Migrações SQL idempotentes — evita 500 no login quando o schema ficou atrás do código. */
export async function ensureProductionSchema(): Promise<void> {
  if (ensured || process.env.NODE_ENV !== "production") return;
  if (!getPgConnectionString()) return;

  const scriptDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../script");
  const pool = createPgPool();
  const client = await pool.connect();

  try {
    for (const file of MIGRATION_FILES) {
      const sqlPath = path.join(scriptDir, file);
      const sql = readFileSync(sqlPath, "utf8");
      await client.query(sql);
    }
    ensured = true;
  } finally {
    client.release();
    await pool.end();
  }
}
