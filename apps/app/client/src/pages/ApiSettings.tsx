import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2, RefreshCw, Eye, EyeOff, Wifi, WifiOff,
  ShieldCheck, AlertTriangle, Key, Download, Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  useExchangeCredentials,
  useTestExchange,
  useSyncExchange,
  useExchangesSummary,
  type ExchangeId,
} from "@/hooks/useExchanges";
import {
  PageHeader, TerminalFrame, TerminalButton, StatPill, Eyebrow, CornerMarks,
} from "@/components/tk";
import { cn } from "@/lib/utils";
import { useAppLocale } from "@/lib/locale-context";

const EXCHANGES: { id: ExchangeId; label: string; needsPassphrase: boolean }[] = [
  { id: "mexc", label: "MEXC", needsPassphrase: false },
  { id: "binance", label: "Binance", needsPassphrase: false },
  { id: "bitget", label: "Bitget", needsPassphrase: true },
];

const TUTORIALS: Record<ExchangeId, string[]> = {
  mexc: [
    "Acesse mexc.com e faça login",
    "Perfil → Gestão de API → Criar API",
    'Ative APENAS "Leitura" (Read Only)',
    "Copie API Key e Secret Key",
  ],
  binance: [
    "Acesse binance.com → Perfil → Gerenciamento de API",
    "Crie uma API Key com permissão de leitura",
    "Habilite Futuros USDⓈ-M se usar contratos USDT",
    "Vincule o IP do servidor se exigido",
  ],
  bitget: [
    "Acesse bitget.com → API Management",
    "Crie API com permissão de leitura",
    "Anote API Key, Secret Key e Passphrase",
    "Vincule o IP do servidor na whitelist",
  ],
};

