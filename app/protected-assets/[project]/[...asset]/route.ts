import { getProject } from "@/config/projects.config";
import { hasValidSession } from "@/lib/auth/session";
import { PROTECTED_HEADERS } from "@/lib/http/security";
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

function denied() {
  // Deliberately use 404 so the route does not reveal whether a private asset exists.
  return new Response("Not Found", { status: 404, headers: PROTECTED_HEADERS });
}

export async function GET(request: NextRequest, context: Context) {
  const { project: slug, asset } = await context.params;
  const project = getProject(slug);
  if (!project?.protected || !hasValidSession(request)) return denied();
  if (asset.some((segment) => !segment || segment === "." || segment === "..")) return denied();

  const pathname = `${slug}/${asset.join("/")}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const range = request.headers.get("range");
    const result = await get(pathname, {
      access: "private",
      headers: range ? { Range: range } : undefined,
    });
    if (!result || result.statusCode !== 200 || !result.stream) return denied();
    const contentRange = result.headers.get("content-range");
    return new Response(result.stream, {
      status: contentRange ? 206 : 200,
      headers: {
        ...PROTECTED_HEADERS,
        "Content-Type": result.blob.contentType || MIME[path.extname(pathname).toLowerCase()] || "application/octet-stream",
        "Accept-Ranges": "bytes",
        ...(contentRange ? { "Content-Range": contentRange } : {}),
        ...(result.headers.get("content-length") ? { "Content-Length": result.headers.get("content-length")! } : {}),
      },
    });
  }

  // Local development fallback. This directory is gitignored and never public.
  const privateRoot = path.resolve(process.cwd(), "private-assets", slug);
  const sourceRoot = path.resolve(process.cwd(), "source-assets");
  const privateFilename = path.resolve(privateRoot, ...asset);
  const sourceSegments = asset[0] === "static" ? asset.slice(1) : asset;
  const sourceFilename = path.resolve(sourceRoot, ...sourceSegments);
  let root = privateRoot;
  let filename = privateFilename;
  try {
    await stat(privateFilename);
  } catch {
    // Source fallback is development-only. Production must use Private Blob.
    if (process.env.NODE_ENV === "production") return denied();
    root = sourceRoot;
    filename = sourceFilename;
  }
  if (!filename.startsWith(`${root}${path.sep}`)) return denied();
  try {
    const info = await stat(filename);
    const requestedRange = request.headers.get("range");
    let start = 0;
    let end = info.size - 1;
    let statusCode = 200;
    if (requestedRange) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(requestedRange);
      if (!match) return new Response(null, { status: 416, headers: { ...PROTECTED_HEADERS, "Content-Range": `bytes */${info.size}` } });
      start = match[1] ? Number(match[1]) : 0;
      end = match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) {
        return new Response(null, { status: 416, headers: { ...PROTECTED_HEADERS, "Content-Range": `bytes */${info.size}` } });
      }
      statusCode = 206;
    }
    const stream = Readable.toWeb(createReadStream(filename, { start, end })) as ReadableStream;
    return new Response(stream, {
      status: statusCode,
      headers: {
        ...PROTECTED_HEADERS,
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
