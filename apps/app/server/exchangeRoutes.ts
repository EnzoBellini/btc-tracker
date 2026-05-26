import type { Express, Request } from "express";
import { insertExchangeCredentialsSchema, type ExchangeId } from "@shared/schema";
import { storage } from "./storage";
import { getAdapter, isExchangeId, MASKED_SECRET } from "./exchanges";
import { syncTradesFromExchanges, syncFullExchange } from "./exchanges/syncTrades";
import {
  assertCanConnectExchange,
  assertCanConnectExchangeIfNew,
  assertSyncAllowed,
} from "./billing/entitlements";

function uid(req: Request): number {
  return req.session.userId as number;
}

function maskCredentials(c: {
  apiKey: string;
  secretKey: string;
  passphrase?: string | null;
  exchange: string;
}) {
  return {
    ...c,
    secretKey: c.secretKey ? MASKED_SECRET : "",
    passphrase: c.passphrase ? MASKED_SECRET : "",
    hasSecret: !!c.secretKey,
    hasPassphrase: !!c.passphrase,
  };
}

async function fetchServerIp(res: import("express").Response) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const r = await fetch("https://api.ipify.org?format=json", { signal: ctrl.signal });
    clearTimeout(to);
    const data = (await r.json()) as { ip?: string };
    res.json({ ip: data.ip });
  } catch (e: unknown) {
    clearTimeout(to);
    const err = e as { name?: string };
    res.json({
      ip: null,
      error:
        err?.name === "AbortError"
          ? "Timeout ao obter IP do servidor"
          : "Não foi possível obter o IP (ipify.org).",
    });
  }
}

