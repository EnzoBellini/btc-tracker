import type { Market } from "./locale";

export const SITE_URL = "https://trackion.app";
export const SITE_NAME = "Trackion";

export type SeoMeta = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const DEFAULT_KEYWORDS_BR = [
  "trading journal crypto",
  "trading journal brasil",
  "diário de trades",
  "planilha de trading",
  "planilha de trades",
  "planilha day trade",
  "day trade crypto",
  "controle de trades",
  "controle trades crypto",
  "registrar trades bitcoin",
  "ferramenta trading crypto",
  "app controle trades",
  "criptomoeda",
  "bitcoin trading",
  "futuros crypto",
  "psicologia do trading",
  "gestão de risco crypto",
  "exchange API",
  "Binance journal",
  "diario trades binance",
  "Bitget journal",
  "MEXC journal",
  "acumular bitcoin",
  "win rate trading",
  "expectancy trading",
  "controle pnl crypto",
  "drawdown",
  "FOMO trading",
  "revenge trade",
  "scalping crypto",
  "controle trades darf",
  "day trade imposto renda",
  "substituir planilha excel",
  "análise de performance",
  "sync exchange",
  "trading com método",
  "journal day trade",
  "software trading crypto",
];

const DEFAULT_KEYWORDS_US = [
  "crypto trading journal",
  "cryptocurrency trading log",
  "bitcoin trading tracker",
  "crypto futures journal",
  "trading psychology",
  "crypto risk management",
  "exchange API sync",
  "Binance trade log",
  "Bitget trade log",
  "MEXC trade log",
  "stack bitcoin",
  "win rate analytics",
  "trading expectancy",
  "drawdown tracker",
  "FOMO crypto trading",
  "crypto spreadsheet alternative",
  "trade performance analytics",
  "retail crypto trading",
  "buy bitcoin track trades",
  "disciplined crypto trading",
];

export function getDefaultKeywords(market: Market): string[] {
  return market === "us" ? DEFAULT_KEYWORDS_US : DEFAULT_KEYWORDS_BR;
}

export function getHomeSeo(market: Market): SeoMeta {
  if (market === "us") {
    return {
      title: "Trackion — #1 Crypto Trading Journal | Exchange Sync, Risk & BTC Stack",
      description:
        "The crypto trading journal built for futures & spot. Auto-sync Binance, MEXC & Bitget via read-only API. Track win rate, manage risk, beat FOMO — 14-day Elite trial free.",
      keywords: DEFAULT_KEYWORDS_US,
      path: "/",
    };
  }
  return {
    title: "Trackion — Trading Journal #1 para Crypto | Exchange, Risco & Stack BTC",
    description:
      "Diário de trades para futuros e spot crypto. Sync automático Binance, MEXC e Bitget via API read-only. Win rate, gestão de risco e psicologia de trade — trial Elite 14 dias grátis.",
    keywords: DEFAULT_KEYWORDS_BR,
    path: "/",
  };
}

function upsertMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  const id = "trackion-seo-jsonld";
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function applySeoMeta(meta: SeoMeta) {
  const url = `${SITE_URL}${meta.path ?? "/"}`;
  document.title = meta.title;

  upsertMeta("description", meta.description);
  if (meta.keywords?.length) {
    upsertMeta("keywords", meta.keywords.join(", "));
  }
  upsertMeta("robots", meta.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
  upsertLink("canonical", url);

  upsertMeta("og:type", "website", "property");
  upsertMeta("og:title", meta.title, "property");
  upsertMeta("og:description", meta.description, "property");
  upsertMeta("og:url", url, "property");
  upsertMeta("og:site_name", SITE_NAME, "property");
  if (meta.ogImage) {
    upsertMeta("og:image", meta.ogImage, "property");
  }

  upsertMeta("twitter:card", "summary_large_image");
  upsertMeta("twitter:title", meta.title);
  upsertMeta("twitter:description", meta.description);

  if (meta.jsonLd) {
    upsertJsonLd(meta.jsonLd);
  }
}

export function buildSoftwareAppJsonLd(market: Market) {
  const isUs = market === "us";
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: isUs
      ? "Crypto trading journal with exchange API sync, risk goals, trading psychology tools and BTC stack tracking."
      : "Trading journal para criptomoedas com sync de exchange via API, metas de risco, psicologia de trade e acompanhamento de stack BTC.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: isUs ? "USD" : "BRL",
      description: isUs ? "14-day Elite trial, no credit card" : "Trial Elite 14 dias, sem cartão",
    },
    featureList: isUs
      ? [
          "Crypto futures & spot trade logging",
          "Binance, MEXC, Bitget API sync",
          "Win rate, expectancy & drawdown analytics",
          "Trading psychology & risk management",
          "BTC stack tracking",
        ]
      : [
          "Registro de trades futuros e spot crypto",
          "Sync API Binance, MEXC, Bitget",
          "Win rate, expectancy e drawdown",
          "Psicologia de trading e gestão de risco",
          "Acompanhamento de stack BTC",
        ],
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-trackion.png`,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@trackion.app",
      contactType: "customer support",
    },
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildFaqJsonLd(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function buildArticleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  modifiedAt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: `${SITE_URL}${input.path}`,
    datePublished: input.publishedAt,
    dateModified: input.modifiedAt ?? input.publishedAt,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-trackion.png` },
    },
    mainEntityOfPage: `${SITE_URL}${input.path}`,
  };
}
