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
import { sendWelcomeEmail, buildVerifyUrl } from "./lib/email";
import { toAuthUserPayload } from "./lib/authUser";
import { createPgPool, getPgConnectionString } from "./lib/pg";
import { createRateLimiter } from "./lib/rateLimit";

const authEnterLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 8, keyPrefix: "auth:enter" });
const authLoginLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 15, keyPrefix: "auth:login" });
const authResendLimit = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5, keyPrefix: "auth:resend" });
const authVerifyLimit = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 30, keyPrefix: "auth:verify" });

declare module "express-session" {
  interface SessionData {
    userId: number;
    userEmail: string;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

async function issueVerification(userId: number, email: string, plainPassword: string) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  await storage.createEmailVerificationToken(userId, tokenHash, verificationExpiresAt(24));
  await sendWelcomeEmail({
    to: email,
    password: plainPassword,
    verifyUrl: buildVerifyUrl(token),
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
      if (!name || name.length < 2) {
        return res.status(400).json({ error: "Informe seu nome" });
      }
      if (!email || !EMAIL_RE.test(normalizeEmail(email))) {
        return res.status(400).json({ error: "E-mail inválido" });
      }

      const normalized = normalizeEmail(email);
      let user = await storage.getUserByEmail(normalized);
      const leadProfile = JSON.stringify({ leadName: name });

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
        await issueVerification(user.id, user.email, plainPassword);
        return res.status(201).json({
          ok: true,
          message: "Enviamos o link de acesso e a senha temporária para seu e-mail.",
        });
      }

      if (!user.emailVerified) {
        const plainPassword = generateSecurePassword();
        const passwordHash = await bcrypt.hash(plainPassword, 12);
        await storage.updateUser(user.id, {
          passwordHash,
          mustChangePassword: true,
          traderProfile: leadProfile,
        });
        await issueVerification(user.id, user.email, plainPassword);
        return res.json({
          ok: true,
          message: "Reenviamos o link de acesso para seu e-mail.",
        });
      }

      return res.json({
        ok: true,
        message: "Este e-mail já possui conta. Use Entrar no app com sua senha ou recupere o acesso por e-mail.",
      });
    } catch (err: unknown) {
      console.error("[trial-signup]", err);
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
        return res.status(201).json({
          status: "created",
          message: "Conta criada. Verifique seu e-mail para a senha e o link de confirmação.",
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

  app.get("/api/auth/verify-email", authVerifyLimit, async (req, res) => {
    try {
      const token = typeof req.query.token === "string" ? req.query.token : "";
      if (!token) return res.status(400).json({ error: "Token inválido" });

      const record = await storage.findValidVerificationToken(hashToken(token));
      if (!record) return res.status(400).json({ error: "Link inválido ou expirado" });

      await storage.markVerificationTokenUsed(record.id);
      const user = await storage.updateUser(record.userId, { emailVerified: true });
      if (!user) return res.status(500).json({ error: "Usuário não encontrado" });

      loginSession(req, user, res, { ok: true, user: toAuthUserPayload(user) });
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

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Não autenticado" });
    const user = await storage.getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: "Não autenticado" });
    res.json(toAuthUserPayload(user));
  });
}
