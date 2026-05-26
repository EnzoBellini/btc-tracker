import type { Response } from "express";
import type { PlanEntitlements } from "@trackion/billing";
import { historyCutoffDate } from "@trackion/billing";
import { getResolvedSubscription } from "./subscriptionService";
import { storage } from "../storage";

export async function getEntitlementsForUser(userId: number) {
  const resolved = await getResolvedSubscription(userId);
  return resolved;
}

export function sendSubscriptionRequired(res: Response, trialEnded: boolean) {
  return res.status(403).json({
    code: "SUBSCRIPTION_REQUIRED",
    trialEnded,
    error: trialEnded
      ? "Seu trial de 14 dias terminou. Escolha um plano para continuar."
      : "Assinatura necessária para acessar este recurso.",
  });
}

export async function assertHasAccess(userId: number, res: Response): Promise<boolean> {
  const resolved = await getResolvedSubscription(userId);
  if (!resolved.hasAccess) {
    sendSubscriptionRequired(res, resolved.trialEnded);
    return false;
  }
  return true;
}

export async function countConnectedExchanges(userId: number): Promise<number> {
  const creds = await storage.listExchangeCredentials(userId);
  return creds.filter((c) => c.isConnected).length;
}

export async function assertCanConnectExchange(userId: number, res: Response): Promise<boolean> {
  if (!(await assertHasAccess(userId, res))) return false;
  const resolved = await getResolvedSubscription(userId);
  const max = resolved.entitlements?.exchangeMaxAccounts;
  if (max == null) return true;
  const connected = await countConnectedExchanges(userId);
  if (connected >= max) {
    res.status(403).json({
      code: "PLAN_LIMIT",
      error: `Seu plano permite até ${max} conta(s) de exchange conectada(s). Faça upgrade para conectar mais.`,
      limit: max,
    });
    return false;
  }
  return true;
}

export async function assertSyncAllowed(userId: number, res: Response): Promise<boolean> {
  if (!(await assertHasAccess(userId, res))) return false;
  const resolved = await getResolvedSubscription(userId);
  const mode = resolved.entitlements?.syncMode;
  if (mode === "manual") {
    res.status(403).json({
      code: "PLAN_FEATURE",
      error: "Sync automático disponível no plano Pro Trader ou superior.",
    });
    return false;
  }
  return true;
}

export async function assertAdvancedReports(userId: number, res: Response): Promise<boolean> {
  if (!(await assertHasAccess(userId, res))) return false;
  const level = (await getResolvedSubscription(userId)).entitlements?.moduleSmartReports;
  if (level !== "advanced") {
    res.status(403).json({
      code: "PLAN_FEATURE",
      error: "Relatórios avançados disponíveis no plano Pro Trader ou superior.",
    });
    return false;
  }
  return true;
}

export function filterTradesByHistory<T extends { date: string }>(
  trades: T[],
  entitlements: PlanEntitlements | null,
): T[] {
  const cutoff = historyCutoffDate(entitlements);
  if (!cutoff) return trades;
  return trades.filter((t) => t.date >= cutoff);
}
