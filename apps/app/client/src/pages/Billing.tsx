import { useHashLocation } from "wouter/use-hash-location";
import { formatPlanPrice, PLAN_CATALOG, type PlanId } from "@trackion/billing";
import { useSubscription, useBillingCheckout, useBillingPortal } from "@/hooks/useSubscription";
import { PageHeader, Eyebrow } from "@/components/tk";
import { cn } from "@/lib/utils";
import { useAppLocale } from "@/lib/locale-context";

export default function Billing() {
  const { t } = useAppLocale();
  const [location] = useHashLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const { data: sub, isLoading, refetch } = useSubscription();
  const checkout = useBillingCheckout();
  const portal = useBillingPortal();

  const success = params.get("success") === "1";

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        index="08"
        total="09"
        eyebrow={t.billing.eyebrow}
        title={t.billing.title}
        subtitle={t.billing.subtitle}
      />
      {success && (
        <div className="border border-profit/40 bg-profit/10 px-4 py-3 text-sm text-profit">
          {t.billing.paymentReceived}
          <button type="button" className="ml-2 underline" onClick={() => refetch()}>
            {t.billing.refresh}
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">{t.billing.loading}</p>
      ) : (
        <>
          <section className="border border-border bg-card p-6">
            <Eyebrow>{t.billing.currentPlan}</Eyebrow>
            <p className="mt-2 font-display text-xl font-bold">
              {sub?.plan?.name ?? (sub?.hasAccess ? t.billing.trialElite : t.billing.noAccess)}
            </p>
            <p className="mt-1 font-mono-tk text-xs text-muted-foreground">
              {t.billing.status}: {sub?.status}
              {sub?.daysLeftInTrial != null && ` · ${t.billing.trialDays(sub.daysLeftInTrial)}`}
            </p>
            {sub?.hasAccess && sub.status === "active" && (
              <button
                type="button"
                onClick={() => portal.mutate()}
                className="mt-4 border border-border px-4 py-2 font-mono-tk text-[11px] uppercase tracking-widest hover:border-primary"
              >
                {t.billing.manageStripe}
              </button>
            )}
          </section>

          <section>
            <Eyebrow>{t.billing.availablePlans}</Eyebrow>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {(["starter", "pro", "elite"] as PlanId[]).map((id) => {
                const plan = PLAN_CATALOG[id];
                const current = sub?.effectivePlanId === id;
                return (
                  <div key={id} className={cn("border p-5", current ? "border-primary" : "border-border")}>
                    <p className="font-semibold">{plan.name}</p>
                    <p className="font-display text-lg font-bold">{formatPlanPrice(plan)}</p>
                    <button
                      type="button"
                      disabled={checkout.isPending || current}
                      onClick={() => checkout.mutate(id)}
                      className="mt-4 w-full border border-primary px-3 py-2 font-mono-tk text-[10px] uppercase tracking-widest hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                    >
                      {current ? t.billing.currentPlanBtn : t.billing.subscribe}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
