import type { Express, Request, Response } from "express";
import type { PlanId } from "@trackion/billing";
import { PLAN_CATALOG, stripeLookupKey } from "@trackion/billing";
import { storage } from "../storage";
import * as billingStorage from "./storage";
import { handleStripeWebhookEvent } from "./webhook";
import { fulfillCheckoutSession, syncSubscriptionFromStripe } from "./fulfillCheckout";

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

async function resolvePriceId(
  stripe: import("stripe").default,
  planId: PlanId,
  currency: BillingCurrency,
  lookupKey?: string,
): Promise<string | undefined> {
  const key = lookupKey ?? stripeLookupKey(planId, currency);
  try {
    const prices = await stripe.prices.list({ lookup_keys: [key], limit: 1 });
    if (prices.data[0]?.id) return prices.data[0].id;
  } catch {
    // fallback para env vars
  }
  return priceIdForPlan(planId, currency);
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
    const lookupKey = typeof req.body?.lookupKey === "string" ? req.body.lookupKey : undefined;

    try {
      const stripe = await getStripe();
      const priceId = await resolvePriceId(stripe, planId, currency, lookupKey);
      if (!priceId) {
        return res.status(503).json({
          error: `Price ID Stripe não configurado para ${planId} (${currency})`,
        });
      }

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
      const refId = typeof req.body?.refId === "string" ? req.body.refId : undefined;
      const couponCode = typeof req.body?.couponCode === "string" ? req.body.couponCode : undefined;
      const { resolveAffiliateCoupon } = await import("../affiliates/service");
      const affiliate = await resolveAffiliateCoupon(refId, couponCode);

      const sessionParams: import("stripe").Stripe.Checkout.SessionCreateParams = {
        mode: "subscription",
        customer: customerId,
        billing_address_collection: "auto",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/#/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/#/checkout?canceled=1`,
        metadata: {
          userId: String(userId),
          planId,
          currency,
          ...(affiliate.refId ? { affiliateRef: affiliate.refId } : {}),
        },
        subscription_data: {
          metadata: {
            userId: String(userId),
            planId,
          },
        },
        allow_promotion_codes: true,
      };

      if (affiliate.stripePromoId) {
        sessionParams.discounts = [{ promotion_code: affiliate.stripePromoId }];
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      res.json({ url: session.url });
    } catch (e) {
      console.error("[billing/checkout]", e);
      res.status(500).json({ error: "Erro ao iniciar checkout" });
    }
  });

  app.get("/api/billing/checkout-session", async (req, res) => {
    if (!stripeCheckoutEnabled()) {
      return res.status(503).json({ error: "Checkout não configurado" });
    }
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Não autenticado" });

    const sessionId = req.query.session_id;
    if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return res.status(400).json({ error: "session_id inválido" });
    }

    try {
      const stripe = await getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.metadata?.userId !== String(userId)) {
        return res.status(403).json({ error: "Sessão não pertence a este usuário" });
      }

      const fulfillment = await fulfillCheckoutSession(stripe, session, userId);

      const planId = session.metadata?.planId as PlanId | undefined;
      const plan = planId && PLAN_CATALOG[planId] ? PLAN_CATALOG[planId] : null;

      res.json({
        status: session.status,
        paymentStatus: session.payment_status,
        planName: plan?.name ?? null,
        planId: plan?.id ?? null,
        customerId: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
        accessGranted: fulfillment.activated,
      });
    } catch (e) {
      console.error("[billing/checkout-session]", e);
      res.status(500).json({ error: "Erro ao carregar sessão de checkout" });
    }
  });

  app.post("/api/billing/portal", async (req, res) => {
    if (!stripeCheckoutEnabled()) {
      return res.status(503).json({ error: "Portal de cobrança não configurado" });
    }
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Não autenticado" });

    const sub = await billingStorage.getSubscriptionByUserId(userId);
    let customerId = sub?.stripeCustomerId ?? undefined;

    const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : undefined;
    if (sessionId?.startsWith("cs_")) {
      try {
        const stripe = await getStripe();
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
        if (checkoutSession.metadata?.userId !== String(userId)) {
          return res.status(403).json({ error: "Sessão não pertence a este usuário" });
        }
        customerId =
          typeof checkoutSession.customer === "string"
            ? checkoutSession.customer
            : checkoutSession.customer?.id ?? customerId;
      } catch (e) {
        console.error("[billing/portal/session]", e);
        return res.status(400).json({ error: "Sessão de checkout inválida" });
      }
    }

    if (!customerId) {
      return res.status(400).json({ error: "Nenhuma assinatura Stripe vinculada" });
    }

    try {
      const stripe = await getStripe();
      const appUrl = process.env.APP_URL ?? "http://localhost:5000";
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${appUrl}/#/billing`,
      });
      res.json({ url: session.url });
    } catch (e) {
      console.error("[billing/portal]", e);
      res.status(500).json({ error: "Erro ao abrir portal" });
    }
  });

  app.post("/api/billing/sync-subscription", async (req, res) => {
    if (!stripeCheckoutEnabled()) {
      return res.status(503).json({ error: "Billing não configurado" });
    }
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Não autenticado" });

    try {
      const user = await storage.getUserById(userId);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

      const stripe = await getStripe();
      const result = await syncSubscriptionFromStripe(stripe, userId, user.email);

      if (!result.activated) {
        return res.status(404).json({
          error: "Não encontramos assinatura ativa no Stripe. Aguarde alguns minutos ou contate o suporte.",
          reason: result.reason,
        });
      }

      const resolved = await import("./subscriptionService").then((m) => m.getResolvedSubscription(userId));
      res.json({
        ok: true,
        planId: result.planId,
        hasAccess: resolved.hasAccess,
      });
    } catch (e) {
      console.error("[billing/sync-subscription]", e);
      res.status(500).json({ error: "Erro ao sincronizar assinatura" });
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

      await handleStripeWebhookEvent(stripe, event);

      res.json({ received: true });
    } catch (e) {
      console.error("[billing/webhook]", e);
      res.status(400).send("Webhook error");
    }
  });
}
