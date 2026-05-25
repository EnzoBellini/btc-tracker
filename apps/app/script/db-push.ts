/**
 * Roda drizzle-kit push a partir de apps/app (drizzle-orm e drizzle-kit no mesmo workspace).
 */
import "dotenv/config";
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
import { createPgPool } from "../server/lib/pg";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appRequire = createRequire(path.join(appRoot, "package.json"));

appRequire.resolve("drizzle-orm");

async function hasMexcTable(): Promise<boolean> {
  try {
    const pool = createPgPool();
    const client = await pool.connect();
    try {
      const r = await client.query(`
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'mexc_credentials'
        LIMIT 1
      `);
      return r.rows.length > 0;
    } finally {
      client.release();
      await pool.end();
    }
  } catch {
    return false;
  }
}

async function main() {
  if (await hasMexcTable()) {
    console.error(
      "\n⚠️  A tabela mexc_credentials ainda existe no banco.\n" +
        "   Rode primeiro:  npm run db:migrate\n" +
        "   Depois:         npm run db:push\n",
    );
    process.exit(1);
  }

  const kitBin = path.join(appRoot, "node_modules", "drizzle-kit", "bin.cjs");
  if (!existsSync(kitBin)) {
    console.error("drizzle-kit não encontrado em apps/app. Rode npm install na raiz do projeto.");
    process.exit(1);
  }

  const result = spawnSync(process.execPath, [kitBin, "push"], {
    cwd: appRoot,
    stdio: "inherit",
  });

  process.exit(result.status ?? 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
