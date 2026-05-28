import type { Market } from "./locale";
import { formatPlanPrice, getPricingPlans, TRIAL_DAYS, type PlanId } from "./plan-catalog";

export function getPlansForMarket(market: Market) {
  return getPricingPlans(market);
}

export { formatPlanPrice, TRIAL_DAYS, type PlanId };
