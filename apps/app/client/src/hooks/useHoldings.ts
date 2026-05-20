import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { BtcHolding, InsertBtcHolding } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useHoldings() {
  return useQuery<BtcHolding[]>({
    queryKey: ["/api/btc-holdings"],
    staleTime: 15_000,
  });
}

export function useCreateHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertBtcHolding) => apiRequest("POST", "/api/btc-holdings", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/btc-holdings"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      toast.success("Snapshot registrado");
    },
    onError: () => toast.error("Erro ao registrar snapshot"),
  });
}

export function useDeleteHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/btc-holdings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/btc-holdings"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      toast.success("Snapshot removido");
    },
    onError: () => toast.error("Erro ao remover snapshot"),
  });
}
