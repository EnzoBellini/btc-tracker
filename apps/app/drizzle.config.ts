import { defineConfig } from "drizzle-kit";
import { getPgConnectionString } from "./server/lib/pg";

const url = getPgConnectionString();
if (!url) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
