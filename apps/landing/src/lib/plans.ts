import type { Market } from "./locale";
import {
  formatPlanPrice,
  formatOriginalPlanPrice,
  getPricingPlans,
  launchSavingsPct,
  TRIAL_DAYS,
  type PlanId,
} from "./plan-catalog";

export function getPlansForMarket(market: Market) {
  return getPricingPlans(market);
}

export { formatPlanPrice, formatOriginalPlanPrice, launchSavingsPct, TRIAL_DAYS, type PlanId };
