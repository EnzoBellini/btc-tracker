import { useCallback, useEffect, useState } from "react";
import {
  detectMarket,
  detectMarketSync,
  setMarketPreference,
  type Market,
} from "@/lib/locale";

export function useMarket() {
  const [market, setMarketState] = useState<Market>(() => detectMarketSync());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    detectMarket().then((m) => {
      if (cancelled) return;
      setMarketState(m);
      setReady(true);
      document.documentElement.lang = m === "us" ? "en" : "pt-BR";
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMarket = useCallback((next: Market) => {
    setMarketPreference(next);
    setMarketState(next);
  }, []);

  return { market, setMarket, ready };
}
