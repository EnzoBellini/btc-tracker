import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertBtcHoldingSchema } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useHoldings, useCreateHolding, useDeleteHolding } from "@/hooks/useHoldings";
import { fmtUsdt, fmtBtc, pnlColor } from "@/lib/format";
import {
  PageHeader, KpiTerminal, TerminalFrame, TerminalButton,
} from "@/components/tk";
import { cn } from "@/lib/utils";
import { useAppLocale } from "@/lib/locale-context";

const formSchema = insertBtcHoldingSchema.extend({
  btcAmount:   z.coerce.number().positive(),
  avgCostUsdt: z.coerce.number().positive(),
  btcPriceNow: z.coerce.number().positive(),
});
type FormValues = z.infer<typeof formSchema>;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border bg-card px-3 py-2 text-xs shadow-2xl">
      <p className="font-mono-tk text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="num font-mono-tk mt-1">{p.name}: {p.value}</p>
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
            <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Data</FormLabel>
            <FormControl><Input type="date" {...field} data-testid="input-holding-date" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="btcAmount" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Total BTC</FormLabel>
              <FormControl><Input type="number" step="any" {...field} placeholder="0.00100000" className="font-mono-tk num" data-testid="input-btc-amount" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="avgCostUsdt" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Custo médio (USDT)</FormLabel>
              <FormControl><Input type="number" step="any" {...field} placeholder="85000" className="font-mono-tk num" data-testid="input-avg-cost" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="btcPriceNow" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Preço atual BTC (USDT)</FormLabel>
            <FormControl><Input type="number" step="any" {...field} placeholder="90000" className="font-mono-tk num" data-testid="input-btc-price-now" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Notas</FormLabel>
            <FormControl><Input {...field as any} placeholder="Observações..." data-testid="input-holding-notes" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2 pt-2">
          <TerminalButton type="button" variant="outline" onClick={onClose}>Cancelar</TerminalButton>
          <TerminalButton type="submit" disabled={createHolding.isPending} data-testid="button-save-holding">
            {createHolding.isPending ? "Salvando…" : "Salvar"}
          </TerminalButton>
        </div>
      </form>
    </Form>
  );
}

