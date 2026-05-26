import type { Express, Request, Response, NextFunction } from "express";
import type { PlanId } from "@trackion/billing";
import { PLAN_CATALOG } from "@trackion/billing";
import { SUBSCRIPTION_STATUSES } from "@shared/schema";
import * as billingStorage from "../billing/storage";
import { adminOverrideSubscription } from "../billing/subscriptionService";

function requireAdminKey(req: Request, res: Response, next: NextFunction) {
  const key = process.env.ADMIN_API_KEY;
  if (!key) {
    return res.status(503).json({ error: "ADMIN_API_KEY não configurada" });
  }
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : req.headers["x-admin-key"];
  if (token !== key) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  next();
}

export function registerAdminRoutes(app: Express) {
  app.use("/api/admin", requireAdminKey);

  app.get("/api/admin/stats", async (_req, res) => {
    const stats = await billingStorage.getAdminStats();
    res.json(stats);
  });

  app.get("/api/admin/plans", (_req, res) => {
    res.json({ plans: Object.values(PLAN_CATALOG) });
  });

  app.get("/api/admin/subscriptions", async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const limit = parseInt(String(req.query.limit ?? "50"), 10);
    const offset = parseInt(String(req.query.offset ?? "0"), 10);
    const data = await billingStorage.listSubscriptionsAdmin({ q, limit, offset });
    res.json(data);
  });

  app.get("/api/admin/users/:email", async (req, res) => {
    const user = await billingStorage.findUserByEmailAdmin(req.params.email);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    const sub = await billingStorage.getSubscriptionByUserId(user.id);
    res.json({ user: { id: user.id, email: user.email, trialUsedAt: user.trialUsedAt, createdAt: user.createdAt }, subscription: sub });
  });

  app.patch("/api/admin/users/:userId/subscription", async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    if (!Number.isFinite(userId)) return res.status(400).json({ error: "userId inválido" });

    const { planId, status, extendTrialDays } = req.body as {
      planId?: PlanId;
      status?: (typeof SUBSCRIPTION_STATUSES)[number];
      extendTrialDays?: number;
    };

    if (planId && !PLAN_CATALOG[planId]) {
      return res.status(400).json({ error: "Plano inválido" });
    }
    if (status && !SUBSCRIPTION_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const updated = await adminOverrideSubscription(userId, { planId, status, extendTrialDays });
    await billingStorage.insertAdminAudit("subscription_override", userId, req.body);
    res.json({ subscription: updated });
  });
}
