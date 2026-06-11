import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/queryClient";
import { getT } from "@/lib/locale-runtime";

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
      toast.success(getT().toasts.credentialsSaved);
    },
    onError: () => toast.error(getT().toasts.credentialsError),
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
      if (data?.success) toast.success(data.message ?? getT().toasts.connectionOk);
      else toast.error(data?.message ?? getT().toasts.connectionFailed);
    },
    onError: () => toast.error(getT().toasts.connectionTestError),
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
      if (data?.success) toast.success(data.message ?? getT().toasts.synced);
      else toast.error(data?.message ?? getT().toasts.syncFailed);
    },
    onError: () => toast.error(getT().toasts.syncError),
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
        toast.success(parts ? getT().toasts.tradesImportedParts(parts) : getT().toasts.tradesImported(data.totalImported));
      } else {
        const errs = data.results?.filter((r) => r.error).map((r) => r.error).join("; ");
        toast(errs ? errs : getT().toasts.noNewTrades, { icon: "ℹ️" });
      }
    },
    onError: () => toast.error(getT().toasts.exchangeSyncError),
  });
}
