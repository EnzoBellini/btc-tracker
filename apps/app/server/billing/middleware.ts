import type { Request, Response, NextFunction } from "express";
import { getResolvedSubscription } from "./subscriptionService";
import { sendSubscriptionRequired } from "./entitlements";

const SUBSCRIPTION_EXEMPT = new Set([
  "GET:/api/auth/me",
  "POST:/api/auth/logout",
  "PATCH:/api/auth/password",
  "GET:/api/me/subscription",
  "GET:/api/billing/plans",
  "POST:/api/billing/checkout",
  "POST:/api/billing/portal",
  "POST:/api/billing/webhook",
]);

export function requireSubscriptionMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith("/api")) return next();
    if (req.path.startsWith("/api/admin")) return next();

    const key = `${req.method}:${req.path}`;
    if (SUBSCRIPTION_EXEMPT.has(key)) return next();

    const userId = req.session?.userId;
    if (!userId) return next();

    const resolved = await getResolvedSubscription(userId);
    if (!resolved.hasAccess) {
      return sendSubscriptionRequired(res, resolved.trialEnded);
    }
    next();
  };
}
