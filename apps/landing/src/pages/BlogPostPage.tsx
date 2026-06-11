import { Clock } from "lucide-react";
import { TrialCtaButton } from "../components/TrialCtaButton";
import { useMemo } from "react";
import BlogShell from "../components/BlogShell";
import { useSeo } from "../hooks/useSeo";
import {
  buildBlogPostMeta,
  formatBlogDate,
  getBlogPost,
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

export default function BlogPostPage({ post, market, onBack, onStartClick }: BlogPostPageProps) {
  const copy = getLandingContent(market).blog;
  const meta = useMemo(() => buildBlogPostMeta(post), [post]);
  useSeo(meta);

  const related = post.relatedSlugs
    .map((slug) => getBlogPost(market, slug))
    .filter((p): p is BlogPost => p !== null);

  return (
    <BlogShell market={market} onBack={onBack} backLabel={copy.backToBlog}>
      <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
        <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt, market)}</time>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden />
          {copy.readTime(post.readMinutes)}
        </span>
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

      <article className="mt-10 space-y-8">
        {post.sections.map((section, i) => (
          <section key={i}>
            {section.heading && (
              <h2 className="text-lg font-semibold text-white">{section.heading}</h2>
            )}
            <div className={section.heading ? "mt-3 space-y-3" : "space-y-3"}>
              {section.paragraphs.map((p, j) => (
                <p key={j} className="text-sm leading-relaxed text-gray-300">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </article>

      <aside className="mt-12 border border-[#FF8C42]/20 bg-[#FF8C42]/[0.06] p-6">
        <p className="text-sm text-gray-300">{copy.inlineCta}</p>
        <TrialCtaButton className="mt-4" onClick={onStartClick}>
          {copy.ctaButton}
        </TrialCtaButton>
      </aside>

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
