import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { Download } from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdvancedReports, type AggRow } from "@/hooks/useAdvancedReports";
import { useWeeklyInsights } from "@/hooks/useWeeklyInsights";
import { fmtUsdt, fmtPct, pnlColor } from "@/lib/format";
import {
  PageHeader, KpiTerminal, TerminalFrame, Eyebrow, StatPill, TerminalButton,
} from "@/components/tk";
import UpgradeCard from "@/components/UpgradeCard";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

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

function ReportTable({
  data, period,
}: {
  data: Record<string, { wins: number; losses: number; pnl: number; count: number }>;
  period: "month" | "week";
}) {
  const entries = Object.entries(data).sort((a, b) => b[0].localeCompare(a[0]));
  if (entries.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground/50">[empty]</p>
        <p className="mt-2 text-sm text-muted-foreground">Nenhum dado disponível ainda</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {[period === "month" ? "Mês" : "Semana", "Trades", "Wins", "Losses", "Win Rate", "PnL"].map(h => (
              <th key={h} className="px-4 py-3 text-left font-mono-tk text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, v]) => {
            const wr = v.count > 0 ? (v.wins / v.count) * 100 : 0;
            return (
              <tr key={key} className="border-b border-border/40 transition-colors hover:bg-white/[0.02]">
                <td className="num px-4 py-3 font-mono-tk text-xs font-bold text-foreground">{key}</td>
                <td className="num px-4 py-3 font-mono-tk text-xs">{v.count}</td>
                <td className="num px-4 py-3 font-mono-tk text-xs text-profit">{v.wins}</td>
                <td className="num px-4 py-3 font-mono-tk text-xs text-loss">{v.losses}</td>
                <td className="px-4 py-3">
                  <StatPill tone={wr >= 50 ? "profit" : "loss"}>{wr.toFixed(1)}%</StatPill>
                </td>
                <td className={cn("num px-4 py-3 font-mono-tk text-sm font-bold", pnlColor(v.pnl))}>
                  {v.pnl >= 0 ? "+" : ""}{fmtUsdt(v.pnl)} USDT
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BreakdownTable({ rows, labelCol }: { rows: AggRow[]; labelCol: string }) {
  if (!rows.length) {
    return <p className="p-6 text-sm text-muted-foreground">Sem dados para este recorte.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {[labelCol, "Trades", "Wins", "Losses", "PnL"].map(h => (
              <th key={h} className="px-4 py-3 text-left font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.key} className="border-b border-border/40 hover:bg-white/[0.02]">
              <td className="px-4 py-3 font-mono-tk text-xs font-bold">{row.key}</td>
              <td className="num px-4 py-3 font-mono-tk text-xs">{row.count}</td>
              <td className="num px-4 py-3 text-profit">{row.wins}</td>
              <td className="num px-4 py-3 text-loss">{row.losses}</td>
              <td className={cn("num px-4 py-3 font-bold", pnlColor(row.pnl))}>
                {row.pnl >= 0 ? "+" : ""}{fmtUsdt(row.pnl)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BreakdownChart({ rows }: { rows: AggRow[] }) {
  const chartData = rows.slice(0, 8).map(r => ({
    key: r.key.length > 12 ? `${r.key.slice(0, 10)}…` : r.key,
    pnl: parseFloat(r.pnl.toFixed(2)),
  }));
  if (!chartData.length) return null;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} barSize={16}>
        <XAxis dataKey="key" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
        <Bar dataKey="pnl" name="PnL">
          {chartData.map((e, i) => (
            <Cell key={i} fill={e.pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function Reports() {
  const { data: stats, isLoading } = useStats();
  const { data: sub } = useSubscription();
  const [tab, setTab] = useState<"monthly" | "weekly">("monthly");
  const [breakdownTab, setBreakdownTab] = useState<"pair" | "setup" | "hour" | "exchange">("pair");
  const [selectedWeek, setSelectedWeek] = useState<string | undefined>(undefined);

  const isAdvanced =
    sub?.entitlements &&
    typeof sub.entitlements === "object" &&
    (sub.entitlements as { moduleSmartReports?: string }).moduleSmartReports === "advanced";
  const isElite =
    sub?.entitlements &&
    typeof sub.entitlements === "object" &&
    (sub.entitlements as { moduleInvestorExport?: boolean }).moduleInvestorExport === true;

  const { data: advanced } = useAdvancedReports(!!isAdvanced);
  const { data: insights } = useWeeklyInsights(selectedWeek, !!isAdvanced && tab === "weekly");

  const monthData = stats?.tradesByMonth ?? {};
  const weekData  = stats?.tradesByWeek  ?? {};

  const { monthChartData, weekChartData } = useMemo(() => {
    const toChart = (data: typeof monthData) =>
      Object.entries(data)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, v]) => ({
          period: key,
          pnl:    parseFloat(v.pnl.toFixed(2)),
          wr:     v.count > 0 ? parseFloat(((v.wins / v.count) * 100).toFixed(1)) : 0,
          trades: v.count,
        }));
    return {
      monthChartData: toChart(monthData),
      weekChartData:  toChart(weekData).slice(-12),
    };
  }, [stats]);

  const weekOptions = insights?.availableWeeks ?? Object.keys(weekData).sort((a, b) => b.localeCompare(a)).slice(0, 12);
  const activeWeek = selectedWeek ?? weekOptions[0];

  const handleExport = async () => {
    const res = await fetch("/api/reports/export?format=csv", { credentials: "include" });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trackion-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPnl = stats?.totalPnl ?? 0;
  const winRate = stats?.winRate ?? 0;
  const closed = stats?.closedTrades ?? 0;
  const btc = stats?.totalBtcBought ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="space-y-3 border-b border-border pb-6">
          <div className="h-3 w-32 animate-pulse bg-muted" />
          <div className="h-10 w-72 animate-pulse bg-muted" />
        </div>
        <div className="grid grid-cols-4 gap-px">{[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse bg-muted" />)}</div>
        <div className="h-64 animate-pulse bg-muted" />
      </div>
    );
  }

  return (
    <div className="relative space-y-10 p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-50" aria-hidden />

      <div className="relative space-y-10">
        <PageHeader
          index="05"
          total="08"
          eyebrow="Reports · performance"
          title="Análise temporal."
          subtitle="Performance agregada por semana e mês — disciplina é repetir o que funciona."
          actions={
            isElite ? (
              <TerminalButton variant="outline" icon={Download} onClick={handleExport}>
                Exportar CSV
              </TerminalButton>
            ) : undefined
          }
        />

        {!isAdvanced && (
          <div className="border border-primary/30 bg-primary/[0.04] px-4 py-3 font-mono-tk text-xs text-muted-foreground">
            Relatórios avançados (insights por par, setup e horário) no{" "}
            <Link href="/billing" className="text-primary underline">Pro Trader</Link>.
          </div>
        )}

        <section className="grid grid-cols-2 gap-px bg-border md:grid-cols-4 [&>*]:bg-background">
          <KpiTerminal
            label="PNL TOTAL"
            index="01"
            value={`${totalPnl >= 0 ? "+" : ""}${fmtUsdt(totalPnl)}`}
            tone={totalPnl >= 0 ? "profit" : "loss"}
            caption="USDT acumulado"
          />
          <KpiTerminal
            label="WIN RATE GLOBAL"
            index="02"
            value={fmtPct(winRate)}
            tone={winRate >= 50 ? "profit" : "loss"}
            caption="taxa de acerto"
          />
          <KpiTerminal
            label="TOTAL TRADES"
            index="03"
            value={String(closed)}
            caption="fechados"
          />
          {isElite && advanced?.sharpeRatio != null ? (
            <KpiTerminal
              label="SHARPE"
              index="04"
              value={String(advanced.sharpeRatio)}
              tone="orange"
              caption="anualizado · elite"
            />
          ) : (
            <KpiTerminal
              label="BTC COMPRADO"
              index="04"
              value={btc.toFixed(6)}
              tone="orange"
              caption="spot via transfers"
            />
          )}
        </section>

        {isElite && advanced && (
          <section className="grid grid-cols-2 gap-px bg-border md:grid-cols-2 [&>*]:bg-background">
            <KpiTerminal
              label="MAX DRAWDOWN"
              index="E1"
              value={`${advanced.maxDrawdownPct ?? 0}%`}
              tone="loss"
              caption="pico a vale · elite"
            />
            <KpiTerminal
              label="SHARPE RATIO"
              index="E2"
              value={advanced.sharpeRatio != null ? String(advanced.sharpeRatio) : "—"}
              tone="orange"
              caption="retornos diários"
            />
          </section>
        )}

        <div className="flex items-center gap-px border border-border bg-border w-fit">
          {(["monthly", "weekly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-2 font-mono-tk text-[10px] font-bold uppercase tracking-[0.28em] transition-colors",
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
              )}
            >
              {t === "monthly" ? "mensal" : "semanal"}
            </button>
          ))}
        </div>

        {tab === "weekly" && isAdvanced && (
          <section className="space-y-4">
            <TerminalFrame title="insights · semana" status="live" statusTone="live" orangeCorners>
              <div className="space-y-4 p-4">
                {weekOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {weekOptions.map(w => (
                      <button
                        key={w}
                        onClick={() => setSelectedWeek(w)}
                        className={cn(
                          "border px-3 py-1 font-mono-tk text-[10px] uppercase tracking-wider transition",
                          activeWeek === w
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-white/20",
                        )}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                )}
                {insights ? (
                  <>
                    <p className="font-display text-lg font-bold">{insights.headline}</p>
                    {insights.bullets.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem trades fechados nesta semana.</p>
                    ) : (
                      <ul className="space-y-2">
                        {insights.bullets.map((b, i) => (
                          <li key={i} className="border-l-2 border-primary/50 pl-3 text-sm text-foreground/90">
                            {b.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Carregando insights…</p>
                )}
              </div>
            </TerminalFrame>

            {advanced && (
              <div className="space-y-4">
                <Eyebrow>breakdown · pro</Eyebrow>
                <div className="flex flex-wrap gap-px border border-border bg-border w-fit">
                  {(
                    [
                      ["pair", "por par"],
                      ["setup", "por setup"],
                      ["hour", "por horário"],
                      ...(advanced.byExchange ? [["exchange", "multi-conta"] as const] : []),
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => setBreakdownTab(id)}
                      className={cn(
                        "px-4 py-2 font-mono-tk text-[10px] font-bold uppercase tracking-[0.22em]",
                        breakdownTab === id
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-muted-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="border border-border bg-card">
                  <div className="grid gap-6 p-4 md:grid-cols-2">
                    <BreakdownChart
                      rows={
                        breakdownTab === "pair"
                          ? advanced.byPair
                          : breakdownTab === "setup"
                            ? advanced.bySetup
                            : breakdownTab === "hour"
                              ? advanced.byHour
                              : advanced.byExchange ?? []
                      }
                    />
                    <BreakdownTable
                      rows={
                        breakdownTab === "pair"
                          ? advanced.byPair
                          : breakdownTab === "setup"
                            ? advanced.bySetup
                            : breakdownTab === "hour"
                              ? advanced.byHour
                              : advanced.byExchange ?? []
                      }
                      labelCol={
                        breakdownTab === "pair"
                          ? "Par"
                          : breakdownTab === "setup"
                            ? "Setup"
                            : breakdownTab === "hour"
                              ? "Faixa UTC"
                              : "Exchange"
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {tab === "weekly" && !isAdvanced && (
          <UpgradeCard
            title="Insights semanais"
            description="Veja em qual par você ganhou ou perdeu, faixas de horário fracas e sequências de loss — disponível no Pro Trader."
          />
        )}

        {tab === "monthly" && (
          <div className="space-y-6">
            {monthChartData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <TerminalFrame title="fig.01 · pnl_por_mes" status="live" statusTone="live" orangeCorners>
                    <div className="p-4">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={monthChartData} barSize={20}>
                          <XAxis dataKey="period" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                          <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
                          <Bar dataKey="pnl" name="PnL" radius={[0, 0, 0, 0]}>
                            {monthChartData.map((e, i) => (
                              <Cell key={i} fill={e.pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TerminalFrame>
                  <TerminalFrame title="fig.02 · win_rate_por_mes" status="live" statusTone="live" orangeCorners>
                    <div className="p-4">
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={monthChartData}>
                          <XAxis dataKey="period" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} width={40} domain={[0, 100]} />
                          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.3 }} />
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <ReferenceLine y={50} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" label={{ value: "50%", fill: "rgba(255,255,255,0.4)", fontSize: 9 }} />
                          <Line type="monotone" dataKey="wr" name="Win Rate %" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TerminalFrame>
                </div>
                <div className="border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2 font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    <span>table · monthly aggregates</span>
                    <span>{Object.keys(monthData).length} rows</span>
                  </div>
                  <ReportTable data={monthData} period="month" />
                </div>
              </>
            ) : (
              <EmptyReport />
            )}
          </div>
        )}

        {tab === "weekly" && (
          <div className="space-y-6">
            {weekChartData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <TerminalFrame title="fig.03 · pnl_ultimas_12_semanas" status="live" statusTone="live" orangeCorners>
                    <div className="p-4">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={weekChartData} barSize={14}>
                          <XAxis dataKey="period" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                          <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
                          <Bar dataKey="pnl" name="PnL" radius={[0, 0, 0, 0]}>
                            {weekChartData.map((e, i) => (
                              <Cell key={i} fill={e.pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TerminalFrame>
                  <TerminalFrame title="fig.04 · trades_por_semana" status="live" statusTone="live" orangeCorners>
                    <div className="p-4">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={weekChartData} barSize={14}>
                          <XAxis dataKey="period" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                          <Bar dataKey="trades" name="Trades" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} opacity={0.85} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TerminalFrame>
                </div>
                <div className="border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2 font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    <span>table · weekly aggregates</span>
                    <span>{Object.keys(weekData).length} rows</span>
                  </div>
                  <ReportTable data={weekData} period="week" />
                </div>
              </>
            ) : (
              <EmptyReport />
            )}
          </div>
        )}

        <p className="border-t border-border pt-4 font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          ↳ relatórios · dados agregados de trades fechados
        </p>
      </div>
    </div>
  );
}

function EmptyReport() {
  return (
    <div className="border border-border bg-card py-16 text-center">
      <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground/50">[no data]</p>
      <p className="mt-2 text-sm text-muted-foreground">Nenhum trade fechado ainda para gerar relatório</p>
    </div>
  );
}
