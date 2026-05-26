import type { Trade } from "@shared/schema";
import type { PlanEntitlements } from "@trackion/billing";

export interface AggRow {
  key: string;
  wins: number;
  losses: number;
  pnl: number;
  count: number;
}

export interface WeeklyInsightBullet {
  type: string;
  text: string;
  pair?: string;
}

export interface WeeklyInsights {
  week: string;
  headline: string;
  bullets: WeeklyInsightBullet[];
}

const HOUR_BUCKETS = ["00-06", "06-12", "12-18", "18-24"] as const;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function emptyAgg(): AggRow {
  return { key: "", wins: 0, losses: 0, pnl: 0, count: 0 };
}

function addToAgg(store: Record<string, AggRow>, key: string, t: Trade) {
  if (!store[key]) store[key] = { ...emptyAgg(), key };
  const row = store[key];
  row.count++;
  row.pnl += t.pnl ?? 0;
  if (t.status === "WIN") row.wins++;
  if (t.status === "LOSS") row.losses++;
}

export function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
  );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function getHourBucket(trade: Trade): string {
  const iso = trade.closedAt ?? `${trade.date}T12:00:00.000Z`;
  const h = new Date(iso).getUTCHours();
  if (h < 6) return "00-06";
  if (h < 12) return "06-12";
  if (h < 18) return "12-18";
  return "18-24";
}

export function resolveSourceExchange(trade: Trade): string {
  if (trade.sourceExchange) return trade.sourceExchange;
  const n = trade.notes ?? "";
  if (n.startsWith("mexc_")) return "mexc";
  if (n.startsWith("binance_")) return "binance";
  if (n.startsWith("bitget_")) return "bitget";
  return "manual";
}

export function aggregateByPair(trades: Trade[]): AggRow[] {
  const store: Record<string, AggRow> = {};
  for (const t of trades) addToAgg(store, t.pair, t);
  return Object.values(store).sort((a, b) => b.count - a.count);
}

export function aggregateBySetup(trades: Trade[]): AggRow[] {
  const store: Record<string, AggRow> = {};
  for (const t of trades) {
    const key = (t.setup?.trim() || "(sem setup)");
    addToAgg(store, key, t);
  }
  return Object.values(store).sort((a, b) => b.count - a.count);
}

export function aggregateByHour(trades: Trade[]): AggRow[] {
  const store: Record<string, AggRow> = {};
  for (const t of trades) addToAgg(store, getHourBucket(t), t);
  return HOUR_BUCKETS.map((b) => store[b] ?? { key: b, wins: 0, losses: 0, pnl: 0, count: 0 });
}

export function aggregateByExchange(trades: Trade[]): AggRow[] {
  const store: Record<string, AggRow> = {};
  for (const t of trades) addToAgg(store, resolveSourceExchange(t), t);
  return Object.values(store).sort((a, b) => b.count - a.count);
}

export function computeSharpeAndDrawdown(trades: Trade[]): {
  sharpeRatio: number | null;
  maxDrawdownPct: number;
} {
  const closed = trades
    .filter((t) => t.status !== "OPEN")
    .sort((a, b) => a.date.localeCompare(b.date));

  if (closed.length < 2) {
    return { sharpeRatio: null, maxDrawdownPct: 0 };
  }

  const dailyPnl: Record<string, number> = {};
  for (const t of closed) {
    dailyPnl[t.date] = (dailyPnl[t.date] ?? 0) + (t.pnl ?? 0);
  }
  const days = Object.keys(dailyPnl).sort();
  const returns = days.map((d) => dailyPnl[d]);

  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance =
    returns.reduce((s, r) => s + (r - mean) ** 2, 0) / Math.max(returns.length - 1, 1);
  const std = Math.sqrt(variance);
  const sharpeRatio = std > 0 ? round2((mean / std) * Math.sqrt(365)) : null;

  let peak = 0;
  let equity = 0;
  let maxDd = 0;
  for (const r of returns) {
    equity += r;
    if (equity > peak) peak = equity;
    if (peak > 0) {
      const dd = ((peak - equity) / peak) * 100;
      if (dd > maxDd) maxDd = dd;
    }
  }

  return { sharpeRatio, maxDrawdownPct: round2(maxDd) };
}

