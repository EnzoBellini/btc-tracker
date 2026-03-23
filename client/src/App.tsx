import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { Router, Switch, Route, Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, Bitcoin, BarChart2, BookOpen, Plug, LogOut, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useSyncTradesFromMexc } from "@/hooks/useTrades";
const LoginPage = lazy(() => import("@/pages/Login"));

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

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const Dashboard   = lazy(() => import("@/pages/Dashboard"));
const Trades      = lazy(() => import("@/pages/Trades"));
const Transfers   = lazy(() => import("@/pages/Transfers"));
const BtcHoldings = lazy(() => import("@/pages/BtcHoldings"));
const Reports     = lazy(() => import("@/pages/Reports"));
const Rules       = lazy(() => import("@/pages/Rules"));
const ApiSettings = lazy(() => import("@/pages/ApiSettings"));
const NotFound    = lazy(() => import("@/pages/not-found"));

// ── Nav config ────────────────────────────────────────────────────────────────
const navItems = [
  { href: "/",             label: "Dashboard",      icon: LayoutDashboard },
  { href: "/trades",       label: "Trades",         icon: TrendingUp },
  { href: "/transfers",    label: "Transferências", icon: ArrowLeftRight },
  { href: "/btc-holdings", label: "BTC Stack",      icon: Bitcoin },
  { href: "/reports",      label: "Relatórios",     icon: BarChart2 },
  { href: "/rules",        label: "Regras & Metas", icon: BookOpen },
  { href: "/api-settings", label: "API MEXC",       icon: Plug },
];

// ── Trackion logo ──────────────────────────────────────────────────────────────
function TrackionLogo() {
  return (
    <img
      src="/logo.png"
      alt="Trackion"
      className="w-8 h-8 rounded-lg object-contain"
    />
  );
}

// ── Page loading fallback ─────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}

// ── ErrorBoundary ─────────────────────────────────────────────────────────────
import { Component, type ErrorInfo, type ReactNode } from "react";

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
        <div className="p-8 text-center space-y-3">
          <p className="text-loss font-semibold">Algo deu errado nesta página</p>
          <p className="text-xs text-muted-foreground">{this.state.error?.message}</p>
          <button
            className="text-xs text-primary underline"
            onClick={() =>
              needsReload ? window.location.reload() : this.setState({ hasError: false })
            }
          >
            {needsReload ? "Recarregar página" : "Tentar novamente"}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const [location] = useHashLocation();
  const { user }   = useAuth();
  const logout     = useLogout();

  return (
    <aside
      className={cn(
        "flex flex-col w-56 bg-card border-r border-border h-full overflow-y-auto shrink-0",
        "transition-transform duration-200 ease-out",
        "max-md:fixed max-md:left-0 max-md:top-0 max-md:z-50",
        "md:relative md:translate-x-0",
        open ? "max-md:translate-x-0" : "max-md:-translate-x-full"
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <TrackionLogo />
        <div>
          <p className="text-sm font-bold text-foreground leading-tight">Trackion</p>
          <p className="text-xs text-muted-foreground">Trading Strategy</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href !== "/" && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <a
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Bottom — user info + logout + attribution */}
      <div className="px-3 py-3 border-t border-border space-y-2">
        {user && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground truncate flex-1" title={user.email}>
              {user.email}
            </p>
            <button
              onClick={() => logout.mutate()}
              title="Sair"
              data-testid="button-logout"
              className="p-1.5 rounded-md text-muted-foreground hover:text-loss hover:bg-muted transition-colors flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
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

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Backdrop (mobile) */}
      <button
        type="button"
        aria-label="Fechar menu"
        className={cn(
          "fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile header + main */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* Hamburger header (mobile only) */}
        <header className="md:hidden shrink-0 h-14 flex items-center gap-3 px-4 bg-card border-b border-border">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <TrackionLogo />
            <span className="text-sm font-bold text-foreground">Trackion</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background min-w-0">
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

// ── Auth guard ───────────────────────────────────────────────────────────────
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Carregando...</span>
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
          <Route component={() => <Layout><NotFound /></Layout>} />
        </Switch>
      </Router>
      </AuthGate>
      {/* react-hot-toast replacing shadcn Toaster */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
            fontSize: "0.875rem",
          },
          success: { iconTheme: { primary: "hsl(142,71%,45%)", secondary: "hsl(var(--card))" } },
          error:   { iconTheme: { primary: "hsl(0,72%,51%)",   secondary: "hsl(var(--card))" } },
        }}
      />
    </QueryClientProvider>
  );
}
