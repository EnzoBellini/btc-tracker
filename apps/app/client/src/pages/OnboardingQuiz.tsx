import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useCompleteOnboarding, useSaveOnboardingProgress, type QuizAnswers } from "@/hooks/useOnboarding";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const STEPS = 6;

const defaults: QuizAnswers = {
  capitalTier: "200_500",
  riskPerTradePct: 2,
  experience: 3,
  timePerDay: "1_3h",
  drawdownStop: 20,
  objective: "hybrid",
  tradingStyle: "day",
  leverage: 3,
  maxOpenPositions: 2,
  afterLoss: "analyze",
  usesStopLoss: "yes",
  monthlyGoalPct: 5,
};

export default function OnboardingQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(defaults);
  const saveProgress = useSaveOnboardingProgress();
  const complete = useCompleteOnboarding();

  function set<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  async function persist(nextStep: number) {
    try {
      await saveProgress.mutateAsync({ step: nextStep, answers });
    } catch {
      /* offline ok */
    }
  }

  async function handleNext() {
    if (step < STEPS - 1) {
      const next = step + 1;
      await persist(next);
      setStep(next);
      return;
    }
    try {
      const result = await complete.mutateAsync(answers);
      toast.success(`Perfil: ${(result.profile as { archetype?: string }).archetype ?? "configurado"}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro");
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-lg font-bold">Configure seu perfil de trader</h1>
            <p className="text-xs text-muted-foreground">
              Passo {step + 1} de {STEPS} — suas regras serão geradas automaticamente
            </p>
          </div>
        </div>

        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((step + 1) / STEPS) * 100}%` }}
          />
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-5 min-h-[280px]">
          {step === 0 && (
            <>
              <Field label="Capital disponível para trading (USDT)">
                <RadioGroup value={String(answers.capitalTier)} onValueChange={(v) => set("capitalTier", v)}>
                  {[
                    ["under_200", "Até 200 USDT"],
                    ["200_500", "200 – 500 USDT"],
                    ["500_2000", "500 – 2.000 USDT"],
                    ["2000_plus", "Acima de 2.000 USDT"],
                  ].map(([val, lab]) => (
                    <div key={val} className="flex items-center space-x-2">
                      <RadioGroupItem value={val} id={`cap-${val}`} />
                      <Label htmlFor={`cap-${val}`}>{lab}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
              <Field label={`Risco por trade: ${answers.riskPerTradePct}% do capital de futuros`}>
                <Slider
                  value={[Number(answers.riskPerTradePct)]}
                  onValueChange={([v]) => set("riskPerTradePct", v)}
                  min={0.5}
                  max={5}
                  step={0.5}
                />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="Experiência com futuros em cripto (1 = iniciante, 5 = avançado)">
                <Slider
                  value={[Number(answers.experience)]}
                  onValueChange={([v]) => set("experience", v)}
                  min={1}
                  max={5}
                  step={1}
                />
              </Field>
              <Field label="Tempo dedicado ao mercado por dia">
                <RadioGroup value={String(answers.timePerDay)} onValueChange={(v) => set("timePerDay", v)}>
                  {[["under_1h", "< 1h"], ["1_3h", "1 – 3h"], ["3h_plus", "3h+"]].map(([val, lab]) => (
                    <div key={val} className="flex items-center space-x-2">
                      <RadioGroupItem value={val} id={`time-${val}`} />
                      <Label htmlFor={`time-${val}`}>{lab}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
              <Field label="Drawdown máximo antes de parar (%)">
                <RadioGroup
                  value={String(answers.drawdownStop)}
                  onValueChange={(v) => set("drawdownStop", Number(v))}
                >
                  {[10, 15, 20, 25].map((n) => (
                    <div key={n} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(n)} id={`dd-${n}`} />
                      <Label htmlFor={`dd-${n}`}>{n}%</Label>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
            </>
          )}

          {step === 2 && (
            <Field label="Objetivo principal">
              <RadioGroup value={String(answers.objective)} onValueChange={(v) => set("objective", v)}>
                {[
                  ["btc_stack", "Acumular BTC"],
                  ["income", "Renda em USDT"],
                  ["learning", "Aprender / paper"],
                  ["hybrid", "Híbrido"],
                ].map(([val, lab]) => (
                  <div key={val} className="flex items-center space-x-2">
                    <RadioGroupItem value={val} id={`obj-${val}`} />
                    <Label htmlFor={`obj-${val}`}>{lab}</Label>
                  </div>
                ))}
              </RadioGroup>
            </Field>
          )}

          {step === 3 && (
            <>
              <Field label="Estilo de operação">
                <RadioGroup value={String(answers.tradingStyle)} onValueChange={(v) => set("tradingStyle", v)}>
                  {[["scalper", "Scalp"], ["day", "Day trade"], ["swing", "Swing"]].map(([val, lab]) => (
                    <div key={val} className="flex items-center space-x-2">
                      <RadioGroupItem value={val} id={`style-${val}`} />
                      <Label htmlFor={`style-${val}`}>{lab}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
              <Field label="Alavancagem confortável">
                <RadioGroup
                  value={String(answers.leverage)}
                  onValueChange={(v) => set("leverage", Number(v))}
                >
                  {[2, 3, 5].map((n) => (
                    <div key={n} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(n)} id={`lev-${n}`} />
                      <Label htmlFor={`lev-${n}`}>{n}x</Label>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
              <Field label="Posições abertas simultâneas">
                <RadioGroup
                  value={String(answers.maxOpenPositions)}
                  onValueChange={(v) => set("maxOpenPositions", Number(v))}
                >
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(n)} id={`open-${n}`} />
                      <Label htmlFor={`open-${n}`}>{n}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
            </>
          )}

          {step === 4 && (
            <>
              <Field label="Após uma perda, você costuma:">
                <RadioGroup value={String(answers.afterLoss)} onValueChange={(v) => set("afterLoss", v)}>
                  {[["stop", "Parar por hoje"], ["revenge", "Revenge trading"], ["analyze", "Analisar e seguir o plano"]].map(
                    ([val, lab]) => (
                      <div key={val} className="flex items-center space-x-2">
                        <RadioGroupItem value={val} id={`loss-${val}`} />
                        <Label htmlFor={`loss-${val}`}>{lab}</Label>
                      </div>
                    ),
                  )}
                </RadioGroup>
              </Field>
              <Field label="Usa stop-loss em 100% dos trades?">
                <RadioGroup value={String(answers.usesStopLoss)} onValueChange={(v) => set("usesStopLoss", v)}>
                  {[["yes", "Sim"], ["partial", "Às vezes"], ["no", "Não"]].map(([val, lab]) => (
                    <div key={val} className="flex items-center space-x-2">
                      <RadioGroupItem value={val} id={`sl-${val}`} />
                      <Label htmlFor={`sl-${val}`}>{lab}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
            </>
          )}

          {step === 5 && (
            <Field label="Meta de lucro mensal (% do capital total)">
              <Input
                type="number"
                min={1}
                max={20}
                value={answers.monthlyGoalPct}
                onChange={(e) => set("monthlyGoalPct", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Com base nas respostas, geraremos suas regras de risco, settings e roadmap inicial.
              </p>
            </Field>
          )}
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          <Button type="button" onClick={handleNext} disabled={complete.isPending} data-testid="button-quiz-next">
            {step === STEPS - 1 ? (
              complete.isPending ? "Gerando..." : "Finalizar"
            ) : (
              <>
                Próximo <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
