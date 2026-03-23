import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTradeSchema, type Trade } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Edit2, Search, X, RefreshCw } from "lucide-react";
import { useTrades, useCreateTrade, useUpdateTrade, useDeleteTrade, useSyncTradesFromMexc } from "@/hooks/useTrades";
import { useUIStore } from "@/store/ui";
import { fmtUsdt, fmtDate, pnlColor } from "@/lib/format";
import { cn } from "@/lib/utils";

// ── Schema ────────────────────────────────────────────────────────────────────
const tradeFormSchema = insertTradeSchema.extend({
  entryPrice:   z.coerce.number().positive(),
  stopPrice:    z.coerce.number().positive(),
  targetPrice:  z.coerce.number().positive(),
  exitPrice:    z.coerce.number().positive().optional().or(z.literal("")),
  positionSize: z.coerce.number().positive(),
  pnl:          z.coerce.number().optional().or(z.literal("")),
});
type TradeFormValues = z.infer<typeof tradeFormSchema>;

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN:      "bg-blue-500/15 text-blue-400 border-0",
    WIN:       "bg-profit/15 text-profit border-0",
    LOSS:      "bg-loss/15 text-loss border-0",
    BREAKEVEN: "bg-muted text-muted-foreground border-0",
  };
  const labels: Record<string, string> = { OPEN: "Aberto", WIN: "Win", LOSS: "Loss", BREAKEVEN: "B/E" };
  return <Badge className={map[status] ?? ""}>{labels[status] ?? status}</Badge>;
}

