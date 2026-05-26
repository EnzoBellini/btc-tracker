import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createPgPool } from "../server/lib/pg";

const file = process.argv[2];
if (!file) {
  console.error("Usage: tsx script/run-sql.ts <path-to.sql>");
  process.exit(1);
}

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sqlPath = path.isAbsolute(file) ? file : path.join(appRoot, file);
const sql = readFileSync(sqlPath, "utf8");

async function main() {
  const pool = createPgPool();
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log("OK:", sqlPath);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
