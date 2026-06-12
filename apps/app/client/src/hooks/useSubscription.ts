import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PlanId } from "@trackion/billing";
import { stripeLookupKey } from "@trackion/billing";
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

export interface CheckoutSessionInfo {
  status: string | null;
  paymentStatus: string | null;
  planName: string | null;
  planId: string | null;
  customerId: string | null;
  accessGranted?: boolean;
}

export type CheckoutInput = PlanId | { planId: PlanId; lookupKey?: string };

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

export function useCheckoutSession(sessionId: string | undefined) {
  return useQuery<CheckoutSessionInfo>({
    queryKey: ["/api/billing/checkout-session", sessionId],
    enabled: !!sessionId,
    retry: 2,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "complete" && data?.paymentStatus === "paid") return false;
      return 3000;
    },
    queryFn: async () => {
      const res = await fetch(`/api/billing/checkout-session?session_id=${encodeURIComponent(sessionId!)}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao carregar sessão");
      return data;
    },
  });
}

export function useBillingCheckout() {
  return useMutation({
    mutationFn: async (input: CheckoutInput) => {
      readAffiliateFromBillingHash();
      const affiliate = getAffiliateSignupPayload();
      const planId = typeof input === "string" ? input : input.planId;
      const lookupKey = typeof input === "string" ? stripeLookupKey(input) : input.lookupKey ?? stripeLookupKey(input.planId);
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId, lookupKey, ...affiliate }),
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
    mutationFn: async (opts?: { sessionId?: string }) => {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(opts?.sessionId ? { sessionId: opts.sessionId } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro no portal");
      if (data.url) window.location.href = data.url;
      return data;
    },
  });
}

export function useBillingSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/sync-subscription", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao sincronizar");
      return data as { ok: boolean; hasAccess: boolean; planId?: string };
    },
    onSuccess: (data) => {
      if (data.hasAccess) {
        void queryClient.invalidateQueries({ queryKey: ["/api/me/subscription"] });
        void queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }
    },
  });
}
