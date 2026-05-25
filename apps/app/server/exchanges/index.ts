import type { ExchangeId } from "@shared/schema";
import type { ExchangeAdapter } from "./types";
import { mexcAdapter } from "./mexc";
import { binanceAdapter } from "./binance";
import { bitgetAdapter } from "./bitget";

export const adapters: Record<ExchangeId, ExchangeAdapter> = {
  mexc: mexcAdapter,
  binance: binanceAdapter,
  bitget: bitgetAdapter,
};

export function getAdapter(id: ExchangeId): ExchangeAdapter {
  const adapter = adapters[id];
  if (!adapter) throw new Error(`Exchange não suportada: ${id}`);
  return adapter;
}

export function isExchangeId(id: string): id is ExchangeId {
  return id === "mexc" || id === "binance" || id === "bitget";
}

export * from "./types";
export { mexcSpotRequest, MEXC_SPOT_BASE } from "./mexc";
