import { runSubscriptionMaintenance } from "./subscriptionService";

const INTERVAL_MS = 60 * 60 * 1000;

export function startSubscriptionCron(log: (msg: string) => void) {
  const tick = async () => {
    try {
      const { expired } = await runSubscriptionMaintenance();
      if (expired > 0) log(`[billing] ${expired} trial(s) expirado(s)`);
    } catch (e) {
      console.error("[billing/cron]", e);
    }
  };

  tick();
  setInterval(tick, INTERVAL_MS);
}
