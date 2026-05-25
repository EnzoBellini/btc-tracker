import * as crypto from "crypto";
import type { ExchangeAdapter, ExchangeCreds, TradeInsert } from "./types";
import { exchangeFetch, parseJsonResponse } from "./fetch";

const BITGET_BASE = "https://api.bitget.com";

function bitgetSign(timestamp: string, method: string, path: string, query: string, body: string, secret: string): string {
  const prehash = timestamp + method + path + (query ? `?${query}` : "") + body;
  return crypto.createHmac("sha256", secret).update(prehash).digest("base64");
}

async function bitgetRequest(
  method: string,
  path: string,
  creds: ExchangeCreds,
  params: Record<string, string> = {},
) {
  const key = creds.apiKey.trim();
  const secret = creds.secretKey.trim();
  const passphrase = (creds.passphrase ?? "").trim();
  if (!passphrase) throw new Error("Passphrase obrigatória para Bitget");

  const query = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  const url = `${BITGET_BASE}${path}${query ? `?${query}` : ""}`;
  const timestamp = String(Date.now());
  const sign = bitgetSign(timestamp, method, path, query, "", secret);

  const res = await exchangeFetch(url, {
    exchangeLabel: "Bitget",
    method,
    headers: {
      "ACCESS-KEY": key,
      "ACCESS-SIGN": sign,
      "ACCESS-TIMESTAMP": timestamp,
      "ACCESS-PASSPHRASE": passphrase,
      locale: "en-US",
      "Content-Type": "application/json",
    },
  });
  const data = (await parseJsonResponse(res, "Bitget")) as Record<string, unknown>;
  if (String(data.code) !== "00000") {
    throw new Error(String(data.msg ?? data.code ?? "Erro Bitget"));
  }
  return data;
}

function mapBitgetPosition(pos: Record<string, unknown>, defaultLeverage: number): TradeInsert {
  const pnl = parseFloat(String(pos.pnl ?? pos.netProfit ?? 0));
  const holdSide = String(pos.holdSide ?? pos.posSide ?? "long").toLowerCase();
  const cTime = Number(pos.cTime ?? pos.uTime ?? Date.now());
  return {
    date: new Date(cTime).toISOString().split("T")[0],
    pair: String(pos.symbol || "BTCUSDT").replace("_", ""),
    direction: holdSide.includes("short") ? "SHORT" : "LONG",
    entryPrice: parseFloat(String(pos.openAvgPrice ?? 0)),
    stopPrice: 0,
    targetPrice: parseFloat(String(pos.closeAvgPrice ?? 0)),
    exitPrice: pos.closeAvgPrice ? parseFloat(String(pos.closeAvgPrice)) : undefined,
    positionSize: parseFloat(String(pos.openTotalPos ?? pos.closeTotalPos ?? 0)),
    leverage: parseInt(String(pos.leverage ?? defaultLeverage), 10) || defaultLeverage,
    pnl,
    status: pnl > 0 ? "WIN" : pnl < 0 ? "LOSS" : "BREAKEVEN",
    notes: `bitget_pos_${pos.positionId ?? pos.posId ?? pos.id}`,
  };
}

export const bitgetAdapter: ExchangeAdapter = {
  id: "bitget",
  label: "Bitget",

  async testConnection(creds) {
    await bitgetRequest("GET", "/api/v2/spot/account/assets", creds, { coin: "USDT" });
  },

  async syncFuturesTrades(creds, existingNotes, defaultLeverage) {
    const trades: TradeInsert[] = [];
    let idLessThan: string | undefined;

    for (let page = 0; page < 20; page++) {
      const params: Record<string, string> = {
        productType: "USDT-FUTURES",
        limit: "100",
      };
      if (idLessThan) params.idLessThan = idLessThan;

      const res = await bitgetRequest(
        "GET",
        "/api/v2/mix/position/history-position",
        creds,
        params,
      );
      const data = res.data as Record<string, unknown> | undefined;
      const list = (data?.list ?? data) as Record<string, unknown>[] | undefined;
      const items = Array.isArray(list) ? list : [];
      if (!items.length) break;

      for (const pos of items) {
        const trade = mapBitgetPosition(pos, defaultLeverage);
        if (existingNotes.has(trade.notes)) continue;
        existingNotes.add(trade.notes);
        trades.push(trade);
      }

      const endId = String(data?.endId ?? items[items.length - 1]?.positionId ?? "");
      if (!endId || items.length < 100) break;
      idLessThan = endId;
    }

    return {
      imported: trades.length,
      trades,
      message: trades.length === 0 ? "Nenhum trade novo da Bitget." : undefined,
    };
  },

  async syncSpotBtc(creds) {
    const res = await bitgetRequest("GET", "/api/v2/spot/account/assets", creds, { coin: "BTC" });
    const data = res.data as Record<string, unknown> | unknown;
    const items = Array.isArray(data) ? data : (data as Record<string, unknown>)?.assets;
    const list = Array.isArray(items) ? items : [];
    const btcRow = list.find((b) => String((b as Record<string, unknown>).coin ?? (b as Record<string, unknown>).asset) === "BTC") as
      | Record<string, unknown>
      | undefined;
    if (!btcRow) return null;
    const available = parseFloat(String(btcRow.available ?? btcRow.free ?? 0));
    const frozen = parseFloat(String(btcRow.frozen ?? btcRow.locked ?? 0));
    const btcAmount = available + frozen;
    if (btcAmount <= 0) return null;

    let btcPrice = 0;
    try {
      const ticker = await fetch(`${BITGET_BASE}/api/v2/spot/market/tickers?symbol=BTCUSDT`);
      const tickerRes = (await ticker.json()) as { data?: Array<{ lastPr?: string; close?: string }> };
      const row = tickerRes.data?.[0];
      btcPrice = parseFloat(row?.lastPr ?? row?.close ?? "0");
    } catch {
      btcPrice = 0;
    }
    return { btcAmount, btcPrice, notes: "sync_bitget_spot" };
  },
};
