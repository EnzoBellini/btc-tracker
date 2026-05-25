/** @deprecated Use useExchanges — aliases fixos para MEXC */
import {
  useExchangeCredentials,
  useUpdateExchangeCredentials,
  useTestExchange,
  useSyncExchange,
  type ExchangeCredentials,
} from "./useExchanges";

export type MexcCredentials = ExchangeCredentials;

export function useMexcCredentials() {
  return useExchangeCredentials("mexc");
}

export function useUpdateMexcCredentials() {
  return useUpdateExchangeCredentials("mexc");
}

export function useTestMexc() {
  return useTestExchange("mexc");
}

export function useSyncMexc() {
  return useSyncExchange("mexc");
}
