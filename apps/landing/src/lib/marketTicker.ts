const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export type MarketTickerItem = {
  symbol: string;
  price: string;
  delta: string;
  up: boolean;
};

export type MarketTickerResponse = {
  items: MarketTickerItem[];
  source?: string;
  updatedAt?: string;
};

/** Itens fixos de marketing (não vêm da MEXC). */
export const TICKER_PLATFORM_ITEMS: MarketTickerItem[] = [
  { symbol: "TRADERS ONLINE", price: "1,247", delta: "LIVE", up: true },
  { symbol: "WIN RATE MÉDIO", price: "58.4%", delta: "Trackion", up: true },
  { symbol: "TRADES IMPORTADOS", price: "1,284,902", delta: "+18.2k 7d", up: true },
];

export async function fetchMarketTicker(): Promise<MarketTickerItem[]> {
  const res = await fetch(`${API_BASE}/api/market/ticker`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("market ticker unavailable");
  const data = (await res.json()) as MarketTickerResponse;
  return [...(data.items ?? []), ...TICKER_PLATFORM_ITEMS];
}
