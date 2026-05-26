import { useQuery } from "@tanstack/react-query";

export interface AggRow {
  key: string;
  wins: number;
  losses: number;
  pnl: number;
  count: number;
}

export interface AdvancedReports {
  byPair: AggRow[];
  bySetup: AggRow[];
  byHour: AggRow[];
  sharpeRatio: number | null;
  maxDrawdownPct: number | null;
  byExchange: AggRow[] | null;
}

export function useAdvancedReports(enabled = true) {
  return useQuery<AdvancedReports>({
    queryKey: ["/api/reports/advanced"],
    enabled,
    staleTime: 30_000,
    retry: false,
    queryFn: async () => {
      const res = await fetch("/api/reports/advanced", { credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Relatórios avançados indisponíveis");
      }
      return res.json();
    },
  });
}
