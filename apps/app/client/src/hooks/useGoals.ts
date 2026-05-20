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
    onError: () => toast.error("Erro ao criar meta"),
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
    onError: () => toast.error("Erro ao atualizar meta"),
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
    onError: () => toast.error("Erro ao remover meta"),
  });
}
