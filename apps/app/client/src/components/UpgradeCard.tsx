import { Link } from "wouter";
import { TerminalFrame, TerminalButton } from "@/components/tk";

export default function UpgradeCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <TerminalFrame title="upgrade · plano" status="idle" orangeCorners>
      <div className="space-y-4 p-6">
        <p className="font-display text-lg font-bold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Link href="/billing">
          <TerminalButton>Ver planos</TerminalButton>
        </Link>
      </div>
    </TerminalFrame>
  );
}
