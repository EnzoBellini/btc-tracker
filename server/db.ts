import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";

/** Banco de dados. null quando DATABASE_URL não está definida (modo local sem banco). */
/** Usa neon-http (HTTP em vez de TCP) para evitar ETIMEDOUT no Railway. */
export const db = process.env.DATABASE_URL
  ? drizzle(
      neon(process.env.DATABASE_URL, {
        fetchOptions: { cache: "no-store" },
      }),
      { schema }
    )
  : null;
