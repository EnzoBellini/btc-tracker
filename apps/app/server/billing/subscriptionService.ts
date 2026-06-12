import { TRIAL_DAYS } from "@trackion/billing";
import type { PlanId } from "@trackion/billing";
import { resolveSubscription, type ResolvedSubscription } from "@trackion/billing";
import type { Subscription, SubscriptionStatus } from "@shared/schema";
import { storage } from "../storage";
import { db } from "../db";
import * as billingStorage from "./storage";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toSubscriptionSnapshot(sub: Subscription | undefined) {
  if (!sub) return null;
  return {
    planId: sub.planId as PlanId,
    status: sub.status as SubscriptionStatus,
    trialEndsAt: sub.trialEndsAt,
    currentPeriodEnd: sub.currentPeriodEnd,
  };
}

export async function getResolvedSubscription(userId: number): Promise<ResolvedSubscription> {
  if (!db && process.env.NODE_ENV !== "production") {
    const elite = { planId: "elite" as PlanId, status: "trialing" as const, trialEndsAt: new Date("2099-12-31"), currentPeriodEnd: null };
    return resolveSubscription(elite);
  }
  const sub = await billingStorage.getSubscriptionByUserId(userId);
  return resolveSubscription(toSubscriptionSnapshot(sub));
}

/** Trial gratuito de 14 dias já foi solicitado ou utilizado para este e-mail. */
export async function hasUsedFreeTrial(userId: number): Promise<boolean> {
  const user = await storage.getUserById(userId);
  if (!user) return false;
  if (user.trialUsedAt) return true;

  const sub = await billingStorage.getSubscriptionByUserId(userId);
  if (!sub) return false;

  return (
    sub.source === "trial_signup" ||
    sub.status === "trialing" ||
    sub.status === "active" ||
    sub.status === "past_due"
  );
}

export async function startTrialForUser(userId: number): Promise<Subscription> {
  const user = await storage.getUserById(userId);
  if (!user) throw new Error("User not found");
  if (user.trialUsedAt) {
    const existing = await billingStorage.getSubscriptionByUserId(userId);
    if (existing) return existing;
    throw new Error("Trial já utilizado para este e-mail");
  }

  const trialEndsAt = addDays(new Date(), TRIAL_DAYS);
  await storage.updateUser(userId, { trialUsedAt: new Date() });

  return billingStorage.upsertSubscription({
    userId,
    planId: "elite",
    status: "trialing",
    trialEndsAt,
    source: "trial_signup",
  });
}

/** Trial Elite só após confirmar o e-mail (landing / auth enter). */
export async function activateTrialAfterEmailVerification(userId: number): Promise<Subscription | null> {
  const user = await storage.getUserById(userId);
  if (!user?.emailVerified) return null;
  if (user.trialUsedAt) {
    return (await billingStorage.getSubscriptionByUserId(userId)) ?? null;
  }
  const existing = await billingStorage.getSubscriptionByUserId(userId);
  if (existing?.status === "trialing" || existing?.status === "active") {
    return existing;
  }
  return startTrialForUser(userId);
}

export async function activatePaidPlan(
  userId: number,
  planId: PlanId,
  opts?: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    periodEnd?: Date;
    source?: "checkout" | "admin_override";
  },
): Promise<Subscription> {
  const now = new Date();
  const periodEnd = opts?.periodEnd ?? addDays(now, 30);
  return billingStorage.upsertSubscription({
    userId,
    planId,
    status: "active",
    trialEndsAt: null,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    stripeCustomerId: opts?.stripeCustomerId ?? null,
    stripeSubscriptionId: opts?.stripeSubscriptionId ?? null,
    source: opts?.source ?? "checkout",
  });
}

export async function adminOverrideSubscription(
  userId: number,
  data: {
    planId?: PlanId;
    status?: SubscriptionStatus;
    extendTrialDays?: number;
  },
): Promise<Subscription | undefined> {
  const sub = await billingStorage.getSubscriptionByUserId(userId);
  if (!sub && !data.planId) return undefined;

  const patch: Parameters<typeof billingStorage.updateSubscription>[1] = {
    source: "admin_override",
  };
  if (data.planId) patch.planId = data.planId;
  if (data.status) patch.status = data.status;
  if (data.extendTrialDays != null) {
    const base = sub?.trialEndsAt ? new Date(sub.trialEndsAt) : new Date();
    patch.trialEndsAt = addDays(base, data.extendTrialDays);
    patch.status = "trialing";
    patch.planId = "elite";
  }

  if (!sub) {
    return billingStorage.upsertSubscription({
      userId,
      planId: data.planId ?? "elite",
      status: data.status ?? "trialing",
      trialEndsAt: patch.trialEndsAt ?? addDays(new Date(), TRIAL_DAYS),
      source: "admin_override",
    });
  }
  return billingStorage.updateSubscription(userId, patch);
}

export async function runSubscriptionMaintenance(): Promise<{ expired: number }> {
  const expired = await billingStorage.expireTrialsPastDue();
  return { expired };
}
