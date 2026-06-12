import type Stripe from "stripe";
import type { PlanId } from "@trackion/billing";
import { PLAN_CATALOG } from "@trackion/billing";
import * as billingStorage from "./storage";
import { activatePaidPlan } from "./subscriptionService";
import { fulfillCheckoutSession } from "./fulfillCheckout";

const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
] as const;

export { WEBHOOK_EVENTS };

async function resolveUserId(
  stripe: Stripe,
  opts: { userId?: number; customerId?: string | null; subscriptionId?: string | null },
): Promise<number | null> {
  if (opts.userId) return opts.userId;

  if (opts.subscriptionId) {
    const row = await billingStorage.getSubscriptionByStripeSubscriptionId(opts.subscriptionId);
    if (row) return row.userId;
  }

  if (opts.customerId) {
    const row = await billingStorage.getSubscriptionByStripeCustomerId(opts.customerId);
    if (row) return row.userId;

    try {
      const customer = await stripe.customers.retrieve(opts.customerId);
      if (!customer.deleted && customer.metadata?.userId) {
        const parsed = parseInt(customer.metadata.userId, 10);
        if (parsed) return parsed;
      }
    } catch {
      // customer pode ter sido removido
    }
  }

  return null;
}

async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  const result = await fulfillCheckoutSession(stripe, session);
  if (!result.activated) {
    console.warn("[billing/webhook] checkout.session.completed sem ativação", session.id);
  }
}

async function handleSubscriptionChange(stripe: Stripe, sub: Stripe.Subscription) {
  const metadataUserId = parseInt(sub.metadata?.userId ?? "", 10);
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

  const userId = await resolveUserId(stripe, {
    userId: metadataUserId || undefined,
    customerId,
    subscriptionId: sub.id,
  });
  if (!userId) {
    console.warn("[billing/webhook] subscription event sem userId", sub.id, sub.status);
    return;
  }

  if (sub.status === "active" || sub.status === "trialing") {
    const planFromMeta = sub.metadata?.planId as PlanId | undefined;
    let planId: PlanId;
    if (planFromMeta && PLAN_CATALOG[planFromMeta]) {
      planId = planFromMeta;
    } else {
      const existing = await billingStorage.getSubscriptionByUserId(userId);
      if (!existing?.planId) return;
      planId = existing.planId as PlanId;
    }
    await activatePaidPlan(userId, planId, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      periodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined,
      source: "checkout",
    });
    return;
  }

  if (sub.status === "past_due" || sub.status === "unpaid") {
    await billingStorage.updateSubscription(userId, { status: "past_due" });
    return;
  }

  if (sub.status === "canceled" || sub.status === "incomplete_expired") {
    await billingStorage.updateSubscription(userId, { status: "canceled" });
  }
}

export async function handleStripeWebhookEvent(stripe: Stripe, event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(stripe, event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionChange(stripe, event.data.object as Stripe.Subscription);
      break;
    default:
      break;
  }
}
