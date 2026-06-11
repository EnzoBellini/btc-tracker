import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import AffiliateGate from "./AffiliateGate";
import { useSeo } from "./hooks/useSeo";
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
import { resolveStaticPage } from "./pages/StaticPage";

const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const SeoLandingPage = lazy(() => import("./pages/SeoLandingPage"));
const StaticPage = lazy(() => import("./pages/StaticPage"));

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
    return (
      <Suspense fallback={null}>
        <BlogIndex market={market} onBack={goHome} onStartClick={goToApp} />
      </Suspense>
    );
  }

  if (route.blogSlug) {
    const post = getBlogPost(market, route.blogSlug);
    if (!post) {
      return (
        <Suspense fallback={null}>
          <BlogIndex market={market} onBack={goHome} onStartClick={goToApp} />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={null}>
        <BlogPostPage post={post} market={market} onBack={goBlog} onStartClick={goToApp} />
      </Suspense>
    );
  }

  if (route.seoPage) {
    return (
      <Suspense fallback={null}>
        <SeoLandingPage
          page={route.seoPage}
          canonicalPath={route.pathname}
          market={route.seoPage.market}
          onBack={goHome}
          onStartClick={goToApp}
        />
      </Suspense>
    );
  }

  if (route.staticPage) {
    return (
      <Suspense fallback={null}>
        <StaticPage kind={route.staticPage} market={market} onBack={goHome} />
      </Suspense>
    );
  }

  return (
    <>
      <HomeSeo market={market} />
      <AffiliateGate onStartClick={goToApp} />
    </>
  );
}
