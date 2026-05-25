import { defineConfig } from "drizzle-kit";
import { getPgConnectionString } from "./server/lib/pg";

const url = getPgConnectionString();
if (!url) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

/** Tabelas gerenciadas pelo Drizzle — exclui `session` (connect-pg-simple). */
const tablesFilter = [
  "users",
  "email_verification_tokens",
  "trades",
  "transfers",
  "btc_holdings",
  "settings",
  "exchange_credentials",
  "goals",
  "onboarding_responses",
  "user_rules",
  "roadmap_items",
];

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  tablesFilter,
});
