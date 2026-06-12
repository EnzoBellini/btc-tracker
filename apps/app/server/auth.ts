/**
 * Authentication: email-only entry, verification, password change.
 */
import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { generateSecurePassword, validateNewPassword } from "./lib/password";
import { generateToken, hashToken, verificationExpiresAt } from "./lib/tokens";
import { sendWelcomeEmail, sendPasswordResetEmail, buildVerifyUrl, parseEmailLocale, type EmailLocale } from "./lib/email";
import { toAuthUserPayload, type AuthUserPayload } from "./lib/authUser";
import { getResolvedSubscription } from "./billing/subscriptionService";
import { createPgPool, getPgConnectionString } from "./lib/pg";
import { createRateLimiter } from "./lib/rateLimit";
import { activateTrialAfterEmailVerification, startTrialForUser, hasUsedFreeTrial } from "./billing/routes";
import { trackFpSignup } from "./affiliates/firstPromoter";
import { mergeTraderProfile, parseAffiliateBody } from "./lib/affiliateAttribution";

const authEnterLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 8, keyPrefix: "auth:enter" });
const authLoginLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 15, keyPrefix: "auth:login" });
const authResendLimit = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5, keyPrefix: "auth:resend" });
const authForgotLimit = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5, keyPrefix: "auth:forgot" });
const authVerifyLimit = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 30, keyPrefix: "auth:verify" });

declare module "express-session" {
  interface SessionData {
    userId: number;
    userEmail: string;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TERMS_VERSION = "2026-06-11";

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function setSession(req: Request, user: { id: number; email: string }) {
  req.session.userId = user.id;
  req.session.userEmail = user.email;
}

function loginSession(
  req: Request,
  user: { id: number; email: string },
  res: Response,
  json: object,
  status = 200,
) {
  req.session.regenerate((err) => {
    if (err) {
      console.error("[auth] session regenerate", err);
      return res.status(500).json({ error: "Erro interno" });
    }
    setSession(req, user);
    res.status(status).json(json);
  });
}

type VerificationResult = {
  verifyUrl: string;
  emailSent: boolean;
  devVerifyUrl?: string;
  devPassword?: string;
};

function devVerificationExtras(
  verifyUrl: string,
  emailSent: boolean,
  plainPassword: string,
): Pick<VerificationResult, "devVerifyUrl" | "devPassword"> {
  if (process.env.NODE_ENV === "production" || emailSent) return {};
  return { devVerifyUrl: verifyUrl, devPassword: plainPassword };
}

async function issueVerification(
  userId: number,
  email: string,
  plainPassword: string,
  locale: EmailLocale = "pt",
): Promise<VerificationResult> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  await storage.createEmailVerificationToken(userId, tokenHash, verificationExpiresAt(24));
  const verifyUrl = buildVerifyUrl(token);
  const { sent } = await sendWelcomeEmail({
    to: email,
    password: plainPassword,
    verifyUrl,
    locale,
  });
  return {
    verifyUrl,
    emailSent: sent,
    ...devVerificationExtras(verifyUrl, sent, plainPassword),
  };
}

const TRIAL_SIGNUP_COPY = {
  pt: {
    sentNew:
      "Enviamos o link de confirmação e a senha temporária. Seu trial Elite de 14 dias começa ao clicar no link do e-mail.",
    sentResend:
      "Reenviamos o link de confirmação. O trial de 14 dias começa quando você confirmar o e-mail.",
    devFallback:
      "Conta criada. Configure RESEND_API_KEY para enviar e-mail — em dev use o link abaixo para confirmar.",
    alreadyHasAccount:
      "Este e-mail já possui conta. Use Entrar no app com sua senha ou recupere o acesso por e-mail.",
    trialAlreadyUsed:
      "Este e-mail já utilizou os 14 dias grátis. Faça login no app ou assine um plano para continuar.",
    emailFailed:
      "Conta criada, mas não foi possível enviar o e-mail. Verifique spam ou tente reenviar pelo app (Entrar).",
    termsRequired:
      "Aceite os Termos de Uso e a Política de Privacidade para criar sua conta.",
  },
  en: {
    sentNew:
      "We sent a confirmation link and temporary password. Your 14-day Elite trial starts when you click the link in the email.",
    sentResend:
      "We resent the confirmation link. Your 14-day trial starts once you confirm your email.",
    devFallback:
      "Account created. Configure RESEND_API_KEY to send email — in dev use the link below to confirm.",
    alreadyHasAccount:
      "This email already has an account. Log in to the app with your password or recover access via email.",
    trialAlreadyUsed:
      "This email already used the 14-day free trial. Log in to the app or subscribe to continue.",
    emailFailed:
      "Account created, but we couldn't send the email. Check spam or try resending from the app (Log in).",
    termsRequired:
      "You must accept the Terms of Use and Privacy Policy to create your account.",
  },
} as const;

function trialSignupJson(verification: VerificationResult, locale: EmailLocale, messageKey: "sentNew" | "sentResend") {
  const copy = TRIAL_SIGNUP_COPY[locale];
  return {
    ok: true as const,
    emailSent: verification.emailSent,
    message: verification.emailSent ? copy[messageKey] : copy.devFallback,
    ...(verification.devVerifyUrl
      ? { devVerifyUrl: verification.devVerifyUrl, devPassword: verification.devPassword }
      : {}),
  };
}

async function applyAffiliateAttribution(
  userId: number,
  body: unknown,
  profileBase?: Record<string, unknown>,
): Promise<void> {
  const attr = parseAffiliateBody(body);
  if (!attr.refId && !attr.fpromTid) return;

  const user = await storage.getUserById(userId);
  if (!user) return;

  const traderProfile = mergeTraderProfile(user.traderProfile, {
    ...profileBase,
    affiliateRef: attr.refId,
    couponCode: attr.couponCode,
  });

  await storage.updateUser(userId, {
    affiliateRef: attr.refId ?? user.affiliateRef ?? undefined,
    traderProfile,
  });

  void trackFpSignup({
    email: user.email,
    uid: String(userId),
    ref_id: attr.refId,
    tid: attr.fpromTid,
  });
}

export function setupSession(app: Express) {
  const PgSession = connectPgSimple(session);
  const secret =
    process.env.SESSION_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : "btc-tracker-dev-secret-change-in-prod");
  if (!secret) {
    throw new Error("SESSION_SECRET obrigatório em produção");
  }