// ── Trade form ────────────────────────────────────────────────────────────────
function TradeForm({ onClose, initial }: { onClose: () => void; initial?: Trade }) {
  const createTrade = useCreateTrade();
  const updateTrade = useUpdateTrade();

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: initial ? {
      ...initial,
      exitPrice: initial.exitPrice ?? undefined,
      pnl: initial.pnl ?? undefined,
      notes: initial.notes ?? "",
    } : {
      date: new Date().toISOString().split("T")[0],
      pair: "BTCUSDT",
      direction: "LONG",
      entryPrice: undefined as any,
      stopPrice: undefined as any,
      targetPrice: undefined as any,
      positionSize: 33.33,
      leverage: 3,
      status: "OPEN",
      notes: "",
    },
  });

  const onSubmit = (data: TradeFormValues) => {
    const payload = { ...data, exitPrice: data.exitPrice || undefined, pnl: data.pnl || undefined };
    const mutation = initial
      ? updateTrade.mutateAsync({ id: initial.id, data: payload })
      : createTrade.mutateAsync(payload as any);
    mutation.then(() => onClose()).catch(() => {});
  };

  const isPending = createTrade.isPending || updateTrade.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl><Input type="date" {...field} data-testid="input-trade-date" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="pair" render={({ field }) => (
            <FormItem>
              <FormLabel>Par</FormLabel>
              <FormControl><Input {...field} placeholder="BTCUSDT" data-testid="input-trade-pair" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="direction" render={({ field }) => (
            <FormItem>
              <FormLabel>Direção</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger data-testid="select-direction"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="LONG">LONG</SelectItem>
                  <SelectItem value="SHORT">SHORT</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="OPEN">Aberto</SelectItem>
                  <SelectItem value="WIN">Win</SelectItem>
                  <SelectItem value="LOSS">Loss</SelectItem>
                  <SelectItem value="BREAKEVEN">Breakeven</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(["entryPrice", "stopPrice", "targetPrice"] as const).map(name => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <FormLabel>{name === "entryPrice" ? "Entrada" : name === "stopPrice" ? "Stop" : "Alvo"}</FormLabel>
                <FormControl><Input type="number" step="any" {...field} data-testid={`input-${name}`} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FormField control={form.control} name="exitPrice" render={({ field }) => (
            <FormItem>
              <FormLabel>Saída</FormLabel>
              <FormControl><Input type="number" step="any" {...field as any} placeholder="—" data-testid="input-exitPrice" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="positionSize" render={({ field }) => (
            <FormItem>
              <FormLabel>Posição (USDT)</FormLabel>
              <FormControl><Input type="number" step="any" {...field} data-testid="input-positionSize" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="pnl" render={({ field }) => (
            <FormItem>
              <FormLabel>PnL (USDT)</FormLabel>
              <FormControl><Input type="number" step="any" {...field as any} placeholder="—" data-testid="input-pnl" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notas</FormLabel>
            <FormControl><Input {...field as any} placeholder="Observações..." data-testid="input-notes" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isPending} data-testid="button-save-trade">
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Trades() {
  const [open, setOpen]           = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);

  // Zustand filter state
  const { tradesFilter, setTradesFilter, resetTradesFilter } = useUIStore();

  const { data: trades = [], isLoading } = useTrades();
  const deleteTrade = useDeleteTrade();
  const syncFromMexc = useSyncTradesFromMexc();

  // Filtered trades (client-side), ordenados por data (mais recente primeiro)
  const filtered = [...trades]
    .filter(t => {
    if (tradesFilter.status !== "all" && t.status !== tradesFilter.status) return false;
    if (tradesFilter.direction !== "all" && t.direction !== tradesFilter.direction) return false;
    if (tradesFilter.search && !t.pair.toLowerCase().includes(tradesFilter.search.toLowerCase()) &&
        !(t.notes ?? "").toLowerCase().includes(tradesFilter.search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const d = b.date.localeCompare(a.date);
      return d !== 0 ? d : (b.id - a.id);
    });

  const hasActiveFilter = tradesFilter.status !== "all" || tradesFilter.direction !== "all" || tradesFilter.search !== "";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">Trades</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Registro de operações de futuros</p>
        </div>
        <Button
          variant="outline"
          onClick={() => syncFromMexc.mutate()}
          disabled={syncFromMexc.isPending}
          className="gap-2"
          title="Buscar trades de futuros da MEXC"
        >
          <RefreshCw className={cn("w-4 h-4", syncFromMexc.isPending && "animate-spin")} />
          {syncFromMexc.isPending ? "Sincronizando..." : "Sincronizar MEXC"}
        </Button>
        <Dialog open={open || !!editTrade} onOpenChange={v => { setOpen(v); if (!v) setEditTrade(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)} data-testid="button-add-trade" className="gap-2">
              <Plus className="w-4 h-4" /> Novo Trade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editTrade ? "Editar Trade" : "Registrar Trade"}</DialogTitle>
            </DialogHeader>
            <TradeForm onClose={() => { setOpen(false); setEditTrade(null); }} initial={editTrade ?? undefined} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar par ou notas..."
            className="pl-8 h-8 text-sm w-48"
            value={tradesFilter.search}
            onChange={e => setTradesFilter({ search: e.target.value })}
            data-testid="input-filter-search"
          />
        </div>
        <Select value={tradesFilter.status} onValueChange={v => setTradesFilter({ status: v })}>
          <SelectTrigger className="h-8 w-32 text-sm" data-testid="select-filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="OPEN">Aberto</SelectItem>
            <SelectItem value="WIN">Win</SelectItem>
            <SelectItem value="LOSS">Loss</SelectItem>
            <SelectItem value="BREAKEVEN">B/E</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tradesFilter.direction} onValueChange={v => setTradesFilter({ direction: v })}>
          <SelectTrigger className="h-8 w-32 text-sm" data-testid="select-filter-direction">
            <SelectValue placeholder="Direção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="LONG">LONG</SelectItem>
            <SelectItem value="SHORT">SHORT</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilter && (
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={resetTradesFilter}>
            <X className="w-3.5 h-3.5" /> Limpar
          </Button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} de {trades.length} trade{trades.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Data", "Par", "Dir.", "Entrada", "Stop", "Alvo", "Saída", "Tamanho", "PnL", "Status", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {[...Array(11)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse w-16" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">
                      {trades.length === 0 ? "Nenhum trade registrado ainda" : "Nenhum trade encontrado com os filtros atuais"}
                    </td>
                  </tr>
                ) : filtered.map(t => (
                  <tr key={t.id} className="border-b border-border hover:bg-muted/30 transition-colors" data-testid={`row-trade-${t.id}`}>
                    <td className="px-4 py-3 tabular text-muted-foreground whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-3 font-medium">{t.pair}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn("border-0 text-xs", t.direction === "LONG" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss")}>
                        {t.direction}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular">{fmtUsdt(t.entryPrice)}</td>
                    <td className="px-4 py-3 tabular text-loss">{fmtUsdt(t.stopPrice)}</td>
                    <td className="px-4 py-3 tabular text-profit">{fmtUsdt(t.targetPrice)}</td>
                    <td className="px-4 py-3 tabular">{t.exitPrice ? fmtUsdt(t.exitPrice) : "—"}</td>
                    <td className="px-4 py-3 tabular">{fmtUsdt(t.positionSize)} USDT</td>
                    <td className={cn("px-4 py-3 tabular font-medium", pnlColor(t.pnl ?? 0))}>
                      {t.pnl != null ? `${t.pnl > 0 ? "+" : ""}${fmtUsdt(t.pnl)}` : "—"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setEditTrade(t)} data-testid={`button-edit-trade-${t.id}`}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="w-7 h-7 text-loss"
                          onClick={() => deleteTrade.mutate(t.id)}
                          disabled={deleteTrade.isPending}
                          data-testid={`button-delete-trade-${t.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
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
