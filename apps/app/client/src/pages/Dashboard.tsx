import { useMemo } from "react";
import {
  Bitcoin, DollarSign, Target, AlertTriangle, CheckCircle2,
  Activity, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { useStats } from "@/hooks/useStats";
import { useTrades } from "@/hooks/useTrades";
import { fmtUsdt, fmtPct, pnlColor } from "@/lib/format";
import PlanTracker from "@/components/PlanTracker";
import { useRoadmap } from "@/hooks/useOnboarding";
import {
  PageHeader, KpiTerminal, TerminalFrame, StatPill, KeyValueRow, Eyebrow,
} from "@/components/tk";

// ── Custom tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border bg-card px-3 py-2 text-xs shadow-2xl">
      <p className="font-mono-tk text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="num font-mono-tk mt-1">
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

  const { pnlChartData, recentTradesData } = useMemo(() => {
    const closed = [...trades]
      .filter(t => t.status !== "OPEN")
      .sort((a, b) => a.date.localeCompare(b.date));
    const pnlChart = closed.reduce<{ trade: number; cumPnl: number; pnl: number; date: string }[]>((acc, t, i) => {
      const prev = acc[i - 1]?.cumPnl ?? 0;
      acc.push({ trade: i + 1, cumPnl: prev + (t.pnl ?? 0), pnl: t.pnl ?? 0, date: t.date });
      return acc;
    }, []);
    return { pnlChartData: pnlChart, recentTradesData: pnlChart.slice(-10) };
  }, [trades]);

  const canTrade = useMemo(() => {
    if (!stats) return true;
    const fc = stats.settings?.futuresCapital ?? 100;
    const drawdown = ((fc - (fc + stats.totalPnl)) / fc) * 100;
    return drawdown < (stats.settings?.stopTradingDrawdown ?? 20);
  }, [stats]);

  const shouldTransfer = stats ? stats.totalPnl >= (stats.settings?.profitTransferThreshold ?? 10) : false;
  const totalPnl = stats?.totalPnl ?? 0;
  const winRate = stats?.winRate ?? 0;
  const wins = stats?.wins ?? 0;
  const losses = stats?.losses ?? 0;
  const btcAcc = stats?.totalBtcBought ?? 0;
  const openTrades = stats?.openTrades ?? 0;
  const closedTrades = stats?.closedTrades ?? 0;
  const totalTrades = stats?.totalTrades ?? 0;

  return (
    <div className="relative space-y-10 p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-50" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-ambient-orange" aria-hidden />

      <div className="relative space-y-10">
        {/* HEADER */}
        <PageHeader
          index="01"
          total="08"
          eyebrow="Dashboard · overview"
          title="Visão geral da estratégia BTC."
          subtitle="Performance, regras e plano de execução — tudo num só painel."
          actions={
            <>
              {canTrade ? (
                <StatPill tone="profit" pulse>
                  PODE OPERAR
                </StatPill>
              ) : (
                <StatPill tone="loss" pulse>
                  PARAR OPERAÇÕES
                </StatPill>
              )}
              {shouldTransfer && (
                <StatPill tone="info">
                  TRANSFERIR P/ BTC
                </StatPill>
              )}
            </>
          }
        />

        {/* KPIs */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-px md:bg-border md:[&>*]:bg-background">
          <KpiTerminal
            label="PNL TOTAL"
            index="01"
            value={`${totalPnl >= 0 ? "+" : ""}${fmtUsdt(totalPnl)}`}
            tone={totalPnl >= 0 ? "profit" : "loss"}
            delta={
              <span className={pnlColor(totalPnl)}>
                {totalPnl >= 0 ? "▲" : "▼"} {closedTrades} trades
              </span>
            }
            caption="USDT realizado"
            loading={isLoading}
          />
          <KpiTerminal
            label="WIN RATE"
            index="02"
            value={fmtPct(winRate)}
            tone={winRate >= 50 ? "profit" : "loss"}
            delta={<span className="text-muted-foreground">{wins}W / {losses}L</span>}
            caption="taxa de acerto"
            loading={isLoading}
          />
          <KpiTerminal
            label="BTC ACUMULADO"
            index="03"
            value={btcAcc.toFixed(6)}
            tone="orange"
            delta={<span className="text-muted-foreground">{fmtUsdt(stats?.totalUsdtTransferred ?? 0)} USDT</span>}
            caption="spot · convertido"
            loading={isLoading}
          />
          <KpiTerminal
            label="TRADES ABERTOS"
            index="04"
            value={String(openTrades)}
            tone="neutral"
            icon={Activity}
            delta={<span className="text-muted-foreground">{totalTrades} total</span>}
            caption="posições live"
            loading={isLoading}
          />
        </section>

        {/* Goals */}
        <section className="space-y-4">
          <Eyebrow>plan tracker · metas ativas</Eyebrow>
          <PlanTracker />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TerminalFrame title="equity_curve · pnl acumulado" status={pnlChartData.length ? "live" : "no data"} statusTone={pnlChartData.length ? "live" : "off"} orangeCorners>
            <div className="px-2 py-4">
              {pnlChartData.length === 0 ? (
                <EmptyChartState message="Nenhum trade fechado ainda" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={pnlChartData}>
                    <defs>
                      <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.3 }} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 6" />
                    <Area type="monotone" dataKey="cumPnl" name="PnL Acum." stroke="hsl(var(--primary))" fill="url(#pnlGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-2 font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              <span>fig.01 — equity</span>
              <span className={pnlColor(totalPnl)}>
                {totalPnl >= 0 ? "+" : ""}{fmtUsdt(totalPnl)} USDT
              </span>
            </div>
          </TerminalFrame>

          <TerminalFrame title="last_10 · trades" status={recentTradesData.length ? "live" : "no data"} statusTone={recentTradesData.length ? "live" : "off"} orangeCorners>
            <div className="px-2 py-4">
              {recentTradesData.length === 0 ? (
                <EmptyChartState message="Nenhum trade fechado ainda" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={recentTradesData} barSize={14}>
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
                    <Bar dataKey="pnl" name="PnL (USDT)" radius={[0, 0, 0, 0]}>
                      {recentTradesData.map((entry, i) => (
                        <Cell key={i} fill={entry.pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-2 font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              <span>fig.02 — last_10</span>
              <span>{recentTradesData.length} samples</span>
            </div>
          </TerminalFrame>
        </section>

        {/* Strategy rules quick ref */}
        <section className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3 font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            <span><span className="text-primary">[06]</span> · strategy.config</span>
            <span>read-only</span>
          </div>
          <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x">
            <div className="px-6 py-2">
              {[
                { label: "Capital Total",     value: `${fmtUsdt(stats?.settings?.totalCapital ?? 200)} USDT` },
                { label: "Capital Futuros",   value: `${fmtUsdt(stats?.settings?.futuresCapital ?? 100)} USDT` },
                { label: "Capital Spot BTC",  value: `${fmtUsdt(stats?.settings?.spotCapital ?? 100)} USDT` },
                { label: "Risco / Trade",     value: `${fmtUsdt(stats?.settings?.riskPerTrade ?? 2.5)} USDT` },
              ].map((r, i) => (
                <KeyValueRow key={r.label} index={String(i + 1).padStart(2, "0")} label={r.label} value={r.value} />
              ))}
            </div>
            <div className="px-6 py-2">
              {[
                { label: "Alavancagem padrão",     value: `${stats?.settings?.defaultLeverage ?? 3}x` },
                { label: "Transferir quando",      value: `+${fmtUsdt(stats?.settings?.profitTransferThreshold ?? 10)} USDT`, tone: "orange" as const },
                { label: "Parar c/ drawdown",      value: `−${stats?.settings?.stopTradingDrawdown ?? 20}%`, tone: "loss" as const },
                { label: "Total trades",           value: String(totalTrades) },
              ].map((r, i) => (
                <KeyValueRow key={r.label} index={String(i + 5).padStart(2, "0")} label={r.label} value={r.value} tone={r.tone} />
              ))}
            </div>
          </div>
        </section>

        <RoadmapSection />
      </div>
    </div>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-2">
      <span className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground/50">
        [no data]
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ── Roadmap section ─────────────────────────────────────────────────────────────
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
    <section className="space-y-4">
      <div className="flex items-end justify-between border-b border-border pb-4">
        <div className="space-y-1">
          <Eyebrow>seu plano de ação · roadmap</Eyebrow>
          <h2 className="font-display text-2xl font-bold tracking-tight">Próximas fases.</h2>
        </div>
        <span className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          {phases.length} phases
        </span>
      </div>

      <ol className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
        {phases.map((phase, i) => {
          const done = phase.checklist.filter((c) => c.done).length;
          const total = phase.checklist.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <li key={phase.id} className="bg-card p-5">
              <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                <div>
                  <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-primary">
                    Phase {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="font-display mt-1 text-lg font-bold leading-tight">{phase.title}</p>
                </div>
                <span className="num font-mono-tk text-xs font-bold text-primary">{pct}%</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{phase.description}</p>
              <ul className="mt-3 space-y-1.5">
                {phase.checklist.map((c, k) => (
                  <li key={k} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${c.done ? "text-profit" : "text-muted-foreground/40"}`} />
                    <span className={c.done ? "text-foreground" : "text-muted-foreground"}>{c.task}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
