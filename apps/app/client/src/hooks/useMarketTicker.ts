import { useQuery } from "@tanstack/react-query";

export type MarketTickerItem = {
  symbol: string;
  price: string;
  delta: string;
  up: boolean | null;
};

type MarketTickerResponse = {
  items: MarketTickerItem[];
  source?: string;
  updatedAt?: string;
};

async function fetchMarketTicker(): Promise<MarketTickerItem[]> {
  const res = await fetch("/api/market/ticker", { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("market ticker unavailable");
  const data = (await res.json()) as MarketTickerResponse;
  return (data.items ?? []).map((item) => ({
    ...item,
    up: item.up ?? null,
  }));
}

export function useMarketTicker() {
  return useQuery({
    queryKey: ["/api/market/ticker"],
    queryFn: fetchMarketTicker,
    staleTime: 20_000,
    refetchInterval: 30_000,
    retry: 2,
  });
}
