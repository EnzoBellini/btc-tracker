import type { Express, Request, Response } from "express";
import type { PlanId } from "@trackion/billing";
import { PLAN_CATALOG } from "@trackion/billing";
import { storage } from "../storage";
import * as billingStorage from "./storage";
import { activatePaidPlan } from "./subscriptionService";

export type BillingCurrency = "BRL" | "USD";

function stripeCheckoutEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY?.startsWith("sk_");
}

function stripeWebhookEnabled(): boolean {
  return stripeCheckoutEnabled() && !!process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_");
}

async function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY não configurada");
  const Stripe = (await import("stripe")).default;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

export function parseCheckoutCurrency(body: { currency?: unknown; market?: unknown }): BillingCurrency {
  const { currency, market } = body;
  if (currency === "USD" || market === "us") return "USD";
  if (currency === "BRL" || market === "br") return "BRL";
  return "BRL";
}

function priceIdForPlan(planId: PlanId, currency: BillingCurrency): string | undefined {
  if (currency === "USD") {
    const us: Record<PlanId, string | undefined> = {
      starter: process.env.STRIPE_PRICE_STARTER_US,
      pro: process.env.STRIPE_PRICE_PRO_US,
      elite: process.env.STRIPE_PRICE_ELITE_US,
    };
    return us[planId];
  }
  const brl: Record<PlanId, string | undefined> = {
    starter: process.env.STRIPE_PRICE_STARTER,
    pro: process.env.STRIPE_PRICE_PRO,
    elite: process.env.STRIPE_PRICE_ELITE,
  };
  return brl[planId];
}

export function registerStripeRoutes(app: Express) {
  app.get("/api/billing/plans", (_req, res) => {
    res.json({
      plans: Object.values(PLAN_CATALOG).map((p) => ({
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        priceCents: p.priceCents,
        currency: p.currency,
        highlights: p.highlights,
        stripeEnabled: stripeCheckoutEnabled(),
        stripeWebhookEnabled: stripeWebhookEnabled(),
      })),
    });
  });

  app.post("/api/billing/checkout", async (req, res) => {
    if (!stripeCheckoutEnabled()) {
      return res.status(503).json({ error: "Pagamentos ainda não configurados. Contate o suporte." });
    }
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Não autenticado" });

    const planId = req.body?.planId as PlanId;
    if (!planId || !PLAN_CATALOG[planId]) {
      return res.status(400).json({ error: "Plano inválido" });
    }
    const currency = parseCheckoutCurrency(req.body);
    const priceId = priceIdForPlan(planId, currency);
    if (!priceId) {
      return res.status(503).json({
        error: `Price ID Stripe não configurado para ${planId} (${currency})`,
      });
    }

    try {
      const stripe = await getStripe();
      const user = await storage.getUserById(userId);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

      let sub = await billingStorage.getSubscriptionByUserId(userId);
      let customerId = sub?.stripeCustomerId ?? undefined;

      if (!customerId) {
        const customer = await stripe.customers.create({ email: user.email, metadata: { userId: String(userId) } });
        customerId = customer.id;
        await billingStorage.updateSubscription(userId, { stripeCustomerId: customerId });
      }

      const appUrl = process.env.APP_URL ?? "http://localhost:5000";
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/#/billing?success=1`,
        cancel_url: `${appUrl}/#/billing?canceled=1`,
        metadata: { userId: String(userId), planId, currency },
      });

      res.json({ url: session.url });
    } catch (e) {
      console.error("[billing/checkout]", e);
      res.status(500).json({ error: "Erro ao iniciar checkout" });
    }
  });

  app.post("/api/billing/portal", async (req, res) => {
    if (!stripeCheckoutEnabled()) {
      return res.status(503).json({ error: "Portal de cobrança não configurado" });
    }
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Não autenticado" });

    const sub = await billingStorage.getSubscriptionByUserId(userId);
    if (!sub?.stripeCustomerId) {
      return res.status(400).json({ error: "Nenhuma assinatura Stripe vinculada" });
    }

    try {
      const stripe = await getStripe();
      const appUrl = process.env.APP_URL ?? "http://localhost:5000";
      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripeCustomerId,
        return_url: `${appUrl}/#/billing`,
      });
      res.json({ url: session.url });
    } catch (e) {
      console.error("[billing/portal]", e);
      res.status(500).json({ error: "Erro ao abrir portal" });
    }
  });

  app.post("/api/billing/webhook", async (req: Request, res: Response) => {
    if (!stripeWebhookEnabled()) return res.status(503).end();
    const sig = req.headers["stripe-signature"];
    if (!sig || typeof sig !== "string") return res.status(400).send("Missing signature");

    try {
      const stripe = await getStripe();
      const raw = req.rawBody as Buffer | undefined;
      if (!raw) return res.status(400).send("Missing body");

      const event = stripe.webhooks.constructEvent(
        raw,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as { metadata?: { userId?: string; planId?: string }; subscription?: string };
        const userId = parseInt(session.metadata?.userId ?? "", 10);
        const planId = session.metadata?.planId as PlanId | undefined;
        if (userId && planId && PLAN_CATALOG[planId]) {
          await activatePaidPlan(userId, planId, {
            stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
            source: "checkout",
          });
        }
      }

      if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
        const sub = event.data.object as {
          id: string;
          status: string;
          metadata?: { userId?: string; planId?: string };
          current_period_end?: number;
        };
        const userId = parseInt(sub.metadata?.userId ?? "", 10);
        if (!userId) return res.json({ received: true });

        if (sub.status === "active" || sub.status === "trialing") {
          const planId = (sub.metadata?.planId as PlanId) ?? "pro";
          await activatePaidPlan(userId, planId, {
            stripeSubscriptionId: sub.id,
            periodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined,
            source: "checkout",
          });
        } else if (sub.status === "past_due") {
          await billingStorage.updateSubscription(userId, { status: "past_due" });
        } else {
          await billingStorage.updateSubscription(userId, { status: "canceled" });
        }
      }

      res.json({ received: true });
    } catch (e) {
      console.error("[billing/webhook]", e);
      res.status(400).send("Webhook error");
    }
  });
}
