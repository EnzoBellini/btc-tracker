import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Plugin } from "vite";
import { getAllPosts, getAllBlogPaths } from "./src/lib/blog-posts";
import { buildSeoPageMeta, getAllSeoPaths, PAGES } from "./src/lib/seo-pages";
import { getHomeSeo } from "./src/lib/seo";

const SITE_URL = "https://trackion.app";

type PrerenderMeta = {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function patchHtml(template: string, meta: PrerenderMeta): string {
  const url = `${SITE_URL}${meta.path}`;
  const keywords = meta.keywords?.join(", ") ?? "";
  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
  );
  if (keywords) {
    html = html.replace(
      /<meta\s+name="keywords"\s+content="[^"]*"\s*\/>/,
      `<meta name="keywords" content="${escapeHtml(keywords)}" />`,
    );
  }
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${url}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${url}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  );

  return html;
}

function writeRouteHtml(outDir: string, template: string, meta: PrerenderMeta) {
  const filePath = meta.path === "/" ? join(outDir, "index.html") : join(outDir, meta.path.slice(1), "index.html");
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, patchHtml(template, meta), "utf8");
}

function collectPrerenderMeta(): PrerenderMeta[] {
  const items: PrerenderMeta[] = [];

  const homeBr = getHomeSeo("br");
  items.push({ path: "/", title: homeBr.title, description: homeBr.description, keywords: homeBr.keywords });

  for (const page of PAGES) {
    const primary = page.paths[0];
    const built = buildSeoPageMeta(page, primary);
    items.push({
      path: built.path ?? primary,
      title: built.title,
      description: built.description,
      keywords: built.keywords,
    });

    for (const alias of page.paths.slice(1)) {
      items.push({
        path: alias,
        title: built.title,
        description: built.description,
        keywords: built.keywords,
      });
    }
  }

  for (const post of getAllPosts()) {
    const path = `/blog/${post.slug}`;
    items.push({
      path,
      title: `${post.title} | Trackion Blog`,
      description: post.excerpt,
      keywords: post.keywords,
    });
  }

  items.push({
    path: "/blog",
    title: "Blog Trackion — Trading Crypto, Psicologia & Exchange",
    description:
      "Artigos sobre trading journal crypto, Google Trends, psicologia de trade, gestão de risco e sync de exchange. Método, não hype.",
    keywords: ["blog trading crypto", "psicologia trading", "diário de trades"],
  });

  return items;
}

function primarySeoPaths(): string[] {
  return [
    "/",
    ...PAGES.map((page) => page.paths[0]),
    "/blog",
    ...getAllPosts().filter((p) => p.market === "br").map((p) => `/blog/${p.slug}`),
    "/privacidade",
    "/termos",
    "/contato",
    "/status",
  ];
}

function buildSitemap(): string {
  const urls = primarySeoPaths();
  const entries = urls
    .map((path) => {
      const loc = `${SITE_URL}${path === "/" ? "/" : path}`;
      const priority =
        path === "/"
          ? "1.0"
          : path.startsWith("/blog/")
            ? "0.8"
            : path === "/blog"
              ? "0.85"
              : path.startsWith("/privacidade") || path.startsWith("/termos") || path.startsWith("/contato")
                ? "0.3"
                : "0.85";
      const changefreq = path.startsWith("/blog/") ? "monthly" : path === "/status" ? "weekly" : "weekly";
      return `  <url><loc>${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

export function seoPrerenderPlugin(): Plugin {
  return {
    name: "trackion-seo-prerender",
    apply: "build",
    closeBundle() {
      const outDir = join(process.cwd(), "dist");
      const template = readFileSync(join(outDir, "index.html"), "utf8");
      const metaList = collectPrerenderMeta();

      for (const meta of metaList) {
        writeRouteHtml(outDir, template, meta);
      }

      const sitemap = buildSitemap();
      writeFileSync(join(outDir, "sitemap.xml"), sitemap, "utf8");
      writeFileSync(join(process.cwd(), "public", "sitemap.xml"), sitemap, "utf8");
    },
  };
}

export { getAllSeoPaths, getAllBlogPaths };
