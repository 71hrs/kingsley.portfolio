import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

const PUBLIC_PAGES: Record<string, string> = {
  "": "index.html",
  index: "index.html",
  works: "works.html",
  // Keep old Highlights links working while the content now lives in About.
  highlights: "about.html",
  about: "about.html",
};

function safeSource(source: string): string {
  if (!/^(?:[A-Za-z0-9-]+\/)*[A-Za-z0-9-]+\.html$/.test(source)) {
    throw new Error("Invalid page source.");
  }
  return source;
}

export async function readPage(source: string, protectedPage = false): Promise<string> {
  const filename = safeSource(source);
  if (protectedPage) {
    return readFile(path.join(process.cwd(), "private-content", filename), "utf8");
  }
  return readFile(path.join(process.cwd(), "Website Pages", filename), "utf8");
}

export function publicPageSource(pathname: string): string | undefined {
  const clean = pathname.replace(/^\/+|\/+$/g, "").replace(/\.html$/, "");
  return PUBLIC_PAGES[clean];
}

export function projectAssetUrls(html: string, projectSlug: string, protectedPage = false): string {
  const prefix = `/project-assets/${encodeURIComponent(projectSlug)}/static/`;
  return html.replace(/(["'])\/?static\/([^"']+)/gi, (_match, quote: string, asset: string) => {
    const normalized = asset.split(/[?#]/, 1)[0].toLowerCase();
    const isPublic = ["css/", "js/", "font/", "fonts/", "picture/home/brand/"].some((prefix) => normalized.startsWith(prefix));
    return `${quote}${protectedPage && !isPublic ? `${prefix}${asset}` : `/static/${asset}`}`;
  });
}
