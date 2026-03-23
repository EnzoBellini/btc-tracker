/**
 * MEXC API Proxy para Fly.io
 * Recebe requests do Railway e repassa para a MEXC usando IP fixo de saída.
 * Aloque IPs de egress: fly ips allocate-egress --region gru
 * Adicione os IPs na whitelist da API Key na MEXC.
 */
import express from "express";

const SPOT_BASE = "https://api.mexc.com";
const CONTRACT_BASE = "https://contract.mexc.com";

const app = express();
app.use(express.json());

// Headers que devem ser repassados para a MEXC
const MEXC_HEADERS = [
  "apikey", "x-mexc-apikey", "request-time", "signature",
  "content-type", "accept",
];

function proxyFetch(req, res, targetUrl) {
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    const lower = k.toLowerCase();
    if (MEXC_HEADERS.includes(lower) || lower.startsWith("x-") || lower === "content-type") {
      headers[k] = v;
    }
  }
  fetch(targetUrl, {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" && req.body ? JSON.stringify(req.body) : undefined,
  })
    .then(async (mexcRes) => {
      res.status(mexcRes.status);
      mexcRes.headers.forEach((v, k) => {
        if (!["content-encoding", "transfer-encoding"].includes(k.toLowerCase())) {
          res.setHeader(k, v);
        }
      });
      res.send(await mexcRes.text());
    })
    .catch((err) => {
      console.error("[mexc-proxy]", err.message);
      res.status(502).json({ message: `Proxy error: ${err.message}` });
    });
}

// Spot: /mexc/spot/* → https://api.mexc.com/*
app.use("/mexc/spot", (req, res) => {
  const path = req.path || "/";
  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  proxyFetch(req, res, SPOT_BASE + path + qs);
});

// Contract (Futures): /mexc/contract/* → https://contract.mexc.com/*
app.use("/mexc/contract", (req, res) => {
  const path = req.path || "/";
  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  proxyFetch(req, res, CONTRACT_BASE + path + qs);
});

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// IP de saída do proxy (para whitelist na MEXC)
app.get("/ip", async (_req, res) => {
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    const data = await r.json();
    res.json({ ip: data.ip });
  } catch (err) {
    res.status(500).json({ ip: null, error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`MEXC proxy listening on ${PORT}`));
