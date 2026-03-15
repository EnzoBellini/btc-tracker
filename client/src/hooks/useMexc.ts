import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/queryClient";

export interface MexcCredentials {
  apiKey: string;
  secretKey: string;
  isConnected: boolean;
  lastSyncAt?: string | null;
  lastSyncStatus?: string | null;
  lastSyncMessage?: string | null;
}

export function useMexcCredentials() {
  return useQuery<MexcCredentials>({
    queryKey: ["/api/mexc/credentials"],
    staleTime: 30_000,
  });
}

export function useUpdateMexcCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { apiKey: string; secretKey: string }) =>
      apiRequest("PATCH", "/api/mexc/credentials", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/mexc/credentials"] });
      toast.success("Credenciais salvas");
    },
    onError: () => toast.error("Erro ao salvar credenciais"),
  });
}

export function useTestMexc() {
  return useMutation({
    mutationFn: ({ apiKey, secretKey }: { apiKey: string; secretKey: string }) =>
      apiRequest("POST", "/api/mexc/test", { apiKey, secretKey }).then(r => r.json()),
    onSuccess: (data: any) => {
      if (data?.success) toast.success("Conexão com MEXC OK");
      else toast.error(data?.message ?? "Falha no teste");
    },
    onError: () => toast.error("Erro ao testar conexão"),
  });
}

export function useSyncMexc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest("POST", "/api/mexc/sync").then(r => r.json()),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["/api/trades"] });
      qc.invalidateQueries({ queryKey: ["/api/btc-holdings"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      qc.invalidateQueries({ queryKey: ["/api/mexc/credentials"] });
      if (data?.success) toast.success(data.message ?? "Sincronizado com sucesso");
      else toast.error(data?.message ?? "Falha na sincronização");
    },
    onError: () => toast.error("Erro ao sincronizar"),
  });
}
