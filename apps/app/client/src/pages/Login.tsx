import { useState } from "react";
import { Eye, EyeOff, Mail, TrendingUp, Shield, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthEnter, useLogin, useResendVerification, useForgotPassword } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CornerMarks, TerminalButton, Eyebrow } from "@/components/tk";
import { cn } from "@/lib/utils";
import { useAppLocale } from "@/lib/locale-context";

type Step = "email" | "check_email" | "password";

function TrackionBrand({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const { t } = useAppLocale();
  const img = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-8 w-8";
  const word = size === "lg" ? "text-lg" : "text-base";
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/logo-trackion.png"
        alt=""
        width={size === "lg" ? 40 : size === "sm" ? 28 : 32}
        height={size === "lg" ? 40 : size === "sm" ? 28 : 32}
        className={cn("shrink-0 object-contain", img)}
        decoding="async"
      />
      <div>
        <p className={cn("font-bold tracking-[0.28em] text-foreground", word)}>TRACKION</p>
        <p className="font-mono-tk text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          {t.shell.brandSubtitle}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useAppLocale();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const enter = useAuthEnter();
  const login = useLogin();
  const resend = useResendVerification();
  const forgot = useForgotPassword();

  const todayISO = new Date().toISOString().slice(0, 10);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const result = await enter.mutateAsync({ email: email.trim() });
      if (result.status === "password_required") {
        setStep("password");
        toast.success(t.login.toastPasswordRequired);
      } else {
        setStep("check_email");
        toast.success(result.message ?? t.login.toastCheckEmail);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.login.toastError);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login.mutateAsync({ email: email.trim(), password });
      toast.success(t.login.toastWelcome);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.login.toastLoginError);
    }
  }

  async function handleResend() {
    try {
      await resend.mutateAsync({ email: email.trim() });
      toast.success(t.login.toastResent);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.login.toastError);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) return;
    try {
      const result = await forgot.mutateAsync({ email: email.trim() });
      toast.success(result.message ?? t.login.forgotSent);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.login.toastError);
    }
  }

  const meta = t.login.stepMeta[step];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="relative hidden w-[44%] shrink-0 flex-col justify-between overflow-hidden border-r border-border bg-card lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-60" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-ambient-orange" aria-hidden />

        <div className="relative z-10 p-10">
          <TrackionBrand size="lg" />
          <p className="mt-6 font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            <span className="text-primary">●</span> session · {todayISO}
          </p>
        </div>

        <div className="relative z-10 space-y-10 px-10 pb-12">
          <div className="space-y-4">
            <Eyebrow tone="primary">auth · terminal access</Eyebrow>
            <h1 className="font-display text-4xl font-bold leading-[0.92] tracking-tight text-foreground xl:text-5xl">
              {t.login.heroTitle[0]}{" "}
              <span className="font-serif-tk italic font-normal text-primary">{t.login.heroTitle[1]}</span>{" "}
              {t.login.heroTitle[2]}
            </h1>
          </div>

          <ul className="space-y-4 border-t border-border pt-8">
            {t.login.features.map(({ index, label }) => {
              const Icon = [TrendingUp, Shield, Zap][Number(index) - 1] ?? TrendingUp;
              return (
                <li key={index} className="grid grid-cols-[auto_auto_1fr] items-start gap-4">
                  <span className="font-mono-tk text-[10px] tracking-[0.28em] text-primary">{index}</span>
                  <div className="flex h-8 w-8 items-center justify-center border border-primary/30 bg-primary/[0.06]">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="pt-1 text-sm leading-relaxed text-muted-foreground">{label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative z-10 border-t border-border px-10 py-4 font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          ↳ trackion.app · encrypted session
        </p>
      </aside>

      <main className="relative flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-30" aria-hidden />

        <div className="relative mb-8 lg:hidden">
          <TrackionBrand />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md"
        >
          <div className="relative border border-border bg-card">
            <CornerMarks orange />

            <div className="border-b border-border px-6 py-4">
              <div className="flex items-center justify-between gap-3 font-mono-tk text-[10px] uppercase tracking-[0.28em]">
                <span className="text-muted-foreground">
                  <span className="text-primary">[{meta.index}]</span> · auth.login
                </span>
                <span className="flex items-center gap-1.5 text-profit">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-profit" />
                  secure
                </span>
              </div>
              <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {meta.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{meta.hint}</p>
            </div>

            <div className="px-6 py-6">
              <AnimatePresence mode="wait">
                {step === "email" && (
                  <motion.form
                    key="email"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleEmailSubmit}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
                      >
                        {t.login.emailLabel}
                      </label>
                      <div className="flex items-center gap-3 border border-border bg-background px-4 py-2.5 font-mono-tk text-sm">
                        <span className="select-none text-primary">›</span>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t.login.emailPlaceholder}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          data-testid="input-email-enter"
                          className="h-auto min-w-0 flex-1 border-0 bg-transparent p-0 font-mono-tk text-sm shadow-none focus-visible:ring-0"
                        />
                      </div>
                    </div>
                    <TerminalButton
                      type="submit"
                      className="w-full"
                      disabled={enter.isPending}
                      icon={Mail}
                      data-testid="button-enter"
                    >
                      {enter.isPending ? t.login.sending : t.login.continue}
                    </TerminalButton>
                  </motion.form>
                )}

                {step === "check_email" && (
                  <motion.div
                    key="check_email"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div className="border border-border bg-background p-4 text-sm leading-relaxed text-muted-foreground">
                      <p>{t.login.checkEmailBody(email)}</p>
                    </div>
                    <TerminalButton
                      variant="outline"
                      className="w-full"
                      onClick={handleResend}
                      disabled={resend.isPending}
                    >
                      {resend.isPending ? t.login.resending : t.login.resend}
                    </TerminalButton>
                    <TerminalButton variant="outline" className="w-full" onClick={() => setStep("password")}>
                      {t.login.confirmedEnterPassword}
                    </TerminalButton>
                    <TerminalButton variant="ghost" className="w-full" onClick={() => setStep("email")}>
                      {t.login.useOtherEmail}
                    </TerminalButton>
                  </motion.div>
                )}

                {step === "password" && (
                  <motion.form
                    key="password"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handlePasswordSubmit}
                    className="space-y-5"
                  >
                    <p className="font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      user · <span className="text-foreground">{email}</span>
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="password"
                          className="font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
                        >
                          {t.login.passwordLabel}
                        </label>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={forgot.isPending}
                          className="font-mono-tk text-[10px] uppercase tracking-[0.18em] text-primary underline decoration-primary/40 underline-offset-2 transition hover:text-primary/80 disabled:opacity-50"
                        >
                          {forgot.isPending ? t.login.forgotSending : t.login.forgotPassword}
                        </button>
                      </div>
                      <div className="relative flex items-center gap-3 border border-border bg-background px-4 py-2.5 font-mono-tk text-sm">
                        <span className="select-none text-primary">›</span>
                        <Input
                          id="password"
                          type={showPwd ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          data-testid="input-password-login"
                          className="h-auto min-w-0 flex-1 border-0 bg-transparent p-0 pr-8 font-mono-tk text-sm shadow-none focus-visible:ring-0"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                          tabIndex={-1}
                          aria-label={showPwd ? t.login.hidePassword : t.login.showPassword}
                        >
                          {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <TerminalButton
                      type="submit"
                      className="w-full"
                      disabled={login.isPending}
                      data-testid="button-login"
                    >
                      {login.isPending ? t.login.entering : t.login.enter}
                    </TerminalButton>
                    <TerminalButton type="button" variant="ghost" className="w-full" onClick={() => setStep("email")}>
                      {t.login.back}
                    </TerminalButton>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-border px-6 py-3 font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              {t.login.stepFooter.replace("{step}", meta.index)}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
