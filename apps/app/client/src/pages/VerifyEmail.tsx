import { useEffect } from "react";
import { useVerifyEmail } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useAppLocale } from "@/lib/locale-context";

function getTokenFromHash(): string | null {
  const hash = window.location.hash;
  const q = hash.includes("?") ? hash.split("?")[1] : "";
  return new URLSearchParams(q).get("token");
}

export default function VerifyEmailPage() {
  const { t } = useAppLocale();
  const verify = useVerifyEmail();
  const token = getTokenFromHash();

  useEffect(() => {
    if (!token) return;
    verify.mutate(token, {
      onSuccess: () => toast.success(t.verifyEmail.toastConfirmed),
      onError: (e) => toast.error(e.message),
    });
  }, [token, t.verifyEmail.toastConfirmed]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-2">
          <XCircle className="w-10 h-10 text-loss mx-auto" />
          <p className="text-sm text-muted-foreground">{t.verifyEmail.invalidLink}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-3 max-w-sm">
        {verify.isPending && (
          <>
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">{t.verifyEmail.confirming}</p>
          </>
        )}
        {verify.isSuccess && (
          <>
            <CheckCircle2 className="w-10 h-10 text-profit mx-auto" />
            <p className="font-medium text-foreground">{t.verifyEmail.confirmed}</p>
            <p className="text-sm text-muted-foreground">{t.verifyEmail.redirecting}</p>
          </>
        )}
        {verify.isError && (
          <>
            <XCircle className="w-10 h-10 text-loss mx-auto" />
            <p className="text-sm text-loss">{verify.error.message}</p>
          </>
        )}
      </div>
    </div>
  );
}
