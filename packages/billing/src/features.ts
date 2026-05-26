export type SyncMode = "manual" | "auto_2m" | "webhook";
export type SmartReportsLevel = "none" | "basic" | "advanced";
export type SupportTier = "standard" | "priority" | "dedicated";

export type PlanId = "starter" | "pro" | "elite";

export interface PlanEntitlements {
  exchangeMaxAccounts: number | null;
  historyMaxDays: number | null;
  syncMode: SyncMode;
  moduleGoalsRisk: boolean;
  moduleSmartReports: SmartReportsLevel;
  moduleMultiAccountReports: boolean;
  moduleInvestorExport: boolean;
  supportTier: SupportTier;
}

export const FEATURE_LABELS: Record<string, string> = {
  "exchange.max_accounts": "Contas de exchange",
  "history.max_days": "Histórico de trades",
  "sync.mode": "Sincronização",
  "module.goals_risk": "Metas & Risco avançado",
  "module.smart_reports": "Relatórios inteligentes",
  "module.multi_account_reports": "Relatórios multi-conta",
  "module.investor_export": "Exportação para investidores",
  "support.tier": "Suporte",
};
