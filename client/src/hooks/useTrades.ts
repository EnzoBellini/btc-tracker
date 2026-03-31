import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Trade, InsertTrade } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useTrades() {
  return useQuery<Trade[]>({
    queryKey: ["/api/trades"],
    staleTime: 15_000,
  });
}

export function useCreateTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertTrade) => apiRequest("POST", "/api/trades", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/trades"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      toast.success("Trade registrado");
    },
    onError: () => toast.error("Erro ao registrar trade"),
  });
}

export function useUpdateTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertTrade> }) =>
      apiRequest("PATCH", `/api/trades/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/trades"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      toast.success("Trade atualizado");
    },
    onError: () => toast.error("Erro ao atualizar trade"),
  });
}

export function useDeleteTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/trades/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/trades"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      toast.success("Trade removido");
    },
    onError: () => toast.error("Erro ao remover trade"),
  });
}

export function useSyncTradesFromMexc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/trades/sync-from-mexc", { method: "POST", credentials: "include" });
      let data: any;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Resposta inválida do servidor. Pode ser timeout — verifique se o IP do Railway está na whitelist da MEXC.");
      }
      if (!res.ok) throw new Error(data?.error ?? "Erro ao sincronizar");
      return data;
    },
    onSuccess: (data: { success?: boolean; imported?: number; message?: string }) => {
      qc.invalidateQueries({ queryKey: ["/api/trades"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      toast.success(data.message ?? "Trades sincronizados");
    },
    onError: (err: any) => toast.error(err?.message ?? "Erro ao sincronizar trades"),
  });
}
