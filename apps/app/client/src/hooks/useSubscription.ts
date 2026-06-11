import { useQuery, useMutation } from "@tanstack/react-query";
import type { PlanId } from "@trackion/billing";
import { getAffiliateSignupPayload, readAffiliateFromBillingHash } from "@/lib/affiliate";

export interface SubscriptionInfo {
  status: string;
  effectivePlanId: string | null;
  hasAccess: boolean;
  trialEnded: boolean;
  daysLeftInTrial: number | null;
  entitlements: Record<string, unknown> | null;
  plan: { id: string; name: string; priceCents: number; highlights: string[] } | null;
  catalog: Array<{
    id: PlanId;
    name: string;
    tagline: string;
    priceCents: number;
    highlights: string[];
  }>;
}

export function useSubscription() {
  return useQuery<SubscriptionInfo>({
    queryKey: ["/api/me/subscription"],
    staleTime: 60_000,
    queryFn: async () => {
      const res = await fetch("/api/me/subscription", { credentials: "include" });
      if (!res.ok) throw new Error("Erro ao carregar assinatura");
      return res.json();
    },
  });
}

export function useBillingCheckout() {
  return useMutation({
    mutationFn: async (planId: PlanId) => {
      readAffiliateFromBillingHash();
      const affiliate = getAffiliateSignupPayload();
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId, ...affiliate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro no checkout");
      if (data.url) window.location.href = data.url;
      return data;
    },
  });
}

export function useBillingPortal() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro no portal");
      if (data.url) window.location.href = data.url;
      return data;
    },
  });
}
