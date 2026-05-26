import { formatPlanPrice, PLAN_CATALOG, TRIAL_DAYS, type PlanId } from "@trackion/billing";

export const PRICING_PLANS = (["starter", "pro", "elite"] as PlanId[]).map((id) => PLAN_CATALOG[id]);

export { formatPlanPrice, TRIAL_DAYS };
