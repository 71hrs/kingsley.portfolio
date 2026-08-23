import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

const LOCAL_COOKIE = "portfolio_session";
const SECURE_COOKIE = "__Host-portfolio_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = { authenticated: true; exp: number; version: string };

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
  return value;
}

function signature(payload: string): Buffer {
  return createHmac("sha256", secret()).update(payload).digest();
}

export function createSessionToken(now = Date.now()): string {
  const payload: SessionPayload = {
    authenticated: true,
    exp: Math.floor(now / 1000) + SESSION_SECONDS,
    version: process.env.AUTH_VERSION ?? "1",
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded).toString("base64url")}`;
}

export function verifySessionToken(token?: string, now = Date.now()): boolean {
  if (!token) return false;
  const [encoded, suppliedSignature] = token.split(".");
  if (!encoded || !suppliedSignature) return false;
  try {
    const expected = signature(encoded);
    const supplied = Buffer.from(suppliedSignature, "base64url");
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as SessionPayload;
    return payload.authenticated === true &&
      payload.exp > Math.floor(now / 1000) &&
      payload.version === (process.env.AUTH_VERSION ?? "1");
  } catch {
    return false;
  }
}

export function hasValidSession(request: NextRequest): boolean {
  return verifySessionToken(
    request.cookies.get(SECURE_COOKIE)?.value ?? request.cookies.get(LOCAL_COOKIE)?.value,
  );
}

export function sessionCookie(isProduction: boolean) {
  return {
    name: isProduction ? SECURE_COOKIE : LOCAL_COOKIE,
    value: createSessionToken(),
    options: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      path: "/",
      maxAge: SESSION_SECONDS,
      priority: "high" as const,
    },
  };
}
