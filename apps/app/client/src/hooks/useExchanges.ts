import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/queryClient";

export type ExchangeId = "mexc" | "binance" | "bitget";

export interface ExchangeCredentials {
  exchange: ExchangeId;
  apiKey: string;
  secretKey: string;
  passphrase?: string;
  isConnected: boolean;
  lastSyncAt?: string | null;
  lastSyncStatus?: string | null;
  lastSyncMessage?: string | null;
  hasSecret?: boolean;
  hasPassphrase?: boolean;
}

export interface ExchangeSummary {
  exchange: ExchangeId;
  isConnected: boolean;
  hasSecret: boolean;
  hasPassphrase?: boolean;
  lastSyncAt?: string | null;
  lastSyncStatus?: string | null;
  lastSyncMessage?: string | null;
}

export function useExchangesSummary() {
  return useQuery<ExchangeSummary[]>({
    queryKey: ["/api/exchanges"],
    staleTime: 30_000,
  });
}

export function useExchangeCredentials(exchange: ExchangeId) {
  return useQuery<ExchangeCredentials>({
    queryKey: [`/api/exchanges/${exchange}/credentials`],
    staleTime: 30_000,
  });
}

export function useUpdateExchangeCredentials(exchange: ExchangeId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { apiKey: string; secretKey: string; passphrase?: string }) =>
      apiRequest("PATCH", `/api/exchanges/${exchange}/credentials`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/exchanges/${exchange}/credentials`] });
      qc.invalidateQueries({ queryKey: ["/api/exchanges"] });
      toast.success("Credenciais salvas");
    },
    onError: () => toast.error("Erro ao salvar credenciais"),
  });
}

export function useTestExchange(exchange: ExchangeId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { apiKey: string; secretKey: string; passphrase?: string }) =>
      apiRequest("POST", `/api/exchanges/${exchange}/test`, data).then((r) => r.json()),
    onSuccess: (data: { success?: boolean; message?: string }) => {
      qc.invalidateQueries({ queryKey: [`/api/exchanges/${exchange}/credentials`] });
      qc.invalidateQueries({ queryKey: ["/api/exchanges"] });
      if (data?.success) toast.success(data.message ?? "Conexão OK");
      else toast.error(data?.message ?? "Falha no teste");
    },
    onError: () => toast.error("Erro ao testar conexão"),
  });
}

export function useSyncExchange(exchange: ExchangeId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest("POST", `/api/exchanges/${exchange}/sync`).then((r) => r.json()),
    onSuccess: (data: { success?: boolean; message?: string }) => {
      qc.invalidateQueries({ queryKey: ["/api/trades"] });
      qc.invalidateQueries({ queryKey: ["/api/btc-holdings"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      qc.invalidateQueries({ queryKey: [`/api/exchanges/${exchange}/credentials`] });
      qc.invalidateQueries({ queryKey: ["/api/exchanges"] });
      if (data?.success) toast.success(data.message ?? "Sincronizado");
      else toast.error(data?.message ?? "Falha na sincronização");
    },
    onError: () => toast.error("Erro ao sincronizar"),
  });
}

export interface SyncAllResult {
  success: boolean;
  totalImported: number;
  results: Array<{
    exchange: ExchangeId;
    imported?: number;
    skipped?: boolean;
    success?: boolean;
    error?: string;
    message?: string;
  }>;
}

export function useSyncAllTrades() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (exchanges?: ExchangeId[]) =>
      apiRequest("POST", "/api/trades/sync", exchanges?.length ? { exchanges } : {}).then((r) => r.json()),
    onSuccess: (data: SyncAllResult) => {
      qc.invalidateQueries({ queryKey: ["/api/trades"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      const parts = (data.results ?? [])
        .filter((r) => !r.skipped && (r.imported ?? 0) > 0)
        .map((r) => `${r.exchange}: ${r.imported}`)
        .join(", ");
      if (data.totalImported > 0) {
        toast.success(parts ? `Importados: ${parts}` : `${data.totalImported} trade(s) importado(s)`);
      } else {
        const errs = data.results?.filter((r) => r.error).map((r) => r.error).join("; ");
        toast(errs ? errs : "Nenhum trade novo para importar", { icon: "ℹ️" });
      }
    },
    onError: () => toast.error("Erro ao sincronizar exchanges"),
  });
}
