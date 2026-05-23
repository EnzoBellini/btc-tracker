import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertGoalSchema, type Goal } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Plus, Trash2, Target, CheckCircle2, Clock, XCircle, Pause, Edit2,
} from "lucide-react";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/useGoals";
import { fmtUsdt, daysUntil } from "@/lib/format";
import { TerminalButton, StatPill, CornerMarks } from "@/components/tk";
import { cn } from "@/lib/utils";

// ── Schema ────────────────────────────────────────────────────────────────────
const formSchema = insertGoalSchema.extend({
  targetAmount:  z.coerce.number().positive("Defina um valor alvo"),
  currentAmount: z.coerce.number().default(0),
  startDate:     z.string().min(1, "Data obrigatória"),
  endDate:       z.string().min(1, "Data obrigatória"),
});
type FormValues = z.infer<typeof formSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────
function periodLabel(period: string) {
  return { daily: "DIÁRIO", weekly: "SEMANAL", monthly: "MENSAL", custom: "CUSTOM" }[period] ?? period.toUpperCase();
}

function getDefaultEndDate(period: string) {
  const d = new Date();
  if (period === "daily")        d.setDate(d.getDate() + 1);
  else if (period === "weekly")  d.setDate(d.getDate() + 7);
  else if (period === "monthly") d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
}

function statusInfo(status: string) {
  const map: Record<string, { icon: typeof Clock; tone: "info" | "profit" | "loss" | "warn"; label: string }> = {
    active:    { icon: Clock,        tone: "info",   label: "ATIVO" },
    completed: { icon: CheckCircle2, tone: "profit", label: "CONCLUÍDO" },
    failed:    { icon: XCircle,      tone: "loss",   label: "FALHOU" },
    paused:    { icon: Pause,        tone: "warn",   label: "PAUSADO" },
  };
  return map[status] ?? map.active;
}

// ── Goal Form ─────────────────────────────────────────────────────────────────
function GoalForm({ onClose, initial }: { onClose: () => void; initial?: Goal }) {
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const today = new Date().toISOString().split("T")[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial ? { ...initial, notes: initial.notes ?? "" } : {
      title: "", targetAmount: undefined as any, currentAmount: 0,
      period: "weekly", startDate: today, endDate: getDefaultEndDate("weekly"),
      status: "active", notes: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    const op = initial
      ? updateGoal.mutateAsync({ id: initial.id, data })
      : createGoal.mutateAsync(data as any);
    op.then(() => onClose()).catch(() => {});
  };

  const isPending = createGoal.isPending || updateGoal.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Título do plano</FormLabel>
            <FormControl><Input {...field} placeholder="Ex: Ganhar 10 USDT essa semana" data-testid="input-goal-title" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="targetAmount" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Meta (USDT)</FormLabel>
              <FormControl><Input type="number" step="any" {...field} placeholder="10.00" className="font-mono-tk num" data-testid="input-goal-target" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="currentAmount" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Progresso atual (USDT)</FormLabel>
              <FormControl><Input type="number" step="any" {...field} placeholder="0.00" className="font-mono-tk num" data-testid="input-goal-current" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="period" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Período</FormLabel>
            <Select onValueChange={v => { field.onChange(v); form.setValue("endDate", getDefaultEndDate(v)); }} defaultValue={field.value}>
              <FormControl><SelectTrigger data-testid="select-goal-period"><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="startDate" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Início</FormLabel>
              <FormControl><Input type="date" {...field} data-testid="input-goal-start" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="endDate" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Fim</FormLabel>
              <FormControl><Input type="date" {...field} data-testid="input-goal-end" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger data-testid="select-goal-status"><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mono-tk text-[10px] uppercase tracking-[0.22em]">Notas</FormLabel>
            <FormControl><Input {...field as any} placeholder="Contexto, estratégia..." data-testid="input-goal-notes" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2 pt-2">
          <TerminalButton type="button" variant="outline" onClick={onClose}>Cancelar</TerminalButton>
          <TerminalButton type="submit" disabled={isPending} data-testid="button-save-goal">
            {isPending ? "Salvando…" : "Salvar meta"}
          </TerminalButton>
        </div>
      </form>
    </Form>
  );
}

