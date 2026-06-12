import type { Market } from "../lib/locale";
import { getLandingContent } from "../lib/landing-content";

type BlogAuthorBioProps = {
  market: Market;
};

export default function BlogAuthorBio({ market }: BlogAuthorBioProps) {
  const bio = getLandingContent(market).blog.authorBio;

  return (
    <aside className="mt-14 flex gap-4 border border-white/10 bg-white/[0.03] p-5 sm:gap-5 sm:p-6">
      <img
        src="/logo-trackion.png"
        alt="Trackion"
        width={48}
        height={48}
        className="h-12 w-12 shrink-0"
      />
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#FF8C42]">{bio.label}</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-300">{bio.text}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <a
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF8C42] transition hover:text-white"
          >
            {bio.appLink}
          </a>
          <a
            href="/planilha-de-trading"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500 transition hover:text-white"
          >
            {bio.planilhaLink}
          </a>
        </div>
      </div>
    </aside>
  );
}
