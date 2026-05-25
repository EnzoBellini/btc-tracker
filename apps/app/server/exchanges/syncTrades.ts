import { EXCHANGE_IDS, type ExchangeId } from "@shared/schema";
import type { IStorage } from "../storage";
import type { ExchangeCredentials } from "@shared/schema";
import { getAdapter, type ExchangeCreds, credsReady } from "./index";

export interface SyncExchangeResult {
  exchange: ExchangeId;
  imported?: number;
  skipped?: boolean;
  success?: boolean;
  error?: string;
  message?: string;
}

export interface SyncTradesResponse {
  success: boolean;
  totalImported: number;
  results: SyncExchangeResult[];
}

function toExchangeCreds(row: ExchangeCredentials): ExchangeCreds {
  return {
    apiKey: row.apiKey,
    secretKey: row.secretKey,
    passphrase: row.passphrase || undefined,
  };
}

export function resolveExchangesToSync(
  requested: ExchangeId[] | undefined,
  allCreds: ExchangeCredentials[],
): ExchangeId[] {
  const connected = allCreds.filter((c) => {
    const needsPass = c.exchange === "bitget";
    return credsReady(c, needsPass, c.passphrase);
  }).map((c) => c.exchange as ExchangeId);

  if (!requested?.length) return connected;
  return requested.filter((id) => EXCHANGE_IDS.includes(id));
}

export async function syncTradesFromExchanges(
  storage: IStorage,
  userId: number,
  exchanges?: ExchangeId[],
): Promise<SyncTradesResponse> {
  const allCreds = await storage.listExchangeCredentials(userId);
  const targets = resolveExchangesToSync(exchanges, allCreds);
  const credsMap = new Map(allCreds.map((c) => [c.exchange as ExchangeId, c]));

  const existingTrades = await storage.getTrades(userId);
  const existingNotes = new Set(existingTrades.map((t) => t.notes));
  const settings = await storage.getSettings(userId);
  const defaultLeverage = settings.defaultLeverage ?? 3;

  const results: SyncExchangeResult[] = [];
  let totalImported = 0;

  for (const id of EXCHANGE_IDS) {
    if (!targets.includes(id)) {
      const row = credsMap.get(id);
      if (!exchanges?.length && row && !credsReady(row, id === "bitget", row.passphrase)) {
        results.push({ exchange: id, skipped: true, message: "não configurada" });
      }
      continue;
    }

    const row = credsMap.get(id);
    if (!row || !credsReady(row, id === "bitget", row.passphrase)) {
      results.push({ exchange: id, skipped: true, message: "credenciais incompletas" });
      continue;
    }

    try {
      const adapter = getAdapter(id);
      const { trades, message } = await adapter.syncFuturesTrades(
        toExchangeCreds(row),
        existingNotes,
        defaultLeverage,
      );
      for (const t of trades) {
        await storage.createTrade(userId, t);
      }
      totalImported += trades.length;
      results.push({
        exchange: id,
        success: true,
        imported: trades.length,
        message: message ?? `${trades.length} trade(s) importado(s)`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[trades/sync] ${id}`, msg);
      results.push({ exchange: id, success: false, error: msg, imported: 0 });
    }
  }

  return {
    success: results.some((r) => r.success && (r.imported ?? 0) > 0) || results.every((r) => r.skipped),
    totalImported,
    results,
  };
}

export async function syncFullExchange(
  storage: IStorage,
  userId: number,
  exchangeId: ExchangeId,
): Promise<{ success: boolean; message: string }> {
  const row = await storage.getExchangeCredentials(userId, exchangeId);
  if (!credsReady(row, exchangeId === "bitget", row.passphrase)) {
    throw new Error("API Key e Secret Key não configurados");
  }

  const adapter = getAdapter(exchangeId);
  const synced: string[] = [];
  const existingTrades = await storage.getTrades(userId);
  const existingNotes = new Set(existingTrades.map((t) => t.notes));
  const settings = await storage.getSettings(userId);

  try {
    const { trades, message } = await adapter.syncFuturesTrades(
      toExchangeCreds(row),
      existingNotes,
      settings.defaultLeverage ?? 3,
    );
    for (const t of trades) {
      await storage.createTrade(userId, t);
    }
    if (trades.length) synced.push(`${trades.length} posições de futuros importadas`);
    else if (message) synced.push(message);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    synced.push(`Futuros: ${msg}`);
  }

  if (adapter.syncSpotBtc) {
    try {
      const spot = await adapter.syncSpotBtc(toExchangeCreds(row));
      if (spot && spot.btcAmount > 0) {
        const today = new Date().toISOString().split("T")[0];
        const holdings = await storage.getBtcHoldings(userId);
        const todayHolding = holdings.find((h) => h.date === today);
        const spotNote = spot.notes;

        if (todayHolding && todayHolding.notes?.startsWith("sync_")) {
          const isSameExchange = todayHolding.notes === spotNote;
          if (isSameExchange) {
            await storage.updateBtcHolding(userId, todayHolding.id, {
              btcAmount: spot.btcAmount,
              btcPriceNow: spot.btcPrice,
              avgCostUsdt: spot.btcPrice > 0 ? spot.btcPrice : todayHolding.avgCostUsdt,
            });
          } else {
            await storage.updateBtcHolding(userId, todayHolding.id, {
              btcAmount: todayHolding.btcAmount + spot.btcAmount,
              btcPriceNow: spot.btcPrice || todayHolding.btcPriceNow,
            });
          }
        } else if (!todayHolding) {
          await storage.createBtcHolding(userId, {
            date: today,
            btcAmount: spot.btcAmount,
            avgCostUsdt: spot.btcPrice > 0 ? spot.btcPrice : 1,
            btcPriceNow: spot.btcPrice,
            notes: spotNote,
          });
        }
        synced.push(`BTC spot: ${spot.btcAmount.toFixed(8)} BTC`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      synced.push(`Spot: ${msg}`);
    }
  }

  const message = synced.join(" | ") || "Sincronizado";
  await storage.updateExchangeCredentials(userId, exchangeId, {
    isConnected: true,
    lastSyncAt: new Date().toISOString(),
    lastSyncStatus: "success",
    lastSyncMessage: message,
  });

  return { success: true, message };
}
