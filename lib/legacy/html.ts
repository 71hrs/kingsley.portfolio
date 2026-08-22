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
  const publicPath = path.join(process.cwd(), "legacy-pages", filename);
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
  return normalizeLegacyUrls(html);
}

export function publicPageSource(pathname: string): string | undefined {
  const clean = pathname.replace(/^\/+|\/+$/g, "").replace(/\.html$/, "");
  return PUBLIC_PAGES[clean];
}

/** Keep the original markup intact; only make legacy relative URLs route-safe. */
export function normalizeLegacyUrls(html: string): string {
  return html
    .replace(/((?:src|href)=["'])static\//gi, "$1/static/")
    .replace(/(<base\s+href=["'])\.\.\//gi, "$1/");
}

/** Route every local dependency of a protected page through the auth check. */
export function protectLegacyAssetUrls(html: string, projectSlug: string): string {
  const prefix = `/protected-assets/${encodeURIComponent(projectSlug)}/static/`;
  return html.replace(/(["'])\/?static\//gi, `$1${prefix}`);
}
