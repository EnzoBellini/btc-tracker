import PlanTracker from "@/components/PlanTracker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertSettingsSchema, type Settings } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  AlertTriangle, TrendingUp, Shield, DollarSign, BookOpen, type LucideIcon,
} from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useUserRules } from "@/hooks/useOnboarding";
import {
  PageHeader, TerminalFrame, TerminalButton, StatPill, Eyebrow,
} from "@/components/tk";

const settingsFormSchema = insertSettingsSchema.extend({
  totalCapital:            z.coerce.number().positive(),
  futuresCapital:          z.coerce.number().positive(),
  spotCapital:             z.coerce.number().positive(),
  riskPerTrade:            z.coerce.number().positive(),
  profitTransferThreshold: z.coerce.number().positive(),
  defaultLeverage:         z.coerce.number().int().min(1).max(10),
  stopTradingDrawdown:     z.coerce.number().min(1).max(100),
});
type SettingsFormValues = z.infer<typeof settingsFormSchema>;

function SettingsForm({ settings }: { settings: Settings }) {
  const updateSettings = useUpdateSettings();
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: settings,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(d => updateSettings.mutate(d))} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            { name: "totalCapital" as const,            label: "Capital Total (USDT)" },
            { name: "futuresCapital" as const,          label: "Capital Futuros (USDT)" },
            { name: "spotCapital" as const,             label: "Capital Spot BTC (USDT)" },
            { name: "riskPerTrade" as const,            label: "Risco por Trade (USDT)" },
            { name: "profitTransferThreshold" as const, label: "Transferir a cada +X USDT" },
            { name: "defaultLeverage" as const,         label: "Alavancagem padrão (x)" },
            { name: "stopTradingDrawdown" as const,     label: "Parar com drawdown (%)" },
          ].map(({ name, label }, i) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-mono-tk text-[10px] uppercase tracking-[0.22em]">
                  <span className="text-primary">{String(i + 1).padStart(2, "0")}</span>
                  {label}
                </FormLabel>
                <FormControl><Input type="number" step="any" {...field} className="font-mono-tk num" data-testid={`input-setting-${name}`} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          ))}
        </div>
        <TerminalButton type="submit" disabled={updateSettings.isPending} data-testid="button-save-settings">
          {updateSettings.isPending ? "Salvando…" : "Salvar configurações"}
        </TerminalButton>
      </form>
    </Form>
  );
}

// ── Static content ────────────────────────────────────────────────────────────
type RuleBlock = { icon: LucideIcon; title: string; items: string[]; tone: "orange" | "blue" | "profit" | "amber" };

const rules: RuleBlock[] = [
  {
    icon: DollarSign, title: "Alocação de capital", tone: "orange",
    items: [
      "Capital total sugerido: 200 USDT",
      "50% em futuros (100 USDT) — para operar com alavancagem",
      "50% em spot BTC (100 USDT) — para acumular BTC",
      "Nunca arrisque mais do que o capital de futuros alocado",
    ],
  },
  {
    icon: Shield, title: "Regras de risco", tone: "blue",
    items: [
      "Risco máximo por trade: 2,50 USDT (2,5% do capital de futuros)",
      "Com 3x de alavancagem, a posição é ~3x o risco calculado",
      "Nunca mover o stop após entrar no trade",
      "Stop-loss obrigatório em TODOS os trades",
      "Se atingir −20% de drawdown: PARAR de operar imediatamente",
    ],
  },
  {
    icon: TrendingUp, title: "Entrada e saída", tone: "profit",
    items: [
      "Entrar apenas em setups com R:R mínimo de 1:2",
      "Stop-loss abaixo/acima do último pivot relevante",
      "Alvo: próximo nível de suporte/resistência importante",
      "Não fazer revenge trading após uma perda",
      "Máximo de 1-2 trades abertos simultaneamente",
    ],
  },
  {
    icon: BookOpen, title: "Transferência de lucro", tone: "amber",
    items: [
      "A cada +10 USDT de lucro nos futuros → comprar BTC no spot",
      "Registrar a transferência com o preço exato do BTC",
      "Manter o capital de futuros estável, crescer o BTC stack",
      "O objetivo final é acumular BTC, não acumular USDT",
    ],
  },
];

const scenarios = [
  { condition: "Você acabou de fechar um WIN",  action: "Registre o trade. Se o lucro acumulado atingiu +10 USDT, transfira para BTC spot.", tag: "WIN", tone: "profit" as const },
  { condition: "Você acabou de fechar um LOSS", action: "Registre o trade. Analise o porquê. Respeite o plano, não faça revenge trading.",  tag: "LOSS", tone: "loss" as const },
  { condition: "Drawdown de 20% atingido",      action: "PARE de operar imediatamente. Revise a estratégia antes de voltar.",               tag: "STOP", tone: "loss" as const },
  { condition: "Sem setup claro no mercado",    action: "Não opere. Ficar de fora é uma posição válida e lucrativa.",                        tag: "AGUARDAR", tone: "off" as const },
];

const positionSizingExample = [
  { step: "Capital futuros",                            value: "100 USDT" },
  { step: "Risco por trade (2,5%)",                     value: "2,50 USDT" },
  { step: "Alavancagem",                                value: "3x" },
  { step: "Tamanho da posição",                         value: "≈ 33,33 USDT (notional ~100)" },
  { step: "Exemplo: entrada em 85.000, stop em 84.500", value: "Distância = 500 USDT (0,59%)" },
  { step: "Quantidade de BTC",                          value: "2,50 / (85.000 × 0,0059) ≈ 0,000499 BTC" },
];

