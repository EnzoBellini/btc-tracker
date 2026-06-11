import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Trade, InsertTrade } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { getT } from "@/lib/locale-runtime";

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
      toast.success(getT().toasts.tradeRegistered);
    },
    onError: () => toast.error(getT().toasts.tradeError),
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
      toast.success(getT().toasts.tradeUpdated);
    },
    onError: () => toast.error(getT().toasts.tradeUpdateError),
  });
}

export function useDeleteTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/trades/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/trades"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      toast.success(getT().toasts.tradeRemoved);
    },
    onError: () => toast.error(getT().toasts.tradeRemoveError),
  });
}

import { useSyncAllTrades } from "./useExchanges";

export { useSyncAllTrades };

/** @deprecated Use useSyncAllTrades — importa de todas as exchanges conectadas */
export function useSyncTradesFromMexc() {
  return useSyncAllTrades();
}
