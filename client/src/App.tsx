import { lazy, Suspense } from "react";
import { Router, Switch, Route, Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "react-hot-toast";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, Bitcoin, BarChart2, BookOpen, Plug, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, useLogout } from "@/hooks/useAuth";
const LoginPage = lazy(() => import("@/pages/Login"));

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

// ── BTC SVG logo ──────────────────────────────────────────────────────────────
function BTCLogo() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" aria-label="BTC Tracker">
      <rect width="36" height="36" rx="8" fill="hsl(27,100%,55%)" />
      <path d="M24.5 16.8c.6-.8.9-1.8.7-2.9-.5-2.4-2.7-3.3-5.5-3.3H13v14h7.2c3.1 0 5.5-1.2 5.5-4.1 0-1.5-.7-2.8-1.2-3.7zm-7.7-3.6h3.2c1.1 0 2 .4 2 1.6s-.9 1.7-2 1.7h-3.2v-3.3zm3.6 9.2H16.8v-3.5h3.6c1.3 0 2.2.5 2.2 1.8 0 1.2-.9 1.7-2.2 1.7z" fill="white"/>
      <rect x="16" y="8" width="1.5" height="3" rx=".75" fill="white"/>
      <rect x="20" y="8" width="1.5" height="3" rx=".75" fill="white"/>
      <rect x="16" y="25" width="1.5" height="3" rx=".75" fill="white"/>
      <rect x="20" y="25" width="1.5" height="3" rx=".75" fill="white"/>
    </svg>
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

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  state = { hasError: false, error: undefined };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("[ErrorBoundary]", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center space-y-3">
          <p className="text-loss font-semibold">Algo deu errado nesta página</p>
          <p className="text-xs text-muted-foreground">{this.state.error?.message}</p>
          <button
            className="text-xs text-primary underline"
            onClick={() => this.setState({ hasError: false })}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar() {
  const [location] = useHashLocation();
  const { user }   = useAuth();
  const logout     = useLogout();

  return (
    <aside className="flex flex-col w-56 bg-card border-r border-border h-full overflow-y-auto shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <BTCLogo />
        <div>
          <p className="text-sm font-bold text-foreground leading-tight">BTC Tracker</p>
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
        <a
          href="https://www.perplexity.ai/computer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary transition-colors block"
        >
          Created with Perplexity Computer
        </a>
      </div>
    </aside>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background min-w-0">
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>
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
  return <>{children}</>;
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
