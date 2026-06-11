import { ArrowLeft } from "lucide-react";
import { getLandingContent } from "../lib/landing-content";
import type { Market } from "../lib/locale";

export type StaticPageKind = "privacy" | "terms" | "contact" | "status";

type StaticPageProps = {
  kind: StaticPageKind;
  market: Market;
  onBack: () => void;
};

const CONTENT: Record<
  Market,
  Record<
    StaticPageKind,
    { title: string; sections: { heading?: string; body: string }[] }
  >
> = {
  br: {
    privacy: {
      title: "Política de Privacidade",
      sections: [
        {
          body: "O Trackion coleta e-mail, nome e dados de trading que você registra ou importa via API read-only das exchanges. Usamos esses dados apenas para operar o serviço, personalizar sua experiência e processar assinaturas via Stripe.",
        },
        {
          heading: "API das exchanges",
          body: "Pedimos permissões somente de leitura. Não armazenamos permissões de saque ou execução de ordens. Você pode revogar chaves a qualquer momento na exchange.",
        },
        {
          heading: "Contato",
          body: "Dúvidas sobre privacidade: support@trackion.app",
        },
      ],
    },
    terms: {
      title: "Termos de Uso",
      sections: [
        {
          body: "O Trackion é uma ferramenta de registro e análise de trades. Não executamos ordens, não damos recomendações de investimento e não garantimos resultados financeiros.",
        },
        {
          heading: "Trial e assinatura",
          body: "O trial Elite de 14 dias não exige cartão no cadastro. Após o período, é necessário assinar um plano para continuar usando o app. Cancelamento via portal Stripe.",
        },
        {
          heading: "Responsabilidade",
          body: "Você é responsável por suas decisões de trading e pela segurança das credenciais de API configuradas no produto.",
        },
      ],
    },
    contact: {
      title: "Contato",
      sections: [
        {
          body: "Suporte e dúvidas gerais:",
        },
        {
          body: "E-mail: support@trackion.app",
        },
        {
          body: "Respondemos em dias úteis, normalmente em até 48 horas.",
        },
      ],
    },
    status: {
      title: "Status do serviço",
      sections: [
        {
          body: "● Todos os sistemas operacionais",
        },
        {
          heading: "App web",
          body: "Online — trackion.app",
        },
        {
          heading: "Sync de exchanges",
          body: "MEXC, Binance e Bitget: operacionais. Bybit e OKX: em desenvolvimento (Q1 2026).",
        },
      ],
    },
  },
  us: {
    privacy: {
      title: "Privacy Policy",
      sections: [
        {
          body: "Trackion collects email, name, and trading data you log or import via read-only exchange APIs. We use this data only to operate the service, personalize your experience, and process subscriptions via Stripe.",
        },
        {
          heading: "Exchange APIs",
          body: "We request read-only permissions only. We never store withdrawal or trading permissions. You can revoke keys anytime on the exchange.",
        },
        {
          heading: "Contact",
          body: "Privacy questions: support@trackion.app",
        },
      ],
    },
    terms: {
      title: "Terms of Use",
      sections: [
        {
          body: "Trackion is a trade logging and analytics tool. We do not execute orders, provide investment advice, or guarantee financial results.",
        },
        {
          heading: "Trial & subscription",
          body: "The 14-day Elite trial requires no card at signup. After the trial, a paid plan is required to continue. Cancel anytime via the Stripe portal.",
        },
        {
          heading: "Liability",
          body: "You are responsible for your trading decisions and for securing API credentials configured in the product.",
        },
      ],
    },
    contact: {
      title: "Contact",
      sections: [
        {
          body: "Support and general inquiries:",
        },
        {
          body: "Email: support@trackion.app",
        },
        {
          body: "We respond on business days, typically within 48 hours.",
        },
      ],
    },
    status: {
      title: "Service status",
      sections: [
        {
          body: "● All systems operational",
        },
        {
          heading: "Web app",
          body: "Online — trackion.app",
        },
        {
          heading: "Exchange sync",
          body: "MEXC, Binance and Bitget: operational. Bybit and OKX: in development (Q1 2026).",
        },
      ],
    },
  },
};

export default function StaticPage({ kind, market, onBack }: StaticPageProps) {
  const nav = getLandingContent(market).static.back;
  const page = CONTENT[market][kind];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-fine opacity-[0.28]" aria-hidden />
      <header className="relative z-10 border-b border-white/[0.06] bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-gray-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {nav}
          </button>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-300">
          {page.sections.map((s, i) => (
            <div key={i}>
              {s.heading && (
                <h2 className="mb-2 text-base font-semibold text-white">{s.heading}</h2>
              )}
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function resolveStaticPage(pathname: string): StaticPageKind | null {
  const p = pathname.replace(/\/$/, "").toLowerCase();
  const map: Record<string, StaticPageKind> = {
    "/privacidade": "privacy",
    "/privacy": "privacy",
    "/termos": "terms",
    "/terms": "terms",
    "/contato": "contact",
    "/contact": "contact",
    "/status": "status",
  };
  return map[p] ?? null;
}
