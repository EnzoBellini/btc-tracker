import { PageHeader, Eyebrow } from "@/components/tk";
import CheckoutPlansPage from "@/components/CheckoutPlansPage";
import { useAppLocale } from "@/lib/locale-context";

/** Rota /checkout — preview de preços + redirect para Stripe Checkout. */
export default function CheckoutPage() {
  const { t } = useAppLocale();

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        index="08"
        total="09"
        eyebrow={t.checkout.eyebrow}
        title={t.checkout.title}
        subtitle={t.checkout.subtitle}
      />
      <CheckoutPlansPage showLaunchPricing />
      <p className="text-center font-mono-tk text-[10px] text-muted-foreground">
        {t.subscriptionWall.footer}
      </p>
    </div>
  );
}
