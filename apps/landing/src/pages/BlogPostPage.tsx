import { Clock } from "lucide-react";
import { useMemo } from "react";
import BlogAuthorBio from "../components/BlogAuthorBio";
import BlogCtaBlock from "../components/BlogCtaBlock";
import BlogProductBanner from "../components/BlogProductBanner";
import { BlogRichText } from "../components/BlogRichText";
import BlogShell from "../components/BlogShell";
import { TrialCtaButton } from "../components/TrialCtaButton";
import { useSeo } from "../hooks/useSeo";
import {
  buildBlogPostMeta,
  formatBlogDate,
  getBlogPost,
  getPillarPost,
  type BlogPost,
} from "../lib/blog-posts";
import { getLandingContent } from "../lib/landing-content";
import type { Market } from "../lib/locale";

type BlogPostPageProps = {
  post: BlogPost;
  market: Market;
  onBack: () => void;
  onStartClick: () => void;
};

function categoryHref(category: BlogPost["category"]): string {
  return `/blog?c=${category}`;
}

function categoryLabel(market: Market, category: BlogPost["category"]): string {
  const copy = getLandingContent(market).blog;
  return category === "planilha-de-trading" ? copy.categoryPlanilha : copy.categoryJournal;
}

export default function BlogPostPage({ post, market, onBack, onStartClick }: BlogPostPageProps) {
  const copy = getLandingContent(market).blog;
  const meta = useMemo(() => buildBlogPostMeta(post), [post]);
  useSeo(meta);

  const related = post.relatedSlugs
    .map((slug) => getBlogPost(market, slug))
    .filter((p): p is BlogPost => p !== null);

  const pillar = getPillarPost(market, post);
  const midCtaIndex = Math.min(2, Math.max(1, post.sections.length - 2));
  const ctaVariant = post.intent === "comparative" ? "conversion" : "soft";

  return (
    <BlogShell market={market} onBack={onBack} onStartClick={onStartClick} backLabel={copy.backToBlog}>
      <BlogProductBanner market={market} onStartClick={onStartClick} />

      <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
        <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt, market)}</time>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden />
          {copy.readTime(post.readMinutes)}
        </span>
        <a
          href={categoryHref(post.category)}
          className="border border-white/10 px-2 py-0.5 text-[#FF8C42] transition hover:border-[#FF8C42]/50"
        >
          {categoryLabel(market, post.category)}
        </a>
        {post.isPillar && (
          <span className="border border-[#FF8C42]/30 px-2 py-0.5 text-[#FF8C42]">{copy.pillarTitle}</span>
        )}
      </div>

      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl">{post.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-gray-400">{post.excerpt}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-gray-500"
          >
            {tag}
          </span>
        ))}
      </div>

      {pillar && (
        <aside className="mt-8 border border-white/10 bg-white/[0.02] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gray-500">{copy.pillarTitle}</p>
          <a
            href={`/blog/${pillar.slug}`}
            className="mt-2 block text-sm font-medium text-[#FF8C42] transition hover:text-white"
          >
            {pillar.title} →
          </a>
        </aside>
      )}

      <article className="mt-10 space-y-10 border-t border-white/[0.08] pt-10">
        {post.sections.map((section, i) => (
          <section key={i} className="scroll-mt-24">
            {section.heading && (
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{section.heading}</h2>
            )}
            <div className={section.heading ? "mt-4 space-y-4" : "space-y-4"}>
              {section.paragraphs.map((p, j) => (
                <p key={j} className="text-base leading-[1.75] text-gray-300">
                  <BlogRichText text={p} />
                </p>
              ))}
            </div>
            {i === midCtaIndex && (
              <BlogCtaBlock
                market={market}
                intent={post.intent}
                variant={ctaVariant}
                onStartClick={onStartClick}
              />
            )}
          </section>
        ))}
      </article>

      <aside className="mt-14 border border-[#FF8C42]/30 bg-[#FF8C42]/[0.08] p-6 sm:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#FF8C42]">Trackion</p>
        <p className="mt-3 text-base leading-relaxed text-gray-200">{copy.inlineCta}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <TrialCtaButton onClick={onStartClick}>{copy.ctaButton}</TrialCtaButton>
          <a
            href="/planilha-de-trading"
            className="inline-flex items-center border border-white/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-300 transition hover:border-[#FF8C42] hover:text-[#FF8C42]"
          >
            {market === "us" ? "Spreadsheet landing" : "Landing planilha"}
          </a>
          <a
            href="/trading-journal-crypto"
            className="inline-flex items-center font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500 transition hover:text-[#FF8C42]"
          >
            {market === "us" ? "Trading journal" : "Trading journal crypto"} →
          </a>
        </div>
      </aside>

      <BlogAuthorBio market={market} />

      {related.length > 0 && (
        <nav className="mt-14 border-t border-white/10 pt-10" aria-label={copy.relatedTitle}>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
            {copy.relatedTitle}
          </h2>
          <ul className="mt-4 space-y-3">
            {related.map((r) => (
              <li key={r.slug}>
                <a
                  href={`/blog/${r.slug}`}
                  className="text-sm text-gray-400 transition hover:text-[#FF8C42]"
                >
                  {r.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </BlogShell>
  );
}
