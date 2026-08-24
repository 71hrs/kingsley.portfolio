import { getProject } from "@/Password System/config/projects.config";
import { hasValidSession } from "@/Password System/auth/session";
import { PROTECTED_HEADERS } from "@/Password System/auth/security";
import { get } from "@vercel/blob";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".svg": "image/svg+xml", ".webm": "video/webm", ".mp4": "video/mp4", ".pdf": "application/pdf",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf",
};

type Context = { params: Promise<{ project: string; asset: string[] }> };

function responseHeaders(isProtected: boolean) {
  return isProtected
    ? PROTECTED_HEADERS
    : { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400", "X-Content-Type-Options": "nosniff" };
}

function denied() {
  return new Response("Not Found", { status: 404, headers: PROTECTED_HEADERS });
}

/**
 * The editable Assets library is organized by page. Existing Blob objects keep
 * their original keys so reorganizing local folders does not duplicate roughly
 * half a gigabyte of uploads or break a deployed page.
 */
function blobStoragePath(assetPath: string): string {
  const match = /^static\/picture\/works\/[^/]+\/([^/]+)\/(.+)$/.exec(assetPath);
  if (!match) return assetPath;

  const [, project, filename] = match;
  if (["polyverse", "dollar-flip", "operation-management-system", "post-lending-management-system"].includes(project)) {
    return `static/picture/${project}/${filename}`;
  }
  if (project === "uircs" || project === "uircs-backup") return `static/picture/uircs-redesign/${filename}`;
  if (project === "chem-guard") {
    return filename.startsWith("chem-guard-")
      ? `static/MIT-picture/${filename}`
      : `static/picture/${filename}`;
  }
  if (project === "organisms-utopia") {
    const wasMitAsset = /^organisms-utopia-(?:c4d|collab|cover|outcome|overview|prototype)/.test(filename);
    return wasMitAsset ? `static/MIT-picture/${filename}` : `static/picture/${filename}`;
  }
  if (["close-to-me", "glamhub", "the-underground-palace", "valentino-beauty", "wave"].includes(project)) {
    return `static/picture/${filename}`;
  }
  return assetPath;
}

/** One media gateway for every project; config alone controls password access. */
export async function GET(request: NextRequest, context: Context) {
  const { project: slug, asset } = await context.params;
  const project = getProject(slug);
  if (!project || (project.protected && !hasValidSession(request))) return denied();
  if (asset.some((segment) => !segment || segment === "." || segment === "..")) return denied();

  const assetPath = asset.join("/");
  const blobPath = `library/${blobStoragePath(assetPath)}`;
  const headers = responseHeaders(project.protected);

  // Vercel uses OIDC for connected projects; legacy/local setups may still
  // provide a read-write token directly.
  // A pulled Development OIDC token expires quickly, so local preview always
  // uses the editable Assets folder. Vercel production uses Private Blob.
  if (process.env.VERCEL === "1" || process.env.BLOB_READ_WRITE_TOKEN) {
    const range = request.headers.get("range");
    const result = await get(blobPath, { access: "private", headers: range ? { Range: range } : undefined });
    if (!result || ![200, 206].includes(result.statusCode) || !result.stream) return denied();
    const contentRange = result.headers.get("content-range");
    return new Response(result.stream, {
      status: contentRange ? 206 : 200,
      headers: {
        ...headers,
        "Content-Type": result.blob.contentType || MIME[path.extname(blobPath).toLowerCase()] || "application/octet-stream",
        "Accept-Ranges": "bytes",
        ...(contentRange ? { "Content-Range": contentRange } : {}),
        ...(result.headers.get("content-length") ? { "Content-Length": result.headers.get("content-length")! } : {}),
      },
    });
  }

  // Local development reads from the single editable source library.
  const sourceRoot = path.resolve(process.cwd(), "Assets");
  const sourceSegments = asset[0] === "static" ? asset.slice(1) : asset;
  const filename = path.resolve(sourceRoot, ...sourceSegments);
  if (!filename.startsWith(`${sourceRoot}${path.sep}`)) return denied();

  try {
    const info = await stat(filename);
    if (!info.isFile()) return denied();
    const requestedRange = request.headers.get("range");
    let start = 0;
    let end = info.size - 1;
    let statusCode = 200;
    if (requestedRange) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(requestedRange);
      if (!match) return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${info.size}` } });
      start = match[1] ? Number(match[1]) : 0;
      end = match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) {
        return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${info.size}` } });
      }
      statusCode = 206;
    }
    const stream = Readable.toWeb(createReadStream(filename, { start, end })) as ReadableStream;
    return new Response(stream, {
      status: statusCode,
      headers: {
        ...headers,
        "Content-Type": MIME[path.extname(filename).toLowerCase()] ?? "application/octet-stream",
        "Content-Length": String(end - start + 1),
        "Accept-Ranges": "bytes",
        ...(statusCode === 206 ? { "Content-Range": `bytes ${start}-${end}/${info.size}` } : {}),
      },
    });
  } catch {
    return denied();
  }
}
