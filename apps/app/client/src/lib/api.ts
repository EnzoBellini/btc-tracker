/**
 * Typed API client — single source of truth for all HTTP calls.
 * Uses the template's apiRequest under the hood.
 */
import { apiRequest } from "./queryClient";
import type {
  Trade, InsertTrade,
  Transfer, InsertTransfer,
  BtcHolding, InsertBtcHolding,
  Settings, InsertSettings,
  Goal, InsertGoal,
} from "@shared/schema";

// ── Trades ────────────────────────────────────────────────────────────────────
export const tradesApi = {
  list: () => fetch("/api/trades").then(r => r.json()) as Promise<Trade[]>,
  create: (data: InsertTrade) => apiRequest("POST", "/api/trades", data),
  update: (id: number, data: Partial<InsertTrade>) => apiRequest("PATCH", `/api/trades/${id}`, data),
  remove: (id: number) => apiRequest("DELETE", `/api/trades/${id}`),
};

// ── Transfers ─────────────────────────────────────────────────────────────────
export const transfersApi = {
  list: () => fetch("/api/transfers").then(r => r.json()) as Promise<Transfer[]>,
  create: (data: InsertTransfer) => apiRequest("POST", "/api/transfers", data),
  remove: (id: number) => apiRequest("DELETE", `/api/transfers/${id}`),
};

// ── BTC Holdings ──────────────────────────────────────────────────────────────
export const holdingsApi = {
  list: () => fetch("/api/btc-holdings").then(r => r.json()) as Promise<BtcHolding[]>,
  create: (data: InsertBtcHolding) => apiRequest("POST", "/api/btc-holdings", data),
  remove: (id: number) => apiRequest("DELETE", `/api/btc-holdings/${id}`),
};

// ── Goals ─────────────────────────────────────────────────────────────────────
export const goalsApi = {
  list: () => fetch("/api/goals").then(r => r.json()) as Promise<Goal[]>,
  create: (data: InsertGoal) => apiRequest("POST", "/api/goals", data),
  update: (id: number, data: Partial<InsertGoal>) => apiRequest("PATCH", `/api/goals/${id}`, data),
  remove: (id: number) => apiRequest("DELETE", `/api/goals/${id}`),
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const settingsApi = {
  get: () => fetch("/api/settings").then(r => r.json()) as Promise<Settings>,
  update: (data: Partial<InsertSettings>) => apiRequest("PATCH", "/api/settings", data),
};

export const exchangesApi = {
  list: () => fetch("/api/exchanges").then((r) => r.json()),
  getCredentials: (exchange: string) =>
    fetch(`/api/exchanges/${exchange}/credentials`).then((r) => r.json()),
  test: (exchange: string, body: { apiKey: string; secretKey: string; passphrase?: string }) =>
    apiRequest("POST", `/api/exchanges/${exchange}/test`, body),
  sync: (exchange: string) => apiRequest("POST", `/api/exchanges/${exchange}/sync`),
  syncAllTrades: (exchanges?: string[]) =>
    apiRequest("POST", "/api/trades/sync", exchanges?.length ? { exchanges } : {}),
};

/** @deprecated Use exchangesApi */
export const mexcApi = {
  getCredentials: () => exchangesApi.getCredentials("mexc"),
  test: (apiKey: string, secretKey: string) => exchangesApi.test("mexc", { apiKey, secretKey }),
  sync: () => exchangesApi.sync("mexc"),
};

export const statsApi = {
  get: () => fetch("/api/stats").then(r => r.json()),
};
