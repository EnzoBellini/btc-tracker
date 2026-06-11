import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  useCompleteOnboarding,
  useOnboardingProgress,
  useSaveOnboardingProgress,
  type QuizAnswers,
} from "@/hooks/useOnboarding";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { setOnboardingWelcomeArchetype } from "@/pages/OnboardingWelcome";
import { useAppLocale } from "@/lib/locale-context";
import { MarketSelector } from "@/components/MarketSelector";

const STEPS = 6;

const CAPITAL_TIERS = ["under_200", "200_500", "500_2000", "2000_plus"] as const;
const TIME_PER_DAY = ["under_1h", "1_3h", "3h_plus"] as const;
const OBJECTIVES = ["btc_stack", "income", "learning", "hybrid"] as const;
const TRADING_STYLES = ["scalper", "day", "swing"] as const;
const AFTER_LOSS = ["stop", "revenge", "analyze"] as const;
const USES_STOP_LOSS = ["yes", "partial", "no"] as const;

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
  const { t, market, setMarket } = useAppLocale();
  const q = t.onboarding;
  const { data: progress, isLoading: progressLoading } = useOnboardingProgress();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const saveProgress = useSaveOnboardingProgress();
  const complete = useCompleteOnboarding();

  useEffect(() => {
    if (progressLoading || hydrated) return;
    if (progress) {
      if (typeof progress.step === "number" && progress.step > 0) {
        setStep(Math.min(progress.step, STEPS - 1));
      }
      if (progress.answers && Object.keys(progress.answers).length > 0) {
        setAnswers({ ...defaults, ...(progress.answers as QuizAnswers) });
      }
    }
    setHydrated(true);
  }, [progress, progressLoading, hydrated]);

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
      const result = await complete.mutateAsync({
        answers,
        locale: market === "us" ? "en" : "pt",
      });
      const arch = (result.profile as { archetype?: string }).archetype ?? q.configuredDefault;
      setOnboardingWelcomeArchetype(arch);
      toast.success(q.profileConfigured(arch));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : q.error);
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary shrink-0" />
            <div>
              <h1 className="text-lg font-bold">{q.title}</h1>
              <p className="text-xs text-muted-foreground">
                {q.stepOf(step + 1, STEPS)}
              </p>
            </div>
          </div>
          <MarketSelector market={market} onChange={setMarket} compact />
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
              <Field label={q.fields.capital}>
                <RadioGroup value={String(answers.capitalTier)} onValueChange={(v) => set("capitalTier", v)}>
                  {CAPITAL_TIERS.map((val) => (
                    <div key={val} className="flex items-center space-x-2">
                      <RadioGroupItem value={val} id={`cap-${val}`} />
                      <Label htmlFor={`cap-${val}`}>{q.options.capitalTier[val]}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
              <Field label={q.fields.riskPerTrade(Number(answers.riskPerTradePct))}>
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
              <Field label={q.fields.experience}>
                <Slider
                  value={[Number(answers.experience)]}
                  onValueChange={([v]) => set("experience", v)}
                  min={1}
                  max={5}
                  step={1}
                />
              </Field>
              <Field label={q.fields.timePerDay}>
                <RadioGroup value={String(answers.timePerDay)} onValueChange={(v) => set("timePerDay", v)}>
                  {TIME_PER_DAY.map((val) => (
                    <div key={val} className="flex items-center space-x-2">
                      <RadioGroupItem value={val} id={`time-${val}`} />
                      <Label htmlFor={`time-${val}`}>{q.options.timePerDay[val]}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
              <Field label={q.fields.drawdownStop}>
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
            <Field label={q.fields.objective}>
              <RadioGroup value={String(answers.objective)} onValueChange={(v) => set("objective", v)}>
                {OBJECTIVES.map((val) => (
                  <div key={val} className="flex items-center space-x-2">
                    <RadioGroupItem value={val} id={`obj-${val}`} />
                    <Label htmlFor={`obj-${val}`}>{q.options.objective[val]}</Label>
                  </div>
                ))}
              </RadioGroup>
            </Field>
          )}

          {step === 3 && (
            <>
              <Field label={q.fields.tradingStyle}>
                <RadioGroup value={String(answers.tradingStyle)} onValueChange={(v) => set("tradingStyle", v)}>
                  {TRADING_STYLES.map((val) => (
                    <div key={val} className="flex items-center space-x-2">
                      <RadioGroupItem value={val} id={`style-${val}`} />
                      <Label htmlFor={`style-${val}`}>{q.options.tradingStyle[val]}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
              <Field label={q.fields.leverage}>
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
              <Field label={q.fields.maxOpenPositions}>
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
              <Field label={q.fields.afterLoss}>
                <RadioGroup value={String(answers.afterLoss)} onValueChange={(v) => set("afterLoss", v)}>
                  {AFTER_LOSS.map((val) => (
                    <div key={val} className="flex items-center space-x-2">
                      <RadioGroupItem value={val} id={`loss-${val}`} />
                      <Label htmlFor={`loss-${val}`}>{q.options.afterLoss[val]}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
              <Field label={q.fields.usesStopLoss}>
                <RadioGroup value={String(answers.usesStopLoss)} onValueChange={(v) => set("usesStopLoss", v)}>
                  {USES_STOP_LOSS.map((val) => (
                    <div key={val} className="flex items-center space-x-2">
                      <RadioGroupItem value={val} id={`sl-${val}`} />
                      <Label htmlFor={`sl-${val}`}>{q.options.usesStopLoss[val]}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
            </>
          )}

          {step === 5 && (
            <Field label={q.fields.monthlyGoal}>
              <Input
                type="number"
                min={1}
                max={20}
                value={answers.monthlyGoalPct}
                onChange={(e) => set("monthlyGoalPct", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {q.fields.monthlyGoalHint}
              </p>
            </Field>
          )}
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> {q.back}
          </Button>
          <Button type="button" onClick={handleNext} disabled={complete.isPending} data-testid="button-quiz-next">
            {step === STEPS - 1 ? (
              complete.isPending ? q.generating : q.finish
            ) : (
              <>
                {q.next} <ChevronRight className="w-4 h-4 ml-1" />
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
