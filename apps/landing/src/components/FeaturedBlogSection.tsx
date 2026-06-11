import { ArrowUpRight, Clock, HelpCircle } from "lucide-react";
import { formatBlogDate, getBlogPosts } from "../lib/blog-posts";
import { getLandingContent } from "../lib/landing-content";
import type { Market } from "../lib/locale";

type FeaturedBlogSectionProps = {
  market: Market;
  onFaqClick: () => void;
};

export function FeaturedBlogSection({ market, onFaqClick }: FeaturedBlogSectionProps) {
  const t = getLandingContent(market);
  const copy = t.blogPromo;
  const blog = t.blog;
  const posts = getBlogPosts(market).slice(0, 3);

  return (
    <section id="blog" className="relative z-[1] scroll-mt-28 border-y border-[#FF8C42]/15 bg-[#FF8C42]/[0.04] py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,140,66,0.08),transparent_60%)]" aria-hidden />
      <div className="relative mx-auto max-w-[1400px] px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#FF8C42]">
              [{copy.sectionLabel}]
            </p>
            <h2 className="mt-4 text-balance text-4xl font-bold leading-[0.95] tracking-tight text-white sm:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-400">{copy.subtitle}</p>
          </div>
          <a
            href="/blog"
            className="inline-flex shrink-0 items-center gap-2 border border-[#FF8C42] bg-[#FF8C42]/10 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#FF8C42] transition hover:bg-[#FF8C42] hover:text-black"
          >
            {copy.viewAll}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {posts.map((post, i) => (
            <article
              key={post.slug}
              className="group relative border border-white/10 bg-black/70 p-6 transition hover:border-[#FF8C42]/40 hover:bg-black/90"
            >
              <span className="font-mono text-[10px] text-gray-600">[0{i + 1}]</span>
              <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
                <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt, market)}</time>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden />
                  {blog.readTime(post.readMinutes)}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-bold leading-snug text-white group-hover:text-[#FF8C42]">
                <a href={`/blog/${post.slug}`}>{post.title}</a>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400 line-clamp-3">{post.excerpt}</p>
              <a
                href={`/blog/${post.slug}`}
                className="mt-5 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF8C42] transition group-hover:gap-2"
              >
                {copy.readArticle}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={onFaqClick}
          className="mt-10 flex w-full items-center justify-between gap-4 border border-white/15 bg-black/60 px-5 py-4 text-left transition hover:border-[#FF8C42]/50 hover:bg-black/80 sm:px-6"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#FF8C42]/40 bg-[#FF8C42]/10">
              <HelpCircle className="h-5 w-5 text-[#FF8C42]" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-white">{copy.faqCta}</p>
              <p className="mt-0.5 text-sm text-gray-500">{copy.faqCtaHint}</p>
            </div>
          </div>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-[#FF8C42]" aria-hidden />
        </button>
      </div>
    </section>
  );
}
