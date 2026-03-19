import { useState } from "react";
import { Bitcoin, Eye, EyeOff, LogIn, UserPlus, TrendingUp, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogin, useRegister } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// ── Animated BTC price ticker (decorative) ────────────────────────────────────
const FEATURES = [
  { icon: TrendingUp, label: "Rastreie seus trades BTCUSDT em tempo real" },
  { icon: Shield,     label: "Gerencie risco com 2.50 USDT por operação" },
  { icon: Zap,        label: "Sincronize com a MEXC via API" },
];

// ── Login form ────────────────────────────────────────────────────────────────
function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);

  const login    = useLogin();
  const register = useRegister();
  const mutation = mode === "login" ? login : register;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    try {
      await mutation.mutateAsync({ email: email.trim(), password });
      toast.success(mode === "login" ? "Bem-vindo de volta!" : "Conta criada com sucesso!");
    } catch (err: any) {
      toast.error(err.message ?? "Algo deu errado");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={`email-${mode}`} className="text-sm text-muted-foreground">
          Email
        </Label>
        <Input
          id={`email-${mode}`}
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete={mode === "login" ? "email" : "username"}
          data-testid={`input-email-${mode}`}
          className="bg-muted/40 border-border focus:border-primary h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`pwd-${mode}`} className="text-sm text-muted-foreground">
          Senha
        </Label>
        <div className="relative">
          <Input
            id={`pwd-${mode}`}
            type={showPwd ? "text" : "password"}
            placeholder={mode === "register" ? "Mínimo 6 caracteres" : "••••••••"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={mode === "register" ? 6 : 1}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            data-testid={`input-password-${mode}`}
            className="bg-muted/40 border-border focus:border-primary h-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            data-testid={`toggle-password-${mode}`}
          >
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending}
        data-testid={`button-${mode}`}
        className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all"
      >
        {mutation.isPending ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {mode === "login" ? "Entrando..." : "Criando conta..."}
          </span>
        ) : mode === "login" ? (
          <span className="flex items-center gap-2"><LogIn className="w-4 h-4" /> Entrar</span>
        ) : (
          <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Criar conta</span>
        )}
      </Button>
    </form>
  );
}

// ── Login page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-stretch">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex w-[45%] bg-card border-r border-border flex-col justify-between p-10 relative overflow-hidden">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Orange glow */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3 z-10">
          <img src="/logo.png" alt="Trackion" className="w-10 h-10 rounded-xl object-contain" />
          <div>
            <p className="font-bold text-foreground leading-tight">Trackion</p>
            <p className="text-xs text-muted-foreground">Trading Strategy</p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-xl font-bold text-foreground leading-tight">
              Controle total da sua<br />
              <span className="text-primary">estratégia Bitcoin</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-xs">
              Rastreie trades, gerencie risco e acompanhe o crescimento do seu stack BTC — tudo em um só lugar.
            </p>
          </motion.div>

          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, label }, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground leading-relaxed">{label}</span>
              </motion.li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="Trackion" className="w-9 h-9 rounded-xl object-contain" />
          <p className="font-bold text-foreground">Trackion</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-sm"
        >
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground">Acessar conta</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Entre ou crie sua conta para continuar
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full mb-5 bg-muted/40 border border-border">
              <TabsTrigger value="login" className="flex-1 data-testid-login" data-testid="tab-login">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1" data-testid="tab-register">
                Criar conta
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="login" asChild>
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <AuthForm mode="login" />
                </motion.div>
              </TabsContent>

              <TabsContent value="register" asChild>
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <AuthForm mode="register" />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          <p className="text-xs text-muted-foreground text-center mt-6">
            App pessoal de trading — seus dados ficam privados
          </p>
        </motion.div>
      </div>
    </div>
  );
}
