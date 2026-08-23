import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

const PUBLIC_PAGES: Record<string, string> = {
  "": "index.html",
  index: "index.html",
  works: "works.html",
  highlights: "highlights.html",
  about: "about.html",
};

function safeSource(source: string): string {
  if (!/^[A-Za-z0-9-]+\.html$/.test(source)) throw new Error("Invalid legacy page source.");
  return source;
}

export async function readLegacyPage(source: string, protectedPage = false): Promise<string> {
  const filename = safeSource(source);
  const privatePath = path.join(process.cwd(), "private-content", filename);
  const publicPath = path.join(process.cwd(), "Website Pages", filename);
  let html: string;
  if (protectedPage) {
    try {
      html = await readFile(privatePath, "utf8");
    } catch {
      html = await readFile(publicPath, "utf8");
    }
  } else {
    html = await readFile(publicPath, "utf8");
  }
  return addContentProtection(normalizeLegacyUrls(html));
}

export function publicPageSource(pathname: string): string | undefined {
  const clean = pathname.replace(/^\/+|\/+$/g, "").replace(/\.html$/, "");
  return PUBLIC_PAGES[clean];
}

/** Keep the original markup intact; only make legacy relative URLs route-safe. */
export function normalizeLegacyUrls(html: string): string {
  return html
    .replace(/((?:src|href)=["'])static\//gi, "$1/static/")
    .replace(/(<base\s+href=["'])\.\.\//gi, "$1/")
    // File-relative links break when the document is served at /work/:slug.
    .replace(/(href=["'])\/?index\.html(?=([?#][^"']*)?["'])/gi, "$1/")
    .replace(/(href=["'])\/?(works|highlights|about)\.html(?=([?#][^"']*)?["'])/gi, "$1/$2")
    .replace(/(href=["'])\/?([A-Za-z0-9-]+)\.html(?=([?#][^"']*)?["'])/gi, "$1/work/$2")
    .replace(/((?:location\.)?href\s*=\s*["'])\/?index\.html(["'])/gi, "$1/$2")
    .replace(/((?:location\.)?href\s*=\s*["'])\/?(works|highlights|about)\.html(["'])/gi, "$1/$2$3")
    .replace(/((?:location\.)?href\s*=\s*["'])\/?([A-Za-z0-9-]+)\.html(["'])/gi, "$1/work/$2$3");
}

const PUBLIC_ASSET_PREFIXES = ["css/", "js/", "font/", "fonts/", "picture/brand/"];

/**
 * All case-study media uses one server-controlled route. Public projects are
 * allowed through without a password; protected projects require the session.
 * Shared CSS, JavaScript, fonts, and brand assets remain public infrastructure.
 */
export function projectAssetUrls(html: string, projectSlug: string): string {
  const prefix = `/project-assets/${encodeURIComponent(projectSlug)}/static/`;
  return html.replace(/(["'])\/?static\/([^"']+)/gi, (_match, quote: string, asset: string) => {
    const pathname = asset.split(/[?#]/, 1)[0].toLowerCase();
    if (PUBLIC_ASSET_PREFIXES.some((publicPrefix) => pathname.startsWith(publicPrefix))) {
      return `${quote}/static/${asset}`;
    }
    return `${quote}${prefix}${asset}`;
  });
}

/** Apply the same lightweight save-deterrence behavior to every rendered page. */
function addContentProtection(html: string): string {
  if (html.includes("/static/js/content-protection.js")) return html;
  const script = '<script src="/static/js/content-protection.js" defer></script>';
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${script}</body>`) : `${html}${script}`;
}
