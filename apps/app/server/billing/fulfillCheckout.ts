import type Stripe from "stripe";
import type { PlanId } from "@trackion/billing";
import { PLAN_CATALOG } from "@trackion/billing";
import * as billingStorage from "./storage";
import { activatePaidPlan } from "./subscriptionService";

async function resolveUserIdFromSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  expectedUserId?: number,
): Promise<number | null> {
  const fromMeta = parseInt(session.metadata?.userId ?? "", 10);
  const userId = fromMeta || expectedUserId;
  if (!userId) return null;
  if (expectedUserId && userId !== expectedUserId) return null;

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  if (subscriptionId) {
    const row = await billingStorage.getSubscriptionByStripeSubscriptionId(subscriptionId);
    if (row && expectedUserId && row.userId !== expectedUserId) return null;
    if (row) return row.userId;
  }

  if (customerId) {
    const row = await billingStorage.getSubscriptionByStripeCustomerId(customerId);
    if (row && expectedUserId && row.userId !== expectedUserId) return null;
    if (row) return row.userId;
  }

  return userId;
}

/** Ativa plano pago a partir de Checkout Session confirmada (webhook + fallback na success page). */
export async function fulfillCheckoutSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  expectedUserId?: number,
): Promise<{ activated: boolean; planId?: PlanId }> {
  if (session.status !== "complete" || session.payment_status !== "paid") {
    return { activated: false };
  }

  const planId = session.metadata?.planId as PlanId | undefined;
  if (!planId || !PLAN_CATALOG[planId]) return { activated: false };

  const userId = await resolveUserIdFromSession(stripe, session, expectedUserId);
  if (!userId) return { activated: false };

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  let periodEnd: Date | undefined;
  if (subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (subscription.current_period_end) {
        periodEnd = new Date(subscription.current_period_end * 1000);
      }
    } catch (e) {
      console.warn("[billing/fulfill] subscription retrieve", subscriptionId, e);
    }
  }

  await activatePaidPlan(userId, planId, {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    periodEnd,
    source: "checkout",
  });

  return { activated: true, planId };
}

/** Sincroniza assinatura ativa do Stripe para o usuário logado (recuperação se webhook falhou). */
export async function syncSubscriptionFromStripe(
  stripe: Stripe,
  userId: number,
  email: string,
): Promise<{ activated: boolean; planId?: PlanId; reason?: string }> {
  const existing = await billingStorage.getSubscriptionByUserId(userId);
  let customerId = existing?.stripeCustomerId ?? undefined;

  if (!customerId) {
    const customers = await stripe.customers.list({ email, limit: 5 });
    const match =
      customers.data.find((c) => c.metadata?.userId === String(userId)) ?? customers.data[0];
    customerId = match?.id;
  }

  if (!customerId) {
    return { activated: false, reason: "no_stripe_customer" };
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 3,
  });

  const sub =
    subscriptions.data.find((s) => s.status === "active" || s.status === "trialing") ??
    subscriptions.data[0];

  if (!sub) {
    return { activated: false, reason: "no_active_subscription" };
  }

  const planFromMeta = sub.metadata?.planId as PlanId | undefined;
  let planId: PlanId;
  if (planFromMeta && PLAN_CATALOG[planFromMeta]) {
    planId = planFromMeta;
  } else if (existing?.planId && PLAN_CATALOG[existing.planId as PlanId]) {
    planId = existing.planId as PlanId;
  } else {
    const priceId = sub.items.data[0]?.price?.id;
    planId = inferPlanIdFromPrice(priceId) ?? "pro";
  }

  await activatePaidPlan(userId, planId, {
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    periodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined,
    source: "checkout",
  });

  return { activated: true, planId };
}

function inferPlanIdFromPrice(priceId: string | undefined): PlanId | undefined {
  if (!priceId) return undefined;
  const map: Record<string, PlanId | undefined> = {
    [process.env.STRIPE_PRICE_STARTER ?? ""]: "starter",
    [process.env.STRIPE_PRICE_PRO ?? ""]: "pro",
    [process.env.STRIPE_PRICE_ELITE ?? ""]: "elite",
    [process.env.STRIPE_PRICE_STARTER_US ?? ""]: "starter",
    [process.env.STRIPE_PRICE_PRO_US ?? ""]: "pro",
    [process.env.STRIPE_PRICE_ELITE_US ?? ""]: "elite",
  };
  return map[priceId];
}
