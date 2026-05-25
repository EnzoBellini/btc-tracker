/**
 * Migra mexc_credentials → exchange_credentials antes do db:push.
 * Evita o prompt interativo do drizzle-kit sobre rename de tabela.
 */
import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createPgPool } from "../server/lib/pg";

const sqlPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "migrate-mexc-to-exchange-credentials.sql",
);

async function main() {
  const pool = createPgPool();
  const client = await pool.connect();
  try {
    const hasMexc = await client.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'mexc_credentials'
      LIMIT 1
    `);
    if (!hasMexc.rows.length) {
      console.log("mexc_credentials não existe — migração SQL não necessária.");
      return;
    }

    console.log("Migrando mexc_credentials → exchange_credentials…");
    const sql = readFileSync(sqlPath, "utf8");
    await client.query(sql);
    console.log("Migração concluída. Rode npm run db:push para sincronizar o schema.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
