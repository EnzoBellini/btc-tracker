import { Pool, type PoolConfig } from "pg";

/**
 * pg v8 trata require/prefer/verify-ca como verify-full e emite warning.
 * Neon e hosts gerenciados: usar verify-full explicitamente.
 * @see https://www.postgresql.org/docs/current/libpq-ssl.html
 */
export function normalizePgConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode");
    if (sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
  } catch {
    /* connection string legada — mantém como está */
  }
  return connectionString;
}

export function getPgConnectionString(): string | undefined {
  const raw = process.env.DATABASE_URL;
  return raw ? normalizePgConnectionString(raw) : undefined;
}

export function createPgPool(overrides?: PoolConfig): Pool {
  const connectionString = getPgConnectionString();
  if (!connectionString) {
    throw new Error("DATABASE_URL não definida");
  }
  return new Pool({
    connectionString,
    connectionTimeoutMillis: 30000,
    ...overrides,
  });
}
