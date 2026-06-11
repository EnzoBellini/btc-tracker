import type { RequestHandler } from "express";

const BLOCKED_EXACT = new Set([
  "/.env",
  "/.env.local",
  "/.env.production",
  "/.env.development",
  "/config.json",
  "/js/config.js",
  "/.aws/credentials",
  "/backend/.env",
  "/api/.env",
]);

const BLOCKED_PREFIXES = [
  "/.git",
  "/.aws/",
  "/wp-admin",
  "/wp-content/",
  "/wp-includes/",
  "/phpmyadmin",
];

export function isProbePath(rawPath: string): boolean {
  const path = rawPath.split("?")[0].split("#")[0].toLowerCase();

  if (BLOCKED_EXACT.has(path)) return true;
  if (path.startsWith("/.env.")) return true;
  if (path.includes("/.env")) return true;

  return BLOCKED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export const blockProbePaths: RequestHandler = (req, res, next) => {
  if (isProbePath(req.path)) {
    return res.sendStatus(404);
  }
  next();
};
