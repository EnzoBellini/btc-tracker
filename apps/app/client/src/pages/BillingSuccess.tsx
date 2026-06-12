import { useEffect } from "react";
import { useHashLocation } from "wouter/use-hash-location";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useCheckoutSession, useBillingPortal } from "@/hooks/useSubscription";
import { useAppLocale } from "@/lib/locale-context";

/** Página de sucesso pós Checkout (Stripe quickstart). */
export default function BillingSuccess() {
  const { t } = useAppLocale();
  const [location] = useHashLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const sessionId = params.get("session_id") ?? undefined;

  const { data: session, isLoading, error, refetch } = useCheckoutSession(sessionId);
  const portal = useBillingPortal();
  const queryClient = useQueryClient();

  const confirmed = session?.status === "complete" && session?.paymentStatus === "paid";

  useEffect(() => {
    if (!confirmed) return;
    void queryClient.invalidateQueries({ queryKey: ["/api/me/subscription"] });
    void queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  }, [confirmed, queryClient]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="mx-auto max-w-lg border border-border bg-card p-8 text-center">
        {isLoading && (
          <p className="font-mono-tk text-sm text-muted-foreground">{t.billingSuccess.loading}</p>
        )}

        {!sessionId && !isLoading && (
          <>
            <p className="font-display text-xl font-bold">{t.billingSuccess.missingSession}</p>
            <Link href="/billing" className="mt-6 inline-block font-mono-tk text-[11px] uppercase tracking-widest text-primary underline">
              {t.billingSuccess.backToBilling}
            </Link>
          </>
        )}

        {sessionId && error && (
          <>
            <p className="font-display text-xl font-bold text-loss">{t.billingSuccess.errorTitle}</p>
            <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 border border-border px-4 py-2 font-mono-tk text-[11px] uppercase tracking-widest hover:border-primary"
            >
              {t.billing.refresh}
            </button>
          </>
        )}

        {sessionId && session && !error && (
          <>
            <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-profit">
              {t.billingSuccess.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold">
              {confirmed
                ? t.billingSuccess.title(session.planName ?? "Trackion")
                : t.billingSuccess.pendingTitle}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {confirmed ? t.billingSuccess.description : t.billingSuccess.pendingDescription}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="border border-primary bg-primary px-4 py-2.5 font-mono-tk text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground hover:bg-transparent hover:text-primary"
              >
                {t.billingSuccess.goToDashboard}
              </Link>
              <button
                type="button"
                disabled={portal.isPending}
                onClick={() => portal.mutate(sessionId ? { sessionId } : undefined)}
                className="border border-border px-4 py-2.5 font-mono-tk text-[11px] uppercase tracking-widest hover:border-primary disabled:opacity-50"
              >
                {t.billingSuccess.manageBilling}
              </button>
            </div>

            {!confirmed && (
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-6 text-xs text-muted-foreground underline"
              >
                {t.billing.refresh}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
