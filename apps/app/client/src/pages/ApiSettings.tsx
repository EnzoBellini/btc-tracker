import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2, RefreshCw, Eye, EyeOff, Wifi, WifiOff,
  ShieldCheck, AlertTriangle, Key, Download, Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMexcCredentials, useTestMexc, useSyncMexc } from "@/hooks/useMexc";
import {
  PageHeader, TerminalFrame, TerminalButton, StatPill, Eyebrow, CornerMarks,
} from "@/components/tk";
import { cn } from "@/lib/utils";

function ServerIpHint() {
  const { data } = useQuery({
    queryKey: ["/api/mexc/server-ip"],
    queryFn: () => fetch("/api/mexc/server-ip").then(r => r.json()),
    staleTime: 60_000,
  });
  if (!data) return null;
  return (
    <div className={cn(
      "relative border p-4 font-mono-tk text-xs",
      data.error ? "border-loss/40 bg-loss/[0.04]" : "border-border bg-background",
    )}>
      <CornerMarks orange={!data.error} />
      <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        ↳ IP do servidor (whitelist MEXC)
      </p>
      {data.ip ? (
        <>
          <p className="num mt-3 break-all text-lg font-bold tracking-tight text-foreground select-all">
            {data.ip}
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Cole em <span className="text-foreground">MEXC → API Management → Alterar → Vincular endereço de IP</span>.
          </p>
        </>
      ) : (
        <p className="mt-2 text-loss">{data.error || "Não foi possível obter o IP"}</p>
      )}
    </div>
  );
}

function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return s; }
}

