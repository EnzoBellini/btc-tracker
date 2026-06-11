/**
 * Testes de integração Stripe (modo test).
 * Uso: npm run test:stripe --workspace=apps/app
 * Requer apps/app/.env com STRIPE_SECRET_KEY (e opcionalmente STRIPE_PRICE_*).
 */
import "dotenv/config";
import Stripe from "stripe";
import { PLAN_CATALOG, type PlanId } from "@trackion/billing";

const PLANS: PlanId[] = ["starter", "pro", "elite"];

type CheckResult = { name: string; ok: boolean; detail?: string };

function envPriceKey(planId: PlanId): string {
  return `STRIPE_PRICE_${planId.toUpperCase()}` as "STRIPE_PRICE_STARTER";
}

async function main() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const publishable = process.env.STRIPE_PUBLISHABLE_KEY;

  const results: CheckResult[] = [];

  if (!secret?.startsWith("sk_test_")) {
    console.error("❌ STRIPE_SECRET_KEY ausente ou não é chave de teste (sk_test_...)");
    process.exit(1);
  }

  if (publishable && !publishable.startsWith("pk_test_")) {
    results.push({ name: "Publishable key", ok: false, detail: "Deve ser pk_test_..." });
  } else if (publishable) {
    results.push({ name: "Publishable key (formato)", ok: true });
  }

  const stripe = new Stripe(secret, { apiVersion: "2025-02-24.acacia" });

  // 1) Conexão API
  try {
    const balance = await stripe.balance.retrieve();
    results.push({
      name: "API: balance.retrieve",
      ok: true,
      detail: `livemode=${balance.livemode} (esperado false em test)`,
    });
    if (balance.livemode) {
      results.push({ name: "Modo test", ok: false, detail: "livemode=true — use sk_test_" });
    }
  } catch (e) {
    results.push({
      name: "API: balance.retrieve",
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
    });
  }

  // 2) Produtos / preços Trackion
  const priceIds: Partial<Record<PlanId, string>> = {};
  for (const planId of PLANS) {
    const envKey = envPriceKey(planId);
    const existing = process.env[envKey];
    if (existing?.startsWith("price_")) {
      try {
        const price = await stripe.prices.retrieve(existing);
        const expectedCents = PLAN_CATALOG[planId].priceCents;
        const ok = price.active && price.currency === "brl" && price.unit_amount === expectedCents;
        priceIds[planId] = existing;
        results.push({
          name: `Price ${planId} (${envKey})`,
          ok,
          detail: ok
            ? `${existing} · ${price.unit_amount} ${price.currency}/mo`
            : `${existing} · ${price.unit_amount} ${price.currency}/mo (esperado ${expectedCents} brl)`,
        });
      } catch (e) {
        results.push({
          name: `Price ${planId} (${envKey})`,
          ok: false,
          detail: `Inválido: ${existing} — ${e instanceof Error ? e.message : e}`,
        });
      }
      continue;
    }

    // Provisionar preço de teste se não configurado
    const catalog = PLAN_CATALOG[planId];
    try {
      const product = await stripe.products.create({
        name: `Trackion ${catalog.name} (test)`,
        metadata: { trackion_plan_id: planId },
      });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: catalog.priceCents,
        currency: "brl",
        recurring: { interval: "month" },
        metadata: { trackion_plan_id: planId },
      });
      priceIds[planId] = price.id;
      results.push({
        name: `Price ${planId} (criado)`,
        ok: true,
        detail: `Adicione ao .env: ${envKey}=${price.id}`,
      });
    } catch (e) {
      results.push({
        name: `Price ${planId} (criar)`,
        ok: false,
        detail: e instanceof Error ? e.message : String(e),
      });
    }
  }

  // 3) Checkout Session (sem cobrança — só valida API)
  const proPriceId = priceIds.pro ?? process.env.STRIPE_PRICE_PRO;
  if (proPriceId) {
    try {
      const customer = await stripe.customers.create({
        email: `stripe-test-${Date.now()}@trackion.test`,
        metadata: { source: "stripe-integration-test" },
      });
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customer.id,
        line_items: [{ price: proPriceId, quantity: 1 }],
        success_url: "http://localhost:5000/#/billing?success=1",
        cancel_url: "http://localhost:5000/#/billing?canceled=1",
        metadata: { userId: "0", planId: "pro", test: "true" },
      });
      results.push({
        name: "Checkout Session (Pro)",
        ok: !!session.url,
        detail: session.url ? `url ok (${session.id})` : "sem url",
      });
    } catch (e) {
      results.push({
        name: "Checkout Session (Pro)",
        ok: false,
        detail: e instanceof Error ? e.message : String(e),
      });
    }
  }

  // 4) Webhook secret (opcional para app completo)
  const wh = process.env.STRIPE_WEBHOOK_SECRET;
  results.push({
    name: "STRIPE_WEBHOOK_SECRET",
    ok: !!wh?.startsWith("whsec_"),
    detail: wh
      ? "configurado"
      : "ausente — rode: stripe listen --forward-to localhost:5000/api/billing/webhook",
  });

  // Relatório
  console.log("\n=== Stripe integration test (test mode) ===\n");
  let failed = 0;
  for (const r of results) {
    const icon = r.ok ? "✅" : "❌";
    console.log(`${icon} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
    if (!r.ok) failed++;
  }

  if (Object.keys(priceIds).length) {
    console.log("\n--- Sugestão .env (price IDs) ---");
    for (const [id, price] of Object.entries(priceIds)) {
      console.log(`${envPriceKey(id as PlanId)}=${price}`);
    }
  }

  const criticalFailed = results.filter((r) => !r.ok && r.name !== "STRIPE_WEBHOOK_SECRET").length;
  console.log(
    `\n${criticalFailed === 0 ? "Integração Stripe OK (test mode)." : `${criticalFailed} check(s) críticos falharam.`}`,
  );
  if (!wh?.startsWith("whsec_")) {
    console.log("ℹ️  Webhook: opcional até testar pagamento fim-a-fim com Stripe CLI.");
  }
  process.exit(criticalFailed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
