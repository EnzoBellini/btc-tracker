import { useEffect, useRef } from "react";
import CheckoutPlansPage from "@/components/CheckoutPlansPage";
import { useSubscription, useBillingSync } from "@/hooks/useSubscription";
import { useAppLocale } from "@/lib/locale-context";

export default function SubscriptionWall() {
  const { t } = useAppLocale();
  const { data: sub, isLoading } = useSubscription();
  const sync = useBillingSync();
  const autoSynced = useRef(false);

  useEffect(() => {
    if (isLoading || sub?.hasAccess || autoSynced.current) return;
    autoSynced.current = true;
    sync.mutate(undefined);
  }, [isLoading, sub?.hasAccess]);

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

        <CheckoutPlansPage />

        <div className="mt-6 text-center">
          <button
            type="button"
            disabled={sync.isPending}
            onClick={() =>
              sync.mutate(undefined, {
                onSuccess: () => {
                  window.location.href = "/#/";
                },
              })
            }
            className="font-mono-tk text-[10px] uppercase tracking-widest text-muted-foreground underline hover:text-primary disabled:opacity-50"
          >
            {sync.isPending ? t.subscriptionWall.syncing : t.subscriptionWall.alreadyPaid}
          </button>
          {sync.isError && (
            <p className="mt-2 text-xs text-loss">{sync.error.message}</p>
          )}
        </div>

        <p className="mt-8 text-center font-mono-tk text-[10px] text-muted-foreground">
          {t.subscriptionWall.footer}
        </p>
      </div>
    </div>
  );
}
