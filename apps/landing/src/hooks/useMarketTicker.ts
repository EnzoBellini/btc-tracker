import { useEffect, useState } from "react";
import {
  fetchMarketTicker,
  TICKER_PLATFORM_ITEMS,
  type MarketTickerItem,
} from "@/lib/marketTicker";

const REFRESH_MS = 30_000;

export function useMarketTicker() {
  const [items, setItems] = useState<MarketTickerItem[]>(TICKER_PLATFORM_ITEMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchMarketTicker();
        if (!cancelled) setItems(next);
      } catch {
        /* mantém último estado ou só platform items */
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
