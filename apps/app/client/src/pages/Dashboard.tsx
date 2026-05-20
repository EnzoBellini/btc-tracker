import { useMemo } from "react";
import {
  TrendingUp, TrendingDown, Bitcoin, DollarSign, Target, AlertTriangle, CheckCircle2,
  Activity, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { useStats } from "@/hooks/useStats";
import { useTrades } from "@/hooks/useTrades";
import { fmtUsdt, fmtPct, pnlColor } from "@/lib/format";
import PlanTracker from "@/components/PlanTracker";
import { useRoadmap } from "@/hooks/useOnboarding";

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, color = "text-foreground", trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold tabular ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1">
            {trend === "up"   && <ArrowUpRight   className="w-3.5 h-3.5 text-profit" />}
            {trend === "down" && <ArrowDownRight className="w-3.5 h-3.5 text-loss"   />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="tabular">
          {p.name}: {typeof p.value === "number" ? fmtUsdt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: trades = [], isLoading: tradesLoading } = useTrades();

  const isLoading = statsLoading || tradesLoading;

  // Memoised chart data (ordenados por data)
  const { pnlChartData, recentTradesData } = useMemo(() => {
    const closed = [...trades]
      .filter(t => t.status !== "OPEN")
      .sort((a, b) => a.date.localeCompare(b.date)); // cronológico para gráfico
    const pnlChart = closed.reduce<{ trade: number; cumPnl: number; pnl: number; date: string }[]>((acc, t, i) => {
      const prev = acc[i - 1]?.cumPnl ?? 0;
      acc.push({ trade: i + 1, cumPnl: prev + (t.pnl ?? 0), pnl: t.pnl ?? 0, date: t.date });
      return acc;
    }, []);
    return { pnlChartData: pnlChart, recentTradesData: pnlChart.slice(-10) };
  }, [trades]);

  // Derived status
  const canTrade = useMemo(() => {
    if (!stats) return true;
    const fc = stats.settings?.futuresCapital ?? 100;
    const drawdown = ((fc - (fc + stats.totalPnl)) / fc) * 100;
    return drawdown < (stats.settings?.stopTradingDrawdown ?? 20);
  }, [stats]);

  const shouldTransfer = stats ? stats.totalPnl >= (stats.settings?.profitTransferThreshold ?? 10) : false;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visão geral da estratégia BTC</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canTrade ? (
            <Badge className="bg-profit/15 text-profit border-0 gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pode operar
            </Badge>
          ) : (
            <Badge className="bg-loss/15 text-loss border-0 gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Parar operações
            </Badge>
          )}
          {shouldTransfer && (
            <Badge className="bg-primary/15 text-primary border-0 gap-1.5">
              <Bitcoin className="w-3.5 h-3.5" /> Transferir lucro p/ BTC
            </Badge>
          )}
        </div>
      </div>

      {/* KPI row */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label="PnL Total"
            value={`${(stats?.totalPnl ?? 0) >= 0 ? "+" : ""}${fmtUsdt(stats?.totalPnl ?? 0)} USDT`}
            sub={`${stats?.closedTrades ?? 0} trades fechados`}
            icon={DollarSign}
            color={pnlColor(stats?.totalPnl ?? 0)}
            trend={(stats?.totalPnl ?? 0) >= 0 ? "up" : "down"}
          />
          <KpiCard
            label="Win Rate"
            value={fmtPct(stats?.winRate ?? 0)}
            sub={`${stats?.wins ?? 0}W / ${stats?.losses ?? 0}L`}
            icon={Target}
            color={(stats?.winRate ?? 0) >= 50 ? "text-profit" : "text-loss"}
          />
          <KpiCard
            label="BTC Acumulado"
            value={`${(stats?.totalBtcBought ?? 0).toFixed(6)} BTC`}
            sub={`${fmtUsdt(stats?.totalUsdtTransferred ?? 0)} USDT transferidos`}
            icon={Bitcoin}
            color="text-primary"
          />
          <KpiCard
            label="Trades Abertos"
            value={String(stats?.openTrades ?? 0)}
            sub={`${stats?.totalTrades ?? 0} total`}
            icon={Activity}
          />
        </div>
      )}

      {/* Metas e progresso */}
      <PlanTracker />

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cumulative PnL */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">PnL Acumulado</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {pnlChartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Nenhum trade fechado ainda
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={pnlChartData}>
                  <defs>
                    <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(27,100%,55%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(27,100%,55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: "hsl(220,8%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Data", position: "insideBottom", offset: -2, fill: "hsl(220,8%,50%)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(220,8%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="hsl(220,12%,25%)" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="cumPnl" name="PnL Acum." stroke="hsl(27,100%,55%)" fill="url(#pnlGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent trades bar */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Últimos 10 Trades</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {recentTradesData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Nenhum trade fechado ainda
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={recentTradesData} barSize={14}>
                  <XAxis dataKey="date" tick={{ fill: "hsl(220,8%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Data", position: "insideBottom", offset: -2, fill: "hsl(220,8%,50%)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(220,8%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="hsl(220,12%,25%)" />
                  <Bar dataKey="pnl" name="PnL (USDT)" radius={[3, 3, 0, 0]}>
                    {recentTradesData.map((entry, i) => (
                      <Cell key={i} fill={entry.pnl >= 0 ? "hsl(142,71%,45%)" : "hsl(0,72%,51%)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategy rules quick ref */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 px-5 pt-5">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Regras da Estratégia</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[
                { label: "Capital Total",      value: `${fmtUsdt(stats?.settings?.totalCapital ?? 200)} USDT` },
                { label: "Capital Futuros",    value: `${fmtUsdt(stats?.settings?.futuresCapital ?? 100)} USDT` },
                { label: "Risco / Trade",      value: `${fmtUsdt(stats?.settings?.riskPerTrade ?? 2.5)} USDT` },
                { label: "Alavancagem",        value: `${stats?.settings?.defaultLeverage ?? 3}x` },
                { label: "Transferir quando",  value: `+${fmtUsdt(stats?.settings?.profitTransferThreshold ?? 10)} USDT` },
                { label: "Parar c/ drawdown",  value: `-${stats?.settings?.stopTradingDrawdown ?? 20}%` },
                { label: "Capital Spot BTC",   value: `${fmtUsdt(stats?.settings?.spotCapital ?? 100)} USDT` },
                { label: "Total trades",       value: String(stats?.totalTrades ?? 0) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted rounded-md p-3">
                  <p className="text-muted-foreground mb-1">{label}</p>
                  <p className="font-semibold text-foreground tabular">{value}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RoadmapSection />
    </div>
  );
}

type RoadmapPhase = {
  id: number;
  title: string;
  description: string;
  checklist: { task: string; done: boolean }[];
};

function RoadmapSection() {
  const { data: items, isLoading } = useRoadmap();
  const phases = (items ?? []) as RoadmapPhase[];
  if (isLoading || phases.length === 0) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 px-5 pt-5">
        <CardTitle className="text-sm font-semibold">Seu plano de ação</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        {phases.map((phase) => (
          <div key={phase.id} className="border border-border rounded-lg p-4">
            <p className="text-sm font-medium">{phase.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
            <ul className="mt-3 space-y-1.5">
              {phase.checklist.map((c: { task: string; done: boolean }, i: number) => (
                <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${c.done ? "text-profit" : "text-muted-foreground"}`} />
                  {c.task}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
