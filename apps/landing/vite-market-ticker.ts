/**
 * Em dev, serve GET /api/market/ticker direto da MEXC quando o app (porta 5000) não está rodando.
 */
import type { Plugin, Connect } from "vite";

const MEXC_SPOT = "https://api.mexc.com";
const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"] as const;
const LABELS: Record<(typeof SYMBOLS)[number], string> = {
  BTCUSDT: "BTC/USDT",
  ETHUSDT: "ETH/USDT",
  SOLUSDT: "SOL/USDT",
  BNBUSDT: "BNB/USDT",
  XRPUSDT: "XRP/USDT",
};

type Item = { symbol: string; price: string; delta: string; up: boolean };

let cache: { at: number; items: Item[] } | null = null;
const CACHE_MS = 25_000;

function formatPrice(sym: string, n: number) {
  if (!Number.isFinite(n)) return "—";
  if (sym === "XRPUSDT") return n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function fetchOne(symbol: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(
      `${MEXC_SPOT}/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`,
      { signal: ctrl.signal, headers: { Accept: "application/json" } },
    );
    clearTimeout(t);
    if (!res.ok) return null;
    const raw = (await res.json()) as { lastPrice?: string; priceChangePercent?: string };
    const last = parseFloat(raw.lastPrice ?? "0");
    const ratio = parseFloat(raw.priceChangePercent ?? "0");
    const pct = ratio * 100;
    return {
      symbol: LABELS[symbol as (typeof SYMBOLS)[number]],
      price: formatPrice(symbol, last),
      delta: `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
      up: pct >= 0,
    };
  } catch {
    clearTimeout(t);
    return null;
  }
}

async function getTicker(): Promise<Item[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.items;
  const rows = await Promise.all(SYMBOLS.map(fetchOne));
  const items = rows.filter((r): r is Item => r !== null);
  const payload =
    items.length > 0
      ? items
      : SYMBOLS.map((s) => ({ symbol: LABELS[s], price: "—", delta: "—", up: true }));
  cache = { at: Date.now(), items: payload };
  return payload;
}

export function marketTickerDevPlugin(): Plugin {
  return {
    name: "trackion-market-ticker-dev",
    configureServer(server) {
      server.middlewares.use(((req, res, next) => {
        const path = req.url?.split("?")[0];
        if (req.method !== "GET" || path !== "/api/market/ticker") {
          return next();
        }

        getTicker()
          .then((items) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Cache-Control", "public, max-age=20");
            res.end(
              JSON.stringify({
                items,
                source: "mexc",
                updatedAt: new Date().toISOString(),
              }),
            );
          })
          .catch(() => {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "MEXC unavailable" }));
          });
      }) as Connect.NextHandleFunction);
    },
  };
}
