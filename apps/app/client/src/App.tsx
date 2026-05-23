import { lazy, Suspense, useState, useEffect, useRef, Component, type ErrorInfo, type ReactNode } from "react";
import { Router, Switch, Route, Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "react-hot-toast";
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, Bitcoin, BarChart2, BookOpen, Plug, LogOut, Menu, User, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useSyncTradesFromMexc } from "@/hooks/useTrades";
import { useMexcCredentials } from "@/hooks/useMexc";
import TopTicker from "@/components/tk/TopTicker";

const LoginPage = lazy(() => import("@/pages/Login"));
const VerifyEmailPage = lazy(() => import("@/pages/VerifyEmail"));
const ChangePasswordPage = lazy(() => import("@/pages/ChangePassword"));
const OnboardingQuizPage = lazy(() => import("@/pages/OnboardingQuiz"));

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Trades = lazy(() => import("@/pages/Trades"));
const Transfers = lazy(() => import("@/pages/Transfers"));
const BtcHoldings = lazy(() => import("@/pages/BtcHoldings"));
const Reports = lazy(() => import("@/pages/Reports"));
const Rules = lazy(() => import("@/pages/Rules"));
const ApiSettings = lazy(() => import("@/pages/ApiSettings"));
const NotFound = lazy(() => import("@/pages/not-found"));

// ── Sync MEXC ao abrir o app (após login) ────────────────────────────────────────
function SyncOnLogin() {
  const { user } = useAuth();
  const syncFromMexc = useSyncTradesFromMexc();
  const hasSynced = useRef(false);
  useEffect(() => {
    if (user && !hasSynced.current) {
      hasSynced.current = true;
      syncFromMexc.mutate();
    }
  }, [user]);
  return null;
}

// ── Nav config ────────────────────────────────────────────────────────────────
const navItems = [
  { href: "/",             index: "01", label: "Dashboard",      mono: "DASHBOARD",  icon: LayoutDashboard },
  { href: "/trades",       index: "02", label: "Trades",         mono: "TRADES",     icon: TrendingUp },
  { href: "/transfers",    index: "03", label: "Transferências", mono: "TRANSFERS",  icon: ArrowLeftRight },
  { href: "/btc-holdings", index: "04", label: "BTC Stack",      mono: "BTC.STACK",  icon: Bitcoin },
  { href: "/reports",      index: "05", label: "Relatórios",     mono: "REPORTS",    icon: BarChart2 },
  { href: "/rules",        index: "06", label: "Regras & Metas", mono: "RULES",      icon: BookOpen },
  { href: "/api-settings", index: "07", label: "API MEXC",       mono: "API.MEXC",   icon: Plug },
  { href: "/conta",        index: "08", label: "Conta",          mono: "ACCOUNT",    icon: User },
];

// ── Page loading fallback ─────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="space-y-6 p-8">
      <div className="space-y-3 border-b border-border pb-6">
        <div className="h-3 w-32 animate-pulse bg-muted" />
        <div className="h-10 w-72 animate-pulse bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse bg-muted" />)}
      </div>
      <div className="h-64 animate-pulse bg-muted" />
    </div>
  );
}

