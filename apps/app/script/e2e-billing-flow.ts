/**
 * Prepara usuários de teste e valida o fluxo trial → paywall → assinatura.
 *
 * Uso: npm run test:billing-flow --workspace=apps/app
 *
 * Depois, no navegador (com npm run dev):
 * - Login trial: e2e-trial@trackion.test
 * - Login payer: e2e-payer@trackion.test
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createPgPool } from "../server/lib/pg";
import { db } from "../server/db";
import { storage } from "../server/storage";
import * as billingStorage from "../server/billing/storage";
import {
  getResolvedSubscription,
  startTrialForUser,
  activatePaidPlan,
  runSubscriptionMaintenance,
} from "../server/billing/subscriptionService";
import { TRIAL_DAYS } from "@trackion/billing";

const TRIAL_EMAIL = "e2e-trial@trackion.test";
const PAYER_EMAIL = "e2e-payer@trackion.test";
const TEST_PASSWORD = "TrackionE2E2024!@x";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function ensureBillingTables() {
  const pool = createPgPool();
  const client = await pool.connect();
  try {
    const r = await client.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'subscriptions' LIMIT 1
    `);
    if (r.rows.length > 0) return;
    console.log("→ Aplicando migrate-billing.sql …");
    const sql = readFileSync(path.join(appRoot, "script/migrate-billing.sql"), "utf8");
    await client.query(sql);
  } finally {
    client.release();
    await pool.end();
  }
}

async function resetUser(email: string, opts: { withTrial: boolean }) {
  const normalized = email.toLowerCase();
  let user = await storage.getUserByEmail(normalized);
  if (user) {
    await billingStorage.updateSubscription(user.id, { status: "expired" }).catch(() => {});
    const pool = createPgPool();
    const c = await pool.connect();
    try {
      await c.query("DELETE FROM subscriptions WHERE user_id = $1", [user.id]);
      await c.query("DELETE FROM users WHERE id = $1", [user.id]);
    } finally {
      c.release();
      await pool.end();
    }
  }

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);
  user = await storage.createUser({
    email: normalized,
    passwordHash,
    emailVerified: true,
    mustChangePassword: false,
    onboardingCompleted: true,
    onboardingStep: 0,
  });

  if (opts.withTrial) {
    await startTrialForUser(user.id);
  }

  return user;
}

function printResolved(label: string, userId: number, r: Awaited<ReturnType<typeof getResolvedSubscription>>) {
  console.log(`  ${label}:`);
  console.log(`    status=${r.status} plan=${r.effectivePlanId} access=${r.hasAccess} trialEnded=${r.trialEnded} daysLeft=${r.daysLeftInTrial}`);
  console.log(`    sync=${r.entitlements?.syncMode} exchanges=${r.entitlements?.exchangeMaxAccounts ?? "∞"}`);
}

async function main() {
  if (!db) {
    console.error("❌ DATABASE_URL obrigatório em apps/app/.env");
    process.exit(1);
  }

  console.log("\n=== E2E Billing Flow (setup + checks) ===\n");

  await ensureBillingTables();

  // ── 1) Usuário TRIAL (Elite 14d) ─────────────────────────────────────────
  console.log("1) Criando usuário TRIAL …");
  const trialUser = await resetUser(TRIAL_EMAIL, { withTrial: true });
  const trialResolved = await getResolvedSubscription(trialUser.id);
  printResolved("Trial", trialUser.id, trialResolved);

  if (!trialResolved.hasAccess || trialResolved.effectivePlanId !== "elite") {
    console.error("❌ Trial deveria ter acesso Elite");
    process.exit(1);
  }
  console.log("   ✅ Trial Elite OK\n");

  // ── 2) Usuário PAYER (sem assinatura → paywall) ───────────────────────────
  console.log("2) Criando usuário PAYER (sem plano) …");
  const payerUser = await resetUser(PAYER_EMAIL, { withTrial: false });
  const payerBlocked = await getResolvedSubscription(payerUser.id);
  printResolved("Payer (inicial)", payerUser.id, payerBlocked);

  if (payerBlocked.hasAccess) {
    console.error("❌ Payer sem assinatura deveria estar bloqueado");
    process.exit(1);
  }
  console.log("   ✅ Paywall esperado para payer\n");

  // ── 3) Simular assinatura Starter (como webhook/checkout) ───────────────
  console.log("3) Ativando Starter no payer (simula pagamento) …");
  await activatePaidPlan(payerUser.id, "starter", { source: "checkout" });
  const payerActive = await getResolvedSubscription(payerUser.id);
  printResolved("Payer (Starter)", payerUser.id, payerActive);

  if (!payerActive.hasAccess || payerActive.effectivePlanId !== "starter") {
    console.error("❌ Payer deveria estar ativo no Starter");
    process.exit(1);
  }
  console.log("   ✅ Assinatura Starter OK\n");

  // ── 4) Expirar trial do usuário A ─────────────────────────────────────────
  console.log("4) Expirando trial do usuário TRIAL …");
  const past = new Date();
  past.setDate(past.getDate() - 1);
  await billingStorage.updateSubscription(trialUser.id, {
    trialEndsAt: past,
    status: "trialing",
  });
  await runSubscriptionMaintenance();
  const trialExpired = await getResolvedSubscription(trialUser.id);
  printResolved("Trial (expirado)", trialUser.id, trialExpired);

  if (trialExpired.hasAccess) {
    console.error("❌ Trial expirado deveria bloquear acesso");
    process.exit(1);
  }
  console.log("   ✅ Bloqueio pós-trial OK\n");

  // ── 5) Recriar trial fresco para teste manual no browser ──────────────────
  console.log("5) Recriando usuário TRIAL fresco para teste no app …");
  const trialFresh = await resetUser(TRIAL_EMAIL, { withTrial: true });
  const freshResolved = await getResolvedSubscription(trialFresh.id);
  printResolved("Trial (browser)", trialFresh.id, freshResolved);

  console.log("\n=== Credenciais para teste manual (npm run dev) ===\n");
  console.log("| Persona | E-mail | Senha | O que testar |");
  console.log("|--------|--------|-------|--------------|");
  console.log(`| Trial Elite (${TRIAL_DAYS}d) | ${TRIAL_EMAIL} | ${TEST_PASSWORD} | App completo, sync, relatórios |`);
  console.log(`| Paywall → Stripe | ${PAYER_EMAIL} | ${TEST_PASSWORD} | Recrie com: npm run test:billing-flow -- --reset-payer-only |`);
  console.log("");
  console.log("Fluxo no navegador:");
  console.log("  A) Login trial → Dashboard, API Exchanges, Relatórios");
  console.log("  B) Admin (porta 3001): expirar trial ou +7d");
  console.log("  C) Payer: login → paywall OU /#/billing → Assinar → cartão 4242…");
  console.log("");
  console.log("Para testar payer no paywall de novo:");
  console.log("  npx tsx script/e2e-billing-flow.ts --payer-paywall-only");
  console.log("");
  console.log("Stripe CLI (ativar assinatura após pagamento real de teste):");
  console.log("  stripe listen --forward-to localhost:5000/api/billing/webhook");
  console.log("\n✅ Todos os checks automatizados passaram.\n");
}

async function payerPaywallOnly() {
  if (!db) process.exit(1);
  await ensureBillingTables();
  const pool = createPgPool();
  const c = await pool.connect();
  try {
    const u = await storage.getUserByEmail(PAYER_EMAIL);
    if (u) {
      await c.query("DELETE FROM subscriptions WHERE user_id = $1", [u.id]);
    }
  } finally {
    c.release();
    await pool.end();
  }
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);
  let user = await storage.getUserByEmail(PAYER_EMAIL);
  if (!user) {
    user = await storage.createUser({
      email: PAYER_EMAIL,
      passwordHash,
      emailVerified: true,
      mustChangePassword: false,
      onboardingCompleted: true,
    });
  } else {
    await storage.updateUser(user.id, {
      passwordHash,
      emailVerified: true,
      mustChangePassword: false,
      onboardingCompleted: true,
      trialUsedAt: new Date(),
    });
  }
  console.log(`Payer resetado (sem assinatura): ${PAYER_EMAIL} / ${TEST_PASSWORD}`);
  const r = await getResolvedSubscription(user.id);
  console.log(`hasAccess=${r.hasAccess} → deve ser false (paywall)`);
}

const arg = process.argv[2];
if (arg === "--payer-paywall-only") {
  payerPaywallOnly().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
