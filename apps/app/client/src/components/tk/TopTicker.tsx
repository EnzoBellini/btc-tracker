import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { useTrades } from "@/hooks/useTrades";
import { useMarketTicker } from "@/hooks/useMarketTicker";
import { fmtUsdt, fmtPct } from "@/lib/format";

type Item = { symbol: string; value: string; delta?: string; up?: boolean | null };

function buildItems(stats: any, trades: any[]): Item[] {
  const totalPnl = stats?.totalPnl ?? 0;
  const winRate = stats?.winRate ?? 0;
  const btc = stats?.totalBtcBought ?? 0;
  const closed = stats?.closedTrades ?? 0;
  const total = stats?.totalTrades ?? 0;
  const open = stats?.openTrades ?? 0;
  const today = new Date().toISOString().slice(0, 10);
  const todayPnl = trades
    ?.filter((t) => t.date === today && t.pnl != null)
    .reduce((s: number, t: any) => s + (t.pnl ?? 0), 0) ?? 0;

  return [
    {
      symbol: "PNL TOTAL",
      value: `${totalPnl >= 0 ? "+" : ""}${fmtUsdt(totalPnl)} USDT`,
      delta: totalPnl >= 0 ? "▲" : "▼",
      up: totalPnl >= 0,
    },
    {
      symbol: "PNL HOJE",
      value: `${todayPnl >= 0 ? "+" : ""}${fmtUsdt(todayPnl)} USDT`,
      delta: todayPnl >= 0 ? "▲" : "▼",
      up: todayPnl >= 0,
    },
    { symbol: "WIN RATE", value: fmtPct(winRate), delta: winRate >= 50 ? "▲" : "▼", up: winRate >= 50 },
    { symbol: "TRADES FECHADOS", value: String(closed), delta: `${total} total`, up: null },
    { symbol: "ABERTOS", value: String(open), delta: open > 0 ? "live" : "—", up: null },
    { symbol: "BTC ACUMULADO", value: `${btc.toFixed(6)} BTC`, delta: "spot", up: null },
    { symbol: "EXCHANGE", value: "MULTI", delta: "mexc · binance · bitget", up: null },
    { symbol: "STATUS", value: "OPERATIONAL", delta: "all systems", up: true },
  ];
}

function marketToItems(market: { symbol: string; price: string; delta: string; up: boolean | null }[]): Item[] {
  return market.map((m) => ({
    symbol: m.symbol,
    value: m.price,
    delta: m.delta,
    up: m.up,
  }));
}

export default function TopTicker() {
  const { data: stats } = useStats();
  const { data: trades = [] } = useTrades();
  const { data: market = [] } = useMarketTicker();
  const userItems = buildItems(stats, trades);
  const items = [...marketToItems(market), ...userItems];

  return (
    <div className="relative z-30 overflow-hidden border-b border-border bg-card/80 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-card to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-card to-transparent" />
      <div className="flex w-max tk-marquee">
        {[...items, ...items].map((item, i) => (
          <div
            key={`${item.symbol}-${i}`}
            className="flex shrink-0 items-center gap-2.5 border-r border-border px-5 py-1.5 font-mono-tk text-[10px]"
          >
            <span className="tracking-[0.18em] text-muted-foreground">{item.symbol}</span>
            <span className="num font-semibold text-foreground">{item.value}</span>
            {item.delta && (
              <span
                className={`num inline-flex items-center gap-1 font-semibold ${
                  item.up === true ? "text-profit" : item.up === false ? "text-loss" : "text-muted-foreground"
                }`}
              >
                {item.up === true && <ArrowUpRight className="h-3 w-3" aria-hidden />}
                {item.up === false && <ArrowDownRight className="h-3 w-3" aria-hidden />}
                {item.delta}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
