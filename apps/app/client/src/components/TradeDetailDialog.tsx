import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Trade } from "@shared/schema";
import { useTradeChart } from "@/hooks/useTrades";
import TradeChart from "@/components/TradeChart";
import { StatPill } from "@/components/tk";
import { fmtUsdt, pnlColor } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { useAppLocale } from "@/lib/locale-context";

type Props = {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function TradeDetailDialog({ trade, open, onOpenChange }: Props) {
  const { t } = useAppLocale();
  const tradeId = trade?.id;
  const { data: chart, isLoading, isError, error } = useTradeChart(open ? tradeId : undefined);

  if (!trade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {t.trades.detailTitle} · {trade.pair}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono-tk text-[11px] font-bold uppercase tracking-[0.22em]",
                trade.direction === "LONG" ? "text-profit" : "text-loss",
              )}
            >
              {trade.direction === "LONG" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trade.direction}
            </span>
            <StatPill tone={trade.status === "WIN" ? "profit" : trade.status === "LOSS" ? "loss" : trade.status === "OPEN" ? "info" : "neutral"}>
              {trade.status}
            </StatPill>
            {trade.sourceExchange && trade.sourceExchange !== "manual" && (
              <StatPill tone="info">{trade.sourceExchange}</StatPill>
            )}
            <span className="font-mono-tk text-[10px] text-muted-foreground">{trade.date}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: t.trades.entry, value: trade.entryPrice > 0 ? fmtUsdt(trade.entryPrice) : "—" },
              { label: "Stop", value: trade.stopPrice > 0 ? fmtUsdt(trade.stopPrice) : "—" },
              { label: "Alvo", value: trade.targetPrice > 0 ? fmtUsdt(trade.targetPrice) : "—" },
              { label: t.trades.exit, value: trade.exitPrice ? fmtUsdt(trade.exitPrice) : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="border border-border bg-card/50 px-3 py-2">
                <p className="font-mono-tk text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                <p className="num mt-1 font-mono-tk text-sm">{value}</p>
              </div>
            ))}
          </div>

          {trade.pnl != null && (
            <p className={cn("num font-mono-tk text-lg font-bold", pnlColor(trade.pnl))}>
              PnL: {trade.pnl > 0 ? "+" : ""}{fmtUsdt(trade.pnl)}
            </p>
          )}

          <div className="border-t border-border pt-4">
            <p className="mb-3 font-mono-tk text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {t.trades.chartTitle}
            </p>

            {isLoading && (
              <div className="flex h-[280px] items-center justify-center border border-border bg-black/20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {isError && (
              <div className="border border-loss/30 bg-loss/5 px-4 py-3">
                <p className="font-mono-tk text-xs text-loss">
                  {(error as Error)?.message ?? t.trades.chartError}
                </p>
              </div>
            )}

            {chart && !isLoading && <TradeChart data={chart} />}
          </div>

          {(trade.setup || trade.notes) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {trade.setup && (
                <div>
                  <p className="font-mono-tk text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{t.trades.setup}</p>
                  <p className="mt-1 text-sm">{trade.setup}</p>
                </div>
              )}
              {trade.notes && (
                <div>
                  <p className="font-mono-tk text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{t.trades.notes}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{trade.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