function ServerIpHint() {
  const { data } = useQuery({
    queryKey: ["/api/exchanges/server-ip"],
    queryFn: () => fetch("/api/exchanges/server-ip").then((r) => r.json()),
    staleTime: 60_000,
  });
  if (!data) return null;
  return (
    <div
      className={cn(
        "relative border p-4 font-mono-tk text-xs",
        data.error ? "border-loss/40 bg-loss/[0.04]" : "border-border bg-background",
      )}
    >
      <CornerMarks orange={!data.error} />
      <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        ↳ IP do servidor (whitelist)
      </p>
      {data.ip ? (
        <>
          <p className="num mt-3 break-all text-lg font-bold tracking-tight text-foreground select-all">
            {data.ip}
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Use este IP na whitelist da API Key em MEXC, Binance ou Bitget.
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
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

function ExchangePanel({ exchange }: { exchange: ExchangeId }) {
  const meta = EXCHANGES.find((e) => e.id === exchange)!;
  const [showSecret, setShowSecret] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [passphrase, setPassphrase] = useState("");

  const { data: creds } = useExchangeCredentials(exchange);
  const testExchange = useTestExchange(exchange);
  const syncExchange = useSyncExchange(exchange);
  const isConnected = !!creds?.isConnected;

  return (
    <div className="space-y-6">
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
          {isConnected ? (
            <Wifi className="h-5 w-5 text-profit" />
          ) : (
            <WifiOff className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            {meta.label}
          </p>
          <p className="font-display mt-1 text-2xl font-bold tracking-tight">
            {isConnected ? `Conectado à ${meta.label}` : "Não conectado"}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {creds?.lastSyncMessage || (isConnected ? "Pronto para sincronizar" : "Configure suas chaves")}
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

      <TerminalFrame
        title={`trackion.app — POST /api/exchanges/${exchange}/credentials`}
        status="awaiting input"
        statusTone="info"
        orangeCorners
      >
        <div className="space-y-5 p-6">
          <div className="flex items-start gap-3">
            <Key className="mt-1 h-4 w-4 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="font-display text-base font-bold">Chaves de API {meta.label}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Permissão de <span className="text-foreground">leitura apenas</span>.
                {exchange === "binance" && " Importação de futuros via REALIZED_PNL (aproximada)."}
              </p>
            </div>
          </div>

          <CredentialField label="apiKey" value={apiKey} onChange={setApiKey} testId="input-api-key" />
          <CredentialField
            label="secretKey"
            value={secretKey}
            onChange={setSecretKey}
            secret
            show={showSecret}
            onToggleShow={() => setShowSecret(!showSecret)}
            testId="input-secret-key"
          />
          {meta.needsPassphrase && (
            <CredentialField
              label="passphrase"
              value={passphrase}
              onChange={setPassphrase}
              secret
              show={showPassphrase}
              onToggleShow={() => setShowPassphrase(!showPassphrase)}
              testId="input-passphrase"
            />
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <TerminalButton
              variant="outline"
              icon={testExchange.isPending ? RefreshCw : ShieldCheck}
              onClick={() =>
                testExchange.mutate({
                  apiKey,
                  secretKey,
                  passphrase: meta.needsPassphrase ? passphrase : undefined,
                })
              }
              disabled={
                !apiKey ||
                !secretKey ||
                (meta.needsPassphrase && !passphrase) ||
                testExchange.isPending
              }
              className={cn(testExchange.isPending && "[&_svg]:animate-spin")}
            >
              {testExchange.isPending ? "testing…" : "test connection"}
            </TerminalButton>
            {isConnected && (
              <TerminalButton
                variant="primary"
                icon={syncExchange.isPending ? RefreshCw : Download}
                onClick={() => syncExchange.mutate()}
                disabled={syncExchange.isPending}
                className={cn(syncExchange.isPending && "[&_svg]:animate-spin")}
              >
                {syncExchange.isPending ? "syncing…" : "sync now"}
              </TerminalButton>
            )}
          </div>
        </div>
      </TerminalFrame>

      <ol className="divide-y divide-border border border-border bg-card">
        {[
          {
            title: "Posições fechadas (Futuros)",
            desc: "Importadas como WIN/LOSS com PnL realizado",
          },
          {
            title: "Saldo BTC (Spot)",
            desc: "Snapshot no BTC Stack quando disponível",
          },
        ].map(({ title, desc }, i) => (
          <li key={title} className="grid grid-cols-[auto_auto_1fr] items-start gap-4 px-5 py-4">
            <span className="font-mono-tk text-[10px] tracking-[0.28em] text-muted-foreground/70">
              {String(i + 1).padStart(2, "0")}
            </span>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-profit" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="border border-border bg-card p-6">
        <Eyebrow>tutorial · {meta.label}</Eyebrow>
        <ol className="mt-4 space-y-3">
          {TUTORIALS[exchange].map((step, i) => (
            <li key={i} className="grid grid-cols-[auto_1fr] items-start gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 font-mono-tk text-[11px] font-bold text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="pt-1 text-sm text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function CredentialField({
  label,
  value,
  onChange,
  secret,
  show,
  onToggleShow,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  secret?: boolean;
  show?: boolean;
  onToggleShow?: () => void;
  testId?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        $ {label}
      </Label>
      <div className="relative flex items-center gap-3 border border-border bg-background px-4 py-2.5 font-mono-tk text-sm">
        <span className="select-none text-primary">›</span>
        <input
          type={secret && !show ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="num min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/40 outline-none"
          data-testid={testId}
        />
        {secret && onToggleShow && (
          <button
            type="button"
            onClick={onToggleShow}
            className="text-muted-foreground transition hover:text-foreground"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ApiSettings() {
  const { t } = useAppLocale();
  const [active, setActive] = useState<ExchangeId>("mexc");
  const { data: summary } = useExchangesSummary();
  const connectedCount = summary?.filter((s) => s.isConnected).length ?? 0;

  return (
    <div className="relative space-y-10 p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-50" aria-hidden />

      <div className="relative max-w-3xl space-y-10">
        <PageHeader
          index="07"
          total="09"
          eyebrow={t.apiSettings.eyebrow}
          title={t.apiSettings.title}
          subtitle={t.apiSettings.subtitle}
        />

        <div className="flex flex-wrap gap-2 border border-border bg-card p-2">
          {EXCHANGES.map((ex) => {
            const connected = summary?.find((s) => s.exchange === ex.id)?.isConnected;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => setActive(ex.id)}
                className={cn(
                  "px-4 py-2 font-mono-tk text-xs uppercase tracking-[0.2em] transition",
                  active === ex.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {ex.label}
                {connected && <span className="ml-2 text-profit">●</span>}
              </button>
            );
          })}
        </div>

        <p className="font-mono-tk text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {connectedCount} de 3 exchanges conectadas · sync em Trades importa de todas as ativas
        </p>

        <ServerIpHint />
        <ExchangePanel exchange={active} />

        <div className="grid grid-cols-[auto_1fr] gap-4 border border-[hsl(var(--neutral))]/40 bg-[hsl(var(--neutral))]/[0.05] p-4">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[hsl(var(--neutral))]" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Nunca compartilhe Secret Key ou Passphrase. Este app nunca executa ordens na sua conta.
          </p>
        </div>
      </div>
    </div>
  );
}