// ── Goal Card ─────────────────────────────────────────────────────────────────
function GoalCard({ goal, onEdit, index }: { goal: Goal; onEdit: (g: Goal) => void; index: number }) {
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const pct       = Math.min(100, goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const days      = daysUntil(goal.endDate);
  const info      = statusInfo(goal.status);

  const isOverdue   = days < 0 && goal.status === "active";
  const isCompleted = goal.status === "completed" || pct >= 100;

  const barColor = pct >= 100 ? "hsl(var(--profit))" : pct >= 75 ? "hsl(var(--neutral))" : "hsl(var(--primary))";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={cn(
          "relative border bg-card p-5 transition-colors",
          isCompleted ? "border-profit/40" : isOverdue ? "border-loss/40" : "border-border",
        )}
      >
        <CornerMarks orange={isCompleted} />

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="font-mono-tk text-[10px] tracking-[0.28em] text-primary/70">
              {String(index).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="font-display text-base font-bold leading-tight tracking-tight text-foreground sm:text-lg">
                {goal.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatPill tone={info.tone}>{info.label}</StatPill>
                <span className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  {periodLabel(goal.period)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 rounded-none border border-transparent text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              onClick={() => onEdit(goal)}
              data-testid={`button-edit-goal-${goal.id}`}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 rounded-none border border-transparent text-muted-foreground hover:border-loss/40 hover:bg-loss/10 hover:text-loss"
              onClick={() => deleteGoal.mutate(goal.id)}
              disabled={deleteGoal.isPending}
              data-testid={`button-delete-goal-${goal.id}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5 space-y-2">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className={cn(
                "num font-display text-3xl font-bold leading-none tracking-tight sm:text-4xl",
                isCompleted ? "text-profit" : "text-foreground",
              )}>
                {fmtUsdt(goal.currentAmount)}
              </p>
              <p className="num font-mono-tk mt-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                / {fmtUsdt(goal.targetAmount)} USDT
              </p>
            </div>
            <span className={cn(
              "num font-mono-tk text-xl font-bold",
              pct >= 100 ? "text-profit" : pct >= 75 ? "text-[hsl(var(--neutral))]" : "text-primary",
            )}>
              {pct.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden bg-muted">
            <motion.div
              className="h-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ background: barColor }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-border border border-border bg-background">
          <div className="p-2.5 text-center">
            <p className="font-mono-tk text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Falta</p>
            <p className={cn(
              "num font-mono-tk mt-1 text-xs font-bold",
              remaining === 0 ? "text-profit" : "text-foreground",
            )}>
              {remaining === 0 ? "✓ META" : `${fmtUsdt(remaining)}`}
            </p>
          </div>
          <div className="p-2.5 text-center">
            <p className="font-mono-tk text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Dias</p>
            <p className={cn(
              "num font-mono-tk mt-1 text-xs font-bold",
              days < 0 ? "text-loss" : days <= 2 ? "text-[hsl(var(--neutral))]" : "text-foreground",
            )}>
              {days < 0 ? `${Math.abs(days)}d atrás` : days === 0 ? "HOJE" : `${days}d`}
            </p>
          </div>
          <div className="p-2.5 text-center">
            <p className="font-mono-tk text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Por dia</p>
            <p className="num font-mono-tk mt-1 text-xs font-bold text-foreground">
              {days > 0 && remaining > 0 ? `${fmtUsdt(remaining / days)}` : "—"}
            </p>
          </div>
        </div>

        {/* Quick update */}
        {goal.status === "active" && (
          <div className="mt-4 flex items-center gap-3 border-t border-border pt-3 font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="text-primary">$</span>
            <span className="shrink-0">update progress:</span>
            <Input
              type="number"
              step="any"
              defaultValue={goal.currentAmount}
              className="h-7 w-24 font-mono-tk num text-xs"
              onBlur={e => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val !== goal.currentAmount) {
                  const newStatus = val >= goal.targetAmount ? "completed" : "active";
                  updateGoal.mutate({ id: goal.id, data: { currentAmount: val, status: newStatus } });
                }
              }}
              data-testid={`input-goal-progress-${goal.id}`}
            />
            <span>USDT</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PlanTracker() {
  const [open, setOpen]         = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const { data: goals = [] }    = useGoals();

  const activeGoals = goals.filter(g => g.status === "active");
  const pastGoals   = goals.filter(g => g.status !== "active");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-primary/40 bg-primary/[0.06]">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-display text-base font-bold tracking-tight">Plan tracker</p>
            <p className="font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {goals.length} metas · {activeGoals.length} ativas
            </p>
          </div>
        </div>
        <Dialog open={open || !!editGoal} onOpenChange={v => { setOpen(v); if (!v) setEditGoal(null); }}>
          <DialogTrigger asChild>
            <button
              onClick={() => setOpen(true)}
              data-testid="button-add-goal"
              className="inline-flex items-center gap-1.5 border border-white/15 px-3 py-1.5 font-mono-tk text-[10px] font-bold uppercase tracking-[0.22em] text-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              <Plus className="h-3 w-3" /> nova meta
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">{editGoal ? "Editar meta" : "Criar meta"}</DialogTitle>
            </DialogHeader>
            <GoalForm onClose={() => { setOpen(false); setEditGoal(null); }} initial={editGoal ?? undefined} />
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <div className="relative border border-dashed border-border bg-card p-8 text-center">
          <Target className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-40" />
          <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground/60">[no goals]</p>
          <p className="mt-2 text-sm text-muted-foreground">Crie sua primeira meta clicando em "Nova meta"</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {activeGoals.map((g, i) => <GoalCard key={g.id} goal={g} onEdit={setEditGoal} index={i + 1} />)}
          </AnimatePresence>

          {pastGoals.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                ↳ histórico · {pastGoals.length}
              </p>
              <AnimatePresence mode="popLayout">
                {pastGoals.map((g, i) => <GoalCard key={g.id} goal={g} onEdit={setEditGoal} index={activeGoals.length + i + 1} />)}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
