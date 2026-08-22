import { getProject } from "@/config/projects.config";
import { verifyPortfolioPassword } from "@/lib/auth/password";
import { hasValidSession, sessionCookie } from "@/lib/auth/session";
import { PROTECTED_HEADERS, requestHasSameOrigin } from "@/lib/http/security";
import { protectLegacyAssetUrls, publicPageSource, readLegacyPage } from "@/lib/legacy/html";
import { passwordPage } from "@/lib/ui/password-page";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ path?: string[] }> };

function resolveRoute(segments: string[] = []) {
  const pathname = segments.join("/");
  if (segments[0] === "work" && segments[1] && segments.length === 2) {
    return { project: getProject(segments[1]), slug: segments[1] };
  }
  const legacySlug = pathname.replace(/\.html$/, "");
  const project = getProject(legacySlug);
  if (project) return { project, slug: legacySlug };
  return { source: publicPageSource(pathname) };
}

function html(body: string, protectedPage = false, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...(protectedPage ? PROTECTED_HEADERS : { "Cache-Control": "public, max-age=0, must-revalidate" }),
    },
  });
}

export async function GET(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const route = resolveRoute(path);
  if (route.project) {
    if (route.project.protected && !hasValidSession(request)) {
      return html(passwordPage(route.project.title), true);
    }
    const source = await readLegacyPage(route.project.source, route.project.protected);
    const body = route.project.protected ? protectLegacyAssetUrls(source, route.slug) : source;
    return html(body, route.project.protected);
  }
  if (route.source) return html(await readLegacyPage(route.source));
  return new NextResponse("Not Found", { status: 404 });
}

export async function POST(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const route = resolveRoute(path);
  if (!route.project?.protected) return new NextResponse("Not Found", { status: 404 });
  if (!requestHasSameOrigin(request)) return html(passwordPage(route.project.title, true), true);

  const form = await request.formData();
  const candidate = form.get("password");
  if (typeof candidate !== "string" || !verifyPortfolioPassword(candidate)) {
    return html(passwordPage(route.project.title, true), true);
  }

  const response = NextResponse.redirect(request.nextUrl, 303);
  const cookie = sessionCookie(process.env.NODE_ENV === "production");
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  Object.entries(PROTECTED_HEADERS).forEach(([name, value]) => response.headers.set(name, value));
  return response;
}
