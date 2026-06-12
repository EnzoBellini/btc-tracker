import type { Trade } from "@shared/schema";
import type {
  TradeChartCandle,
  TradeChartExitReason,
  TradeChartLevel,
  TradeChartResponse,
} from "@shared/tradeChart";
import { exchangeFetch, parseJsonResponse } from "../exchanges/fetch";

const BINANCE_FUTURES = "https://fapi.binance.com";
const MEXC_CONTRACT = "https://contract.mexc.com";
const BITGET_BASE = "https://api.bitget.com";

const WINDOW_BEFORE_MS = 90 * 60 * 1000;
const WINDOW_AFTER_MS = 30 * 60 * 1000;

function normalizeSymbol(pair: string): string {
  return pair.replace(/[_\-/]/g, "").toUpperCase();
}

function mexcSymbol(pair: string): string {
  const sym = normalizeSymbol(pair);
  if (sym.endsWith("USDT")) return `${sym.slice(0, -4)}_USDT`;
  return sym;
}

function tradeCloseMs(trade: Trade): number {
  if (trade.closedAt) {
    const ms = Date.parse(trade.closedAt);
    if (Number.isFinite(ms)) return ms;
  }
  const dateMs = Date.parse(`${trade.date}T12:00:00.000Z`);
  return Number.isFinite(dateMs) ? dateMs : Date.now();
}

function pickInterval(windowMs: number): string {
  if (windowMs <= 2 * 60 * 60 * 1000) return "1m";
  if (windowMs <= 8 * 60 * 60 * 1000) return "5m";
  return "15m";
}

function intervalMs(interval: string): number {
  const map: Record<string, number> = {
    "1m": 60_000,
    "5m": 5 * 60_000,
    "15m": 15 * 60_000,
  };
  return map[interval] ?? 5 * 60_000;
}

function parseBinanceKlines(raw: unknown): TradeChartCandle[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!Array.isArray(row) || row.length < 5) return null;
      return {
        time: Number(row[0]),
        open: parseFloat(String(row[1])),
        high: parseFloat(String(row[2])),
        low: parseFloat(String(row[3])),
        close: parseFloat(String(row[4])),
      };
    })
    .filter((c): c is TradeChartCandle => c !== null && Number.isFinite(c.time) && c.close > 0);
}

function parseMexcKlines(raw: unknown): TradeChartCandle[] {
  const obj = raw as Record<string, unknown>;
  const data = obj?.data as Record<string, unknown> | undefined;
  const times = (data?.time ?? obj?.time) as number[] | undefined;
  const opens = (data?.open ?? obj?.open) as number[] | undefined;
  const highs = (data?.high ?? obj?.high) as number[] | undefined;
  const lows = (data?.low ?? obj?.low) as number[] | undefined;
  const closes = (data?.close ?? obj?.close) as number[] | undefined;
  if (!times?.length || !closes?.length) return [];
  return times
    .map((time, i) => ({
      time: Number(time) * (time < 1e12 ? 1000 : 1),
      open: parseFloat(String(opens?.[i] ?? closes[i])),
      high: parseFloat(String(highs?.[i] ?? closes[i])),
      low: parseFloat(String(lows?.[i] ?? closes[i])),
      close: parseFloat(String(closes[i])),
    }))
    .filter((c) => Number.isFinite(c.time) && c.close > 0);
}

function parseBitgetKlines(raw: unknown): TradeChartCandle[] {
  const obj = raw as Record<string, unknown>;
  const list = (obj?.data ?? obj) as unknown[];
  if (!Array.isArray(list)) return [];
  return list
    .map((row) => {
      if (!Array.isArray(row) || row.length < 5) return null;
      return {
        time: Number(row[0]),
        open: parseFloat(String(row[1])),
        high: parseFloat(String(row[2])),
        low: parseFloat(String(row[3])),
        close: parseFloat(String(row[4])),
      };
    })
    .filter((c): c is TradeChartCandle => c !== null && Number.isFinite(c.time) && c.close > 0);
}

async function fetchBinanceKlines(
  symbol: string,
  interval: string,
  startTime: number,
  endTime: number,
): Promise<TradeChartCandle[]> {
  const params = new URLSearchParams({
    symbol,
    interval,
    startTime: String(startTime),
    endTime: String(endTime),
    limit: "500",
  });
  const res = await exchangeFetch(`${BINANCE_FUTURES}/fapi/v1/klines?${params}`, {
    exchangeLabel: "Binance Klines",
  });
  return parseBinanceKlines(await res.json());
}

async function fetchMexcKlines(
  symbol: string,
  interval: string,
  startTime: number,
  endTime: number,
): Promise<TradeChartCandle[]> {
  const mexcInterval = interval === "1m" ? "Min1" : interval === "15m" ? "Min15" : "Min5";
  const params = new URLSearchParams({
    interval: mexcInterval,
    start: String(Math.floor(startTime / 1000)),
    end: String(Math.floor(endTime / 1000)),
  });
  const res = await exchangeFetch(`${MEXC_CONTRACT}/api/v1/contract/kline/${symbol}?${params}`, {
    exchangeLabel: "MEXC Klines",
  });
  const data = await parseJsonResponse(res, "MEXC Klines");
  return parseMexcKlines(data);
}

