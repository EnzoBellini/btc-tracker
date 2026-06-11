import { formatPlanPrice, LAUNCH_ORIGINAL_PRICE_CENTS, PLAN_CATALOG, type PlanId } from "@trackion/billing";
import { useSubscription, useBillingCheckout } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { useAppLocale } from "@/lib/locale-context";

function formatOriginalPrice(planId: PlanId): string {
  const reais = LAUNCH_ORIGINAL_PRICE_CENTS[planId] / 100;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reais);
}

export default function SubscriptionWall() {
  const { t } = useAppLocale();
  const { data: sub, isLoading } = useSubscription();
  const checkout = useBillingCheckout();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono-tk text-sm text-muted-foreground">{t.subscriptionWall.loading}</p>
      </div>
    );
  }

  const trialEnded = sub?.trialEnded ?? true;
  const daysLeft = sub?.daysLeftInTrial;

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-primary">
          {t.subscriptionWall.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
          {trialEnded ? t.subscriptionWall.trialEndedTitle : t.subscriptionWall.choosePlanTitle}
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          {trialEnded
            ? t.subscriptionWall.trialEndedDesc
            : daysLeft != null
              ? t.subscriptionWall.daysLeftDesc(daysLeft)
              : t.subscriptionWall.subscriptionRequired}
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {(["starter", "pro", "elite"] as PlanId[]).map((id) => {
            const plan = PLAN_CATALOG[id];
            const isAnchor = id === "pro";
            return (
              <div
                key={id}
                className={cn(
                  "relative border bg-card p-6",
                  isAnchor ? "border-primary" : "border-border",
                )}
              >
                {isAnchor && (
                  <span className="absolute -top-2.5 left-4 bg-primary px-2 py-0.5 font-mono-tk text-[9px] font-bold uppercase tracking-widest text-primary-foreground">
                    {t.subscriptionWall.recommended}
                  </span>
                )}
                <p className="font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {plan.name}
                </p>
                <p className="mt-2 font-display text-2xl font-bold">{formatPlanPrice(plan)}</p>
                <p className="text-xs text-muted-foreground">
                  {t.subscriptionWall.originalPrice}{" "}
                  <span className="line-through">{formatOriginalPrice(id)}</span>
                </p>
                <p className="text-xs text-muted-foreground">{t.subscriptionWall.perMonth}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {plan.highlights.slice(0, 4).map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="text-primary">›</span>
                      {h}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={checkout.isPending}
                  onClick={() => checkout.mutate(id)}
                  className={cn(
                    "mt-6 w-full border px-4 py-2.5 font-mono-tk text-[11px] font-bold uppercase tracking-[0.2em] transition",
                    isAnchor
                      ? "border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {t.subscriptionWall.subscribe}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center font-mono-tk text-[10px] text-muted-foreground">
          {t.subscriptionWall.footer}
        </p>
      </div>
    </div>
  );
}