export default function BtcHoldings() {
  const { t } = useAppLocale();
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
    <div className="relative space-y-10 p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-50" aria-hidden />

      <div className="relative space-y-10">
        <PageHeader
          index="04"
          total="09"
          eyebrow={t.btcHoldings.eyebrow}
          title={t.btcHoldings.title}
          subtitle={t.btcHoldings.subtitle}
          actions={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button
                  data-testid="button-add-holding"
                  className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2.5 font-mono-tk text-[11px] font-bold uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-transparent hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" /> novo snapshot
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle className="font-display text-xl">Registrar snapshot BTC</DialogTitle></DialogHeader>
                <HoldingForm onClose={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          }
        />

        {/* KPIs */}
        {latest && (
          <section className="grid grid-cols-2 gap-px bg-border md:grid-cols-4 [&>*]:bg-background">
            <KpiTerminal label="BTC TOTAL" index="01" value={fmtBtc(latest.btcAmount)} tone="orange" caption="acumulado" />
            <KpiTerminal label="VALOR ATUAL" index="02" value={`$${fmtUsdt(latest.btcAmount * latest.btcPriceNow)}`} caption="mark-to-market" />
            <KpiTerminal label="CUSTO MÉDIO" index="03" value={`$${fmtUsdt(latest.avgCostUsdt, 0)}`} caption="avg entry" />
            <KpiTerminal
              label="PNL NÃO REALIZADO"
              index="04"
              value={
                <span className="flex items-center gap-2">
                  {unrealizedPnl >= 0
                    ? <TrendingUp   className="h-6 w-6 text-profit" />
                    : <TrendingDown className="h-6 w-6 text-loss"   />}
                  {unrealizedPnl >= 0 ? "+" : ""}{fmtUsdt(unrealizedPnl)}
                </span>
              }
              tone={unrealizedPnl >= 0 ? "profit" : "loss"}
              caption={`${unrealizedPct >= 0 ? "+" : ""}${unrealizedPct.toFixed(1)}% USDT`}
            />
          </section>
        )}

        {/* Charts */}
        {chartData.length > 0 && (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TerminalFrame title={t.btcHoldings.chartBtcAccumulated} status="live" statusTone="live" orangeCorners>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="btcStackGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} width={70} tickFormatter={v => v.toFixed(5)} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.3 }} />
                    <Area type="monotone" dataKey="btc" name="BTC" stroke="hsl(var(--primary))" fill="url(#btcStackGrad)" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TerminalFrame>

            <TerminalFrame title={t.btcHoldings.chartPriceVsCost} status="live" statusTone="live" orangeCorners>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} width={70} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.3 }} />
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <Line type="monotone" dataKey="price"   name={t.btcHoldings.chartPriceLabel}   stroke="hsl(var(--primary))" strokeWidth={2}   dot={{ fill: "hsl(var(--primary))", r: 3 }} />
                    <Line type="monotone" dataKey="avgCost" name={t.btcHoldings.chartCostLabel} stroke="rgba(255,255,255,0.4)"  strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TerminalFrame>
          </section>
        )}

        {/* Table */}
        <section className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            <span>{t.btcHoldings.tableSnapshots}</span>
            <span>{t.btcHoldings.tableRows(holdings.length)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["#", "Data", "BTC Total", "Custo Médio", "Preço Atual", "Valor Total", "PnL Não Realizado", "Notas", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono-tk text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-border/60">
                      {[...Array(9)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-3 w-16 animate-pulse bg-muted" /></td>
                      ))}
                    </tr>
                  ))
                ) : holdings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground/50">[empty]</p>
                      <p className="mt-2 text-sm text-muted-foreground">{t.btcHoldings.emptySnapshots}</p>
                    </td>
                  </tr>
                ) : [...holdings].reverse().map((h, idx) => {
                  const upnl = (h.btcPriceNow - h.avgCostUsdt) * h.btcAmount;
                  const upct = ((h.btcPriceNow - h.avgCostUsdt) / h.avgCostUsdt) * 100;
                  return (
                    <tr key={h.id} className="group border-b border-border/40 transition-colors hover:bg-white/[0.02]" data-testid={`row-holding-${h.id}`}>
                      <td className="px-4 py-3 font-mono-tk text-[10px] tracking-[0.18em] text-muted-foreground/60">{String(idx + 1).padStart(3, "0")}</td>
                      <td className="num px-4 py-3 font-mono-tk text-xs text-muted-foreground">{h.date}</td>
                      <td className="num px-4 py-3 font-mono-tk text-sm font-bold text-primary">{fmtBtc(h.btcAmount)}</td>
                      <td className="num px-4 py-3 font-mono-tk text-xs">${fmtUsdt(h.avgCostUsdt, 0)}</td>
                      <td className="num px-4 py-3 font-mono-tk text-xs">${fmtUsdt(h.btcPriceNow, 0)}</td>
                      <td className="num px-4 py-3 font-mono-tk text-xs">${fmtUsdt(h.btcAmount * h.btcPriceNow)}</td>
                      <td className={cn("num px-4 py-3 font-mono-tk text-sm font-bold", pnlColor(upnl))}>
                        {upnl >= 0 ? "+" : ""}{fmtUsdt(upnl)} ({upct >= 0 ? "+" : ""}{upct.toFixed(1)}%)
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{h.notes || "—"}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 rounded-none border border-transparent text-muted-foreground opacity-50 transition-opacity hover:border-loss/40 hover:bg-loss/10 hover:text-loss group-hover:opacity-100"
                          onClick={() => deleteHolding.mutate(h.id)}
                          disabled={deleteHolding.isPending}
                          data-testid={`button-delete-holding-${h.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
