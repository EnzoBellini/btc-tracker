import CheckoutPlansPage from "@/components/CheckoutPlansPage";
import { useSubscription } from "@/hooks/useSubscription";
import { useAppLocale } from "@/lib/locale-context";

export default function SubscriptionWall() {
  const { t } = useAppLocale();
  const { data: sub, isLoading } = useSubscription();

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

        <p className="mt-8 text-center font-mono-tk text-[10px] text-muted-foreground">
          {t.subscriptionWall.footer}
        </p>
      </div>
    </div>
  );
}
