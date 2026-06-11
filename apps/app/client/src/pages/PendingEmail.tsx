import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppLocale } from "@/lib/locale-context";
import { MarketSelector } from "@/components/MarketSelector";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";

export default function PendingEmailPage({ email }: { email: string }) {
  const { t, market, setMarket } = useAppLocale();
  const [resending, setResending] = useState(false);

  const resend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.pendingEmail.error);
      toast.success(data.message ?? t.pendingEmail.resent);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.pendingEmail.error);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <MarketSelector market={market} onChange={setMarket} compact />
      </div>
      <div className="w-full max-w-md space-y-6 border border-border bg-card p-8">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold">{t.pendingEmail.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{t.pendingEmail.body(email)}</p>
        <div className="space-y-2">
          <Label htmlFor="pending-email">{t.pendingEmail.emailLabel}</Label>
          <Input id="pending-email" value={email} readOnly className="bg-muted" />
        </div>
        <Button type="button" className="w-full" onClick={resend} disabled={resending}>
          {resending ? t.pendingEmail.resending : t.pendingEmail.resend}
        </Button>
        <p className="text-center text-xs text-muted-foreground">{t.pendingEmail.hint}</p>
      </div>
    </div>
  );
}
