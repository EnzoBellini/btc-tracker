import { useEffect, useMemo, useState } from "react";
import AffiliateGate from "./AffiliateGate";
import { useSeo } from "./hooks/useSeo";
import BlogIndex from "./pages/BlogIndex";
import BlogPostPage from "./pages/BlogPostPage";
import SeoLandingPage from "./pages/SeoLandingPage";
import StaticPage, { resolveStaticPage } from "./pages/StaticPage";
import { useMarket } from "./hooks/useMarket";
import { getBlogPost, isBlogIndex } from "./lib/blog-posts";
import {
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  buildSoftwareAppJsonLd,
  buildWebSiteJsonLd,
  getHomeSeo,
} from "./lib/seo";
import { getLandingContent } from "./lib/landing-content";
import { resolveSeoPage } from "./lib/seo-pages";

/** URL do app (login/dashboard). Em produção: https://app.trackion.app */
const APP_URL = (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, "") ?? "";

type RouteState = {
  staticPage: ReturnType<typeof resolveStaticPage>;
  seoPage: ReturnType<typeof resolveSeoPage>;
  blogSlug: string | null;
  blogIndex: boolean;
  pathname: string;
};

function resolveRoute(pathname: string): RouteState {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const blogIndex = isBlogIndex(normalized);
  const blogMatch = normalized.match(/^\/blog\/([^/]+)$/);
  const blogSlug = blogMatch?.[1] ?? null;
  const seoPage = blogIndex || blogSlug ? null : resolveSeoPage(normalized);

  return {
    staticPage: blogIndex || blogSlug || seoPage ? null : resolveStaticPage(normalized),
    seoPage,
    blogSlug,
    blogIndex,
    pathname: normalized,
  };
}

function HomeSeo({ market }: { market: ReturnType<typeof useMarket>["market"] }) {
  const t = getLandingContent(market);
  const meta = useMemo(
    () => ({
      ...getHomeSeo(market),
      jsonLd: [
        buildOrganizationJsonLd(),
        buildWebSiteJsonLd(),
        buildSoftwareAppJsonLd(market),
        buildFaqJsonLd(t.seo.faq),
      ],
    }),
    [market, t.seo.faq],
  );
  useSeo(meta);
  return null;
}

export default function App() {
  const { market } = useMarket();
  const [route, setRoute] = useState(() => resolveRoute(window.location.pathname));

  useEffect(() => {
    const onPop = () => setRoute(resolveRoute(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const goToApp = () => {
    if (APP_URL) {
      window.location.href = APP_URL;
      return;
    }
    window.location.href = "/";
  };

  const goHome = () => {
    window.history.pushState({}, "", "/");
    setRoute(resolveRoute("/"));
  };

  const goBlog = () => {
    window.history.pushState({}, "", "/blog");
    setRoute(resolveRoute("/blog"));
  };

  if (route.blogIndex) {
    return <BlogIndex market={market} onBack={goHome} onStartClick={goToApp} />;
  }

  if (route.blogSlug) {
    const post = getBlogPost(market, route.blogSlug);
    if (!post) {
      return <BlogIndex market={market} onBack={goHome} onStartClick={goToApp} />;
    }
    return (
      <BlogPostPage post={post} market={market} onBack={goBlog} onStartClick={goToApp} />
    );
  }

  if (route.seoPage) {
    return (
      <SeoLandingPage
        page={route.seoPage}
        canonicalPath={route.pathname}
        market={route.seoPage.market}
        onBack={goHome}
        onStartClick={goToApp}
      />
    );
  }

  if (route.staticPage) {
    return <StaticPage kind={route.staticPage} market={market} onBack={goHome} />;
  }

  return (
    <>
      <HomeSeo market={market} />
      <AffiliateGate onStartClick={goToApp} />
    </>
  );
}
