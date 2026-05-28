import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { setupSession, registerAuthRoutes } from "./auth";
import { registerOnboardingRoutes } from "./onboarding";
import { registerBillingRoutes } from "./billing/routes";
import { registerAdminRoutes } from "./admin/routes";
import { startSubscriptionCron } from "./billing/cron";
import { db } from "./db";
import { validateSecurityConfig, logEmailConfigStatus, redactForLog } from "./lib/security";

validateSecurityConfig();

const app = express();
const httpServer = createServer(app);
const isProd = process.env.NODE_ENV === "production";

app.disable("x-powered-by");
const exchangeOrigins = [
  "'self'",
  "https://contract.mexc.com",
  "https://api.mexc.com",
  "https://fapi.binance.com",
  "https://api.binance.com",
  "https://api.bitget.com",
  "https://api.ipify.org",
];

app.use(
  isProd
    ? helmet({
        hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: exchangeOrigins,
            frameAncestors: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
          },
        },
      })
    : helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        hsts: false,
      }),
);

// Necessário para cookies de sessão funcionarem atrás do proxy do Railway
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

const corsOrigins = [
  ...(process.env.LANDING_ORIGIN ?? "http://localhost:3000").split(","),
  ...(process.env.ADMIN_ORIGIN ?? "http://localhost:3001").split(","),
]
  .map((o) => o.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && corsOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Key");
  }
  if (
    req.method === "OPTIONS" &&
    (req.path.startsWith("/api/trial-signup") ||
      req.path.startsWith("/api/market") ||
      req.path.startsWith("/api/billing/webhook") ||
      req.path.startsWith("/api/admin"))
  ) {
    return res.sendStatus(204);
  }
  next();
});

// ── Auth session (must come BEFORE routes) ────────────────────────────────────
setupSession(app);
registerAuthRoutes(app);
registerOnboardingRoutes(app);
registerBillingRoutes(app);
registerAdminRoutes(app);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(redactForLog(path, capturedJsonResponse))}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    const message =
      isProd && status >= 500 ? "Erro interno" : (err.message || "Internal Server Error");

    return res.status(status).json({ error: message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    if (!db) log("Modo local: sem DATABASE_URL, usando armazenamento em memória", "storage");
    logEmailConfigStatus(log);
    startSubscriptionCron(log);
  });
})();
