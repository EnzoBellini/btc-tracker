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

async function findStripeCustomerId(
  stripe: Stripe,
  userId: number,
  email: string,
): Promise<string | undefined> {
  const existing = await billingStorage.getSubscriptionByUserId(userId);
  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  const normalized = email.toLowerCase().trim();
  const byEmail = await stripe.customers.list({ email: normalized, limit: 10 });
  const emailMatch =
    byEmail.data.find((c) => c.metadata?.userId === String(userId)) ??
    byEmail.data.find((c) => c.email?.toLowerCase() === normalized) ??
    byEmail.data[0];
  if (emailMatch?.id) return emailMatch.id;

  try {
    const search = await stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
      limit: 1,
    });
    if (search.data[0]?.id) return search.data[0].id;
  } catch {
    // search API indisponível em algumas contas
  }

  return undefined;
}

async function inferPlanIdFromStripePrice(
  stripe: Stripe,
  priceId: string | undefined,
  existingPlanId?: string | null,
): Promise<PlanId> {
  if (priceId) {
    const fromEnv = inferPlanIdFromPrice(priceId);
    if (fromEnv) return fromEnv;
    try {
      const price = await stripe.prices.retrieve(priceId);
      const metaPlan = price.metadata?.trackion_plan_id as PlanId | undefined;
      if (metaPlan && PLAN_CATALOG[metaPlan]) return metaPlan;
    } catch {
      // ignore
    }
  }
  if (existingPlanId && PLAN_CATALOG[existingPlanId as PlanId]) {
    return existingPlanId as PlanId;
  }
  return "pro";
}

function isPayableSubscription(status: Stripe.Subscription.Status): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}

/** Sincroniza assinatura ativa do Stripe para o usuário logado (recuperação se webhook falhou). */
export async function syncSubscriptionFromStripe(
  stripe: Stripe,
  userId: number,
  email: string,
): Promise<{ activated: boolean; planId?: PlanId; reason?: string }> {
  const existing = await billingStorage.getSubscriptionByUserId(userId);
  const customerId = await findStripeCustomerId(stripe, userId, email);

  if (customerId) {
    const checkoutSessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 10,
    });
    for (const session of checkoutSessions.data) {
      if (session.metadata?.userId && session.metadata.userId !== String(userId)) continue;
      const fulfilled = await fulfillCheckoutSession(stripe, session, userId);
      if (fulfilled.activated) return { activated: true, planId: fulfilled.planId };
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10,
    });
    const sub = subscriptions.data.find((s) => isPayableSubscription(s.status));
    if (sub) {
      const planId = await inferPlanIdFromStripePrice(
        stripe,
        sub.items.data[0]?.price?.id,
        sub.metadata?.planId ?? existing?.planId,
      );
      await activatePaidPlan(userId, planId, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: sub.id,
        periodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined,
        source: "checkout",
      });
      return { activated: true, planId };
    }
  }

  // Fallback: checkout sessions com metadata userId (sem customer vinculado ainda)
  try {
    const sessionSearch = await stripe.checkout.sessions.search({
      query: `metadata['userId']:'${userId}' AND status:'complete'`,
      limit: 5,
    });
    for (const session of sessionSearch.data) {
      const fulfilled = await fulfillCheckoutSession(stripe, session, userId);
      if (fulfilled.activated) return { activated: true, planId: fulfilled.planId };
    }
  } catch (e) {
    console.warn("[billing/sync] checkout session search", e);
  }

  if (!customerId) return { activated: false, reason: "no_stripe_customer" };
  return { activated: false, reason: "no_active_subscription" };
}

function inferPlanIdFromPrice(priceId: string | undefined): PlanId | undefined {
  if (!priceId) return undefined;
  const entries: [string | undefined, PlanId][] = [
    [process.env.STRIPE_PRICE_STARTER, "starter"],
    [process.env.STRIPE_PRICE_PRO, "pro"],
    [process.env.STRIPE_PRICE_ELITE, "elite"],
    [process.env.STRIPE_PRICE_STARTER_US, "starter"],
    [process.env.STRIPE_PRICE_PRO_US, "pro"],
    [process.env.STRIPE_PRICE_ELITE_US, "elite"],
  ];
  for (const [envPrice, planId] of entries) {
    if (envPrice && envPrice === priceId) return planId;
  }
  return undefined;
}
