import { formatPlanPrice, PLAN_CATALOG, TRIAL_DAYS, type PlanId } from "./plan-catalog";

export const PRICING_PLANS = (["starter", "pro", "elite"] as PlanId[]).map((id) => PLAN_CATALOG[id]);

export { formatPlanPrice, TRIAL_DAYS };
