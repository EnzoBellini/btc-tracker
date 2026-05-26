/**
 * Espelho de packages/billing/src/plans.ts para deploy isolado (apps/landing).
 * Ao alterar preços ou planos, atualize também packages/billing.
 */
export type PlanId = "starter" | "pro" | "elite";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  priceCents: number;
  currency: "BRL";
  isPaid: boolean;
  sortOrder: number;
  highlights: string[];
}

export const TRIAL_DAYS = 14;

export const PLAN_CATALOG: Record<PlanId, PlanDefinition> = {
  starter: {
    id: "starter",
    name: "Starter Lite",
    tagline: "Traders iniciantes ou capital menor",
    priceCents: 4900,
    currency: "BRL",
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
    priceCents: 9900,
    currency: "BRL",
    isPaid: true,
    sortOrder: 2,
    highlights: [
      "Até 3 contas de exchange",
      "Histórico ilimitado",
      "Sync automático a cada 2 min",
      "Metas & Risco avançado",
      "Relatórios por setup/horário",
      "Suporte prioritário",
    ],
  },
  elite: {
    id: "elite",
    name: "Elite / Fund",
    tagline: "Multi-conta, fundos e operação em escala",
    priceCents: 19900,
    currency: "BRL",
    isPaid: true,
    sortOrder: 3,
    highlights: [
      "Contas de exchange ilimitadas",
      "Sync em tempo real (webhook)",
      "Relatórios consolidados multi-conta",
      "Sharpe Ratio e drawdown avançado",
      "Exportação para investidores",
      "Suporte dedicado",
    ],
  },
};

export function formatPlanPrice(plan: PlanDefinition): string {
  const reais = plan.priceCents / 100;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reais);
}
