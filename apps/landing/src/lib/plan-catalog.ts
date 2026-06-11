/**
 * Espelho de packages/billing/src/plans.ts para deploy isolado (apps/landing).
 * Ao alterar preços ou planos, atualize também packages/billing.
 */
import type { Market } from "./locale";

export type PlanId = "starter" | "pro" | "elite";
export type Currency = "BRL" | "USD";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  priceCents: number;
  currency: Currency;
  isPaid: boolean;
  sortOrder: number;
  highlights: string[];
}

export const TRIAL_DAYS = 14;

/** Preços regulares (riscados na promo de lançamento). */
export const LAUNCH_ORIGINAL_PRICE_CENTS: Record<Market, Record<PlanId, number>> = {
  br: { starter: 4900, pro: 9900, elite: 19900 },
  us: { starter: 2000, pro: 5000, elite: 10000 },
};

const BR_PLANS: Record<PlanId, Omit<PlanDefinition, "currency" | "priceCents">> = {
  starter: {
    id: "starter",
    name: "Starter Lite",
    tagline: "Traders iniciantes ou capital menor",
    isPaid: true,
    sortOrder: 1,
    highlights: [
      "1 conta de exchange",
      "Histórico de 30 dias",
      "Dashboard essencial e diário manual",
      "Importação básica de dados",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro Trader",
    tagline: "Trader ativo — sincronização e risco diário",
    isPaid: true,
    sortOrder: 2,
    highlights: [
      "Até 3 contas de exchange",
      "Histórico ilimitado",
      "Sync automático a cada 2 min (app aberto)",
      "Metas & Risco avançado",
      "Insights semanais por par",
      "Relatórios por setup/horário",
      "Suporte prioritário",
    ],
  },
  elite: {
    id: "elite",
    name: "Elite / Fund",
    tagline: "Multi-conta, fundos e operação em escala",
    isPaid: true,
    sortOrder: 3,
    highlights: [
      "Contas de exchange ilimitadas",
      "Sync automático acelerado (~30s, app aberto)",
      "Relatórios consolidados multi-conta",
      "Sharpe Ratio e drawdown avançado",
      "Exportação para investidores",
      "Suporte dedicado",
    ],
  },
};

const US_PLANS: Record<PlanId, Omit<PlanDefinition, "currency" | "priceCents">> = {
  starter: {
    id: "starter",
    name: "Starter Lite",
    tagline: "Beginner traders or smaller capital",
    isPaid: true,
    sortOrder: 1,
    highlights: [
      "1 exchange account",
      "30-day history",
      "Essential dashboard & manual journal",
      "Basic data import",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro Trader",
    tagline: "Active trader — sync and daily risk management",
    isPaid: true,
    sortOrder: 2,
    highlights: [
      "Up to 3 exchange accounts",
      "Unlimited history",
      "Auto sync every 2 min (app open)",
      "Advanced Goals & Risk",
      "Weekly pair insights",
      "Setup/time reports",
      "Priority support",
    ],
  },
  elite: {
    id: "elite",
    name: "Elite / Fund",
    tagline: "Multi-account, funds & scale operations",
    isPaid: true,
    sortOrder: 3,
    highlights: [
      "Unlimited exchange accounts",
      "Accelerated auto sync (~30s, app open)",
      "Consolidated multi-account reports",
      "Sharpe Ratio & advanced drawdown",
      "Investor export",
      "Dedicated support",
    ],
  },
};

const REGIONAL_PRICING: Record<Market, Record<PlanId, { priceCents: number; currency: Currency }>> = {
  br: {
    starter: { priceCents: 2000, currency: "BRL" },
    pro: { priceCents: 4000, currency: "BRL" },
    elite: { priceCents: 6000, currency: "BRL" },
  },
  us: {
    starter: { priceCents: 2000, currency: "USD" },
    pro: { priceCents: 4000, currency: "USD" },
    elite: { priceCents: 6000, currency: "USD" },
  },
};

export function getPlanCatalog(market: Market): Record<PlanId, PlanDefinition> {
  const base = market === "us" ? US_PLANS : BR_PLANS;
  const pricing = REGIONAL_PRICING[market];
  return (["starter", "pro", "elite"] as PlanId[]).reduce(
    (acc, id) => {
      acc[id] = { ...base[id], ...pricing[id] };
      return acc;
    },
    {} as Record<PlanId, PlanDefinition>,
  );
}

export function getPricingPlans(market: Market): PlanDefinition[] {
  const catalog = getPlanCatalog(market);
  return (["starter", "pro", "elite"] as PlanId[]).map((id) => catalog[id]);
}

export function formatPlanPrice(plan: PlanDefinition): string {
  const locale = plan.currency === "USD" ? "en-US" : "pt-BR";
  const amount = plan.priceCents / 100;
  return new Intl.NumberFormat(locale, { style: "currency", currency: plan.currency }).format(amount);
}

export function formatOriginalPlanPrice(market: Market, planId: PlanId): string {
  const plan = getPlanCatalog(market)[planId];
  const locale = plan.currency === "USD" ? "en-US" : "pt-BR";
  const amount = LAUNCH_ORIGINAL_PRICE_CENTS[market][planId] / 100;
  return new Intl.NumberFormat(locale, { style: "currency", currency: plan.currency }).format(amount);
}

export function launchSavingsPct(market: Market, planId: PlanId): number {
  const original = LAUNCH_ORIGINAL_PRICE_CENTS[market][planId];
  const current = getPlanCatalog(market)[planId].priceCents;
  return Math.round((1 - current / original) * 100);
}
