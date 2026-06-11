import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTransferSchema } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTransfers, useCreateTransfer, useDeleteTransfer } from "@/hooks/useTransfers";
import { fmtUsdt, fmtBtc } from "@/lib/format";
import {
  PageHeader, KpiTerminal, TerminalFrame, TerminalButton,
} from "@/components/tk";
import { useAppLocale } from "@/lib/locale-context";

const formSchema = insertTransferSchema.extend({
  amountUsdt: z.coerce.number().positive("Valor obrigatório"),
  btcPrice:   z.coerce.number().positive("Preço obrigatório"),
  btcBought:  z.coerce.number().positive("BTC comprado obrigatório"),
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

function TransferForm({ onClose }: { onClose: () => void }) {
  const createTransfer = useCreateTransfer();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      amountUsdt: undefined as any,
      btcPrice:   undefined as any,
      btcBought:  undefined as any,
      notes: "",
    },
  });

  const amountUsdt = form.watch("amountUsdt");
  const btcPrice   = form.watch("btcPrice");
  if (amountUsdt && btcPrice && amountUsdt > 0 && btcPrice > 0) {
    const calc    = amountUsdt / btcPrice;
    const current = form.getValues("btcBought");
    if (Math.abs(calc - current) > 0.0000001) form.setValue("btcBought", parseFloat(calc.toFixed(8)));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(d => createTransfer.mutateAsync(d).then(() => onClose()).catch(() => {}))} className="space-y-4">
        <FormField control={form.control} name="date" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Data</FormLabel>
            <FormControl><Input type="date" {...field} data-testid="input-transfer-date" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="amountUsdt" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">USDT transferido</FormLabel>
              <FormControl><Input type="number" step="any" {...field} placeholder="10.00" className="font-mono-tk num" data-testid="input-transfer-amount" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="btcPrice" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Preço BTC (USDT)</FormLabel>
              <FormControl><Input type="number" step="any" {...field} placeholder="85000" className="font-mono-tk num" data-testid="input-btc-price" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="btcBought" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">BTC comprado (calculado)</FormLabel>
            <FormControl><Input type="number" step="any" {...field} className="font-mono-tk num text-primary font-bold" data-testid="input-btc-bought" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Notas</FormLabel>
            <FormControl><Input {...field as any} placeholder="Observações..." data-testid="input-transfer-notes" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2 pt-2">
          <TerminalButton type="button" variant="outline" onClick={onClose}>Cancelar</TerminalButton>
          <TerminalButton type="submit" disabled={createTransfer.isPending} data-testid="button-save-transfer">
            {createTransfer.isPending ? "Salvando…" : "Salvar"}
          </TerminalButton>
        </div>
      </form>
    </Form>
  );
}

export default function Transfers() {
  const { t } = useAppLocale();
  const [open, setOpen] = useState(false);
  const { data: transfers = [], isLoading } = useTransfers();
  const deleteTransfer = useDeleteTransfer();

  const { chartData, totalBtc, totalUsdt } = useMemo(() => {
    const sorted = [...transfers].reverse();
    const chart = sorted.reduce<{ date: string; cumBtc: number }[]>((acc, t, i) => {
      const prev = acc[i - 1]?.cumBtc ?? 0;
      acc.push({ date: t.date, cumBtc: parseFloat((prev + t.btcBought).toFixed(8)) });
      return acc;
    }, []);
    return {
      chartData:  chart,
      totalBtc:   transfers.reduce((s, t) => s + t.btcBought, 0),
      totalUsdt:  transfers.reduce((s, t) => s + t.amountUsdt, 0),
    };
  }, [transfers]);

  return (
    <div className="relative space-y-10 p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-50" aria-hidden />

      <div className="relative space-y-10">
        <PageHeader
          index="03"
          total="09"
          eyebrow={t.transfers.eyebrow}
          title={t.transfers.title}
          subtitle={t.transfers.subtitle}
          actions={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button
                  data-testid="button-add-transfer"
                  className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2.5 font-mono-tk text-[11px] font-bold uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-transparent hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" /> nova transferência
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle className="font-display text-xl">Registrar transferência</DialogTitle></DialogHeader>
                <TransferForm onClose={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          }
        />

        {/* Summary KPIs */}
        <section className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 [&>*]:bg-background">
          <KpiTerminal
            label="TOTAL USDT CONVERTIDO"
            index="01"
            value={`${fmtUsdt(totalUsdt)}`}
            tone="orange"
            caption="USDT → BTC"
          />
          <KpiTerminal
            label="TOTAL BTC ADQUIRIDO"
            index="02"
            value={fmtBtc(totalBtc)}
            tone="orange"
            caption="acumulado · spot"
          />
        </section>

        {/* Chart */}
        {chartData.length > 0 && (
          <section>
            <TerminalFrame title={t.transfers.chartBtcOverTime} status="live" statusTone="live" orangeCorners>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} width={80} tickFormatter={v => `${v.toFixed(6)}`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.3 }} />
                    <Area type="monotone" dataKey="cumBtc" name="BTC Acum." stroke="hsl(var(--primary))" fill="url(#btcGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TerminalFrame>
          </section>
        )}

        {/* Table */}
        <section className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            <span>{t.transfers.tableTransfers}</span>
            <span>{t.transfers.tableRows(transfers.length)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["#", "Data", "USDT Transferido", "Preço BTC", "BTC Comprado", "Notas", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono-tk text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-border/60">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-3 w-16 animate-pulse bg-muted" /></td>
                      ))}
                    </tr>
                  ))
                ) : transfers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground/50">[empty]</p>
                      <p className="mt-2 text-sm text-muted-foreground">{t.transfers.emptyTransfers}</p>
                    </td>
                  </tr>
                ) : transfers.map((t, idx) => (
                  <tr key={t.id} className="group border-b border-border/40 transition-colors hover:bg-white/[0.02]" data-testid={`row-transfer-${t.id}`}>
                    <td className="px-4 py-3 font-mono-tk text-[10px] tracking-[0.18em] text-muted-foreground/60">{String(idx + 1).padStart(3, "0")}</td>
                    <td className="num px-4 py-3 font-mono-tk text-xs text-muted-foreground">{t.date}</td>
                    <td className="num px-4 py-3 font-mono-tk text-sm font-bold text-primary">{fmtUsdt(t.amountUsdt)} USDT</td>
                    <td className="num px-4 py-3 font-mono-tk text-xs">${fmtUsdt(t.btcPrice, 0)}</td>
                    <td className="num px-4 py-3 font-mono-tk text-sm font-bold text-primary">{fmtBtc(t.btcBought)} BTC</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.notes || "—"}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 rounded-none border border-transparent text-muted-foreground opacity-50 transition-opacity hover:border-loss/40 hover:bg-loss/10 hover:text-loss group-hover:opacity-100"
                        onClick={() => deleteTransfer.mutate(t.id)}
                        disabled={deleteTransfer.isPending}
                        data-testid={`button-delete-transfer-${t.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
