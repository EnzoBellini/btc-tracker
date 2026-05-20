import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { useStats } from "@/hooks/useStats";
import { fmtUsdt, fmtPct, pnlColor } from "@/lib/format";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? fmtUsdt(p.value) : p.value}</p>
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
    return <div className="py-12 text-center text-muted-foreground text-sm">Nenhum dado disponível ainda</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {[period === "month" ? "Mês" : "Semana", "Trades", "Wins", "Losses", "Win Rate", "PnL"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, v]) => {
            const wr = v.count > 0 ? (v.wins / v.count) * 100 : 0;
            return (
              <tr key={key} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium tabular">{key}</td>
                <td className="px-4 py-3 tabular">{v.count}</td>
                <td className="px-4 py-3 tabular text-profit">{v.wins}</td>
                <td className="px-4 py-3 tabular text-loss">{v.losses}</td>
                <td className="px-4 py-3">
                  <Badge className={`border-0 text-xs ${wr >= 50 ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
                    {wr.toFixed(1)}%
                  </Badge>
                </td>
                <td className={`px-4 py-3 tabular font-medium ${pnlColor(v.pnl)}`}>
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

export default function Reports() {
  const { data: stats, isLoading } = useStats();

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

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}</div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Performance semanal e mensal</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "PnL Total",       value: `${(stats?.totalPnl ?? 0) >= 0 ? "+" : ""}${fmtUsdt(stats?.totalPnl ?? 0)} USDT`, color: pnlColor(stats?.totalPnl ?? 0) },
          { label: "Win Rate Global", value: fmtPct(stats?.winRate ?? 0),                                                         color: (stats?.winRate ?? 0) >= 50 ? "text-profit" : "text-loss" },
          { label: "Total Trades",    value: String(stats?.closedTrades ?? 0),                                                    color: "text-foreground" },
          { label: "BTC Comprado",    value: `${(stats?.totalBtcBought ?? 0).toFixed(6)} BTC`,                                    color: "text-primary" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="bg-card border-border">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-bold tabular mt-1 ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="monthly">
        <TabsList className="bg-muted">
          <TabsTrigger value="monthly">Mensal</TabsTrigger>
          <TabsTrigger value="weekly">Semanal</TabsTrigger>
        </TabsList>

        {/* ── Monthly ── */}
        <TabsContent value="monthly" className="space-y-4 mt-4">
          {monthChartData.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2 px-5 pt-5">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">PnL por Mês (USDT)</CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 pb-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={monthChartData} barSize={20}>
                        <XAxis dataKey="period" tick={{ fill: "hsl(220,8%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(220,8%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={0} stroke="hsl(220,12%,25%)" />
                        <Bar dataKey="pnl" name="PnL" radius={[3, 3, 0, 0]}>
                          {monthChartData.map((e, i) => (
                            <Cell key={i} fill={e.pnl >= 0 ? "hsl(142,71%,45%)" : "hsl(0,72%,51%)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2 px-5 pt-5">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Win Rate por Mês (%)</CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 pb-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={monthChartData}>
                        <XAxis dataKey="period" tick={{ fill: "hsl(220,8%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(220,8%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} domain={[0, 100]} />
                        <Tooltip content={<CustomTooltip />} />
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,12%,18%)" />
                        <ReferenceLine y={50} stroke="hsl(220,8%,50%)" strokeDasharray="4 4" label={{ value: "50%", fill: "hsl(220,8%,50%)", fontSize: 10 }} />
                        <Line type="monotone" dataKey="wr" name="Win Rate %" stroke="hsl(27,100%,55%)" strokeWidth={2} dot={{ fill: "hsl(27,100%,55%)", r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              <Card className="bg-card border-border">
                <CardContent className="p-0"><ReportTable data={monthData} period="month" /></CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-16 text-center text-muted-foreground">Nenhum trade fechado ainda para gerar relatório mensal</CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Weekly ── */}
        <TabsContent value="weekly" className="space-y-4 mt-4">
          {weekChartData.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2 px-5 pt-5">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">PnL por Semana (últimas 12)</CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 pb-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={weekChartData} barSize={14}>
                        <XAxis dataKey="period" tick={{ fill: "hsl(220,8%,50%)", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(220,8%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={0} stroke="hsl(220,12%,25%)" />
                        <Bar dataKey="pnl" name="PnL" radius={[3, 3, 0, 0]}>
                          {weekChartData.map((e, i) => (
                            <Cell key={i} fill={e.pnl >= 0 ? "hsl(142,71%,45%)" : "hsl(0,72%,51%)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2 px-5 pt-5">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Trades por Semana</CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 pb-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={weekChartData} barSize={14}>
                        <XAxis dataKey="period" tick={{ fill: "hsl(220,8%,50%)", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(220,8%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="trades" name="Trades" fill="hsl(27,100%,55%)" radius={[3, 3, 0, 0]} opacity={0.8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              <Card className="bg-card border-border">
                <CardContent className="p-0"><ReportTable data={weekData} period="week" /></CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-16 text-center text-muted-foreground">Nenhum trade fechado ainda para gerar relatório semanal</CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
