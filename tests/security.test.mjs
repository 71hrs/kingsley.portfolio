import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("password is not embedded in browser-facing source", async () => {
  const files = [
    "app/[[...path]]/route.ts",
    "lib/ui/password-page.ts",
    "config/projects.config.ts",
  ];
  for (const file of files) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /if\s*\([^)]*password\s*===/i);
    assert.doesNotMatch(source, /localStorage|sessionStorage/);
  }
});

test("protected responses disable shared caching", async () => {
  const source = await readFile(new URL("../lib/http/security.ts", import.meta.url), "utf8");
  assert.match(source, /private, no-store/);
  assert.match(source, /Vercel-CDN-Cache-Control/);
});

test("session cookie uses required security flags", async () => {
  const source = await readFile(new URL("../lib/auth/session.ts", import.meta.url), "utf8");
  assert.match(source, /httpOnly:\s*true/);
  assert.match(source, /sameSite:\s*"lax"/);
  assert.match(source, /SECURE_COOKIE/);
});
