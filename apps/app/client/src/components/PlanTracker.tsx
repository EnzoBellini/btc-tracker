import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertGoalSchema, type Goal } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Plus, Trash2, Target, CheckCircle2,
  Clock, XCircle, Pause, Edit2, DollarSign,
} from "lucide-react";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/useGoals";
import { fmtUsdt, daysUntil } from "@/lib/format";

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
  return { daily: "Diário", weekly: "Semanal", monthly: "Mensal", custom: "Personalizado" }[period] ?? period;
}

function getDefaultEndDate(period: string) {
  const d = new Date();
  if (period === "daily")        d.setDate(d.getDate() + 1);
  else if (period === "weekly")  d.setDate(d.getDate() + 7);
  else if (period === "monthly") d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
}

function StatusIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle2 className="w-4 h-4 text-profit" />;
  if (status === "failed")    return <XCircle      className="w-4 h-4 text-loss"    />;
  if (status === "paused")    return <Pause        className="w-4 h-4 text-yellow-400" />;
  return <Clock className="w-4 h-4 text-primary" />;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active:    "bg-primary/15 text-primary border-0",
    completed: "bg-profit/15 text-profit border-0",
    failed:    "bg-loss/15 text-loss border-0",
    paused:    "bg-yellow-400/15 text-yellow-400 border-0",
  };
  const labels: Record<string, string> = { active: "Ativo", completed: "Concluído", failed: "Falhou", paused: "Pausado" };
  return { cls: map[status] ?? "", label: labels[status] ?? status };
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
            <FormLabel>Título do plano</FormLabel>
            <FormControl><Input {...field} placeholder="Ex: Ganhar 10 USDT essa semana" data-testid="input-goal-title" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="targetAmount" render={({ field }) => (
            <FormItem>
              <FormLabel>Meta (USDT)</FormLabel>
              <FormControl><Input type="number" step="any" {...field} placeholder="10.00" data-testid="input-goal-target" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="currentAmount" render={({ field }) => (
            <FormItem>
              <FormLabel>Progresso atual (USDT)</FormLabel>
              <FormControl><Input type="number" step="any" {...field} placeholder="0.00" data-testid="input-goal-current" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="period" render={({ field }) => (
          <FormItem>
            <FormLabel>Período</FormLabel>
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
              <FormLabel>Início</FormLabel>
              <FormControl><Input type="date" {...field} data-testid="input-goal-start" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="endDate" render={({ field }) => (
            <FormItem>
              <FormLabel>Fim</FormLabel>
              <FormControl><Input type="date" {...field} data-testid="input-goal-end" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
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
            <FormLabel>Notas</FormLabel>
            <FormControl><Input {...field as any} placeholder="Contexto, estratégia..." data-testid="input-goal-notes" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isPending} data-testid="button-save-goal">
            {isPending ? "Salvando..." : "Salvar Meta"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ── Goal Card ─────────────────────────────────────────────────────────────────
function GoalCard({ goal, onEdit }: { goal: Goal; onEdit: (g: Goal) => void }) {
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const pct       = Math.min(100, goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const days      = daysUntil(goal.endDate);
  const { cls, label } = statusBadge(goal.status);

  const isOverdue   = days < 0 && goal.status === "active";
  const isCompleted = goal.status === "completed" || pct >= 100;

  // Progress bar color
  const barColor = pct >= 100 ? "hsl(142,71%,45%)" : pct >= 75 ? "hsl(38,92%,50%)" : "hsl(27,100%,55%)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-card border-border transition-colors ${isCompleted ? "border-profit/30" : isOverdue ? "border-loss/30" : ""}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <StatusIcon status={goal.status} />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{goal.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className={`${cls} text-xs`}>{label}</Badge>
                  <span className="text-xs text-muted-foreground">{periodLabel(goal.period)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onEdit(goal)} data-testid={`button-edit-goal-${goal.id}`}>
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-7 h-7 text-loss" onClick={() => deleteGoal.mutate(goal.id)} disabled={deleteGoal.isPending} data-testid={`button-delete-goal-${goal.id}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex items-end justify-between">
              <div>
                <span className={`text-3xl font-bold tabular ${isCompleted ? "text-profit" : "text-foreground"}`}>
                  {fmtUsdt(goal.currentAmount)}
                </span>
                <span className="text-muted-foreground text-sm"> / {fmtUsdt(goal.targetAmount)} USDT</span>
              </div>
              <span className={`text-lg font-bold tabular ${pct >= 100 ? "text-profit" : pct >= 75 ? "text-yellow-400" : "text-muted-foreground"}`}>
                {pct.toFixed(1)}%
              </span>
            </div>
            {/* Animated progress bar */}
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ background: barColor }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-muted rounded p-2 text-center">
              <p className="text-muted-foreground mb-0.5">Falta</p>
              <p className={`font-semibold tabular ${remaining === 0 ? "text-profit" : "text-foreground"}`}>
                {remaining === 0 ? "✓ Meta!" : `${fmtUsdt(remaining)} USDT`}
              </p>
            </div>
            <div className="bg-muted rounded p-2 text-center">
              <p className="text-muted-foreground mb-0.5">Dias</p>
              <p className={`font-semibold tabular ${days < 0 ? "text-loss" : days <= 2 ? "text-yellow-400" : "text-foreground"}`}>
                {days < 0 ? `${Math.abs(days)}d atrás` : days === 0 ? "Hoje!" : `${days}d`}
              </p>
            </div>
            <div className="bg-muted rounded p-2 text-center">
              <p className="text-muted-foreground mb-0.5">Por dia</p>
              <p className="font-semibold tabular">
                {days > 0 && remaining > 0 ? `${fmtUsdt(remaining / days)} USDT` : "—"}
              </p>
            </div>
          </div>

          {/* Quick update */}
          {goal.status === "active" && (
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground flex-shrink-0">Atualizar progresso:</span>
              <Input
                type="number"
                step="any"
                defaultValue={goal.currentAmount}
                className="h-7 text-xs w-24"
                onBlur={e => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val !== goal.currentAmount) {
                    const newStatus = val >= goal.targetAmount ? "completed" : "active";
                    updateGoal.mutate({ id: goal.id, data: { currentAmount: val, status: newStatus } });
                  }
                }}
                data-testid={`input-goal-progress-${goal.id}`}
              />
              <span className="text-xs text-muted-foreground">USDT</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PlanTracker() {
  const [open, setOpen]           = useState(false);
  const [editGoal, setEditGoal]   = useState<Goal | null>(null);
  const { data: goals = [] }      = useGoals();

  const activeGoals = goals.filter(g => g.status === "active");
  const pastGoals   = goals.filter(g => g.status !== "active");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Plan Tracker</h2>
            <p className="text-xs text-muted-foreground">Defina metas e acompanhe seu progresso</p>
          </div>
        </div>
        <Dialog open={open || !!editGoal} onOpenChange={v => { setOpen(v); if (!v) setEditGoal(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5 text-xs h-8" data-testid="button-add-goal">
              <Plus className="w-3.5 h-3.5" /> Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editGoal ? "Editar Meta" : "Criar Meta"}</DialogTitle>
            </DialogHeader>
            <GoalForm onClose={() => { setOpen(false); setEditGoal(null); }} initial={editGoal ?? undefined} />
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <div className="bg-muted/40 border border-dashed border-border rounded-lg p-8 text-center">
          <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">Nenhuma meta ainda</p>
          <p className="text-xs text-muted-foreground mt-1">Crie sua primeira meta clicando em "Nova Meta"</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {activeGoals.map(g => <GoalCard key={g.id} goal={g} onEdit={setEditGoal} />)}
          </AnimatePresence>

          {pastGoals.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium px-0.5">Histórico</p>
              <AnimatePresence mode="popLayout">
                {pastGoals.map(g => <GoalCard key={g.id} goal={g} onEdit={setEditGoal} />)}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
