import type { PlanEntitlements, PlanId } from "./features";
import { PLAN_CATALOG, type PlanDefinition } from "./plans";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export interface SubscriptionSnapshot {
  planId: PlanId;
  status: SubscriptionStatus;
  trialEndsAt: Date | string | null;
  currentPeriodEnd: Date | string | null;
}

export interface ResolvedSubscription {
  effectivePlanId: PlanId | null;
  status: SubscriptionStatus;
  hasAccess: boolean;
  trialEnded: boolean;
  daysLeftInTrial: number | null;
  entitlements: PlanEntitlements | null;
  plan: PlanDefinition | null;
}

const GRACE_MS = 3 * 24 * 60 * 60 * 1000;

function toDate(v: Date | string | null | undefined): Date | null {
  if (!v) return null;
  return v instanceof Date ? v : new Date(v);
}

export function resolveSubscription(sub: SubscriptionSnapshot | null | undefined): ResolvedSubscription {
  if (!sub) {
    return {
      effectivePlanId: null,
      status: "expired",
      hasAccess: false,
      trialEnded: true,
      daysLeftInTrial: null,
      entitlements: null,
      plan: null,
    };
  }

  const now = Date.now();
  const trialEnds = toDate(sub.trialEndsAt);
  const periodEnd = toDate(sub.currentPeriodEnd);

  if (sub.status === "trialing") {
    if (trialEnds && trialEnds.getTime() > now) {
      const elite = PLAN_CATALOG.elite;
      const daysLeft = Math.ceil((trialEnds.getTime() - now) / (24 * 60 * 60 * 1000));
      return {
        effectivePlanId: "elite",
        status: "trialing",
        hasAccess: true,
        trialEnded: false,
        daysLeftInTrial: Math.max(0, daysLeft),
        entitlements: elite.entitlements,
        plan: elite,
      };
    }
    return {
      effectivePlanId: null,
      status: "expired",
      hasAccess: false,
      trialEnded: true,
      daysLeftInTrial: 0,
      entitlements: null,
      plan: null,
    };
  }

  if (sub.status === "active") {
    const plan = PLAN_CATALOG[sub.planId];
    return {
      effectivePlanId: sub.planId,
      status: "active",
      hasAccess: true,
      trialEnded: false,
      daysLeftInTrial: null,
      entitlements: plan.entitlements,
      plan,
    };
  }

  if (sub.status === "past_due") {
    if (periodEnd && periodEnd.getTime() + GRACE_MS > now) {
      const plan = PLAN_CATALOG[sub.planId];
      return {
        effectivePlanId: sub.planId,
        status: "past_due",
        hasAccess: true,
        trialEnded: false,
        daysLeftInTrial: null,
        entitlements: plan.entitlements,
        plan,
      };
    }
  }

  return {
    effectivePlanId: null,
    status: sub.status === "canceled" ? "canceled" : "expired",
    hasAccess: false,
    trialEnded: false,
    daysLeftInTrial: null,
    entitlements: null,
    plan: null,
  };
}

export function historyCutoffDate(entitlements: PlanEntitlements | null): string | null {
  if (!entitlements?.historyMaxDays) return null;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - entitlements.historyMaxDays);
  return d.toISOString().slice(0, 10);
}
