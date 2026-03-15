import PlanTracker from "@/components/PlanTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertSettingsSchema, type Settings } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertTriangle, CheckCircle2, TrendingUp, Shield, DollarSign, BookOpen } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

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
      <form onSubmit={form.handleSubmit(d => updateSettings.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: "totalCapital" as const,            label: "Capital Total (USDT)" },
            { name: "futuresCapital" as const,          label: "Capital Futuros (USDT)" },
            { name: "spotCapital" as const,             label: "Capital Spot BTC (USDT)" },
            { name: "riskPerTrade" as const,            label: "Risco por Trade (USDT)" },
            { name: "profitTransferThreshold" as const, label: "Transferir a cada +X USDT" },
            { name: "defaultLeverage" as const,         label: "Alavancagem Padrão (x)" },
            { name: "stopTradingDrawdown" as const,     label: "Parar com Drawdown (%)" },
          ].map(({ name, label }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{label}</FormLabel>
                <FormControl><Input type="number" step="any" {...field} data-testid={`input-setting-${name}`} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          ))}
        </div>
        <Button type="submit" disabled={updateSettings.isPending} data-testid="button-save-settings">
          {updateSettings.isPending ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </form>
    </Form>
  );
}

// ── Static content ────────────────────────────────────────────────────────────
const rules = [
  {
    icon: DollarSign, title: "Alocação de Capital", color: "text-primary", bg: "bg-primary/10",
    items: [
      "Capital total sugerido: 200 USDT",
      "50% em futuros (100 USDT) — para operar com alavancagem",
      "50% em spot BTC (100 USDT) — para acumular BTC",
      "Nunca arrisque mais do que o capital de futuros alocado",
    ],
  },
  {
    icon: Shield, title: "Regras de Risco", color: "text-blue-400", bg: "bg-blue-500/10",
    items: [
      "Risco máximo por trade: 2,50 USDT (2,5% do capital de futuros)",
      "Com 3x de alavancagem, a posição é ~3x o risco calculado",
      "Nunca mover o stop após entrar no trade",
      "Stop-loss obrigatório em TODOS os trades",
      "Se atingir -20% de drawdown: PARAR de operar imediatamente",
    ],
  },
  {
    icon: TrendingUp, title: "Entrada e Saída", color: "text-profit", bg: "bg-profit/10",
    items: [
      "Entrar apenas em setups com R:R mínimo de 1:2",
      "Stop-loss abaixo/acima do último pivot relevante",
      "Alvo: próximo nível de suporte/resistência importante",
      "Não fazer revenge trading após uma perda",
      "Máximo de 1-2 trades abertos simultaneamente",
    ],
  },
  {
    icon: BookOpen, title: "Transferência de Lucro", color: "text-yellow-400", bg: "bg-yellow-400/10",
    items: [
      "A cada +10 USDT de lucro nos futuros → comprar BTC no spot",
      "Registrar a transferência com o preço exato do BTC",
      "Manter o capital de futuros estável, crescer o BTC stack",
      "O objetivo final é acumular BTC, não acumular USDT",
    ],
  },
];

const scenarios = [
  { condition: "Você acabou de fechar um WIN",  action: "Registre o trade. Se o lucro acumulado atingiu +10 USDT, transfira para BTC spot.", badge: "WIN",     badgeClass: "bg-profit/15 text-profit border-0" },
  { condition: "Você acabou de fechar um LOSS", action: "Registre o trade. Analise o porquê. Respeite o plano, não faça revenge trading.",  badge: "LOSS",    badgeClass: "bg-loss/15 text-loss border-0" },
  { condition: "Drawdown de 20% atingido",       action: "PARE de operar imediatamente. Revise a estratégia antes de voltar.",               badge: "STOP",    badgeClass: "bg-loss/15 text-loss border-0" },
  { condition: "Sem setup claro no mercado",     action: "Não opere. Ficar de fora é uma posição válida e lucrativa.",                       badge: "AGUARDAR", badgeClass: "bg-muted text-muted-foreground border-0" },
];

const positionSizingExample = [
  { step: "Capital futuros",                           value: "100 USDT" },
  { step: "Risco por trade (2,5%)",                    value: "2,50 USDT" },
  { step: "Alavancagem",                               value: "3x" },
  { step: "Tamanho da posição",                        value: "≈ 33,33 USDT (notional ~100)" },
  { step: "Exemplo: entrada em 85.000, stop em 84.500", value: "Distância = 500 USDT (0,59%)" },
  { step: "Quantidade de BTC",                          value: "2,50 / (85.000 × 0,0059) ≈ 0,000499 BTC" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Rules() {
  const { data: settings, isLoading } = useSettings();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Regras da Estratégia</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Seu manual de trading — leia antes de operar</p>
      </div>

      {/* Rules grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map(({ icon: Icon, title, color, bg, items }) => (
          <Card key={title} className="bg-card border-border">
            <CardHeader className="pb-3 px-5 pt-5">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Position sizing */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 px-5 pt-5">
          <CardTitle className="text-sm font-semibold">Cálculo de Tamanho da Posição</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="space-y-2">
            {positionSizingExample.map(({ step, value }, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{step}</span>
                <span className="text-sm font-medium tabular text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scenarios */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 px-5 pt-5">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <CardTitle className="text-sm font-semibold">O que fazer quando...</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          {scenarios.map(({ condition, action, badge, badgeClass }) => (
            <div key={condition} className="flex items-start gap-3 p-3 bg-muted rounded-md">
              <Badge className={`${badgeClass} flex-shrink-0 mt-0.5`}>{badge}</Badge>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{condition}</p>
                <p className="text-xs text-muted-foreground">{action}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Plan Tracker */}
      <PlanTracker />

      {/* Settings */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 px-5 pt-5">
          <CardTitle className="text-sm font-semibold">Configurações da Estratégia</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
            </div>
          ) : settings ? (
            <SettingsForm settings={settings} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
