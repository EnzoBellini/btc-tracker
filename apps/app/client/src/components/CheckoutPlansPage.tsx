import { formatPlanPrice, LAUNCH_ORIGINAL_PRICE_CENTS, PLAN_CATALOG, stripeLookupKey, type PlanId } from "@trackion/billing";
import { useBillingCheckout } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { useAppLocale } from "@/lib/locale-context";

function formatOriginalPrice(planId: PlanId): string {
  const reais = LAUNCH_ORIGINAL_PRICE_CENTS[planId] / 100;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reais);
}

interface CheckoutPlansPageProps {
  showLaunchPricing?: boolean;
  compact?: boolean;
  currentPlanId?: string | null;
}

/** Página de preview de preços + botões Checkout (Stripe quickstart). */
export default function CheckoutPlansPage({ showLaunchPricing = true, compact = false, currentPlanId }: CheckoutPlansPageProps) {
  const { t } = useAppLocale();
  const checkout = useBillingCheckout();

  return (
    <div className={cn("grid gap-4", compact ? "md:grid-cols-3" : "mt-10 md:grid-cols-3")}>
      {(["starter", "pro", "elite"] as PlanId[]).map((id) => {
        const plan = PLAN_CATALOG[id];
        const isAnchor = id === "pro";
        const current = currentPlanId === id;
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
            <p className={cn("mt-2 font-display font-bold", compact ? "text-lg" : "text-2xl")}>
              {formatPlanPrice(plan)}
            </p>
            {showLaunchPricing && (
              <>
                <p className="text-xs text-muted-foreground">
                  {t.subscriptionWall.originalPrice}{" "}
                  <span className="line-through">{formatOriginalPrice(id)}</span>
                </p>
                <p className="text-xs text-muted-foreground">{t.subscriptionWall.perMonth}</p>
              </>
            )}
            <ul className={cn("space-y-2 text-sm text-muted-foreground", compact ? "mt-3" : "mt-4")}>
              {plan.highlights.slice(0, compact ? 3 : 4).map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-primary">›</span>
                  {h}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={checkout.isPending || current}
              onClick={() => checkout.mutate({ planId: id, lookupKey: stripeLookupKey(id) })}
              className={cn(
                "mt-6 w-full border px-4 py-2.5 font-mono-tk text-[11px] font-bold uppercase tracking-[0.2em] transition disabled:opacity-50",
                isAnchor
                  ? "border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary"
                  : "border-border hover:border-primary/50",
              )}
            >
              {current
                ? t.billing.currentPlanBtn
                : checkout.isPending
                  ? t.checkout.processing
                  : t.subscriptionWall.subscribe}
            </button>
          </div>
        );
      })}
    </div>
  );
}
