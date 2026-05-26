import * as crypto from "crypto";
import type { ExchangeAdapter, ExchangeCreds, TradeInsert } from "./types";
import { exchangeFetch, parseJsonResponse } from "./fetch";

const MEXC_CONTRACT_BASE = "https://contract.mexc.com";
export const MEXC_SPOT_BASE = "https://api.mexc.com";

function mexcSign(queryString: string, secretKey: string): string {
  return crypto.createHmac("sha256", secretKey).update(queryString).digest("hex");
}

async function mexcFuturesRequest(
  path: string,
  apiKey: string,
  secretKey: string,
  params: Record<string, string | number> = {},
) {
  const key = apiKey.trim();
  const secret = secretKey.trim();
  const timestamp = Date.now();
  const paramStr = Object.entries({ ...params, timestamp })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const targetStr = key + timestamp + paramStr;
  const signature = mexcSign(targetStr, secret);
  const url = `${MEXC_CONTRACT_BASE}${path}?${paramStr}`;
  const res = await exchangeFetch(url, {
    exchangeLabel: "MEXC Futures",
    headers: {
      ApiKey: key,
      "Request-Time": String(timestamp),
      Signature: signature,
      "Content-Type": "application/json",
    },
  });
  return parseJsonResponse(res, "MEXC Futures");
}

export async function mexcSpotRequest(
  path: string,
  apiKey: string,
  secretKey: string,
  params: Record<string, string | number> = {},
) {
  const key = apiKey.trim();
  const secret = secretKey.trim();
  const timestamp = Date.now();
  const recvWindow = 10000;
  const allParams = { ...params, recvWindow, timestamp };
  const paramStr = Object.entries(allParams)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const signature = mexcSign(paramStr, secret);
  const url = `${MEXC_SPOT_BASE}${path}?${paramStr}&signature=${signature}`;
  const res = await exchangeFetch(url, {
    exchangeLabel: "MEXC Spot",
    headers: { "X-MEXC-APIKEY": key, "Content-Type": "application/json" },
  });
  return parseJsonResponse(res, "MEXC Spot");
}

function mapMexcPosition(pos: Record<string, unknown>, defaultLeverage: number): TradeInsert {
  const pnl = parseFloat(String(pos.realised ?? 0));
  const closedMs = Number(pos.updateTime || pos.createTime || Date.now());
  const date = new Date(closedMs).toISOString().split("T")[0];
  return {
    date,
    pair: String(pos.symbol || "BTCUSDT").replace("_", ""),
    direction: pos.positionType === 1 ? "LONG" : "SHORT",
    entryPrice: Number(pos.openAvgPrice || pos.holdAvgPrice || 0),
    stopPrice: Number(pos.liquidatePrice || 0),
    targetPrice: Number(pos.closeAvgPrice || 0),
    exitPrice: pos.closeAvgPrice ? Number(pos.closeAvgPrice) : undefined,
    positionSize: Number(pos.im || 0),
    leverage: Number(pos.leverage || defaultLeverage),
    pnl,
    status: pnl > 0 ? "WIN" : pnl < 0 ? "LOSS" : "BREAKEVEN",
    notes: `mexc_pos_${pos.positionId}`,
    closedAt: new Date(closedMs).toISOString(),
    sourceExchange: "mexc",
  };
}

export const mexcAdapter: ExchangeAdapter = {
  id: "mexc",
  label: "MEXC",

  async testConnection(creds) {
    const data = (await mexcSpotRequest("/api/v3/account", creds.apiKey, creds.secretKey)) as Record<
      string,
      unknown
    >;
    if (!data.balances) throw new Error(String(data.msg || "Resposta inválida da MEXC"));
  },

  async syncFuturesTrades(creds, existingNotes, defaultLeverage) {
    const trades: TradeInsert[] = [];

    for (let page = 1; page <= 5; page++) {
      const posRes = (await mexcFuturesRequest(
        "/api/v1/private/position/list/history_positions",
        creds.apiKey,
        creds.secretKey,
        { page_num: page, page_size: 100 },
      )) as Record<string, unknown>;
      const data = posRes.data;
      const resultList = Array.isArray(data)
        ? data
        : (data as Record<string, unknown> | undefined)?.resultList;
      if (!posRes.success) {
        throw new Error(String(posRes.message ?? posRes.msg ?? posRes.code ?? "Resposta inválida"));
      }
      if (!Array.isArray(resultList) || !resultList.length) break;

      for (const pos of resultList as Record<string, unknown>[]) {
        const trade = mapMexcPosition(pos, defaultLeverage);
        if (existingNotes.has(trade.notes)) continue;
        existingNotes.add(trade.notes);
        trades.push(trade);
      }
    }

    return {
      imported: trades.length,
      trades,
      message:
        trades.length === 0
          ? "Nenhum trade novo. Verifique whitelist de IP na MEXC."
          : undefined,
    };
  },

  async syncSpotBtc(creds) {
    const acctRes = (await mexcSpotRequest("/api/v3/account", creds.apiKey, creds.secretKey)) as Record<
      string,
      unknown
    >;
    const balances = acctRes.balances as Array<{ asset: string; free: string; locked?: string }> | undefined;
    if (!balances) return null;
    const btcBalance = balances.find((b) => b.asset === "BTC");
    if (!btcBalance) return null;
    const btcAmount = parseFloat(btcBalance.free) + parseFloat(btcBalance.locked || "0");
    if (btcAmount <= 0) return null;
    let btcPrice = 0;
    try {
      const ticker = await fetch(`${MEXC_SPOT_BASE}/api/v3/ticker/price?symbol=BTCUSDT`);
      const tickerData = (await ticker.json()) as { price?: string };
      btcPrice = parseFloat(tickerData.price || "0");
    } catch {
      btcPrice = 0;
    }
    return { btcAmount, btcPrice, notes: "sync_mexc_spot" };
  },
};