export function registerExchangeRoutes(app: Express): void {
  app.get("/api/exchanges", async (req, res) => {
    const creds = await storage.listExchangeCredentials(uid(req));
    res.json(
      creds.map((c) => ({
        exchange: c.exchange,
        isConnected: c.isConnected,
        hasSecret: !!c.secretKey,
        hasPassphrase: !!c.passphrase,
        lastSyncAt: c.lastSyncAt,
        lastSyncStatus: c.lastSyncStatus,
        lastSyncMessage: c.lastSyncMessage,
      })),
    );
  });

  app.get("/api/exchanges/server-ip", async (_req, res) => fetchServerIp(res));

  app.get("/api/exchanges/:exchange/credentials", async (req, res) => {
    const exchange = req.params.exchange;
    if (!isExchangeId(exchange)) return res.status(400).json({ error: "Exchange inválida" });
    const creds = await storage.getExchangeCredentials(uid(req), exchange);
    res.json(maskCredentials(creds));
  });

  app.patch("/api/exchanges/:exchange/credentials", async (req, res) => {
    const userId = uid(req);
    const exchange = req.params.exchange;
    if (!isExchangeId(exchange)) return res.status(400).json({ error: "Exchange inválida" });
    const result = insertExchangeCredentialsSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    const payload = { ...result.data };
    if (payload.secretKey === MASKED_SECRET) delete payload.secretKey;
    if (payload.passphrase === MASKED_SECRET) delete payload.passphrase;
    if (payload.isConnected === true) {
      if (!(await assertCanConnectExchangeIfNew(userId, exchange, true, res))) return;
    }
    const creds = await storage.updateExchangeCredentials(userId, exchange, payload);
    res.json(maskCredentials(creds));
  });

  app.post("/api/exchanges/:exchange/test", async (req, res) => {
    const userId = uid(req);
    if (!(await assertCanConnectExchange(userId, res))) return;
    const exchange = req.params.exchange;
    if (!isExchangeId(exchange)) return res.status(400).json({ error: "Exchange inválida" });
    const { apiKey, secretKey, passphrase } = req.body as {
      apiKey?: string;
      secretKey?: string;
      passphrase?: string;
    };
    if (!apiKey || !secretKey) return res.status(400).json({ error: "Campos obrigatórios" });
    if (exchange === "bitget" && !passphrase) {
      return res.status(400).json({ error: "Passphrase obrigatória para Bitget" });
    }
    try {
      await getAdapter(exchange).testConnection({ apiKey, secretKey, passphrase });
      await storage.updateExchangeCredentials(uid(req), exchange, {
        apiKey,
        secretKey,
        passphrase: passphrase ?? "",
        isConnected: true,
        lastSyncAt: new Date().toISOString(),
        lastSyncStatus: "success",
        lastSyncMessage: "Conexão bem-sucedida",
      });
      res.json({ success: true, message: `Conexão bem-sucedida com ${exchange}` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      await storage.updateExchangeCredentials(uid(req), exchange, {
        apiKey,
        secretKey,
        passphrase: passphrase ?? "",
        isConnected: false,
        lastSyncStatus: "error",
        lastSyncMessage: msg,
      });
      res.status(400).json({ error: `Falha na conexão: ${msg}` });
    }
  });

  app.post("/api/exchanges/:exchange/sync", async (req, res) => {
    const userId = uid(req);
    if (!(await assertSyncAllowed(userId, res))) return;
    const exchange = req.params.exchange;
    if (!isExchangeId(exchange)) return res.status(400).json({ error: "Exchange inválida" });
    try {
      const result = await syncFullExchange(storage, uid(req), exchange);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      await storage.updateExchangeCredentials(uid(req), exchange, {
        isConnected: false,
        lastSyncAt: new Date().toISOString(),
        lastSyncStatus: "error",
        lastSyncMessage: msg,
      });
      res.status(500).json({ error: msg });
    }
  });

  app.post("/api/trades/sync", async (req, res) => {
    const userId = uid(req);
    if (!(await assertSyncAllowed(userId, res))) return;
    const body = req.body as { exchanges?: string[] } | undefined;
    let requested: ExchangeId[] | undefined;
    if (body?.exchanges?.length) {
      const invalid = body.exchanges.filter((e) => !isExchangeId(e));
      if (invalid.length) {
        return res.status(400).json({ error: `Exchanges inválidas: ${invalid.join(", ")}` });
      }
      requested = body.exchanges as ExchangeId[];
    }
    const result = await syncTradesFromExchanges(storage, uid(req), requested);
    const hasErrors = result.results.some((r) => r.error);
    if (hasErrors && result.totalImported === 0) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Legacy MEXC aliases
  app.get("/api/mexc/server-ip", async (_req, res) => fetchServerIp(res));

  app.get("/api/mexc/credentials", async (req, res) => {
    const creds = await storage.getExchangeCredentials(uid(req), "mexc");
    res.json(maskCredentials(creds));
  });

  app.patch("/api/mexc/credentials", async (req, res) => {
    const result = insertExchangeCredentialsSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.format() });
    const payload = { ...result.data };
    if (payload.secretKey === MASKED_SECRET) delete payload.secretKey;
    const creds = await storage.updateExchangeCredentials(uid(req), "mexc", payload);
    res.json(maskCredentials(creds));
  });

  app.post("/api/mexc/sync", async (req, res) => {
    try {
      const result = await syncFullExchange(storage, uid(req), "mexc");
      res.json(result);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post("/api/mexc/test", async (req, res) => {
    const { apiKey, secretKey } = req.body as { apiKey?: string; secretKey?: string };
    if (!apiKey || !secretKey) return res.status(400).json({ error: "Campos obrigatórios" });
    try {
      await getAdapter("mexc").testConnection({ apiKey, secretKey });
      await storage.updateExchangeCredentials(uid(req), "mexc", {
        apiKey,
        secretKey,
        isConnected: true,
        lastSyncAt: new Date().toISOString(),
        lastSyncStatus: "success",
        lastSyncMessage: "Conexão bem-sucedida",
      });
      res.json({ success: true, message: "Conexão bem-sucedida com a MEXC" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: `Falha na conexão: ${msg}` });
    }
  });

  app.post("/api/trades/sync-from-mexc", async (req, res) => {
    const result = await syncTradesFromExchanges(storage, uid(req), ["mexc"]);
    const mexcResult = result.results.find((r) => r.exchange === "mexc");
    if (mexcResult?.error) {
      const hint =
        mexcResult.error.includes("700006") || mexcResult.error.includes("IP")
          ? " IP não autorizado — adicione o IP do Railway na whitelist da API Key."
          : "";
      return res.status(400).json({ error: mexcResult.error + hint });
    }
    res.json({
      success: true,
      imported: mexcResult?.imported ?? 0,
      message: mexcResult?.message ?? `${result.totalImported} trade(s) importado(s)`,
    });
  });
}
