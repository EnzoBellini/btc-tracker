import { useQuery } from "@tanstack/react-query";

export interface StatsData {
  totalTrades: number;
  closedTrades: number;
  openTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  totalBtcBought: number;
  totalUsdtTransferred: number;
  latestBtcHolding: any;
  settings: any;
  tradesByMonth: Record<string, { wins: number; losses: number; pnl: number; count: number }>;
  tradesByWeek: Record<string, { wins: number; losses: number; pnl: number; count: number }>;
}

export function useStats() {
  return useQuery<StatsData>({
    queryKey: ["/api/stats"],
    staleTime: 30_000, // 30s — don't hammer the server on every focus
  });
}
