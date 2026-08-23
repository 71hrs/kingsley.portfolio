import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("password is not embedded in browser-facing source", async () => {
  const files = [
    "app/[[...path]]/route.ts",
    "Password System/auth/password-page.ts",
    "Password System/config/projects.config.ts",
  ];
  for (const file of files) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /if\s*\([^)]*password\s*===/i);
    assert.doesNotMatch(source, /localStorage|sessionStorage/);
  }
});

test("protected responses disable shared caching", async () => {
  const source = await readFile(new URL("../Password%20System/auth/security.ts", import.meta.url), "utf8");
  assert.match(source, /private, no-store/);
  assert.match(source, /Vercel-CDN-Cache-Control/);
});

test("session cookie uses required security flags", async () => {
  const source = await readFile(new URL("../Password%20System/auth/session.ts", import.meta.url), "utf8");
  assert.match(source, /httpOnly:\s*true/);
  assert.match(source, /sameSite:\s*"lax"/);
  assert.match(source, /SECURE_COOKIE/);
});

test("all project media uses the unified server-controlled asset route", async () => {
  const pageRoute = await readFile(new URL("../app/[[...path]]/route.ts", import.meta.url), "utf8");
  const assetRoute = await readFile(new URL("../app/project-assets/[project]/[...asset]/route.ts", import.meta.url), "utf8");
  assert.match(pageRoute, /projectAssetUrls\(source, route\.slug\)/);
  assert.match(assetRoute, /project\.protected && !hasValidSession/);
  assert.match(assetRoute, /library\/\$\{assetPath\}/);
});

test("rendered pages load casual media save deterrence", async () => {
  const html = await readFile(new URL("../lib/legacy/html.ts", import.meta.url), "utf8");
  const browserScript = await readFile(new URL("../Assets/js/content-protection.js", import.meta.url), "utf8");
  assert.match(html, /content-protection\.js/);
  assert.match(browserScript, /contextmenu/);
  assert.match(browserScript, /dragstart/);
  assert.match(browserScript, /nodownload/);
});
