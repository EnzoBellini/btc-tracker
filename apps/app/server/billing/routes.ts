import type { Express } from "express";
import { PLAN_CATALOG } from "@trackion/billing";
import { getResolvedSubscription, startTrialForUser } from "./subscriptionService";
import { registerStripeRoutes } from "./stripe";

export function registerBillingRoutes(app: Express) {
  registerStripeRoutes(app);

  app.get("/api/me/subscription", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Não autenticado" });

    const resolved = await getResolvedSubscription(userId);
    res.json({
      status: resolved.status,
      effectivePlanId: resolved.effectivePlanId,
      hasAccess: resolved.hasAccess,
      trialEnded: resolved.trialEnded,
      daysLeftInTrial: resolved.daysLeftInTrial,
      entitlements: resolved.entitlements,
      plan: resolved.plan
        ? {
            id: resolved.plan.id,
            name: resolved.plan.name,
            priceCents: resolved.plan.priceCents,
            highlights: resolved.plan.highlights,
          }
        : null,
      catalog: Object.values(PLAN_CATALOG).map((p) => ({
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        priceCents: p.priceCents,
        highlights: p.highlights,
      })),
    });
  });
}

export { startTrialForUser, activateTrialAfterEmailVerification, hasUsedFreeTrial } from "./subscriptionService";