  const config: session.SessionOptions = {
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  };

  if (getPgConnectionString()) {
    config.store = new PgSession({
      pool: createPgPool(),
      createTableIfMissing: true,
    });
  }

  app.use(session(config));
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) return next();
  res.status(401).json({ error: "Não autenticado" });
}

export function registerAuthRoutes(app: Express) {
  // Landing — trial 14 dias (nome + e-mail → link de acesso)
  app.post("/api/trial-signup", authEnterLimit, async (req, res) => {
    try {
      const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
      const email = typeof req.body.email === "string" ? req.body.email : "";
      const locale = parseEmailLocale(req.body);
      const copy = TRIAL_SIGNUP_COPY[locale];
      const acceptTerms =
        req.body.acceptTerms === true || req.body.termsAccepted === true;
      if (!name || name.length < 2) {
        return res.status(400).json({ error: "Informe seu nome" });
      }
      if (!email || !EMAIL_RE.test(normalizeEmail(email))) {
        return res.status(400).json({ error: "E-mail inválido" });
      }
      if (!acceptTerms) {
        return res.status(400).json({ error: copy.termsRequired });
      }

      const normalized = normalizeEmail(email);
      let user = await storage.getUserByEmail(normalized);
      const leadProfile = JSON.stringify({
        leadName: name,
        locale,
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: TERMS_VERSION,
        privacyAcceptedAt: new Date().toISOString(),
        privacyVersion: TERMS_VERSION,
      });

      if (user && (await hasUsedFreeTrial(user.id))) {
        return res.status(409).json({
          ok: false,
          trialAlreadyUsed: true,
          existingAccount: true,
          message: copy.trialAlreadyUsed,
        });
      }

      if (!user) {
        const plainPassword = generateSecurePassword();
        const passwordHash = await bcrypt.hash(plainPassword, 12);
        user = await storage.createUser({
          email: normalized,
          passwordHash,
          emailVerified: false,
          mustChangePassword: true,
          onboardingCompleted: false,
          onboardingStep: 0,
          traderProfile: leadProfile,
        });
        let verification: VerificationResult;
        try {
          verification = await issueVerification(user.id, user.email, plainPassword, locale);
        } catch (emailErr) {
          await storage.deleteUser(user.id);
          throw emailErr;
        }
        await applyAffiliateAttribution(user.id, req.body, {
          leadName: name,
          locale,
          termsAcceptedAt: new Date().toISOString(),
          termsVersion: TERMS_VERSION,
          privacyAcceptedAt: new Date().toISOString(),
          privacyVersion: TERMS_VERSION,
        });
        return res.status(201).json(trialSignupJson(verification, locale, "sentNew"));
      }

      if (!user.emailVerified) {
        const plainPassword = generateSecurePassword();
        const passwordHash = await bcrypt.hash(plainPassword, 12);
        await storage.updateUser(user.id, {
          passwordHash,
          mustChangePassword: true,
          traderProfile: leadProfile,
        });
        const verification = await issueVerification(user.id, user.email, plainPassword, locale);
        await applyAffiliateAttribution(user.id, req.body, {
          leadName: name,
          locale,
          termsAcceptedAt: new Date().toISOString(),
          termsVersion: TERMS_VERSION,
          privacyAcceptedAt: new Date().toISOString(),
          privacyVersion: TERMS_VERSION,
        });
        return res.json(trialSignupJson(verification, locale, "sentResend"));
      }

      return res.json({
        ok: false,
        emailSent: false,
        existingAccount: true,
        message: copy.alreadyHasAccount,
      });
    } catch (err: unknown) {
      console.error("[trial-signup]", err);
      const msg = err instanceof Error ? err.message : "";
      const locale = parseEmailLocale(req.body);
      if (msg.includes("Falha ao enviar e-mail") || msg.includes("RESEND")) {
        return res.status(503).json({
          error: TRIAL_SIGNUP_COPY[locale].emailFailed,
        });
      }
      res.status(500).json({ error: "Erro interno" });
    }
  });

  // Entrada unificada — apenas e-mail
  app.post("/api/auth/enter", authEnterLimit, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !EMAIL_RE.test(normalizeEmail(email))) {
        return res.status(400).json({ error: "E-mail inválido" });
      }

      const normalized = normalizeEmail(email);
      let user = await storage.getUserByEmail(normalized);

      if (!user) {
        const plainPassword = generateSecurePassword();
        const passwordHash = await bcrypt.hash(plainPassword, 12);
        user = await storage.createUser({
          email: normalized,
          passwordHash,
          emailVerified: false,
          mustChangePassword: true,
          onboardingCompleted: false,
          onboardingStep: 0,
        });
        await issueVerification(user.id, user.email, plainPassword);
        await applyAffiliateAttribution(user.id, req.body);
        return res.status(201).json({
          status: "created",
          message:
            "Conta criada. Confirme o e-mail para ativar o trial; enviamos senha temporária e o link.",
        });
      }

      if (!user.emailVerified) {
        const plainPassword = generateSecurePassword();
        const passwordHash = await bcrypt.hash(plainPassword, 12);
        await storage.updateUser(user.id, { passwordHash, mustChangePassword: true });
        await issueVerification(user.id, user.email, plainPassword);
        return res.json({
          status: "pending_verification",
          message: "E-mail ainda não confirmado. Reenviamos as instruções.",
        });
      }

      return res.json({ status: "password_required", email: user.email });
    } catch (err: unknown) {
      console.error("[auth/enter]", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Falha ao enviar e-mail") || msg.includes("RESEND")) {
        return res.status(503).json({
          error: "Não foi possível enviar o e-mail. Tente novamente em instantes.",
        });
      }
      res.status(500).json({ error: "Erro interno" });
    }
  });

  app.post("/api/auth/resend-verification", authResendLimit, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "E-mail obrigatório" });
      const user = await storage.getUserByEmail(normalizeEmail(email));
      if (!user) return res.json({ ok: true });
      if (user.emailVerified) return res.json({ ok: true, message: "E-mail já verificado" });

      const plainPassword = generateSecurePassword();
      const passwordHash = await bcrypt.hash(plainPassword, 12);
      await storage.updateUser(user.id, { passwordHash, mustChangePassword: true });
      await issueVerification(user.id, user.email, plainPassword);
      res.json({ ok: true, message: "E-mail reenviado" });
    } catch (err: unknown) {
      console.error("[auth/resend]", err);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  app.post("/api/auth/forgot-password", authForgotLimit, async (req, res) => {
    const genericMessage =
      parseEmailLocale(req.body) === "en"
        ? "If an account exists with this email, we sent instructions."
        : "Se existir uma conta com este e-mail, enviamos instruções.";

    try {
      const email = typeof req.body.email === "string" ? req.body.email : "";
      if (!email || !EMAIL_RE.test(normalizeEmail(email))) {
        return res.status(400).json({ error: "E-mail inválido" });
      }

      const locale = parseEmailLocale(req.body);
      const user = await storage.getUserByEmail(normalizeEmail(email));
      if (!user) return res.json({ ok: true, message: genericMessage });

      const plainPassword = generateSecurePassword();
      const passwordHash = await bcrypt.hash(plainPassword, 12);
      await storage.updateUser(user.id, { passwordHash, mustChangePassword: true });

      if (!user.emailVerified) {
        await issueVerification(user.id, user.email, plainPassword, locale);
        return res.json({ ok: true, message: genericMessage });
      }

      await sendPasswordResetEmail({ to: user.email, password: plainPassword, locale });
      return res.json({ ok: true, message: genericMessage });
    } catch (err: unknown) {
      console.error("[auth/forgot-password]", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Falha ao enviar e-mail") || msg.includes("RESEND")) {
        return res.status(503).json({
          error:
            parseEmailLocale(req.body) === "en"
              ? "Could not send email. Try again shortly."
              : "Não foi possível enviar o e-mail. Tente novamente em instantes.",
        });
      }
      res.status(500).json({ error: "Erro interno" });
    }
  });

  app.get("/api/auth/verify-email", authVerifyLimit, async (req, res) => {
    try {
      const token = typeof req.query.token === "string" ? req.query.token : "";
      if (!token) return res.status(400).json({ error: "Token inválido" });

      const record = await storage.findValidVerificationToken(hashToken(token));
      if (!record) return res.status(400).json({ error: "Link inválido ou expirado" });

      await storage.markVerificationTokenUsed(record.id);
      const user = await storage.updateUser(record.userId, { emailVerified: true });
      if (!user) return res.status(500).json({ error: "Usuário não encontrado" });

      try {
        await activateTrialAfterEmailVerification(user.id);
      } catch (trialErr) {
        console.warn("[auth/verify-email] trial", trialErr);
      }

      const refreshed = await storage.getUserById(user.id);
      const resolved = await import("./billing/subscriptionService").then((m) =>
        m.getResolvedSubscription(user.id),
      );
      const payload: AuthUserPayload = {
        ...toAuthUserPayload(refreshed ?? user),
        subscription: {
          status: resolved.status,
          effectivePlanId: resolved.effectivePlanId,
          hasAccess: resolved.hasAccess,
          trialEnded: resolved.trialEnded,
          daysLeftInTrial: resolved.daysLeftInTrial,
        },
      };

      loginSession(req, refreshed ?? user, res, { ok: true, user: payload });
    } catch (err: unknown) {
      console.error("[auth/verify-email]", err);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email e senha obrigatórios" });
      if (password.length < 6) return res.status(400).json({ error: "Senha muito curta (mín. 6 caracteres)" });

      const normalizedEmail = normalizeEmail(email);
      const existing = await storage.getUserByEmail(normalizedEmail);
      if (existing) return res.status(409).json({ error: "Email já cadastrado" });

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await storage.createUser({
        email: normalizedEmail,
        passwordHash,
        emailVerified: true,
        mustChangePassword: false,
        onboardingCompleted: false,
      });

      try {
        await startTrialForUser(user.id);
      } catch (trialErr) {
        console.warn("[auth/register] trial", trialErr);
      }

      loginSession(req, user, res, toAuthUserPayload(user), 201);
      return;
    } catch (err: unknown) {
      console.error("[auth/register]", err);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  app.post("/api/auth/login", authLoginLimit, async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email e senha obrigatórios" });

      const user = await storage.getUserByEmail(normalizeEmail(email));
      if (!user) return res.status(401).json({ error: "Email ou senha incorretos" });
      if (!user.emailVerified) {
        return res.status(403).json({ error: "Confirme seu e-mail antes de entrar", code: "EMAIL_NOT_VERIFIED" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: "Email ou senha incorretos" });

      loginSession(req, user, res, toAuthUserPayload(user));
    } catch (err: unknown) {
      console.error("[auth/login]", err);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  app.patch("/api/auth/password", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Senha atual e nova senha são obrigatórias" });
      }

      const pwdError = validateNewPassword(newPassword);
      if (pwdError) return res.status(400).json({ error: pwdError });

      const user = await storage.getUserById(userId);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return res.status(401).json({ error: "Senha atual incorreta" });

      const passwordHash = await bcrypt.hash(newPassword, 12);
      const updated = await storage.updateUser(userId, {
        passwordHash,
        mustChangePassword: false,
        passwordChangedAt: new Date(),
      });
      if (!updated) return res.status(500).json({ error: "Erro ao atualizar senha" });

      res.json({ ok: true, user: toAuthUserPayload(updated) });
    } catch (err: unknown) {
      console.error("[auth/password]", err);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
  });

  app.delete("/api/auth/account", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const password = typeof req.body.password === "string" ? req.body.password : "";
      const confirmEmail =
        typeof req.body.confirmEmail === "string" ? normalizeEmail(req.body.confirmEmail) : "";

      if (!password) {
        return res.status(400).json({ error: "Informe sua senha para confirmar a exclusão" });
      }

      const user = await storage.getUserById(userId);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
      if (confirmEmail !== user.email) {
        return res.status(400).json({ error: "O e-mail de confirmação não confere com sua conta" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: "Senha incorreta" });

      const deleted = await storage.deleteUser(userId);
      if (!deleted) return res.status(500).json({ error: "Não foi possível excluir a conta" });

      req.session.destroy((err) => {
        if (err) console.error("[auth/account-delete] session destroy", err);
        res.json({ ok: true, message: "Conta excluída. Você pode se cadastrar novamente com o mesmo e-mail." });
      });
    } catch (err: unknown) {
      console.error("[auth/account-delete]", err);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Não autenticado" });
    const user = await storage.getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: "Não autenticado" });
    const resolved = await getResolvedSubscription(user.id);
    const payload: AuthUserPayload = {
      ...toAuthUserPayload(user),
      subscription: {
        status: resolved.status,
        effectivePlanId: resolved.effectivePlanId,
        hasAccess: resolved.hasAccess,
        trialEnded: resolved.trialEnded,
        daysLeftInTrial: resolved.daysLeftInTrial,
      },
    };
    res.json(payload);
  });
}
