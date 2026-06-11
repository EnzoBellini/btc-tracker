import { ArrowUpRight, Clock } from "lucide-react";
import { useMemo } from "react";
import BlogShell from "../components/BlogShell";
import { useSeo } from "../hooks/useSeo";
import { buildBlogIndexMeta, formatBlogDate, getBlogPosts } from "../lib/blog-posts";
import { getLandingContent } from "../lib/landing-content";
import type { Market } from "../lib/locale";

type BlogIndexProps = {
  market: Market;
  onBack: () => void;
  onStartClick: () => void;
};

export default function BlogIndex({ market, onBack, onStartClick }: BlogIndexProps) {
  const copy = getLandingContent(market).blog;
  const posts = getBlogPosts(market);
  const meta = useMemo(() => buildBlogIndexMeta(market), [market]);
  useSeo(meta);

  return (
    <BlogShell market={market} onBack={onBack}>
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#FF8C42]">{copy.eyebrow}</p>
      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">{copy.indexTitle}</h1>
      <p className="mt-4 text-base leading-relaxed text-gray-400">{copy.indexSubtitle}</p>

      <div className="mt-12 space-y-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="group border border-white/10 bg-black/50 p-6 transition hover:border-[#FF8C42]/30"
          >
            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
              <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt, market)}</time>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden />
                {copy.readTime(post.readMinutes)}
              </span>
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
        <button
          type="button"
          onClick={onStartClick}
          className="group mt-4 inline-flex items-center gap-2 border border-[#FF8C42] bg-[#FF8C42] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-black transition hover:bg-transparent hover:text-[#FF8C42]"
        >
          {copy.ctaButton}
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </BlogShell>
  );
}
