const APP_URL = process.env.APP_URL ?? "http://localhost:5000";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

export interface WelcomeEmailParams {
  to: string;
  password: string;
  verifyUrl: string;
}

function hasResend(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<void> {
  const { to, password, verifyUrl } = params;
  const subject = "Bem-vindo ao Trackion — sua senha de acesso";
  const body = [
    "Olá,",
    "",
    "Sua conta no Trackion foi criada.",
    "",
    `Senha temporária: ${password}`,
    "",
    "Por segurança, altere esta senha após o primeiro login.",
    "",
    "Confirme seu e-mail clicando no link (válido por 24h):",
    verifyUrl,
    "",
    "Se você não solicitou este cadastro, ignore este e-mail.",
  ].join("\n");

  if (!hasResend()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY não configurada — não é possível enviar e-mail em produção.");
    }
    // Dev: nunca logar senha nem token completo (segurança em logs compartilhados/CI).
    console.log(
      `[email] DEV — e-mail NÃO enviado para ${to}. Defina RESEND_API_KEY no .env (apps/app/.env.example).`,
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject,
      text: body,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[email] Falha Resend:", res.status, errText);
    throw new Error("Falha ao enviar e-mail. Verifique RESEND_API_KEY e EMAIL_FROM (domínio verificado).");
  }

  console.log(`[email] Enviado para ${to} via Resend`);
}

export function buildVerifyUrl(token: string): string {
  return `${APP_URL}/#/verify-email?token=${encodeURIComponent(token)}`;
}
