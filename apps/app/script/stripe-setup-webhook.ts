/**
 * Registra (ou atualiza) o endpoint de webhook Stripe para o Trackion.
 * Uso: npm run stripe:setup-webhook --workspace=apps/app
 *
 * Imprime STRIPE_WEBHOOK_SECRET — guarde no .env / Railway.
 * O secret só é exibido na criação; se o endpoint já existir, use o Dashboard ou recrie.
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import Stripe from "stripe";
import { WEBHOOK_EVENTS } from "../server/billing/webhook";

config({ path: resolve(import.meta.dirname, "../.env") });

const APP_URL = (process.env.APP_URL ?? "https://app.trackion.app").replace(/\/$/, "");
const WEBHOOK_URL =
  process.env.STRIPE_WEBHOOK_URL ??
  (APP_URL.includes("localhost") ? "https://app.trackion.app/api/billing/webhook" : `${APP_URL}/api/billing/webhook`);

const freshSecret = process.argv.includes("--fresh-secret");

async function main() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret?.startsWith("sk_")) {
    console.error("❌ STRIPE_SECRET_KEY ausente ou inválida em apps/app/.env");
    process.exit(1);
  }

  const stripe = new Stripe(secret, { apiVersion: "2025-02-24.acacia" });
  const enabledEvents = [...WEBHOOK_EVENTS];

  console.log(`\n🔎 Procurando webhook em ${WEBHOOK_URL}\n`);

  const existing = await stripe.webhookEndpoints.list({ limit: 100 });
  const match = existing.data.find((e) => e.url === WEBHOOK_URL);

  if (match) {
    if (freshSecret) {
      console.log(`↻ Recriando endpoint ${match.id} para emitir novo signing secret…`);
      await stripe.webhookEndpoints.del(match.id);
    } else {
      const updated = await stripe.webhookEndpoints.update(match.id, {
        enabled_events: enabledEvents,
        disabled: false,
      });
      console.log(`✓ Endpoint já existia (${updated.id}) — eventos atualizados:`);
      for (const ev of enabledEvents) console.log(`  · ${ev}`);
      console.log("\n⚠️  O signing secret não é reemitido ao atualizar.");
      console.log("   Dashboard → Developers → Webhooks → Signing secret");
      console.log(`   Ou: npm run stripe:setup-webhook -- --fresh-secret\n`);
      return;
    }
  }

  const endpoint = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: enabledEvents,
    description: "Trackion billing — assinaturas Checkout",
  });

  console.log("✅ Webhook criado:");
  console.log(`   ID:  ${endpoint.id}`);
  console.log(`   URL: ${endpoint.url}`);
  console.log("\n--- Adicione ao apps/app/.env (e Railway) ---");
  console.log(`STRIPE_WEBHOOK_SECRET=${endpoint.secret}`);
  console.log("\nEventos:");
  for (const ev of enabledEvents) console.log(`  · ${ev}`);
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
