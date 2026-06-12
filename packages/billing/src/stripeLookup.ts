import type { PlanId } from "./features";

export type StripeBillingCurrency = "BRL" | "USD";

/** Lookup key estável para preços Stripe (quickstart billing). */
export function stripeLookupKey(planId: PlanId, currency: StripeBillingCurrency = "BRL"): string {
  const suffix = currency === "USD" ? "usd" : "brl";
  return `trackion_${planId}_${suffix}`;
}
