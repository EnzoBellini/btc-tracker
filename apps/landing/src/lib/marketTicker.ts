export type MarketTickerItem = {
  symbol: string;
  price: string;
  delta: string;
  up: boolean;
};

/** Placeholder exibido no 1º paint — evita flash vazio enquanto a API responde. */
export const TICKER_FALLBACK_ITEMS: MarketTickerItem[] = [
  { symbol: "BTC/USDT", price: "—", delta: "—", up: true },
  { symbol: "ETH/USDT", price: "—", delta: "—", up: true },
  { symbol: "SOL/USDT", price: "—", delta: "—", up: true },
  { symbol: "BNB/USDT", price: "—", delta: "—", up: true },
  { symbol: "XRP/USDT", price: "—", delta: "—", up: true },
];

const CACHE_KEY = "trackion_ticker_v1";
const CACHE_TTL_MS = 45_000;

export type MarketTickerResponse = {
  items: MarketTickerItem[];
  source?: string;
  updatedAt?: string;
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export function readCachedMarketTicker(): MarketTickerItem[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; items: MarketTickerItem[] };
    if (!Array.isArray(parsed.items) || Date.now() - parsed.at > CACHE_TTL_MS) return null;
    return parsed.items;
  } catch {
    return null;
  }
}

export function writeCachedMarketTicker(items: MarketTickerItem[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items }));
  } catch {
    /* ignore quota */
  }
}

export async function fetchMarketTicker(): Promise<MarketTickerItem[]> {
  const res = await fetch(`${API_BASE}/api/market/ticker`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("market ticker unavailable");
  const data = (await res.json()) as MarketTickerResponse;
  return data.items ?? [];
}

/** Dispara fetch cedo — chamado no boot do app, antes do React montar o ticker. */
export function prefetchMarketTicker() {
  void fetchMarketTicker()
    .then((items) => {
      if (items.length > 0) writeCachedMarketTicker(items);
    })
    .catch(() => {
      /* fallback permanece */
    });
}