export function buildWeeklyInsights(trades: Trade[], weekKey: string): WeeklyInsights {
  const weekTrades = trades.filter(
    (t) => t.status !== "OPEN" && getWeekKey(t.date) === weekKey,
  );

  if (weekTrades.length === 0) {
    return {
      week: weekKey,
      headline: `Semana ${weekKey}: nenhum trade fechado`,
      bullets: [],
    };
  }

  const bullets: WeeklyInsightBullet[] = [];
  const totalPnl = weekTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const wins = weekTrades.filter((t) => t.status === "WIN").length;
  const losses = weekTrades.filter((t) => t.status === "LOSS").length;

  const byPair = aggregateByPair(weekTrades);
  const lossPairs = [...byPair]
    .filter((p) => p.losses > 0)
    .sort((a, b) => b.losses - a.losses)
    .slice(0, 2);
  for (const p of lossPairs) {
    bullets.push({
      type: "loss_cluster",
      pair: p.key,
      text: `Você perdeu ${p.losses} trade${p.losses > 1 ? "s" : ""} em ${p.key} (${round2(p.pnl)} USDT).`,
    });
  }

  const winPairs = [...byPair]
    .filter((p) => p.wins > 0)
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 2);
  for (const p of winPairs) {
    bullets.push({
      type: "win_cluster",
      pair: p.key,
      text: `Você ganhou ${p.wins} trade${p.wins > 1 ? "s" : ""} em ${p.key} (+${round2(p.pnl)} USDT).`,
    });
  }

  const byHour = aggregateByHour(weekTrades).filter((h) => h.count >= 3);
  if (byHour.length) {
    const worst = [...byHour].sort((a, b) => a.pnl - b.pnl)[0];
    if (worst.pnl < 0) {
      bullets.push({
        type: "hour_weak",
        text: `Faixa ${worst.key} UTC concentrou ${worst.losses} loss(es) e PnL de ${round2(worst.pnl)} USDT.`,
      });
    }
  }

  const sorted = [...weekTrades].sort((a, b) => {
    const ta = a.closedAt ?? a.date;
    const tb = b.closedAt ?? b.date;
    return ta.localeCompare(tb);
  });
  let streak = 0;
  let maxStreak = 0;
  for (const t of sorted) {
    if (t.status === "LOSS") {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  }
  if (maxStreak >= 3) {
    bullets.push({
      type: "loss_streak",
      text: `Sequência de ${maxStreak} losses consecutivos na semana — revise o setup nesse período.`,
    });
  }

  const longs = weekTrades.filter((t) => t.direction === "LONG");
  const shorts = weekTrades.filter((t) => t.direction === "SHORT");
  const longPnl = longs.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const shortPnl = shorts.reduce((s, t) => s + (t.pnl ?? 0), 0);
  if (longs.length >= 2 && shorts.length >= 2) {
    const better = longPnl >= shortPnl ? "LONG" : "SHORT";
    const betterPnl = better === "LONG" ? longPnl : shortPnl;
    const worse = better === "LONG" ? "SHORT" : "LONG";
    const worsePnl = better === "LONG" ? shortPnl : longPnl;
    bullets.push({
      type: "direction_compare",
      text: `${better}s renderam melhor (+${round2(betterPnl)} USDT) que ${worse}s (${round2(worsePnl)} USDT).`,
    });
  }

  const globalLossRate = losses / weekTrades.length;
  const volatile = [...byPair]
    .filter((p) => p.count >= 2)
    .map((p) => ({
      ...p,
      lossRate: p.losses / p.count,
      avgAbsPnl: Math.abs(p.pnl) / p.count,
    }))
    .sort((a, b) => b.avgAbsPnl - a.avgAbsPnl)[0];

  if (volatile && volatile.lossRate > globalLossRate && volatile.losses >= 2) {
    bullets.push({
      type: "volatility_proxy",
      pair: volatile.key,
      text: `${volatile.key} concentrou perdas (${volatile.losses} losses); pode indicar condições mais difíceis para seu setup.`,
    });
  }

  const headline =
    totalPnl >= 0
      ? `Semana ${weekKey}: +${round2(totalPnl)} USDT · ${wins}W / ${losses}L`
      : `Semana ${weekKey}: ${round2(totalPnl)} USDT · ${wins}W / ${losses}L`;

  return { week: weekKey, headline, bullets };
}

export function buildAdvancedReport(
  trades: Trade[],
  entitlements: PlanEntitlements | null,
) {
  const closed = trades.filter((t) => t.status !== "OPEN");
  const { sharpeRatio, maxDrawdownPct } = computeSharpeAndDrawdown(closed);

  const base = {
    byPair: aggregateByPair(closed),
    bySetup: aggregateBySetup(closed),
    byHour: aggregateByHour(closed),
    sharpeRatio: entitlements?.moduleMultiAccountReports ? sharpeRatio : null,
    maxDrawdownPct: entitlements?.moduleMultiAccountReports ? maxDrawdownPct : null,
    byExchange: entitlements?.moduleMultiAccountReports
      ? aggregateByExchange(closed)
      : null,
  };

  return base;
}

export function buildExportCsv(trades: Trade[], summary: {
  totalPnl: number;
  winRate: number;
  sharpeRatio: number | null;
  maxDrawdownPct: number;
}): string {
  const lines: string[] = [];
  lines.push("Trackion — Relatório para investidores");
  lines.push(`PnL total,${summary.totalPnl}`);
  lines.push(`Win rate,${summary.winRate}%`);
  lines.push(`Sharpe (anualizado),${summary.sharpeRatio ?? "N/A"}`);
  lines.push(`Max drawdown %,${summary.maxDrawdownPct}`);
  lines.push("");
  lines.push("date,pair,direction,status,pnl,setup,exchange");
  const closed = trades
    .filter((t) => t.status !== "OPEN")
    .sort((a, b) => a.date.localeCompare(b.date));
  for (const t of closed) {
    const row = [
      t.date,
      t.pair,
      t.direction,
      t.status,
      String(t.pnl ?? 0),
      (t.setup ?? "").replace(/,/g, " "),
      resolveSourceExchange(t),
    ];
    lines.push(row.join(","));
  }
  return lines.join("\n");
}
