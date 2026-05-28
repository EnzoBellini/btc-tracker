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

export async function fetchMarketTicker(): Promise<MarketTickerItem[]> {
  const res = await fetch(`${API_BASE}/api/market/ticker`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("market ticker unavailable");
  const data = (await res.json()) as MarketTickerResponse;
  return data.items ?? [];
}
