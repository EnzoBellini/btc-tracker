import type { Express, Request } from "express";
import { storage } from "./storage";
import {
  assertAdvancedReports,
  assertInvestorExport,
  filterTradesByHistory,
} from "./billing/entitlements";
import { getResolvedSubscription } from "./billing/subscriptionService";
import {
  buildAdvancedReport,
  buildExportCsv,
  buildWeeklyInsights,
  computeSharpeAndDrawdown,
  getWeekKey,
} from "./services/reportAnalytics";

function uid(req: Request): number {
  return req.session.userId as number;
}

export function registerReportRoutes(app: Express): void {
  app.get("/api/reports/advanced", async (req, res) => {
    const userId = uid(req);
    if (!(await assertAdvancedReports(userId, res))) return;

    const resolved = await getResolvedSubscription(userId);
    let trades = await storage.getTrades(userId);
    trades = filterTradesByHistory(trades, resolved.entitlements);

    res.json(buildAdvancedReport(trades, resolved.entitlements));
  });

  app.get("/api/reports/weekly-insights", async (req, res) => {
    const userId = uid(req);
    if (!(await assertAdvancedReports(userId, res))) return;

    const resolved = await getResolvedSubscription(userId);
    let trades = await storage.getTrades(userId);
    trades = filterTradesByHistory(trades, resolved.entitlements);

    const weekParam = typeof req.query.week === "string" ? req.query.week : undefined;
    const weekKey = weekParam ?? getWeekKey(new Date().toISOString().slice(0, 10));

    const closed = trades.filter((t) => t.status !== "OPEN");
    const availableWeeks = Array.from(
      new Set(closed.map((t) => getWeekKey(t.date))),
    ).sort((a, b) => b.localeCompare(a));

    res.json({
      ...buildWeeklyInsights(trades, weekKey),
      availableWeeks: availableWeeks.slice(0, 12),
    });
  });

  app.get("/api/reports/export", async (req, res) => {
    const userId = uid(req);
    if (!(await assertInvestorExport(userId, res))) return;

    const resolved = await getResolvedSubscription(userId);
    let trades = await storage.getTrades(userId);
    trades = filterTradesByHistory(trades, resolved.entitlements);

    const closed = trades.filter((t) => t.status !== "OPEN");
    const wins = closed.filter((t) => t.status === "WIN").length;
    const winRate = closed.length ? (wins / closed.length) * 100 : 0;
    const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const { sharpeRatio, maxDrawdownPct } = computeSharpeAndDrawdown(closed);

    const csv = buildExportCsv(trades, {
      totalPnl: Math.round(totalPnl * 100) / 100,
      winRate: Math.round(winRate * 10) / 10,
      sharpeRatio,
      maxDrawdownPct,
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="trackion-report-${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    res.send(csv);
  });
}
