import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Goal, InsertGoal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useGoals() {
  return useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    staleTime: 15_000,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertGoal) => apiRequest("POST", "/api/goals", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/goals"] });
      toast.success("Meta criada");
    },
    onError: (err: Error) => {
      const msg = err.message?.includes("Pro Trader")
        ? err.message
        : "Erro ao criar meta";
      toast.error(msg);
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertGoal> }) =>
      apiRequest("PATCH", `/api/goals/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/goals"] });
      toast.success("Meta atualizada");
    },
    onError: (err: Error) => {
      const msg = err.message?.includes("Pro Trader")
        ? err.message
        : "Erro ao atualizar meta";
      toast.error(msg);
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/goals/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/goals"] });
      toast.success("Meta removida");
    },
    onError: (err: Error) => {
      const msg = err.message?.includes("Pro Trader")
        ? err.message
        : "Erro ao remover meta";
      toast.error(msg);
    },
  });
}
