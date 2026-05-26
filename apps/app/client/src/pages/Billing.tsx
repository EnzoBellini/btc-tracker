import { useHashLocation } from "wouter/use-hash-location";
import { formatPlanPrice, PLAN_CATALOG, type PlanId } from "@trackion/billing";
import { useSubscription, useBillingCheckout, useBillingPortal } from "@/hooks/useSubscription";
import { PageHeader, Eyebrow } from "@/components/tk";
import { cn } from "@/lib/utils";

export default function Billing() {
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
        eyebrow="billing · assinatura"
        title="Assinatura"
        subtitle="Gerencie seu plano Trackion"
      />
      {success && (
        <div className="border border-profit/40 bg-profit/10 px-4 py-3 text-sm text-profit">
          Pagamento recebido. Atualizando assinatura…
          <button type="button" className="ml-2 underline" onClick={() => refetch()}>
            Atualizar
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : (
        <>
          <section className="border border-border bg-card p-6">
            <Eyebrow>plano atual</Eyebrow>
            <p className="mt-2 font-display text-xl font-bold">
              {sub?.plan?.name ?? (sub?.hasAccess ? "Trial Elite" : "Sem acesso")}
            </p>
            <p className="mt-1 font-mono-tk text-xs text-muted-foreground">
              Status: {sub?.status}
              {sub?.daysLeftInTrial != null && ` · ${sub.daysLeftInTrial} dia(s) de trial`}
            </p>
            {sub?.hasAccess && sub.status === "active" && (
              <button
                type="button"
                onClick={() => portal.mutate()}
                className="mt-4 border border-border px-4 py-2 font-mono-tk text-[11px] uppercase tracking-widest hover:border-primary"
              >
                Gerenciar no Stripe
              </button>
            )}
          </section>

          <section>
            <Eyebrow>planos disponíveis</Eyebrow>
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
                      {current ? "Plano atual" : "Assinar"}
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
