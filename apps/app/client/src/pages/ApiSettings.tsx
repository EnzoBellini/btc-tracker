import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, XCircle, RefreshCw, Eye, EyeOff, Wifi, WifiOff,
  ShieldCheck, AlertTriangle, Key, Download, Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMexcCredentials, useTestMexc, useSyncMexc } from "@/hooks/useMexc";

function ServerIpHint() {
  const { data } = useQuery({
    queryKey: ["/api/mexc/server-ip"],
    queryFn: () => fetch("/api/mexc/server-ip").then(r => r.json()),
    staleTime: 60_000,
  });
  if (!data) return null;
  return (
    <div className={`rounded-md border p-3 text-xs ${data.error ? "bg-destructive/5 border-destructive/30" : "bg-muted/50 border-border"}`}>
      <p className="font-medium text-muted-foreground mb-1">
        IP do servidor Railway (para whitelist MEXC)
      </p>
      {data.ip ? (
        <>
          <p className="font-mono text-lg text-foreground break-all select-all">{data.ip}</p>
          <p className="text-muted-foreground mt-1">
            Copie este IP e adicione em <strong>MEXC → API Management → Alterar → Vincular endereço de IP</strong>.
          </p>
        </>
      ) : (
        <p className="text-destructive mt-1">{data.error || "Não foi possível obter o IP"}</p>
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
  const [apiKey, setApiKey]         = useState("");
  const [secretKey, setSecretKey]   = useState("");

  const { data: creds } = useMexcCredentials();
  const testMexc  = useTestMexc();
  const syncMexc  = useSyncMexc();

  const isConnected = creds?.isConnected;

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">Configurações de API</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Vincule sua conta MEXC para importar trades e saldo BTC automaticamente
        </p>
      </div>

      {/* Status banner */}
      <Card className={`border ${isConnected ? "border-profit/30 bg-profit/5" : "border-border bg-card"}`}>
        <CardContent className="p-4 flex items-center gap-4">
          <div className={`p-3 rounded-full ${isConnected ? "bg-profit/15" : "bg-muted"}`}>
            {isConnected ? <Wifi className="w-5 h-5 text-profit" /> : <WifiOff className="w-5 h-5 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{isConnected ? "Conectado à MEXC" : "Não conectado"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {creds?.lastSyncMessage || (isConnected ? "Pronto para sincronizar" : "Configure suas chaves abaixo")}
            </p>
            {creds?.lastSyncAt && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> Último sync: {fmtDate(creds.lastSyncAt)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isConnected ? (
              <Badge className="bg-profit/15 text-profit border-0 gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
              </Badge>
            ) : (
              <Badge className="bg-muted text-muted-foreground border-0 gap-1">
                <XCircle className="w-3.5 h-3.5" /> Inativo
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Key form */}
      <Card className="bg-card border-border">
        <CardHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Chaves de API MEXC</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Use uma API Key com permissão de <strong>leitura apenas</strong> (Read Only). Nunca ative permissões de saque ou trading.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-xs font-medium">API Key</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="mx0aBYs33eIilxBWC5..."
              className="font-mono text-sm"
              data-testid="input-api-key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secretKey" className="text-xs font-medium">Secret Key</Label>
            <div className="relative">
              <Input
                id="secretKey"
                type={showSecret ? "text" : "password"}
                value={secretKey}
                onChange={e => setSecretKey(e.target.value)}
                placeholder="45d0b3c26f2644f1..."
                className="font-mono text-sm pr-10"
                data-testid="input-secret-key"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={() => testMexc.mutate({ apiKey, secretKey })}
              disabled={!apiKey || !secretKey || testMexc.isPending}
              data-testid="button-test-connection"
              variant="outline"
              className="gap-2"
            >
              {testMexc.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {testMexc.isPending ? "Testando..." : "Testar Conexão"}
            </Button>
            {isConnected && (
              <Button
                onClick={() => syncMexc.mutate()}
                disabled={syncMexc.isPending}
                data-testid="button-sync-mexc"
                className="gap-2"
              >
                {syncMexc.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {syncMexc.isPending ? "Sincronizando..." : "Sincronizar Agora"}
              </Button>
            )}
          </div>

          <ServerIpHint />
        </CardContent>
      </Card>

      {/* What gets imported */}
      <Card className="bg-card border-border">
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-sm font-semibold">O que é importado</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="space-y-3">
            {[
              {
                icon: CheckCircle2, color: "text-profit",
                title: "Posições fechadas (Futuros BTC_USDT)",
                desc: "Trades importados como WIN/LOSS com preço de entrada, saída, leverage e PnL realizado",
              },
              {
                icon: CheckCircle2, color: "text-profit",
                title: "Saldo BTC (Spot)",
                desc: "Snapshot do saldo atual de BTC adicionado ao seu BTC Stack com o preço de mercado",
              },
              {
                icon: AlertTriangle, color: "text-yellow-400",
                title: "Whitelist de IP (Futuros)",
                desc: "Se a API tem IP vinculado, adicione o IP fixo do Railway (mostrado acima) em MEXC → API Management → Vincular IP.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <Icon className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to get API keys */}
      <Card className="bg-card border-border">
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-sm font-semibold">Como gerar suas chaves na MEXC</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <ol className="space-y-2.5">
            {[
              "Acesse mexc.com e faça login na sua conta",
              "Vá em Perfil → Gestão de API",
              'Clique em "Criar API"',
              'Dê um nome e ative APENAS a permissão "Leitura" (Read Only)',
              "Complete a verificação de segurança",
              "Copie a API Key e o Secret Key aqui",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 p-3 bg-yellow-400/5 border border-yellow-400/20 rounded-md flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-yellow-400">Segurança:</strong> Nunca compartilhe seu Secret Key. Use sempre permissão de leitura apenas. Este app nunca executa ordens na sua conta.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
