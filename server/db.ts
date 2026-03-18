import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

/** Banco de dados. null quando DATABASE_URL não está definida (modo local sem banco). */
export const db = process.env.DATABASE_URL
  ? drizzle(
      new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 30000,
      }),
      { schema }
    )
  : null;