async function fetchBitgetKlines(
  symbol: string,
  interval: string,
  startTime: number,
  endTime: number,
): Promise<TradeChartCandle[]> {
  const params = new URLSearchParams({
    symbol,
    productType: "USDT-FUTURES",
    granularity: interval,
    startTime: String(startTime),
    endTime: String(endTime),
    limit: "200",
  });
  const res = await exchangeFetch(`${BITGET_BASE}/api/v2/mix/market/candles?${params}`, {
    exchangeLabel: "Bitget Klines",
  });
  const data = await parseJsonResponse(res, "Bitget Klines");
  return parseBitgetKlines(data);
}

async function fetchKlines(
  exchange: string | null | undefined,
  pair: string,
  interval: string,
  startTime: number,
  endTime: number,
): Promise<{ candles: TradeChartCandle[]; source: string }> {
  const symbol = normalizeSymbol(pair);
  const mexcSym = mexcSymbol(pair);

  const attempts: Array<{ fn: () => Promise<TradeChartCandle[]>; source: string }> = [];

  if (exchange === "mexc") {
    attempts.push({ fn: () => fetchMexcKlines(mexcSym, interval, startTime, endTime), source: "MEXC" });
  } else if (exchange === "bitget") {
    attempts.push({ fn: () => fetchBitgetKlines(symbol, interval, startTime, endTime), source: "Bitget" });
  } else if (exchange === "binance") {
    attempts.push({ fn: () => fetchBinanceKlines(symbol, interval, startTime, endTime), source: "Binance" });
  }

  attempts.push({ fn: () => fetchBinanceKlines(symbol, interval, startTime, endTime), source: "Binance Futures" });
  if (exchange !== "mexc") {
    attempts.push({ fn: () => fetchMexcKlines(mexcSym, interval, startTime, endTime), source: "MEXC" });
  }

  for (const { fn, source } of attempts) {
    try {
      const candles = await fn();
      if (candles.length >= 2) {
        return { candles: candles.sort((a, b) => a.time - b.time), source };
      }
    } catch {
      /* try next source */
    }
  }

  throw new Error("Não foi possível obter candles para este par e intervalo.");
}

function buildLevels(trade: Trade): TradeChartLevel {
  return {
    entry: trade.entryPrice > 0 ? trade.entryPrice : undefined,
    stop: trade.stopPrice > 0 ? trade.stopPrice : undefined,
    target: trade.targetPrice > 0 ? trade.targetPrice : undefined,
    exit: trade.exitPrice && trade.exitPrice > 0 ? trade.exitPrice : undefined,
  };
}

function inferExitReason(
  trade: Trade,
  levels: TradeChartLevel,
): TradeChartExitReason {
  const { exit, stop, target } = levels;
  if (!exit) return "UNKNOWN";
  if (stop && target) {
    const tol = Math.max(exit * 0.002, 1);
    const distStop = Math.abs(exit - stop);
    const distTarget = Math.abs(exit - target);
    if (distTarget <= tol && distTarget < distStop) return "TP";
    if (distStop <= tol && distStop < distTarget) return "SL";
  }
  if (trade.status === "WIN") return "TP";
  if (trade.status === "LOSS") return "SL";
  return "MANUAL";
}

function buildWarnings(trade: Trade, levels: TradeChartLevel): string[] {
  const warnings: string[] = [];
  if (!levels.stop && !levels.target) {
    warnings.push("Stop e alvo não disponíveis — comum em importações da Binance.");
  } else {
    if (!levels.stop) warnings.push("Stop não disponível na importação.");
    if (!levels.target) warnings.push("Alvo não disponível na importação.");
  }
  if (!levels.entry) {
    warnings.push("Preço de entrada não disponível — gráfico mostra só o movimento de preço.");
  }
  if (trade.status === "OPEN") {
    warnings.push("Trade ainda aberto — gráfico mostra janela recente até o momento atual.");
  }
  warnings.push("Gráfico reconstruído a partir de candles públicos, não é print da exchange.");
  return warnings;
}

export async function buildTradeChart(trade: Trade): Promise<TradeChartResponse> {
  const closeMs = tradeCloseMs(trade);
  const isOpen = trade.status === "OPEN";
  const endMs = isOpen ? Date.now() : closeMs + WINDOW_AFTER_MS;
  const startMs = closeMs - WINDOW_BEFORE_MS;
  const windowMs = endMs - startMs;
  const interval = pickInterval(windowMs);

  const { candles, source } = await fetchKlines(
    trade.sourceExchange,
    trade.pair,
    interval,
    startMs,
    endMs,
  );

  const step = intervalMs(interval);
  const filtered = candles.filter((c) => c.time >= startMs - step && c.time <= endMs + step);

  const levels = buildLevels(trade);
  const exitReason = inferExitReason(trade, levels);

  return {
    pair: trade.pair,
    direction: trade.direction,
    status: trade.status,
    interval,
    candles: filtered.length ? filtered : candles,
    levels,
    exitReason,
    warnings: buildWarnings(trade, levels),
    closeTime: new Date(closeMs).toISOString(),
    klineSource: source,
  };
}
