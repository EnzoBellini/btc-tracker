import type { Express } from "express";
import { type Server } from "http";
import * as crypto from "crypto";
import { storage } from "./storage";
import {
  insertTradeSchema, insertTransferSchema, insertBtcHoldingSchema,
  insertSettingsSchema, insertMexcCredentialsSchema, insertGoalSchema,
} from "@shared/schema";

// ─── MEXC API helpers ─────────────────────────────────────────────────────────

function mexcSign(queryString: string, secretKey: string): string {
  return crypto.createHmac("sha256", secretKey).update(queryString).digest("hex");
}

async function mexcFuturesRequest(path: string, apiKey: string, secretKey: string, params: Record<string, string | number> = {}) {
  const key = apiKey.trim();
  const secret = secretKey.trim();
  const timestamp = Date.now();
  const paramStr = Object.entries({ ...params, timestamp })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const targetStr = key + timestamp + paramStr;
  const signature = mexcSign(targetStr, secret);
  const url = `https://contract.mexc.com${path}?${paramStr}`;
  const res = await fetch(url, {
    headers: {
      "ApiKey": key,
      "Request-Time": String(timestamp),
      "Signature": signature,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.message ?? data?.msg ?? data?.code ?? `HTTP ${res.status}`;
    throw new Error(`MEXC Futures ${res.status}: ${msg}`);
  }
  return data;
}

async function mexcSpotRequest(path: string, apiKey: string, secretKey: string, params: Record<string, string | number> = {}) {
  const key = apiKey.trim();
  const secret = secretKey.trim();
  const timestamp = Date.now();
  const recvWindow = 10000;
  const allParams = { ...params, recvWindow, timestamp };
  const paramStr = Object.entries(allParams).map(([k, v]) => `${k}=${v}`).join("&");
  const signature = mexcSign(paramStr, secret);
  const url = `https://api.mexc.com${path}?${paramStr}&signature=${signature}`;
  const res = await fetch(url, {
    headers: { "X-MEXC-APIKEY": key, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.msg ?? data?.code ?? `HTTP ${res.status}`;
    throw new Error(`MEXC Spot ${res.status}: ${msg}`);
  }
  return data;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── Trades ────────────────────────────────────────────────────────────────
  app.get("/api/trades", async (_req, res) => {
    const trades = await storage.getTrades();
    res.json(trades);
  });
  app.post("/api/trades", async (req, res) => {
    const result = insertTradeSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    res.status(201).json(await storage.createTrade(result.data));
  });
  app.patch("/api/trades/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = insertTradeSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    const trade = await storage.updateTrade(id, result.data);
    if (!trade) return res.status(404).json({ error: "Not found" });
    res.json(trade);
  });
  app.delete("/api/trades/:id", async (req, res) => {
    const ok = await storage.deleteTrade(parseInt(req.params.id));
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  });

  // ── Sync Trades from MEXC Futures ──────────────────────────────────────────
  app.post("/api/trades/sync-from-mexc", async (_req, res) => {
    const creds = await storage.getMexcCredentials();
    if (!creds.apiKey || !creds.secretKey) {
      return res.status(400).json({ error: "API Key e Secret Key não configurados. Configure em API MEXC." });
    }
    try {
      const existingTrades = await storage.getTrades();
      const existingIds = new Set(existingTrades.map(t => t.notes));
      let totalImported = 0;

      for (let page = 1; page <= 5; page++) {
        // symbol opcional — busca todos os contratos (BTC_USDT, etc.)
        const posRes = await mexcFuturesRequest(
          "/api/v1/private/position/list/history_positions",
          creds.apiKey.trim(),
          creds.secretKey.trim(),
          { page_num: page, page_size: 100 }
        );
        const resultList = Array.isArray(posRes.data) ? posRes.data : posRes.data?.resultList;
        if (!posRes.success) {
          const errMsg = posRes.message ?? posRes.msg ?? posRes.code ?? "Resposta inválida";
          throw new Error(String(errMsg));
        }
        if (!resultList?.length) break;

        for (const pos of resultList) {
          const posIdKey = `mexc_pos_${pos.positionId}`;
          if (existingIds.has(posIdKey)) continue;

          const date = new Date(pos.updateTime || pos.createTime).toISOString().split("T")[0];
          const direction = pos.positionType === 1 ? "LONG" : "SHORT";
          const pnl = parseFloat((pos.realised ?? 0).toFixed(4));
          const status = pnl > 0 ? "WIN" : pnl < 0 ? "LOSS" : "BREAKEVEN";

          await storage.createTrade({
            date,
            pair: (pos.symbol || "BTCUSDT").replace("_", ""),
            direction,
            entryPrice: pos.openAvgPrice || pos.holdAvgPrice || 0,
            stopPrice: pos.liquidatePrice || 0,
            targetPrice: pos.closeAvgPrice || 0,
            exitPrice: pos.closeAvgPrice || undefined,
            positionSize: pos.im || 0,
            leverage: pos.leverage || 3,
            pnl,
            status,
            notes: posIdKey,
          });
          existingIds.add(posIdKey);
          totalImported++;
        }
      }

      let message = `${totalImported} trade(s) importado(s) da MEXC Futuros`;
      if (totalImported === 0) {
        message += " Dica: Se a API retornou vazio, adicione o IP do Railway na whitelist da API Key (MEXC > API Management > Vincular IP). O Railway usa um IP diferente do seu.";
      }
      res.json({ success: true, imported: totalImported, message });
    } catch (err: any) {
      console.error("[trades/sync-from-mexc]", err.message);
      const hint = err.message?.includes("700006") || err.message?.includes("IP")
        ? " IP não autorizado — adicione o IP do Railway na whitelist da API Key (MEXC > API Management > Alterar > Vincular IP)."
        : "";
      res.status(400).json({ error: err.message + hint });
    }
  });

  // ── Transfers ─────────────────────────────────────────────────────────────
  app.get("/api/transfers", async (_req, res) => res.json(await storage.getTransfers()));
  app.post("/api/transfers", async (req, res) => {
    const result = insertTransferSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    res.status(201).json(await storage.createTransfer(result.data));
  });
  app.delete("/api/transfers/:id", async (req, res) => {
    const ok = await storage.deleteTransfer(parseInt(req.params.id));
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  });

  // ── BTC Holdings ──────────────────────────────────────────────────────────
  app.get("/api/btc-holdings", async (_req, res) => res.json(await storage.getBtcHoldings()));
  app.post("/api/btc-holdings", async (req, res) => {
    const result = insertBtcHoldingSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    res.status(201).json(await storage.createBtcHolding(result.data));
  });
  app.delete("/api/btc-holdings/:id", async (req, res) => {
    const ok = await storage.deleteBtcHolding(parseInt(req.params.id));
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  });

  // ── Settings ──────────────────────────────────────────────────────────────
  app.get("/api/settings", async (_req, res) => res.json(await storage.getSettings()));
  app.patch("/api/settings", async (req, res) => {
    const result = insertSettingsSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    res.json(await storage.updateSettings(result.data));
  });

  // ── Server IP (para whitelist MEXC) ────────────────────────────────────────
  app.get("/api/mexc/server-ip", async (_req, res) => {
    try {
      const r = await fetch("https://api.ipify.org?format=json");
      const data = await r.json();
      res.json({ ip: data.ip });
    } catch {
      res.json({ ip: null, error: "Não foi possível obter o IP" });
    }
  });

  // ── MEXC Credentials ──────────────────────────────────────────────────────
  app.get("/api/mexc/credentials", async (_req, res) => {
    const creds = await storage.getMexcCredentials();
    // Never return the secret key to the frontend — mask it
    res.json({
      ...creds,
      secretKey: creds.secretKey ? "••••••••••••••••" : "",
      hasSecret: !!creds.secretKey,
    });
  });

  app.patch("/api/mexc/credentials", async (req, res) => {
    const result = insertMexcCredentialsSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    // Don't overwrite secret with the masked value
    const payload = { ...result.data };
    if (payload.secretKey === "••••••••••••••••") delete payload.secretKey;
    const creds = await storage.updateMexcCredentials(payload);
    res.json({ ...creds, secretKey: creds.secretKey ? "••••••••••••••••" : "", hasSecret: !!creds.secretKey });
  });

  // ── MEXC Sync ─────────────────────────────────────────────────────────────
  app.post("/api/mexc/sync", async (_req, res) => {
    const creds = await storage.getMexcCredentials();
    if (!creds.apiKey || !creds.secretKey) {
      return res.status(400).json({ error: "API Key e Secret Key não configurados" });
    }

    try {
      const synced: string[] = [];

      // 1. Sync closed futures positions → Trades
      try {
        const posRes = await mexcFuturesRequest(
          "/api/v1/private/position/list/history_positions",
          creds.apiKey, creds.secretKey,
          { symbol: "BTC_USDT", page_num: 1, page_size: 50 }
        );
        const futuresList = Array.isArray(posRes.data) ? posRes.data : posRes.data?.resultList;
        if (posRes.success && futuresList?.length) {
          const existingTrades = await storage.getTrades();
          const existingIds = new Set(existingTrades.map(t => t.notes));

          for (const pos of futuresList) {
            const posIdKey = `mexc_pos_${pos.positionId}`;
            if (existingIds.has(posIdKey)) continue; // skip already imported

            const date = new Date(pos.updateTime || pos.createTime).toISOString().split("T")[0];
            const direction = pos.positionType === 1 ? "LONG" : "SHORT";
            const pnl = parseFloat((pos.realised || 0).toFixed(4));
            const status = pnl > 0 ? "WIN" : pnl < 0 ? "LOSS" : "BREAKEVEN";

            await storage.createTrade({
              date,
              pair: (pos.symbol || "BTCUSDT").replace("_", ""),
              direction,
              entryPrice: pos.openAvgPrice || 0,
              stopPrice: pos.liquidatePrice || 0,
              targetPrice: pos.closeAvgPrice || 0,
              exitPrice: pos.closeAvgPrice || undefined,
              positionSize: pos.im || 0,
              leverage: pos.leverage || 3,
              pnl,
              status,
              notes: posIdKey,
            });
          }
          synced.push(`${futuresList.length} posições de futuros importadas`);
        }
      } catch (e: any) {
        console.error("Futures sync error:", e.message);
        synced.push(`Futuros: ${e.message}`);
      }

      // 2. Sync spot BTC balance → BTC Holding snapshot
      try {
        const acctRes = await mexcSpotRequest("/api/v3/account", creds.apiKey, creds.secretKey);
        if (acctRes.balances) {
          const btcBalance = acctRes.balances.find((b: any) => b.asset === "BTC");
          if (btcBalance) {
            const btcAmount = parseFloat(btcBalance.free) + parseFloat(btcBalance.locked || 0);
            if (btcAmount > 0) {
              // Get current BTC price
              let btcPrice = 0;
              try {
                const ticker = await fetch("https://api.mexc.com/api/v3/ticker/price?symbol=BTCUSDT");
                const tickerData = await ticker.json();
                btcPrice = parseFloat(tickerData.price || 0);
              } catch { btcPrice = 0; }

              const today = new Date().toISOString().split("T")[0];
              const existingHoldings = await storage.getBtcHoldings();
              const todayHolding = existingHoldings.find(h => h.date === today);

              if (!todayHolding) {
                const avgCost = btcPrice > 0 ? btcPrice : 1;
                await storage.createBtcHolding({
                  date: today,
                  btcAmount,
                  avgCostUsdt: avgCost,
                  btcPriceNow: btcPrice,
                  notes: "sync_mexc_spot",
                });
              }
              synced.push(`BTC spot: ${btcAmount.toFixed(8)} BTC`);
            }
          }
        }
      } catch (e: any) {
        console.error("Spot sync error:", e.message);
        synced.push(`Spot: ${e.message}`);
      }

      await storage.updateMexcCredentials({
        isConnected: true,
        lastSyncAt: new Date().toISOString(),
        lastSyncStatus: "success",
        lastSyncMessage: synced.join(" | "),
      });

      res.json({ success: true, message: synced.join(" | ") });
    } catch (err: any) {
      await storage.updateMexcCredentials({
        isConnected: false,
        lastSyncAt: new Date().toISOString(),
        lastSyncStatus: "error",
        lastSyncMessage: err.message,
      });
      res.status(500).json({ error: err.message });
    }
  });

  // Test MEXC connection
  app.post("/api/mexc/test", async (req, res) => {
    const { apiKey, secretKey } = req.body;
    if (!apiKey || !secretKey) return res.status(400).json({ error: "Campos obrigatórios" });
    try {
      const data = await mexcSpotRequest("/api/v3/account", apiKey, secretKey);
      if (data.balances) {
        await storage.updateMexcCredentials({
          apiKey,
          secretKey,
          isConnected: true,
          lastSyncAt: new Date().toISOString(),
          lastSyncStatus: "success",
          lastSyncMessage: "Conexão bem-sucedida",
        });
        res.json({ success: true, message: "Conexão bem-sucedida com a MEXC" });
      } else {
        throw new Error(data.msg || "Resposta inválida da MEXC");
      }
    } catch (err: any) {
      await storage.updateMexcCredentials({
        apiKey,
        secretKey,
        isConnected: false,
        lastSyncStatus: "error",
        lastSyncMessage: err.message,
      });
      res.status(400).json({ error: `Falha na conexão: ${err.message}` });
    }
  });

  // ── Goals ─────────────────────────────────────────────────────────────────
  app.get("/api/goals", async (_req, res) => res.json(await storage.getGoals()));
  app.post("/api/goals", async (req, res) => {
    const result = insertGoalSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    res.status(201).json(await storage.createGoal(result.data));
  });
  app.patch("/api/goals/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = insertGoalSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    const goal = await storage.updateGoal(id, result.data);
    if (!goal) return res.status(404).json({ error: "Not found" });
    res.json(goal);
  });
  app.delete("/api/goals/:id", async (req, res) => {
    const ok = await storage.deleteGoal(parseInt(req.params.id));
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  });

  // ── Stats (aggregated) ────────────────────────────────────────────────────
  app.get("/api/stats", async (_req, res) => {
    const [trades, transfers, holdings, settings] = await Promise.all([
      storage.getTrades(), storage.getTransfers(), storage.getBtcHoldings(), storage.getSettings(),
    ]);
    const closedTrades = trades.filter(t => t.status !== "OPEN");
    const wins = closedTrades.filter(t => t.status === "WIN");
    const losses = closedTrades.filter(t => t.status === "LOSS");
    const winRate = closedTrades.length ? (wins.length / closedTrades.length) * 100 : 0;
    const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const totalBtcBought = transfers.reduce((s, t) => s + t.btcBought, 0);
    const latestHolding = holdings.length ? holdings[holdings.length - 1] : null;
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

  return httpServer;
}
