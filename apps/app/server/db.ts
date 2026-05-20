import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import { createPgPool, getPgConnectionString } from "./lib/pg";

/** Banco de dados. null quando DATABASE_URL não está definida (modo local sem banco). */
export const db = getPgConnectionString()
  ? drizzle(createPgPool(), { schema })
  : null;
