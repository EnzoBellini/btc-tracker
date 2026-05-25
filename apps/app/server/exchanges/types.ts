import type { ExchangeId } from "@shared/schema";
import type { InsertTrade } from "@shared/schema";

export const MASKED_SECRET = "••••••••••••••••";

export interface ExchangeCreds {
  apiKey: string;
  secretKey: string;
  passphrase?: string;
}

export interface SyncFuturesResult {
  imported: number;
  trades: TradeInsert[];
  message?: string;
}

export interface SyncSpotResult {
  btcAmount: number;
  btcPrice: number;
  notes: string;
}

export interface ExchangeAdapter {
  id: ExchangeId;
  label: string;
  testConnection(creds: ExchangeCreds): Promise<void>;
  syncFuturesTrades(
    creds: ExchangeCreds,
    existingNotes: Set<string | null | undefined>,
    defaultLeverage: number,
  ): Promise<SyncFuturesResult>;
  syncSpotBtc?(creds: ExchangeCreds): Promise<SyncSpotResult | null>;
}

export function credsReady(c: { apiKey: string; secretKey: string; isConnected?: boolean }, needsPassphrase = false, passphrase = ""): boolean {
  if (!c.apiKey?.trim() || !c.secretKey?.trim()) return false;
  if (needsPassphrase && !passphrase?.trim()) return false;
  return true;
}

export type TradeInsert = InsertTrade;
