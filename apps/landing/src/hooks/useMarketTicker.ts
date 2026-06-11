import { useEffect, useState } from "react";
import {
  fetchMarketTicker,
  readCachedMarketTicker,
  TICKER_FALLBACK_ITEMS,
  writeCachedMarketTicker,
  type MarketTickerItem,
} from "@/lib/marketTicker";

const REFRESH_MS = 30_000;

function initialTickerItems(): MarketTickerItem[] {
  return readCachedMarketTicker() ?? TICKER_FALLBACK_ITEMS;
}

export function useMarketTicker() {
  const [items, setItems] = useState<MarketTickerItem[]>(initialTickerItems);
  const [loading, setLoading] = useState(() => readCachedMarketTicker() === null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchMarketTicker();
        if (cancelled || next.length === 0) return;
        writeCachedMarketTicker(next);
        setItems(next);
      } catch {
        /* mantém cache / fallback */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { items, loading };
}
