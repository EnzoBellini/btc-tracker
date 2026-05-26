import * as crypto from "crypto";
import type { ExchangeAdapter, ExchangeCreds, TradeInsert } from "./types";
import { exchangeFetch, parseJsonResponse } from "./fetch";

const BINANCE_FUTURES_BASE = "https://fapi.binance.com";
const BINANCE_SPOT_BASE = "https://api.binance.com";

function binanceSign(queryString: string, secretKey: string): string {
  return crypto.createHmac("sha256", secretKey).update(queryString).digest("hex");
}

async function binanceSignedRequest(
  base: string,
  path: string,
  apiKey: string,
  secretKey: string,
  params: Record<string, string | number> = {},
  label: string,
): Promise<unknown> {
  const timestamp = Date.now();
  const allParams = { ...params, timestamp };
  const query = Object.entries(allParams)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
  const signature = binanceSign(query, secretKey.trim());
  const url = `${base}${path}?${query}&signature=${signature}`;
  const res = await exchangeFetch(url, {
    exchangeLabel: label,
    headers: { "X-MBX-APIKEY": apiKey.trim() },
  });
  return parseJsonResponse(res, label);
}

function mapIncomeToTrade(row: Record<string, unknown>, defaultLeverage: number): TradeInsert {
  const income = parseFloat(String(row.income ?? 0));
  const time = Number(row.time ?? Date.now());
  const symbol = String(row.symbol || "BTCUSDT");
  return {
    date: new Date(time).toISOString().split("T")[0],
    pair: symbol,
    direction: income >= 0 ? "LONG" : "SHORT",
    entryPrice: 0,
    stopPrice: 0,
    targetPrice: 0,
    exitPrice: undefined,
    positionSize: Math.abs(income),
    leverage: defaultLeverage,
    pnl: income,
    status: income > 0 ? "WIN" : income < 0 ? "LOSS" : "BREAKEVEN",
    notes: `binance_income_${row.tranId}`,
    closedAt: new Date(time).toISOString(),
    sourceExchange: "binance",
  };
}

export const binanceAdapter: ExchangeAdapter = {
  id: "binance",
  label: "Binance",

  async testConnection(creds) {
    const data = (await binanceSignedRequest(
      BINANCE_FUTURES_BASE,
      "/fapi/v2/account",
      creds.apiKey,
      creds.secretKey,
      { recvWindow: 10000 },
      "Binance Futures",
    )) as Record<string, unknown>;
    if (data.code !== undefined && Number(data.code) !== 0) {
      throw new Error(String(data.msg ?? data.code));
    }
  },

  async syncFuturesTrades(creds, existingNotes, defaultLeverage) {
    const trades: TradeInsert[] = [];
    let startTime = Date.now() - 90 * 24 * 60 * 60 * 1000;

    for (let page = 0; page < 10; page++) {
      const rows = await binanceSignedRequest(
        BINANCE_FUTURES_BASE,
        "/fapi/v1/income",
        creds.apiKey,
        creds.secretKey,
        {
          incomeType: "REALIZED_PNL",
          startTime,
          limit: 1000,
          recvWindow: 10000,
        },
        "Binance Futures",
      );

      const list = Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
      if (!list.length) break;

      for (const row of list) {
        if (String(row.incomeType) !== "REALIZED_PNL") continue;
        const trade = mapIncomeToTrade(row, defaultLeverage);
        if (existingNotes.has(trade.notes)) continue;
        existingNotes.add(trade.notes);
        trades.push(trade);
      }

      const lastTime = Number(list[list.length - 1]?.time ?? 0);
      if (list.length < 1000 || !lastTime) break;
      startTime = lastTime + 1;
    }

    return {
      imported: trades.length,
      trades,
      message:
        trades.length === 0
          ? "Nenhum PnL realizado novo (últimos 3 meses). Importação aproximada via income history."
          : "Importação aproximada via REALIZED_PNL da Binance.",
    };
  },

  async syncSpotBtc(creds) {
    const acctRes = (await binanceSignedRequest(
      BINANCE_SPOT_BASE,
      "/api/v3/account",
      creds.apiKey,
      creds.secretKey,
      { recvWindow: 10000 },
      "Binance Spot",
    )) as Record<string, unknown>;
    const balances = acctRes.balances as Array<{ asset: string; free: string; locked?: string }> | undefined;
    if (!balances) return null;
    const btcBalance = balances.find((b) => b.asset === "BTC");
    if (!btcBalance) return null;
    const btcAmount = parseFloat(btcBalance.free) + parseFloat(btcBalance.locked || "0");
    if (btcAmount <= 0) return null;
    let btcPrice = 0;
    try {
      const ticker = await fetch(`${BINANCE_SPOT_BASE}/api/v3/ticker/price?symbol=BTCUSDT`);
      const tickerData = (await ticker.json()) as { price?: string };
      btcPrice = parseFloat(tickerData.price || "0");
    } catch {
      btcPrice = 0;
    }
    return { btcAmount, btcPrice, notes: "sync_binance_spot" };
  },
};
