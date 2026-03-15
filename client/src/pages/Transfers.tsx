import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTransferSchema } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTransfers, useCreateTransfer, useDeleteTransfer } from "@/hooks/useTransfers";
import { fmtUsdt, fmtBtc } from "@/lib/format";

const formSchema = insertTransferSchema.extend({
  amountUsdt: z.coerce.number().positive("Valor obrigatório"),
  btcPrice:   z.coerce.number().positive("Preço obrigatório"),
  btcBought:  z.coerce.number().positive("BTC comprado obrigatório"),
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

  // Auto-calculate btcBought
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
            <FormLabel>Data</FormLabel>
            <FormControl><Input type="date" {...field} data-testid="input-transfer-date" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="amountUsdt" render={({ field }) => (
            <FormItem>
              <FormLabel>USDT Transferido</FormLabel>
              <FormControl><Input type="number" step="any" {...field} placeholder="10.00" data-testid="input-transfer-amount" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="btcPrice" render={({ field }) => (
            <FormItem>
              <FormLabel>Preço BTC (USDT)</FormLabel>
              <FormControl><Input type="number" step="any" {...field} placeholder="85000" data-testid="input-btc-price" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="btcBought" render={({ field }) => (
          <FormItem>
            <FormLabel>BTC Comprado (calculado)</FormLabel>
            <FormControl><Input type="number" step="any" {...field} data-testid="input-btc-bought" className="text-primary font-medium" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notas</FormLabel>
            <FormControl><Input {...field as any} placeholder="Observações..." data-testid="input-transfer-notes" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={createTransfer.isPending} data-testid="button-save-transfer">
            {createTransfer.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Transfers() {
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">Transferências</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Futuros → BTC Spot (regra: a cada +10 USDT de lucro)</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-transfer" className="gap-2">
              <Plus className="w-4 h-4" /> Nova Transferência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Registrar Transferência</DialogTitle></DialogHeader>
            <TransferForm onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total USDT Convertido</p>
            <p className="text-2xl font-bold text-primary tabular mt-1">{fmtUsdt(totalUsdt)} USDT</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total BTC Adquirido</p>
            <p className="text-2xl font-bold text-primary tabular mt-1">{fmtBtc(totalBtc)} BTC</p>
          </CardContent>
        </Card>
      </div>

      {/* BTC accumulation chart */}
      {chartData.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">BTC Acumulado ao Longo do Tempo</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(27,100%,55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(27,100%,55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "hsl(220,8%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(220,8%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} tickFormatter={v => `${v.toFixed(6)}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cumBtc" name="BTC Acum." stroke="hsl(27,100%,55%)" fill="url(#btcGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Data", "USDT Transferido", "Preço BTC", "BTC Comprado", "Notas", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : transfers.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Nenhuma transferência registrada</td></tr>
                ) : transfers.map(t => (
                  <tr key={t.id} className="border-b border-border hover:bg-muted/30 transition-colors" data-testid={`row-transfer-${t.id}`}>
                    <td className="px-4 py-3 tabular text-muted-foreground">{t.date}</td>
                    <td className="px-4 py-3 tabular text-primary font-medium">{fmtUsdt(t.amountUsdt)} USDT</td>
                    <td className="px-4 py-3 tabular">${fmtUsdt(t.btcPrice, 0)}</td>
                    <td className="px-4 py-3 tabular text-primary font-medium">{fmtBtc(t.btcBought)} BTC</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.notes || "—"}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-loss" onClick={() => deleteTransfer.mutate(t.id)} disabled={deleteTransfer.isPending} data-testid={`button-delete-transfer-${t.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
