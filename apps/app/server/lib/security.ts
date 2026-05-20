const DEV_SESSION_FALLBACK = "btc-tracker-dev-secret-change-in-prod";

export function validateSecurityConfig(): void {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret === DEV_SESSION_FALLBACK || secret.length < 32) {
      throw new Error(
        "SESSION_SECRET inválido em produção. Use uma string aleatória com pelo menos 32 caracteres.",
      );
    }
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY é obrigatório em produção para envio de e-mail.");
    }
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL é obrigatório em produção.");
    }
    const encKey = process.env.ENCRYPTION_KEY;
    if (!encKey || encKey.length < 32) {
      throw new Error(
        "ENCRYPTION_KEY é obrigatório em produção (mín. 32 caracteres) para credenciais MEXC.",
      );
    }
  }
}

export function logEmailConfigStatus(log: (msg: string, source?: string) => void): void {
  if (process.env.RESEND_API_KEY) {
    log(`E-mail: Resend ativo (remetente: ${process.env.EMAIL_FROM ?? "padrão"})`, "email");
    return;
  }
  log(
    "E-mail: RESEND_API_KEY não configurada — mensagens NÃO são enviadas (apenas aviso no log, sem senha).",
    "email",
  );
  log("Configure RESEND_API_KEY no .env — veja apps/app/.env.example", "email");
}

/** Remove dados sensíveis antes de logar respostas da API. */
export function redactForLog(path: string, body: unknown): unknown {
  if (!body || typeof body !== "object") return body;
  const sensitivePaths = ["/api/auth", "/api/mexc"];
  if (!sensitivePaths.some((p) => path.startsWith(p))) return body;

  const clone = JSON.parse(JSON.stringify(body)) as Record<string, unknown>;
  const redactKeys = ["password", "currentPassword", "newPassword", "secretKey", "token", "passwordHash"];

  function walk(obj: Record<string, unknown>) {
    for (const key of Object.keys(obj)) {
      if (redactKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
        obj[key] = "[REDACTED]";
      } else if (obj[key] && typeof obj[key] === "object") {
        walk(obj[key] as Record<string, unknown>);
      }
    }
  }
  walk(clone);
  return clone;
}
