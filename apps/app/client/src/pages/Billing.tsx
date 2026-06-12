import { useHashLocation } from "wouter/use-hash-location";
import { Link } from "wouter";
import { useSubscription, useBillingPortal } from "@/hooks/useSubscription";
import CheckoutPlansPage from "@/components/CheckoutPlansPage";
import { PageHeader, Eyebrow } from "@/components/tk";
import { useAppLocale } from "@/lib/locale-context";

export default function Billing() {
  const { t } = useAppLocale();
  const [location] = useHashLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const { data: sub, isLoading } = useSubscription();
  const portal = useBillingPortal();

  const canceled = params.get("canceled") === "1";

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        index="08"
        total="09"
        eyebrow={t.billing.eyebrow}
        title={t.billing.title}
        subtitle={t.billing.subtitle}
      />

      {canceled && (
        <div className="border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {t.checkout.canceled}
          <Link href="/checkout" className="ml-2 text-primary underline">
            {t.checkout.tryAgain}
          </Link>
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
                onClick={() => portal.mutate(undefined)}
                className="mt-4 border border-border px-4 py-2 font-mono-tk text-[11px] uppercase tracking-widest hover:border-primary"
              >
                {t.billing.manageStripe}
              </button>
            )}
          </section>

          <section>
            <Eyebrow>{t.billing.availablePlans}</Eyebrow>
            <div className="mt-4">
              <CheckoutPlansPage
                showLaunchPricing={false}
                compact
                currentPlanId={sub?.effectivePlanId}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
