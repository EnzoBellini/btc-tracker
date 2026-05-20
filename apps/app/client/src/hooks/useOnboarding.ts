import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { AuthUser } from "./useAuth";

export type QuizAnswers = Record<string, string | number>;

export function useOnboardingProgress() {
  return useQuery({
    queryKey: ["/api/onboarding/progress"],
    queryFn: async (): Promise<{ step: number; answers: QuizAnswers; completed: boolean }> => {
      const res = await fetch("/api/onboarding/progress", { credentials: "include" });
      if (!res.ok) throw new Error("Erro ao carregar progresso");
      return res.json();
    },
  });
}

export function useSaveOnboardingProgress() {
  return useMutation({
    mutationFn: async ({ step, answers }: { step: number; answers: QuizAnswers }) => {
      const res = await fetch("/api/onboarding/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ step, answers }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao salvar");
      }
      return res.json();
    },
  });
}

export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: async (answers: QuizAnswers) => {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao finalizar");
      return data as { ok: boolean; profile: Record<string, unknown>; user: AuthUser };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-rules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap"] });
    },
  });
}

export function useUserRules() {
  return useQuery({
    queryKey: ["/api/user-rules"],
    queryFn: async () => {
      const res = await fetch("/api/user-rules", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });
}

export function useRoadmap() {
  return useQuery({
    queryKey: ["/api/roadmap"],
    queryFn: async () => {
      const res = await fetch("/api/roadmap", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });
}
