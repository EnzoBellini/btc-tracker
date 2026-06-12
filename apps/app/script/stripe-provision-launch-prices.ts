/**
 * Cria preços Stripe alinhados ao catálogo atual (promo de lançamento).
 * Uso: npx tsx apps/app/script/stripe-provision-launch-prices.ts
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import Stripe from "stripe";
import { PLAN_CATALOG, stripeLookupKey, type PlanId } from "@trackion/billing";

config({ path: resolve(import.meta.dirname, "../.env") });

const PLANS: PlanId[] = ["starter", "pro", "elite"];

type CurrencySpec = { currency: "brl" | "usd"; envSuffix: "" | "_US" };

const CURRENCIES: CurrencySpec[] = [
  { currency: "brl", envSuffix: "" },
  { currency: "usd", envSuffix: "_US" },
];

function envKey(planId: PlanId, suffix: "" | "_US"): string {
  return `STRIPE_PRICE_${planId.toUpperCase()}${suffix}`;
}

async function findOrCreateProduct(stripe: Stripe, planId: PlanId, currency: "brl" | "usd") {
  const products = await stripe.products.search({
    query: `metadata['trackion_plan_id']:'${planId}' AND metadata['trackion_currency']:'${currency}'`,
    limit: 1,
  });
  if (products.data[0]) return products.data[0];

  const catalog = PLAN_CATALOG[planId];
  return stripe.products.create({
    name: `Trackion ${catalog.name} (${currency.toUpperCase()})`,
    metadata: { trackion_plan_id: planId, trackion_currency: currency },
  });
}

async function main() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret?.startsWith("sk_")) {
    console.error("STRIPE_SECRET_KEY ausente ou inválida");
    process.exit(1);
  }

  const stripe = new Stripe(secret, { apiVersion: "2025-02-24.acacia" });
  const updates: string[] = [];

  for (const { currency, envSuffix } of CURRENCIES) {
    if (envSuffix === "_US" && !process.env.STRIPE_PRICE_STARTER_US && currency === "usd") {
      // USD opcional — ainda provisiona se não houver nenhuma chave _US
    }

    for (const planId of PLANS) {
      const catalog = PLAN_CATALOG[planId];
      const key = envKey(planId, envSuffix);
      const existingId = process.env[key];

      if (existingId?.startsWith("price_")) {
        try {
          const existing = await stripe.prices.retrieve(existingId);
          if (existing.active && existing.unit_amount === catalog.priceCents && existing.currency === currency) {
            console.log(`✓ ${key} já correto (${existingId})`);
            updates.push(`${key}=${existingId}`);
            continue;
          }
          console.log(`↻ ${key} desatualizado (${existingId}) — criando novo preço`);
        } catch {
          console.log(`↻ ${key} inválido — criando novo preço`);
        }
      }

      const product = await findOrCreateProduct(stripe, planId, currency);
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: catalog.priceCents,
        currency,
        recurring: { interval: "month" },
        lookup_key: stripeLookupKey(planId, currency === "usd" ? "USD" : "BRL"),
        metadata: { trackion_plan_id: planId, trackion_launch: "true" },
      });

      if (existingId?.startsWith("price_")) {
        try {
          await stripe.prices.update(existingId, { active: false });
        } catch {
          // preço antigo pode estar em uso
        }
      }

      console.log(`✅ ${key}=${price.id} (${catalog.priceCents / 100} ${currency}/mo)`);
      updates.push(`${key}=${price.id}`);
    }
  }

  console.log("\n--- Atualize apps/app/.env ---");
  for (const line of updates) console.log(line);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
