import { useQuery } from "@tanstack/react-query";

export interface WeeklyInsightBullet {
  type: string;
  text: string;
  pair?: string;
}

export interface WeeklyInsights {
  week: string;
  headline: string;
  bullets: WeeklyInsightBullet[];
  availableWeeks: string[];
}

export function useWeeklyInsights(week: string | undefined, enabled = true) {
  const params = week ? `?week=${encodeURIComponent(week)}` : "";
  return useQuery<WeeklyInsights>({
    queryKey: ["/api/reports/weekly-insights", week ?? "current"],
    enabled,
    staleTime: 30_000,
    retry: false,
    queryFn: async () => {
      const res = await fetch(`/api/reports/weekly-insights${params}`, { credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Erro ao carregar insights");
      }
      return res.json();
    },
  });
}
