import type { Express, Request } from "express";
import { type Server } from "http";
import { requireAuth } from "./auth";
import { storage } from "./storage";
import { registerExchangeRoutes } from "./exchangeRoutes";
import { requireSubscriptionMiddleware } from "./billing/middleware";
import { assertGoalsRisk, filterTradesByHistory } from "./billing/entitlements";
import { getResolvedSubscription } from "./billing/subscriptionService";
import { registerReportRoutes } from "./reportRoutes";

function uid(req: Request): number {
  return req.session.userId as number;
}
import {
  insertTradeSchema, insertTransferSchema, insertBtcHoldingSchema,
  insertSettingsSchema, insertGoalSchema,
} from "@shared/schema";
import { getMarketTicker } from "./market";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  const publicAuthPaths = new Set([
    "POST:/api/auth/register",
    "POST:/api/auth/login",
    "POST:/api/auth/enter",
    "POST:/api/auth/resend-verification",
    "GET:/api/auth/verify-email",
    "GET:/api/auth/me",
    "POST:/api/trial-signup",
    "GET:/api/market/ticker",
    "GET:/api/billing/plans",
    "POST:/api/billing/checkout",
    "POST:/api/billing/portal",
    "POST:/api/billing/sync-subscription",
    "GET:/api/billing/checkout-session",
    "POST:/api/billing/webhook",
  ]);

  app.use((req, res, next) => {
    if (!req.path.startsWith("/api")) return next();
    if (req.path.startsWith("/api/admin")) return next();
    if (req.path.startsWith("/api/affiliates/")) return next();
    const key = `${req.method}:${req.path}`;
    if (publicAuthPaths.has(key)) return next();
    return requireAuth(req, res, next);
  });

  app.use(requireSubscriptionMiddleware());

  // ── Market ticker (MEXC spot · público) ───────────────────────────────────
  app.get("/api/market/ticker", async (_req, res) => {
    try {
      const items = await getMarketTicker();
      res.setHeader("Cache-Control", "public, max-age=20");
      res.json({ items, source: "mexc", updatedAt: new Date().toISOString() });
    } catch (e: unknown) {
      console.error("[market/ticker]", e);
      res.status(502).json({ error: "Não foi possível obter cotações da MEXC" });
    }
  });

  // ── Trades ────────────────────────────────────────────────────────────────
  app.get("/api/trades", async (req, res) => {
    const userId = uid(req);
    const resolved = await getResolvedSubscription(userId);
    let trades = await storage.getTrades(userId);
    trades = filterTradesByHistory(trades, resolved.entitlements);
    res.json(trades);
  });
  app.post("/api/trades", async (req, res) => {
    const result = insertTradeSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    const data = {
      ...result.data,
      sourceExchange: result.data.sourceExchange ?? "manual",
      closedAt:
        result.data.closedAt ??
        (result.data.status !== "OPEN"
          ? `${result.data.date}T12:00:00.000Z`
          : undefined),
    };
    res.status(201).json(await storage.createTrade(uid(req), data));
  });
  app.patch("/api/trades/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = insertTradeSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    const trade = await storage.updateTrade(uid(req), id, result.data);
    if (!trade) return res.status(404).json({ error: "Not found" });
    res.json(trade);
  });
  app.delete("/api/trades/:id", async (req, res) => {
    const ok = await storage.deleteTrade(uid(req), parseInt(req.params.id));
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  });

  app.get("/api/trades/:id/chart", async (req, res) => {
    const userId = uid(req);
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "ID inválido" });

    const trade = await storage.getTrade(userId, id);
    if (!trade) return res.status(404).json({ error: "Trade não encontrado" });

    const resolved = await getResolvedSubscription(userId);
    const visible = filterTradesByHistory([trade], resolved.entitlements);
    if (!visible.length) {
      return res.status(403).json({ error: "Trade fora do histórico do seu plano." });
    }

    try {
      const { buildTradeChart } = await import("./services/tradeChart");
      const chart = await buildTradeChart(trade);
      res.setHeader("Cache-Control", "private, max-age=300");
      res.json(chart);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[trades/chart]", id, msg);
      res.status(502).json({ error: msg });
    }
  });

  registerExchangeRoutes(app);

  // ── Transfers ─────────────────────────────────────────────────────────────
  app.get("/api/transfers", async (req, res) => res.json(await storage.getTransfers(uid(req))));
  app.post("/api/transfers", async (req, res) => {
    const result = insertTransferSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    res.status(201).json(await storage.createTransfer(uid(req), result.data));
  });
  app.delete("/api/transfers/:id", async (req, res) => {
    const ok = await storage.deleteTransfer(uid(req), parseInt(req.params.id));
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  });

  // ── BTC Holdings ──────────────────────────────────────────────────────────
  app.get("/api/btc-holdings", async (req, res) => res.json(await storage.getBtcHoldings(uid(req))));
  app.post("/api/btc-holdings", async (req, res) => {
    const result = insertBtcHoldingSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    res.status(201).json(await storage.createBtcHolding(uid(req), result.data));
  });
  app.delete("/api/btc-holdings/:id", async (req, res) => {
    const ok = await storage.deleteBtcHolding(uid(req), parseInt(req.params.id));
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  });

  // ── Settings ──────────────────────────────────────────────────────────────
  app.get("/api/settings", async (req, res) => res.json(await storage.getSettings(uid(req))));
  app.patch("/api/settings", async (req, res) => {
    const result = insertSettingsSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    res.json(await storage.updateSettings(uid(req), result.data));
  });

  // ── Goals ─────────────────────────────────────────────────────────────────
  app.get("/api/goals", async (req, res) => res.json(await storage.getGoals(uid(req))));
  app.post("/api/goals", async (req, res) => {
    const userId = uid(req);
    if (!(await assertGoalsRisk(userId, res))) return;
    const result = insertGoalSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    res.status(201).json(await storage.createGoal(userId, result.data));
  });
  app.patch("/api/goals/:id", async (req, res) => {
    const userId = uid(req);
    if (!(await assertGoalsRisk(userId, res))) return;
    const id = parseInt(req.params.id);
    const result = insertGoalSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    const goal = await storage.updateGoal(userId, id, result.data);
    if (!goal) return res.status(404).json({ error: "Not found" });
    res.json(goal);
  });
  app.delete("/api/goals/:id", async (req, res) => {
    const userId = uid(req);
    if (!(await assertGoalsRisk(userId, res))) return;
    const ok = await storage.deleteGoal(userId, parseInt(req.params.id));
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  });

  // ── Stats (aggregated) ────────────────────────────────────────────────────
  app.get("/api/stats", async (req, res) => {
    const userId = uid(req);
    const resolved = await getResolvedSubscription(userId);
    if (resolved.entitlements?.moduleSmartReports === "none") {
      return res.status(403).json({
        code: "PLAN_FEATURE",
        error: "Relatórios disponíveis a partir do plano Starter com relatórios básicos.",
      });
    }
    let trades = await storage.getTrades(userId);
    trades = filterTradesByHistory(trades, resolved.entitlements);
    const [transfers, holdings, settings] = await Promise.all([
      storage.getTransfers(userId),
      storage.getBtcHoldings(userId),
      storage.getSettings(userId),
    ]);
    const closedTrades = trades.filter(t => t.status !== "OPEN");
    const wins = closedTrades.filter(t => t.status === "WIN");
    const losses = closedTrades.filter(t => t.status === "LOSS");
    const winRate = closedTrades.length ? (wins.length / closedTrades.length) * 100 : 0;
    const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const totalBtcBought = transfers.reduce((s, t) => s + t.btcBought, 0);
    const latestHolding = holdings.length
      ? [...holdings].sort((a, b) => b.date.localeCompare(a.date))[0]
      : null;
    const totalUsdtTransferred = transfers.reduce((s, t) => s + t.amountUsdt, 0);

    const tradesByMonth: Record<string, { wins: number; losses: number; pnl: number; count: number }> = {};
    const tradesByWeek: Record<string, { wins: number; losses: number; pnl: number; count: number }> = {};
    for (const t of closedTrades) {
      if (!t.date) continue;
      const d = new Date(t.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
      const weekKey = `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
      for (const [key, store] of [[monthKey, tradesByMonth], [weekKey, tradesByWeek]] as [string, typeof tradesByMonth][]) {
        if (!store[key]) store[key] = { wins: 0, losses: 0, pnl: 0, count: 0 };
        store[key].count++;
        store[key].pnl += t.pnl ?? 0;
        if (t.status === "WIN") store[key].wins++;
        if (t.status === "LOSS") store[key].losses++;
      }
    }

    res.json({
      totalTrades: trades.length,
      closedTrades: closedTrades.length,
      openTrades: trades.filter(t => t.status === "OPEN").length,
      wins: wins.length,
      losses: losses.length,
      winRate: Math.round(winRate * 10) / 10,
      totalPnl: Math.round(totalPnl * 100) / 100,
      totalBtcBought: Math.round(totalBtcBought * 1e8) / 1e8,
      totalUsdtTransferred: Math.round(totalUsdtTransferred * 100) / 100,
      latestBtcHolding: latestHolding,
      settings,
      tradesByMonth,
      tradesByWeek,
    });
  });

  registerReportRoutes(app);

  return httpServer;
}
