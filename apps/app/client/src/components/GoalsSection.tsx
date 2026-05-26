import PlanTracker from "@/components/PlanTracker";
import UpgradeCard from "@/components/UpgradeCard";
import { useSubscription } from "@/hooks/useSubscription";

export default function GoalsSection() {
  const { data: sub } = useSubscription();
  const canGoals =
    sub?.entitlements &&
    typeof sub.entitlements === "object" &&
    (sub.entitlements as { moduleGoalsRisk?: boolean }).moduleGoalsRisk === true;

  if (!canGoals) {
    return (
      <UpgradeCard
        title="Metas & Risco avançado"
        description="Crie metas semanais e mensais, acompanhe progresso e integre com seu plano de risco. Disponível no plano Pro Trader ou superior."
      />
    );
  }
  return <PlanTracker />;
}
