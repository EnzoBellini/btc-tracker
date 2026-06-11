import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useMarket } from "@/hooks/useMarket";
import { getAppContent, type AppContent } from "@/lib/app-content";
import { setFormatMarket } from "@/lib/format";
import { setCurrentMarket } from "@/lib/locale-runtime";
import type { Market as MarketType } from "@/lib/locale";

type LocaleContextValue = {
  market: MarketType;
  setMarket: (market: MarketType) => void;
  ready: boolean;
  t: AppContent;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { market, setMarket, ready } = useMarket();
  const t = useMemo(() => getAppContent(market), [market]);

  useEffect(() => {
    setFormatMarket(market);
    setCurrentMarket(market);
  }, [market]);

  return (
    <LocaleContext.Provider value={{ market, setMarket, ready, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useAppLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useAppLocale must be used within LocaleProvider");
  return ctx;
}
