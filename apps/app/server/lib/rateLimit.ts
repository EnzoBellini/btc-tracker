import type { Request, Response, NextFunction } from "express";

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export function createRateLimiter(opts: {
  windowMs: number;
  max: number;
  keyPrefix: string;
  message?: string;
}) {
  const { windowMs, max, keyPrefix, message = "Muitas tentativas. Aguarde e tente novamente." } = opts;

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    let entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count += 1;
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ error: message });
    }

    next();
  };
}

/** Limpa entradas expiradas a cada 10 min (evita vazamento de memória). */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of Array.from(store.entries())) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 10 * 60 * 1000).unref();
