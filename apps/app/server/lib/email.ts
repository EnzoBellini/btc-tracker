export type EmailLocale = "pt" | "en";

const APP_URL = process.env.APP_URL ?? "http://localhost:5000";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "Trackion <noreply@trackion.app>";

export interface WelcomeEmailParams {
  to: string;
  password: string;
  verifyUrl: string;
  locale?: EmailLocale;
}

export function parseEmailLocale(input: { market?: unknown; locale?: unknown }): EmailLocale {
  const { market, locale } = input;
  if (market === "us") return "en";
  if (market === "br") return "pt";
  if (locale === "en" || locale === "en-US") return "en";
  if (locale === "pt" || locale === "pt-BR") return "pt";
  return "pt";
}

function buildWelcomeEmailContent(password: string, verifyUrl: string, locale: EmailLocale) {
  if (locale === "en") {
    const subject = "Welcome to Trackion — confirm your email and 14-day trial";
    const text = [
      "Hello,",
      "",
      "Your Trackion account has been created.",
      "",
      `Temporary password: ${password}`,
      "",
      "For security, change this password after your first login.",
      "",
      "Confirm your email to activate your 14-day Elite trial (link valid for 24 hours):",
      verifyUrl,
      "",
      "If you did not request this signup, please ignore this email.",
    ].join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#111;max-width:520px;margin:0 auto;padding:24px">
  <p>Hello,</p>
  <p>Your <strong>Trackion</strong> account has been created.</p>
  <p><strong>Temporary password:</strong> <code style="background:#f4f4f5;padding:2px 6px;border-radius:4px">${password}</code></p>
  <p>For security, change this password after your first login.</p>
  <p>Confirm your email to activate your <strong>14-day Elite trial</strong> (link valid for 24 hours):</p>
  <p style="margin:24px 0">
    <a href="${verifyUrl}" style="display:inline-block;background:#FF8C42;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
      Confirm email and start trial
    </a>
  </p>
  <p style="font-size:13px;color:#666">Or copy the link: <a href="${verifyUrl}">${verifyUrl}</a></p>
  <p style="font-size:13px;color:#888;margin-top:32px">If you did not request this signup, please ignore this email.</p>
</body>
</html>`;

    return { subject, text, html };
  }

  const subject = "Bem-vindo ao Trackion — confirme seu e-mail e trial de 14 dias";
  const text = [
    "Olá,",
    "",
    "Sua conta no Trackion foi criada.",
    "",
    `Senha temporária: ${password}`,
    "",
    "Por segurança, altere esta senha após o primeiro login.",
    "",
    "Confirme seu e-mail para ativar o trial Elite de 14 dias (link válido por 24h):",
    verifyUrl,
    "",
    "Se você não solicitou este cadastro, ignore este e-mail.",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#111;max-width:520px;margin:0 auto;padding:24px">
  <p>Olá,</p>
  <p>Sua conta no <strong>Trackion</strong> foi criada.</p>
  <p><strong>Senha temporária:</strong> <code style="background:#f4f4f5;padding:2px 6px;border-radius:4px">${password}</code></p>
  <p>Por segurança, altere esta senha após o primeiro login.</p>
  <p>Confirme seu e-mail para ativar o <strong>trial Elite de 14 dias</strong> (link válido por 24h):</p>
  <p style="margin:24px 0">
    <a href="${verifyUrl}" style="display:inline-block;background:#FF8C42;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
      Confirmar e-mail e ativar trial
    </a>
  </p>
  <p style="font-size:13px;color:#666">Ou copie o link: <a href="${verifyUrl}">${verifyUrl}</a></p>
  <p style="font-size:13px;color:#888;margin-top:32px">Se você não solicitou este cadastro, ignore este e-mail.</p>
</body>
</html>`;

  return { subject, text, html };
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<{ sent: boolean }> {
  const { to, password, verifyUrl, locale = "pt" } = params;
  const { subject, text, html } = buildWelcomeEmailContent(password, verifyUrl, locale);

  if (!isResendConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY não configurada — não é possível enviar e-mail em produção.");
    }
    console.log(
      `[email] DEV — e-mail NÃO enviado para ${to}. Defina RESEND_API_KEY em apps/app/.env — o link de confirmação volta na resposta da API (dev).`,
    );
    return { sent: false };
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
      text,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    let detail = errText;
    try {
      const parsed = JSON.parse(errText) as { message?: string };
      if (parsed.message) detail = parsed.message;
    } catch {
      /* mantém texto bruto */
    }
    console.error("[email] Falha Resend:", res.status, detail);
    throw new Error(
      `Falha ao enviar e-mail (${res.status}): ${detail}. Verifique RESEND_API_KEY e EMAIL_FROM (domínio verificado no Resend).`,
    );
  }

  console.log(`[email] Enviado para ${to} via Resend (from: ${EMAIL_FROM}, locale: ${locale})`);
  return { sent: true };
}

export function buildVerifyUrl(token: string): string {
  return `${APP_URL}/#/verify-email?token=${encodeURIComponent(token)}`;
}

export function buildLoginUrl(): string {
  return `${APP_URL}/#/login`;
}

function buildPasswordResetEmailContent(password: string, loginUrl: string, locale: EmailLocale) {
  if (locale === "en") {
    const subject = "Trackion — new temporary password";
    const text = [
      "Hello,",
      "",
      "We received a request to reset your Trackion password.",
      "",
      `Temporary password: ${password}`,
      "",
      "Sign in and change this password in your account settings.",
      "",
      loginUrl,
      "",
      "If you did not request this, ignore this email — your account remains secure.",
    ].join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#111;max-width:520px;margin:0 auto;padding:24px">
  <p>Hello,</p>
  <p>We received a request to reset your <strong>Trackion</strong> password.</p>
  <p><strong>Temporary password:</strong> <code style="background:#f4f4f5;padding:2px 6px;border-radius:4px">${password}</code></p>
  <p>Sign in and change this password in your account settings.</p>
  <p style="margin:24px 0">
    <a href="${loginUrl}" style="display:inline-block;background:#FF8C42;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
      Sign in to Trackion
    </a>
  </p>
  <p style="font-size:13px;color:#888;margin-top:32px">If you did not request this, ignore this email.</p>
</body>
</html>`;

    return { subject, text, html };
  }

  const subject = "Trackion — nova senha temporária";
  const text = [
    "Olá,",
    "",
    "Recebemos um pedido para redefinir sua senha do Trackion.",
    "",
    `Senha temporária: ${password}`,
    "",
    "Entre no app e altere esta senha nas configurações da conta.",
    "",
    loginUrl,
    "",
    "Se você não solicitou isso, ignore este e-mail — sua conta continua segura.",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#111;max-width:520px;margin:0 auto;padding:24px">
  <p>Olá,</p>
  <p>Recebemos um pedido para redefinir sua senha do <strong>Trackion</strong>.</p>
  <p><strong>Senha temporária:</strong> <code style="background:#f4f4f5;padding:2px 6px;border-radius:4px">${password}</code></p>
  <p>Entre no app e altere esta senha nas configurações da conta.</p>
  <p style="margin:24px 0">
    <a href="${loginUrl}" style="display:inline-block;background:#FF8C42;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
      Entrar no Trackion
    </a>
  </p>
  <p style="font-size:13px;color:#888;margin-top:32px">Se você não solicitou isso, ignore este e-mail.</p>
</body>
</html>`;

  return { subject, text, html };
}

export async function sendPasswordResetEmail(params: {
  to: string;
  password: string;
  locale?: EmailLocale;
}): Promise<{ sent: boolean }> {
  const { to, password, locale = "pt" } = params;
  const loginUrl = buildLoginUrl();
  const { subject, text, html } = buildPasswordResetEmailContent(password, loginUrl, locale);

  if (!isResendConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY não configurada — não é possível enviar e-mail em produção.");
    }
    console.log(`[email] DEV — reset NÃO enviado para ${to}. Senha: ${password}`);
    return { sent: false };
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
      text,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    let detail = errText;
    try {
      const parsed = JSON.parse(errText) as { message?: string };
      if (parsed.message) detail = parsed.message;
    } catch {
      /* mantém texto bruto */
    }
    console.error("[email] Falha Resend (reset):", res.status, detail);
    throw new Error(`Falha ao enviar e-mail (${res.status}): ${detail}`);
  }

  console.log(`[email] Reset enviado para ${to}`);
  return { sent: true };
}

