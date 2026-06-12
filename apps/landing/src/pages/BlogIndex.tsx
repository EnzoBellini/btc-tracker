import { ArrowUpRight, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BlogProductBanner from "../components/BlogProductBanner";
import BlogShell from "../components/BlogShell";
import { TrialCtaButton } from "../components/TrialCtaButton";
import { useSeo } from "../hooks/useSeo";
import {
  buildBlogIndexMeta,
  formatBlogDate,
  getBlogPostsByCategory,
  parseBlogCategoryParam,
  type BlogCategory,
} from "../lib/blog-posts";
import { getLandingContent } from "../lib/landing-content";
import type { Market } from "../lib/locale";

type BlogIndexProps = {
  market: Market;
  onBack: () => void;
  onStartClick: () => void;
};

const CATEGORIES: BlogCategory[] = ["planilha-de-trading", "trading-journal"];

function readCategoryFromUrl(): BlogCategory | null {
  return parseBlogCategoryParam(new URLSearchParams(window.location.search).get("c"));
}

export default function BlogIndex({ market, onBack, onStartClick }: BlogIndexProps) {
  const copy = getLandingContent(market).blog;
  const [category, setCategory] = useState<BlogCategory | null>(() => readCategoryFromUrl());
  const posts = useMemo(() => getBlogPostsByCategory(market, category), [market, category]);
  const meta = useMemo(() => buildBlogIndexMeta(market), [market]);
  useSeo(meta);

  useEffect(() => {
    const sync = () => setCategory(readCategoryFromUrl());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const setCategoryFilter = (next: BlogCategory | null) => {
    setCategory(next);
    const url = next ? `/blog?c=${next}` : "/blog";
    window.history.pushState({}, "", url);
  };

  const categoryLabel = (c: BlogCategory) =>
    c === "planilha-de-trading" ? copy.categoryPlanilha : copy.categoryJournal;

  return (
    <BlogShell market={market} onBack={onBack} onStartClick={onStartClick}>
      <BlogProductBanner market={market} onStartClick={onStartClick} />

      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#FF8C42]">{copy.eyebrow}</p>
      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">{copy.indexTitle}</h1>
      <p className="mt-4 text-base leading-relaxed text-gray-400">{copy.indexSubtitle}</p>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label={copy.categoryAll}>
        <button
          type="button"
          onClick={() => setCategoryFilter(null)}
          className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition ${
            category === null
              ? "border-[#FF8C42] bg-[#FF8C42]/10 text-[#FF8C42]"
              : "border-white/10 text-gray-500 hover:border-white/25 hover:text-white"
          }`}
        >
          {copy.categoryAll}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategoryFilter(c)}
            className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition ${
              category === c
                ? "border-[#FF8C42] bg-[#FF8C42]/10 text-[#FF8C42]"
                : "border-white/10 text-gray-500 hover:border-white/25 hover:text-white"
            }`}
          >
            {categoryLabel(c)}
          </button>
        ))}
      </nav>

      <div className="mt-12 space-y-5">
        {posts.map((post, i) => (
          <article
            key={post.slug}
            className="group relative border border-white/10 bg-black/50 p-6 transition hover:border-[#FF8C42]/35 hover:bg-black/70 sm:p-8"
          >
            <span className="font-mono text-[10px] text-gray-600">[0{i + 1}]</span>
            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
              <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt, market)}</time>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden />
                {copy.readTime(post.readMinutes)}
              </span>
              <span className="text-[#FF8C42]/80">{categoryLabel(post.category)}</span>
              {post.isPillar && <span className="text-gray-600">· {copy.pillarTitle}</span>}
            </div>
            <h2 className="mt-3 text-xl font-semibold text-white group-hover:text-[#FF8C42]">
              <a href={`/blog/${post.slug}`}>{post.title}</a>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">{post.excerpt}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-gray-500"
                >
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={`/blog/${post.slug}`}
              className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#FF8C42] transition group-hover:gap-2"
            >
              {copy.readMore}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          </article>
        ))}
      </div>

      <div className="mt-14 border border-[#FF8C42]/20 bg-[#FF8C42]/[0.06] p-6">
        <p className="text-sm text-gray-300">{copy.ctaText}</p>
        <TrialCtaButton className="mt-4" onClick={onStartClick}>
          {copy.ctaButton}
        </TrialCtaButton>
      </div>
    </BlogShell>
  );
}