const categoryMeta: Record<string, { icon: LucideIcon; tone: RuleBlock["tone"] }> = {
  capital:    { icon: DollarSign, tone: "orange" },
  risk:       { icon: Shield,     tone: "blue" },
  entry_exit: { icon: TrendingUp, tone: "profit" },
  transfer:   { icon: BookOpen,   tone: "amber" },
};

function toneClasses(tone: RuleBlock["tone"]) {
  switch (tone) {
    case "blue":   return { text: "text-blue-400",   border: "border-blue-400/30",  bg: "bg-blue-400/[0.06]" };
    case "profit": return { text: "text-profit",     border: "border-profit/30",    bg: "bg-profit/[0.06]" };
    case "amber":  return { text: "text-[hsl(var(--neutral))]", border: "border-[hsl(var(--neutral))]/30", bg: "bg-[hsl(var(--neutral))]/[0.06]" };
    default:       return { text: "text-primary",    border: "border-primary/30",   bg: "bg-primary/[0.06]" };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Rules() {
  const { data: settings, isLoading } = useSettings();
  const { data: userRules } = useUserRules();

  const displayRules: RuleBlock[] =
    userRules && userRules.length > 0
      ? userRules.map((r: { category: string; title: string; items: string[] }) => {
          const meta = categoryMeta[r.category] ?? categoryMeta.capital;
          return { icon: meta.icon, title: r.title, tone: meta.tone, items: r.items };
        })
      : rules;

  return (
    <div className="relative space-y-12 p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-50" aria-hidden />

      <div className="relative space-y-12">
        <PageHeader
          index="06"
          total="08"
          eyebrow="Rules · doctrine"
          title="Manual de trading."
          subtitle="Leia antes de operar. Disciplina nasce de regras escritas, não de palpite."
        />

        {/* Rules grid */}
        <section className="space-y-4">
          <Eyebrow>doutrina · 4 pilares</Eyebrow>
          <ol className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
            {displayRules.map(({ icon: Icon, title, tone, items }, i) => {
              const t = toneClasses(tone);
              return (
                <li key={title} className="relative bg-card p-6">
                  <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono-tk text-[10px] tracking-[0.28em] text-primary">
                        [{String(i + 1).padStart(2, "0")}]
                      </span>
                      <div className={`flex h-9 w-9 items-center justify-center border ${t.border} ${t.bg}`}>
                        <Icon className={`h-4 w-4 ${t.text}`} />
                      </div>
                    </div>
                    <span className="font-mono-tk text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
                      pilar {i + 1} / {displayRules.length}
                    </span>
                  </div>
                  <h3 className="font-display mt-4 text-2xl font-bold leading-tight tracking-tight">{title}</h3>
                  <ul className="mt-4 space-y-2">
                    {items.map((item, k) => (
                      <li key={k} className="grid grid-cols-[auto_1fr] items-start gap-3 text-sm leading-relaxed">
                        <span className="num font-mono-tk text-[10px] tracking-[0.22em] text-muted-foreground">
                          0{k + 1}
                        </span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Position sizing — editorial */}
        <section>
          <TerminalFrame title="position_sizing · exemplo" status="docs" statusTone="info" orangeCorners>
            <div className="divide-y divide-border">
              {positionSizingExample.map((row, i) => (
                <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4">
                  <span className="font-mono-tk text-[10px] tracking-[0.28em] text-muted-foreground/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-muted-foreground">{row.step}</span>
                  <span className="num font-mono-tk text-sm font-bold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </TerminalFrame>
        </section>

        {/* Scenarios — what to do when */}
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b border-border pb-3">
            <div className="space-y-1">
              <Eyebrow>scenarios · playbook</Eyebrow>
              <h2 className="font-display text-2xl font-bold tracking-tight">O que fazer quando…</h2>
            </div>
            <span className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              <AlertTriangle className="-mt-0.5 mr-1 inline h-3 w-3 text-[hsl(var(--neutral))]" />
              decision tree
            </span>
          </div>
          <div className="divide-y divide-border border border-border bg-card">
            {scenarios.map((s, i) => (
              <article key={s.condition} className="grid grid-cols-[auto_auto_1fr] items-start gap-5 px-5 py-5 transition-colors hover:bg-white/[0.02]">
                <span className="font-mono-tk text-[10px] tracking-[0.28em] text-muted-foreground/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <StatPill tone={s.tone}>{s.tag}</StatPill>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground sm:text-base">{s.condition}</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">{s.action}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Plan Tracker */}
        <section className="space-y-4">
          <Eyebrow>goals · plan tracker</Eyebrow>
          <PlanTracker />
        </section>

        {/* Settings */}
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b border-border pb-3">
            <div className="space-y-1">
              <Eyebrow>config · strategy</Eyebrow>
              <h2 className="font-display text-2xl font-bold tracking-tight">Configurações da estratégia.</h2>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-muted" />)}
            </div>
          ) : settings ? (
            <div className="border border-border bg-card p-6">
              <SettingsForm settings={settings} />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
