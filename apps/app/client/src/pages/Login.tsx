import { useState } from "react";
import { Eye, EyeOff, LogIn, Mail, TrendingUp, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthEnter, useLogin, useResendVerification } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: TrendingUp, label: "Rastreie seus trades BTCUSDT em tempo real" },
  { icon: Shield, label: "Gerencie risco com regras personalizadas" },
  { icon: Zap, label: "Sincronize com a MEXC via API" },
];

type Step = "email" | "check_email" | "password";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const enter = useAuthEnter();
  const login = useLogin();
  const resend = useResendVerification();

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const result = await enter.mutateAsync({ email: email.trim() });
      if (result.status === "password_required") {
        setStep("password");
        toast.success("Informe a senha enviada ao seu e-mail");
      } else {
        setStep("check_email");
        toast.success(result.message ?? "Verifique seu e-mail");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro");
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login.mutateAsync({ email: email.trim(), password });
      toast.success("Bem-vindo ao Trackion!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar");
    }
  }

  async function handleResend() {
    try {
      await resend.mutateAsync({ email: email.trim() });
      toast.success("E-mail reenviado");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-stretch">
      <div className="hidden lg:flex w-[45%] bg-card border-r border-border flex-col justify-between p-10 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-3 z-10">
          <img src="/logo.png" alt="Trackion" className="w-10 h-10 rounded-xl object-contain" />
          <div>
            <p className="font-bold text-foreground leading-tight">Trackion</p>
            <p className="text-xs text-muted-foreground">Trading Strategy</p>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-xl font-bold text-foreground leading-tight">
            Controle total da sua<br />
            <span className="text-primary">estratégia Bitcoin</span>
          </h1>
          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, label }, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="Trackion" className="w-9 h-9 rounded-xl object-contain" />
          <p className="font-bold text-foreground">Trackion</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground">Acessar Trackion</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {step === "email" && "Digite seu e-mail para entrar ou criar conta"}
              {step === "check_email" && "Confirme o e-mail que enviamos"}
              {step === "password" && "Use a senha enviada ao seu e-mail"}
            </p>
          </div>

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email-enter"
                  className="bg-muted/40 h-10"
                />
              </div>
              <Button type="submit" className="w-full" disabled={enter.isPending} data-testid="button-enter">
                {enter.isPending ? "Enviando..." : (
                  <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Continuar</span>
                )}
              </Button>
            </form>
          )}

          {step === "check_email" && (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Enviamos um e-mail para <strong className="text-foreground">{email}</strong> com sua senha
                temporária e o link de confirmação.
              </p>
              <Button variant="outline" className="w-full" onClick={handleResend} disabled={resend.isPending}>
                Reenviar e-mail
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep("password")}>
                Já confirmei — inserir senha
              </Button>
              <Button variant="ghost" className="w-full text-xs" onClick={() => setStep("email")}>
                Usar outro e-mail
              </Button>
            </div>
          )}

          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <p className="text-xs text-muted-foreground">{email}</p>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password-login"
                    className="bg-muted/40 h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={login.isPending} data-testid="button-login">
                {login.isPending ? "Entrando..." : (
                  <span className="flex items-center gap-2"><LogIn className="w-4 h-4" /> Entrar</span>
                )}
              </Button>
              <Button type="button" variant="ghost" className="w-full text-xs" onClick={() => setStep("email")}>
                Voltar
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
