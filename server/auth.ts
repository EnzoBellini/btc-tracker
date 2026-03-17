/**
 * Authentication middleware using express-session + bcryptjs.
 * Simple username/password auth — no OAuth, no JWT.
 * For production, swap MemStorage for a real DB and use proper session store.
 */
import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

// ── Types ──────────────────────────────────────────────────────────────────
declare module "express-session" {
  interface SessionData {
    userId: number;
    userEmail: string;
  }
}

// ── Session middleware ─────────────────────────────────────────────────────
export function setupSession(app: Express) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? "btc-tracker-dev-secret-change-in-prod",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax",
      },
    })
  );
}

// ── requireAuth middleware ─────────────────────────────────────────────────
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) return next();
  res.status(401).json({ error: "Não autenticado" });
}

// ── Auth routes ────────────────────────────────────────────────────────────
export function registerAuthRoutes(app: Express) {
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email e senha obrigatórios" });
      if (password.length < 6) return res.status(400).json({ error: "Senha muito curta (mín. 6 caracteres)" });

      const normalizedEmail = email.toLowerCase().trim();
      const existing = await storage.getUserByEmail(normalizedEmail);
      if (existing) return res.status(409).json({ error: "Email já cadastrado" });

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await storage.createUser({ email: normalizedEmail, passwordHash });

      req.session.userId    = user.id;
      req.session.userEmail = user.email;
      res.status(201).json({ id: user.id, email: user.email });
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      console.error("[auth/register] Erro:", msg);
      res.status(500).json({
        error: "Erro interno",
        debug: msg, // TODO: remover após resolver
      });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email e senha obrigatórios" });

      const user = await storage.getUserByEmail(email.toLowerCase().trim());
      if (!user) return res.status(401).json({ error: "Email ou senha incorretos" });

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: "Email ou senha incorretos" });

      req.session.userId    = user.id;
      req.session.userEmail = user.email;
      res.json({ id: user.id, email: user.email });
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      console.error("[auth/login] Erro:", msg);
      res.status(500).json({
        error: "Erro interno",
        debug: msg, // TODO: remover após resolver
      });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
  });

  // Me — current session
  app.get("/api/auth/me", (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Não autenticado" });
    res.json({ id: req.session.userId, email: req.session.userEmail });
  });
}
