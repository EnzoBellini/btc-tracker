/**
 * Centralized formatting utilities.
 * Never scatter .toFixed() across the codebase — always go through here.
 */

export function fmtUsdt(n: number, decimals = 2): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return n < 0 ? `-${formatted}` : formatted;
}

export function fmtBtc(n: number): string {
  return n.toFixed(8);
}

export function fmtPct(n: number, decimals = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}%`;
}

export function fmtDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function fmtDatetime(isoStr: string | null | undefined): string {
  if (!isoStr) return "—";
  try {
    return new Date(isoStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
}

export function fmtPnl(n: number | null): string {
  if (n == null) return "—";
  return `${n > 0 ? "+" : ""}${fmtUsdt(n)}`;
}

export function sign(n: number): "positive" | "negative" | "zero" {
  if (n > 0) return "positive";
  if (n < 0) return "negative";
  return "zero";
}

export function pnlColor(n: number | null): string {
  if (n == null) return "text-muted-foreground";
  if (n > 0) return "text-profit";
  if (n < 0) return "text-loss";
  return "text-muted-foreground";
}

export function daysUntil(dateStr: string): number {
  const end = new Date(dateStr + "T23:59:59");
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