export default function ApiSettings() {
  const [showSecret, setShowSecret] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const { data: creds } = useMexcCredentials();
  const testMexc = useTestMexc();
  const syncMexc = useSyncMexc();

  const isConnected = !!creds?.isConnected;

  return (
    <div className="relative space-y-10 p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-50" aria-hidden />

      <div className="relative max-w-3xl space-y-10">
        <PageHeader
          index="07"
          total="08"
          eyebrow="API · MEXC integration"
          title="Conecte sua exchange."
          subtitle="Vincule a MEXC para importar trades e saldo BTC automaticamente. Permissão de leitura apenas."
        />

        {/* STATUS BANNER */}
        <section>
          <div
            className={cn(
              "relative grid grid-cols-[auto_1fr_auto] items-center gap-5 border bg-card px-6 py-5",
              isConnected ? "border-profit/40" : "border-border",
            )}
          >
            <CornerMarks orange={isConnected} />
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center border",
                isConnected ? "border-profit/40 bg-profit/[0.06]" : "border-white/15 bg-muted",
              )}
            >
              {isConnected ? <Wifi className="h-5 w-5 text-profit" /> : <WifiOff className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div className="min-w-0">
              <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                connection status
              </p>
              <p className="font-display mt-1 text-2xl font-bold tracking-tight">
                {isConnected ? "Conectado à MEXC" : "Não conectado"}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {creds?.lastSyncMessage || (isConnected ? "Pronto para sincronizar" : "Configure suas chaves abaixo")}
              </p>
              {creds?.lastSyncAt && (
                <p className="mt-1 flex items-center gap-1.5 font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <Clock className="h-3 w-3" /> last sync: {fmtDate(creds.lastSyncAt)}
                </p>
              )}
            </div>
            <StatPill tone={isConnected ? "profit" : "off"} pulse={isConnected}>
              {isConnected ? "ATIVO" : "INATIVO"}
            </StatPill>
          </div>
        </section>

        {/* API KEY FORM — terminal command-line UI */}
        <section className="space-y-3">
          <Eyebrow>credentials · api keys</Eyebrow>

          <TerminalFrame
            title="trackion.app — POST /api/mexc/credentials"
            status="awaiting input"
            statusTone="info"
            orangeCorners
          >
            <div className="space-y-5 p-6">
              <div className="flex items-start gap-3">
                <Key className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="font-display text-base font-bold">Chaves de API MEXC</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Use uma API Key com permissão de <span className="text-foreground">leitura apenas</span> (Read Only).
                    Nunca ative permissões de saque ou trading.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey" className="font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  $ apiKey
                </Label>
                <div className="relative flex items-center gap-3 border border-border bg-background px-4 py-2.5 font-mono-tk text-sm">
                  <span className="select-none text-primary">›</span>
                  <input
                    id="apiKey"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="mx0aBYs33eIilxBWC5..."
                    className="num min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/40 outline-none"
                    data-testid="input-api-key"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretKey" className="font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  $ secretKey
                </Label>
                <div className="relative flex items-center gap-3 border border-border bg-background px-4 py-2.5 font-mono-tk text-sm">
                  <span className="select-none text-primary">›</span>
                  <input
                    id="secretKey"
                    type={showSecret ? "text" : "password"}
                    value={secretKey}
                    onChange={e => setSecretKey(e.target.value)}
                    placeholder="45d0b3c26f2644f1..."
                    className="num min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/40 outline-none"
                    data-testid="input-secret-key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-muted-foreground transition hover:text-foreground"
                    aria-label={showSecret ? "Ocultar" : "Mostrar"}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <TerminalButton
                  variant="outline"
                  icon={testMexc.isPending ? RefreshCw : ShieldCheck}
                  onClick={() => testMexc.mutate({ apiKey, secretKey })}
                  disabled={!apiKey || !secretKey || testMexc.isPending}
                  className={cn(testMexc.isPending && "[&_svg]:animate-spin")}
                  data-testid="button-test-connection"
                >
                  {testMexc.isPending ? "testing…" : "test connection"}
                </TerminalButton>
                {isConnected && (
                  <TerminalButton
                    variant="primary"
                    icon={syncMexc.isPending ? RefreshCw : Download}
                    onClick={() => syncMexc.mutate()}
                    disabled={syncMexc.isPending}
                    className={cn(syncMexc.isPending && "[&_svg]:animate-spin")}
                    data-testid="button-sync-mexc"
                  >
                    {syncMexc.isPending ? "syncing…" : "sync now"}
                  </TerminalButton>
                )}
              </div>

              <ServerIpHint />
            </div>
          </TerminalFrame>
        </section>

        {/* WHAT GETS IMPORTED */}
        <section className="space-y-3">
          <Eyebrow>imports · what we sync</Eyebrow>
          <ol className="divide-y divide-border border border-border bg-card">
            {[
              {
                icon: CheckCircle2, tone: "profit" as const,
                title: "Posições fechadas (Futuros BTC_USDT)",
                desc: "Trades importados como WIN/LOSS com preço de entrada, saída, leverage e PnL realizado",
              },
              {
                icon: CheckCircle2, tone: "profit" as const,
                title: "Saldo BTC (Spot)",
                desc: "Snapshot do saldo atual de BTC adicionado ao BTC Stack com o preço de mercado",
              },
              {
                icon: AlertTriangle, tone: "warn" as const,
                title: "Whitelist de IP (Futuros)",
                desc: "Se a API tem IP vinculado, adicione o IP fixo do Railway (mostrado acima) em MEXC → API Management → Vincular IP.",
              },
            ].map(({ icon: Icon, tone, title, desc }, i) => {
              const color = tone === "warn" ? "text-[hsl(var(--neutral))]" : "text-profit";
              return (
                <li key={title} className="grid grid-cols-[auto_auto_1fr] items-start gap-4 px-5 py-4">
                  <span className="font-mono-tk text-[10px] tracking-[0.28em] text-muted-foreground/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon className={cn("h-4 w-4 shrink-0", color)} />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* HOW TO */}
        <section className="space-y-3">
          <Eyebrow>tutorial · gerar chaves na MEXC</Eyebrow>
          <div className="border border-border bg-card p-6">
            <ol className="space-y-3">
              {[
                "Acesse mexc.com e faça login na sua conta",
                "Vá em Perfil → Gestão de API",
                'Clique em "Criar API"',
                'Dê um nome e ative APENAS a permissão "Leitura" (Read Only)',
                "Complete a verificação de segurança",
                "Copie a API Key e o Secret Key aqui",
              ].map((step, i) => (
                <li key={i} className="grid grid-cols-[auto_1fr] items-start gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 font-mono-tk text-[11px] font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pt-1 text-sm text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 grid grid-cols-[auto_1fr] gap-4 border border-[hsl(var(--neutral))]/40 bg-[hsl(var(--neutral))]/[0.05] p-4">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[hsl(var(--neutral))]" />
              <div>
                <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-[hsl(var(--neutral))]">
                  Segurança
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Nunca compartilhe seu Secret Key. Use sempre permissão de leitura apenas.
                  Este app nunca executa ordens na sua conta.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
