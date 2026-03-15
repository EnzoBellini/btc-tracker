import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Transfer, InsertTransfer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useTransfers() {
  return useQuery<Transfer[]>({
    queryKey: ["/api/transfers"],
    staleTime: 15_000,
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertTransfer) => apiRequest("POST", "/api/transfers", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/transfers"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      toast.success("Transferência registrada");
    },
    onError: () => toast.error("Erro ao registrar transferência"),
  });
}

export function useDeleteTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/transfers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/transfers"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      toast.success("Transferência removida");
    },
    onError: () => toast.error("Erro ao remover transferência"),
  });
}
