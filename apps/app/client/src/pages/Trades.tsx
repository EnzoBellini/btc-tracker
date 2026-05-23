import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTradeSchema, type Trade } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Plus, Trash2, Edit2, Search, X, RefreshCw, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useTrades, useCreateTrade, useUpdateTrade, useDeleteTrade, useSyncTradesFromMexc } from "@/hooks/useTrades";
import { useUIStore } from "@/store/ui";
import { fmtUsdt, pnlColor } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PageHeader, TerminalButton, StatPill } from "@/components/tk";
import { Button } from "@/components/ui/button";

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
function StatusCell({ status }: { status: string }) {
  const map: Record<string, { tone: "info" | "profit" | "loss" | "neutral"; label: string }> = {
    OPEN: { tone: "info", label: "OPEN" },
    WIN: { tone: "profit", label: "WIN" },
    LOSS: { tone: "loss", label: "LOSS" },
    BREAKEVEN: { tone: "neutral", label: "B/E" },
  };
  const cfg = map[status] ?? { tone: "neutral" as const, label: status };
  return <StatPill tone={cfg.tone} pulse={status === "OPEN"}>{cfg.label}</StatPill>;
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
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Data</FormLabel>
              <FormControl><Input type="date" {...field} data-testid="input-trade-date" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="pair" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Par</FormLabel>
              <FormControl><Input {...field} placeholder="BTCUSDT" data-testid="input-trade-pair" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="direction" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Direção</FormLabel>
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
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Status</FormLabel>
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
                <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">
                  {name === "entryPrice" ? "Entrada" : name === "stopPrice" ? "Stop" : "Alvo"}
                </FormLabel>
                <FormControl><Input type="number" step="any" {...field} className="font-mono-tk num" data-testid={`input-${name}`} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FormField control={form.control} name="exitPrice" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Saída</FormLabel>
              <FormControl><Input type="number" step="any" {...field as any} placeholder="—" className="font-mono-tk num" data-testid="input-exitPrice" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="positionSize" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Posição (USDT)</FormLabel>
              <FormControl><Input type="number" step="any" {...field} className="font-mono-tk num" data-testid="input-positionSize" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="pnl" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">PnL (USDT)</FormLabel>
              <FormControl><Input type="number" step="any" {...field as any} placeholder="—" className="font-mono-tk num" data-testid="input-pnl" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Notas</FormLabel>
            <FormControl><Input {...field as any} placeholder="Observações..." data-testid="input-notes" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2 pt-2">
          <TerminalButton type="button" variant="outline" onClick={onClose}>Cancelar</TerminalButton>
          <TerminalButton type="submit" disabled={isPending} data-testid="button-save-trade">
            {isPending ? "Salvando…" : "Salvar"}
          </TerminalButton>
        </div>
      </form>
    </Form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Trades() {
  const [open, setOpen] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);

  const { tradesFilter, setTradesFilter, resetTradesFilter } = useUIStore();
  const { data: trades = [], isLoading } = useTrades();
  const deleteTrade = useDeleteTrade();
  const syncFromMexc = useSyncTradesFromMexc();

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
    <div className="relative space-y-8 p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-50" aria-hidden />

      <div className="relative space-y-8">
        {/* HEADER */}
        <PageHeader
          index="02"
          total="08"
          eyebrow="Trades · execution log"
          title="Registro de operações."
          subtitle="Tudo que foi executado — manual ou via sync da exchange."
          actions={
            <>
              <TerminalButton
                variant="outline"
                icon={RefreshCw}
                onClick={() => syncFromMexc.mutate()}
                disabled={syncFromMexc.isPending}
                className={cn(syncFromMexc.isPending && "[&_svg]:animate-spin")}
              >
                {syncFromMexc.isPending ? "syncing…" : "sync mexc"}
              </TerminalButton>
              <Dialog open={open || !!editTrade} onOpenChange={v => { setOpen(v); if (!v) setEditTrade(null); }}>
                <DialogTrigger asChild>
                  <button
                    onClick={() => setOpen(true)}
                    data-testid="button-add-trade"
                    className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2.5 font-mono-tk text-[11px] font-bold uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-transparent hover:text-primary"
                  >
                    <Plus className="h-3.5 w-3.5" /> novo trade
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">
                      {editTrade ? "Editar Trade" : "Registrar Trade"}
                    </DialogTitle>
                  </DialogHeader>
                  <TradeForm onClose={() => { setOpen(false); setEditTrade(null); }} initial={editTrade ?? undefined} />
                </DialogContent>
              </Dialog>
            </>
          }
        />

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-3 border border-border bg-card px-4 py-3">
          <span className="hidden font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground sm:inline">
            <span className="text-primary">↳</span> filter
          </span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar par ou notas..."
              className="h-8 w-48 pl-8 font-mono-tk text-xs"
              value={tradesFilter.search}
              onChange={e => setTradesFilter({ search: e.target.value })}
              data-testid="input-filter-search"
            />
          </div>
          <Select value={tradesFilter.status} onValueChange={v => setTradesFilter({ status: v })}>
            <SelectTrigger className="h-8 w-32 font-mono-tk text-xs uppercase tracking-[0.18em]" data-testid="select-filter-status">
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
            <SelectTrigger className="h-8 w-32 font-mono-tk text-xs uppercase tracking-[0.18em]" data-testid="select-filter-direction">
              <SelectValue placeholder="Direção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="LONG">LONG</SelectItem>
              <SelectItem value="SHORT">SHORT</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilter && (
            <button
              onClick={resetTradesFilter}
              className="inline-flex h-8 items-center gap-1 border border-white/10 px-2 font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition hover:border-white/30 hover:text-foreground"
            >
              <X className="h-3 w-3" /> clear
            </button>
          )}
          <span className="ml-auto font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="text-foreground num">{filtered.length}</span> / <span className="num">{trades.length}</span> trades
          </span>
        </div>

        {/* TABLE — Bloomberg style */}
        <div className="border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    { k: "#",       w: "w-12" },
                    { k: "Data",    w: "" },
                    { k: "Par",     w: "" },
                    { k: "Dir.",    w: "" },
                    { k: "Entrada", w: "" },
                    { k: "Stop",    w: "" },
                    { k: "Alvo",    w: "" },
                    { k: "Saída",   w: "" },
                    { k: "Tamanho", w: "" },
                    { k: "PnL",     w: "" },
                    { k: "Status",  w: "" },
                    { k: "",        w: "w-20" },
                  ].map(({ k, w }) => (
                    <th
                      key={k}
                      className={cn(
                        "px-4 py-3 text-left font-mono-tk text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground whitespace-nowrap",
                        w,
                      )}
                    >
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-border/60">
                      {[...Array(12)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-3 w-16 animate-pulse bg-muted" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-16 text-center">
                      <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground/50">[empty]</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {trades.length === 0 ? "Nenhum trade registrado ainda" : "Nenhum trade com os filtros atuais"}
                      </p>
                    </td>
                  </tr>
                ) : filtered.map((t, idx) => (
                  <tr key={t.id} className="group border-b border-border/40 transition-colors hover:bg-white/[0.02]" data-testid={`row-trade-${t.id}`}>
                    <td className="px-4 py-3 font-mono-tk text-[10px] tracking-[0.18em] text-muted-foreground/60">
                      {String(idx + 1).padStart(3, "0")}
                    </td>
                    <td className="num px-4 py-3 font-mono-tk text-xs text-muted-foreground whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-3 font-mono-tk text-sm font-bold tracking-wide text-foreground">{t.pair}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 font-mono-tk text-[11px] font-bold uppercase tracking-[0.22em]",
                          t.direction === "LONG" ? "text-profit" : "text-loss",
                        )}
                      >
                        {t.direction === "LONG" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {t.direction}
                      </span>
                    </td>
                    <td className="num px-4 py-3 font-mono-tk text-xs">{fmtUsdt(t.entryPrice)}</td>
                    <td className="num px-4 py-3 font-mono-tk text-xs text-loss">{fmtUsdt(t.stopPrice)}</td>
                    <td className="num px-4 py-3 font-mono-tk text-xs text-profit">{fmtUsdt(t.targetPrice)}</td>
                    <td className="num px-4 py-3 font-mono-tk text-xs">{t.exitPrice ? fmtUsdt(t.exitPrice) : "—"}</td>
                    <td className="num px-4 py-3 font-mono-tk text-xs text-muted-foreground">{fmtUsdt(t.positionSize)}</td>
                    <td className={cn("num px-4 py-3 font-mono-tk text-sm font-bold", pnlColor(t.pnl ?? 0))}>
                      {t.pnl != null ? `${t.pnl > 0 ? "+" : ""}${fmtUsdt(t.pnl)}` : "—"}
                    </td>
                    <td className="px-4 py-3"><StatusCell status={t.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-50 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 rounded-none border border-transparent text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                          onClick={() => setEditTrade(t)}
                          data-testid={`button-edit-trade-${t.id}`}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 rounded-none border border-transparent text-muted-foreground hover:border-loss/40 hover:bg-loss/10 hover:text-loss"
                          onClick={() => deleteTrade.mutate(t.id)}
                          disabled={deleteTrade.isPending}
                          data-testid={`button-delete-trade-${t.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4 font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          <span>↳ tabela · ordem: data DESC</span>
          <span><span className="text-foreground num">{filtered.length}</span> linhas</span>
        </div>
      </div>
    </div>
  );
}
