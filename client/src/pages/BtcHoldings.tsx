import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertBtcHoldingSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useHoldings, useCreateHolding, useDeleteHolding } from "@/hooks/useHoldings";
import { fmtUsdt, fmtBtc, pnlColor } from "@/lib/format";

const formSchema = insertBtcHoldingSchema.extend({
  btcAmount:   z.coerce.number().positive(),
  avgCostUsdt: z.coerce.number().positive(),
  btcPriceNow: z.coerce.number().positive(),
});
type FormValues = z.infer<typeof formSchema>;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

function HoldingForm({ onClose }: { onClose: () => void }) {
  const createHolding = useCreateHolding();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      btcAmount:   undefined as any,
      avgCostUsdt: undefined as any,
      btcPriceNow: undefined as any,
      notes: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(d => createHolding.mutateAsync(d).then(() => onClose()).catch(() => {}))} className="space-y-4">
        <FormField control={form.control} name="date" render={({ field }) => (
          <FormItem>
            <FormLabel>Data</FormLabel>
            <FormControl><Input type="date" {...field} data-testid="input-holding-date" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="btcAmount" render={({ field }) => (
            <FormItem>
              <FormLabel>Total BTC</FormLabel>
              <FormControl><Input type="number" step="any" {...field} placeholder="0.00100000" data-testid="input-btc-amount" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="avgCostUsdt" render={({ field }) => (
            <FormItem>
              <FormLabel>Custo Médio (USDT)</FormLabel>
              <FormControl><Input type="number" step="any" {...field} placeholder="85000" data-testid="input-avg-cost" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="btcPriceNow" render={({ field }) => (
          <FormItem>
            <FormLabel>Preço Atual BTC (USDT)</FormLabel>
            <FormControl><Input type="number" step="any" {...field} placeholder="90000" data-testid="input-btc-price-now" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notas</FormLabel>
            <FormControl><Input {...field as any} placeholder="Observações..." data-testid="input-holding-notes" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={createHolding.isPending} data-testid="button-save-holding">
            {createHolding.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function BtcHoldings() {
  const [open, setOpen] = useState(false);
  const { data: holdings = [], isLoading } = useHoldings();
  const deleteHolding = useDeleteHolding();

  const latest = holdings.length ? holdings[holdings.length - 1] : null;

  const { unrealizedPnl, unrealizedPct, chartData } = useMemo(() => {
    const upnl = latest ? (latest.btcPriceNow - latest.avgCostUsdt) * latest.btcAmount : 0;
    const upct = latest ? ((latest.btcPriceNow - latest.avgCostUsdt) / latest.avgCostUsdt) * 100 : 0;
    const chart = holdings.map(h => ({
      date:    h.date,
      btc:     h.btcAmount,
      value:   parseFloat((h.btcAmount * h.btcPriceNow).toFixed(2)),
      avgCost: h.avgCostUsdt,
      price:   h.btcPriceNow,
    }));
    return { unrealizedPnl: upnl, unrealizedPct: upct, chartData: chart };
  }, [holdings, latest]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">BTC Stack</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Acompanhe o crescimento do seu BTC</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-holding" className="gap-2">
              <Plus className="w-4 h-4" /> Novo Snapshot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Registrar Snapshot BTC</DialogTitle></DialogHeader>
            <HoldingForm onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">BTC Total</p>
              <p className="text-2xl font-bold text-primary tabular mt-1">{fmtBtc(latest.btcAmount)}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Valor Atual</p>
              <p className="text-2xl font-bold tabular mt-1">${fmtUsdt(latest.btcAmount * latest.btcPriceNow)}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Custo Médio</p>
              <p className="text-2xl font-bold tabular mt-1">${fmtUsdt(latest.avgCostUsdt, 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">PnL Não Realizado</p>
              <div className="flex items-center gap-1.5 mt-1">
                {unrealizedPnl >= 0
                  ? <TrendingUp   className="w-5 h-5 text-profit" />
                  : <TrendingDown className="w-5 h-5 text-loss"   />}
                <p className={`text-2xl font-bold tabular ${pnlColor(unrealizedPnl)}`}>
                  {unrealizedPnl >= 0 ? "+" : ""}{fmtUsdt(unrealizedPnl)} USDT
                </p>
              </div>
              <p className={`text-xs tabular mt-0.5 ${pnlColor(unrealizedPct)}`}>
                {unrealizedPct >= 0 ? "+" : ""}{unrealizedPct.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 px-5 pt-5">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">BTC Acumulado</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="btcStackGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(27,100%,55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(27,100%,55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: "hsl(220,8%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(220,8%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} width={70} tickFormatter={v => v.toFixed(5)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="btc" name="BTC" stroke="hsl(27,100%,55%)" fill="url(#btcStackGrad)" strokeWidth={2} dot={{ fill: "hsl(27,100%,55%)", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2 px-5 pt-5">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preço vs Custo Médio</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <ResponsiveContainer width="100%" height={170}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fill: "hsl(220,8%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(220,8%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} width={70} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,12%,18%)" />
                  <Line type="monotone" dataKey="price"   name="Preço BTC"   stroke="hsl(27,100%,55%)" strokeWidth={2}   dot={{ fill: "hsl(27,100%,55%)", r: 3 }} />
                  <Line type="monotone" dataKey="avgCost" name="Custo Médio" stroke="hsl(220,8%,50%)"  strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Data", "BTC Total", "Custo Médio", "Preço Atual", "Valor Total", "PnL Não Realizado", "Notas", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : holdings.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Nenhum snapshot registrado</td></tr>
                ) : [...holdings].reverse().map(h => {
                  const upnl = (h.btcPriceNow - h.avgCostUsdt) * h.btcAmount;
                  const upct = ((h.btcPriceNow - h.avgCostUsdt) / h.avgCostUsdt) * 100;
                  return (
                    <tr key={h.id} className="border-b border-border hover:bg-muted/30 transition-colors" data-testid={`row-holding-${h.id}`}>
                      <td className="px-4 py-3 tabular text-muted-foreground">{h.date}</td>
                      <td className="px-4 py-3 tabular text-primary font-medium">{fmtBtc(h.btcAmount)}</td>
                      <td className="px-4 py-3 tabular">${fmtUsdt(h.avgCostUsdt, 0)}</td>
                      <td className="px-4 py-3 tabular">${fmtUsdt(h.btcPriceNow, 0)}</td>
                      <td className="px-4 py-3 tabular">${fmtUsdt(h.btcAmount * h.btcPriceNow)}</td>
                      <td className={`px-4 py-3 tabular font-medium ${pnlColor(upnl)}`}>
                        {upnl >= 0 ? "+" : ""}{fmtUsdt(upnl)} ({upct >= 0 ? "+" : ""}{upct.toFixed(1)}%)
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{h.notes || "—"}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-loss" onClick={() => deleteHolding.mutate(h.id)} disabled={deleteHolding.isPending} data-testid={`button-delete-holding-${h.id}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
