const MEXC_SPOT_BASE = "https://api.mexc.com";
const FETCH_TIMEOUT_MS = 12_000;
const CACHE_TTL_MS = 25_000;

/** Pares exibidos no ticker (spot USDT na MEXC). */
export const MARKET_TICKER_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "XRPUSDT",
] as const;

const SYMBOL_LABELS: Record<(typeof MARKET_TICKER_SYMBOLS)[number], string> = {
  BTCUSDT: "BTC/USDT",
  ETHUSDT: "ETH/USDT",
  SOLUSDT: "SOL/USDT",
  BNBUSDT: "BNB/USDT",
  XRPUSDT: "XRP/USDT",
};

export type MarketTickerItem = {
  symbol: string;
  price: string;
  delta: string;
  up: boolean;
};

type Mexc24hr = {
  symbol?: string;
  lastPrice?: string;
  priceChangePercent?: string;
};

let cache: { at: number; items: MarketTickerItem[] } | null = null;

function formatPrice(symbol: string, price: number): string {
  if (!Number.isFinite(price)) return "—";
  if (symbol === "XRPUSDT") {
    return price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }
  if (price >= 1000) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDelta(ratio: number): { delta: string; up: boolean } {
  const pct = ratio * 100;
  const sign = pct >= 0 ? "+" : "";
  return {
    delta: `${sign}${pct.toFixed(2)}%`,
    up: pct >= 0,
  };
}

async function fetchMexc24hr(symbol: string): Promise<Mexc24hr | null> {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${MEXC_SPOT_BASE}/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`,
      { signal: ctrl.signal, headers: { Accept: "application/json" } },
    );
    clearTimeout(to);
    if (!res.ok) return null;
    return (await res.json()) as Mexc24hr;
  } catch {
    clearTimeout(to);
    return null;
  }
}

function rowFromMexc(symbol: (typeof MARKET_TICKER_SYMBOLS)[number], raw: Mexc24hr): MarketTickerItem {
  const last = parseFloat(raw.lastPrice ?? "0");
  const changeRatio = parseFloat(raw.priceChangePercent ?? "0");
  const { delta, up } = formatDelta(changeRatio);
  return {
    symbol: SYMBOL_LABELS[symbol],
    price: formatPrice(symbol, last),
    delta,
    up,
  };
}

/** Fallback estático se a MEXC falhar (evita ticker vazio). */
export const MARKET_TICKER_FALLBACK: MarketTickerItem[] = MARKET_TICKER_SYMBOLS.map((sym) => ({
  symbol: SYMBOL_LABELS[sym],
  price: "—",
  delta: "—",
  up: true,
}));

export async function getMarketTicker(): Promise<MarketTickerItem[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.items;
  }

  const results = await Promise.all(
    MARKET_TICKER_SYMBOLS.map(async (sym) => {
      const raw = await fetchMexc24hr(sym);
      if (!raw) return null;
      return rowFromMexc(sym, raw);
    }),
  );

  const items = results.filter((r): r is MarketTickerItem => r !== null);
  const payload = items.length > 0 ? items : MARKET_TICKER_FALLBACK;

  cache = { at: Date.now(), items: payload };
  return payload;
}