// ── ErrorBoundary ─────────────────────────────────────────────────────────────
const isChunkLoadError = (err?: Error) => {
  const msg = err?.message ?? "";
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Loading chunk") ||
    msg.includes("ChunkLoadError") ||
    (msg.includes("Failed to fetch") && msg.includes("imported"))
  );
};

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  state = { hasError: false, error: undefined };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("[ErrorBoundary]", error, info); }
  render() {
    if (this.state.hasError) {
      const needsReload = isChunkLoadError(this.state.error);
      return (
        <div className="flex h-full items-center justify-center p-8">
          <div className="relative max-w-md border border-loss/40 bg-card p-8 text-center">
            <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-loss">
              [ERR] · runtime exception
            </p>
            <p className="mt-3 font-display text-2xl font-bold">Algo deu errado</p>
            <p className="mt-3 break-all font-mono-tk text-xs text-muted-foreground">
              {(this.state.error as Error | undefined)?.message}
            </p>
            <button
              className="mt-6 inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 font-mono-tk text-[11px] font-bold uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-transparent hover:text-primary"
              onClick={() => needsReload ? window.location.reload() : this.setState({ hasError: false })}
            >
              {needsReload ? "Recarregar" : "Tentar novamente"}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const [location] = useHashLocation();
  const { user } = useAuth();
  const logout = useLogout();
  const { data: creds } = useMexcCredentials();
  const isConnected = !!creds?.isConnected;

  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-card",
        "transition-transform duration-200 ease-out",
        "max-md:fixed max-md:left-0 max-md:top-0 max-md:z-50",
        "md:relative md:translate-x-0",
        open ? "max-md:translate-x-0" : "max-md:-translate-x-full",
      )}
    >
      {/* Brand block — bordered */}
      <div className="border-b border-border px-5 py-5">
        <div className="flex items-center gap-2.5">
          <img src="/logo-trackion.png" alt="" className="h-7 w-7 shrink-0 object-contain" decoding="async" />
          <div className="min-w-0">
            <p className="text-base font-bold tracking-[0.28em] text-foreground">TRACKION</p>
            <p className="font-mono-tk text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              trading journal · v2
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between font-mono-tk text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="num">{todayISO}</span>
          <span className="flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", isConnected ? "bg-profit animate-pulse" : "bg-muted-foreground/40")} />
            {isConnected ? "MEXC LIVE" : "MEXC OFF"}
          </span>
        </div>
      </div>

      {/* Eyebrow */}
      <p className="mt-5 px-5 pb-2 font-mono-tk text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
        ↳ navigation · 08 modules
      </p>

      {/* Nav */}
      <nav className="flex-1 px-2 pb-4">
        {navItems.map(({ href, index, label, mono, icon: Icon }) => {
          const active = location === href || (href !== "/" && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <a
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary/[0.06] text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.02] hover:text-foreground",
                )}
              >
                <span className={cn("font-mono-tk text-[10px] tracking-[0.22em]", active ? "text-primary" : "text-muted-foreground/60")}>
                  {index}
                </span>
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                <span className="flex-1 truncate">{label}</span>
                {active && <span className="font-mono-tk text-[9px] text-primary">●</span>}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Bottom — user info + logout */}
      <div className="border-t border-border px-3 py-3">
        {user && (
          <>
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-background font-mono-tk text-[10px] font-bold uppercase text-primary">
                {user.email?.[0] ?? "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-foreground" title={user.email}>{user.email}</p>
                <p className="font-mono-tk text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                  ● online
                </p>
              </div>
              <button
                onClick={() => logout.mutate()}
                title="Sair"
                data-testid="button-logout"
                className="flex h-7 w-7 shrink-0 items-center justify-center border border-transparent text-muted-foreground transition hover:border-loss/40 hover:bg-loss/10 hover:text-loss"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useHashLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const currentNav = navItems.find((n) => n.href === location || (n.href !== "/" && location.startsWith(n.href))) ?? navItems[0];

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Backdrop (mobile) */}
      <button
        type="button"
        aria-label="Fechar menu"
        className={cn(
          "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity md:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Top bar: mobile hamburger + ticker (desktop+mobile) */}
        <header className="shrink-0 border-b border-border bg-card/60">
          <div className="flex h-12 items-center gap-3 px-4 md:hidden">
            <button
              type="button"
              aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo-trackion.png" alt="" className="h-6 w-6 object-contain" decoding="async" />
              <span className="text-sm font-bold tracking-[0.22em] text-foreground">TRACKION</span>
            </div>
            <div className="ml-auto flex items-center gap-2 font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="text-primary">/{currentNav.mono}</span>
            </div>
          </div>

          {/* Breadcrumb desktop */}
          <div className="hidden h-9 items-center gap-3 border-b border-border/60 px-6 font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground md:flex">
            <span className="text-primary">trackion.app</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground">{currentNav.mono}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-muted-foreground">{currentNav.index} / {String(navItems.length).padStart(2, "0")}</span>
            <span className="ml-auto flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-profit" />
              <span className="text-profit">OPERATIONAL</span>
            </span>
          </div>

          {/* Ticker (only desktop, to avoid being heavy in mobile) */}
          <div className="hidden md:block">
            <TopTicker />
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto bg-background">
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

// ── Auth guard ───────────────────────────────────────────────────────────────
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useHashLocation();

  if (location.startsWith("/verify-email")) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <VerifyEmailPage />
      </Suspense>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative border border-border bg-card px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="h-5 w-5 animate-spin border-2 border-primary border-t-transparent" />
            <div>
              <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                [SYS] · boot
              </p>
              <p className="font-display text-sm font-semibold text-foreground">Carregando sessão…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <LoginPage />
      </Suspense>
    );
  }

  if (!user.emailVerified) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <LoginPage />
      </Suspense>
    );
  }

  if (user.mustChangePassword) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <ChangePasswordPage />
      </Suspense>
    );
  }

  if (!user.onboardingCompleted) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <OnboardingQuizPage />
      </Suspense>
    );
  }

  return (
    <>
      <SyncOnLogin />
      {children}
    </>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <Router hook={useHashLocation}>
          <Switch>
            <Route path="/"             component={() => <Layout><Dashboard /></Layout>} />
            <Route path="/trades"       component={() => <Layout><Trades /></Layout>} />
            <Route path="/transfers"    component={() => <Layout><Transfers /></Layout>} />
            <Route path="/btc-holdings" component={() => <Layout><BtcHoldings /></Layout>} />
            <Route path="/reports"      component={() => <Layout><Reports /></Layout>} />
            <Route path="/rules"        component={() => <Layout><Rules /></Layout>} />
            <Route path="/api-settings" component={() => <Layout><ApiSettings /></Layout>} />
            <Route path="/conta"        component={() => <Layout><ChangePasswordPage /></Layout>} />
            <Route path="/verify-email" component={() => <VerifyEmailPage />} />
            <Route component={() => <Layout><NotFound /></Layout>} />
          </Switch>
        </Router>
      </AuthGate>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0",
            fontSize: "0.8rem",
            fontFamily: "JetBrains Mono, monospace",
          },
          success: { iconTheme: { primary: "hsl(var(--profit))", secondary: "hsl(var(--card))" } },
          error:   { iconTheme: { primary: "hsl(var(--loss))",   secondary: "hsl(var(--card))" } },
        }}
      />
    </QueryClientProvider>
  );
}
