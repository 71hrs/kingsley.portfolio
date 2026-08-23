import { put } from "@vercel/blob";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL_OIDC_TOKEN) {
  console.error("A Vercel Blob token or Vercel OIDC session is required.");
  process.exit(1);
}

const root = process.cwd();
const projects = JSON.parse(await readFile(path.join(root, "Password System", "config", "projects.data.json"), "utf8"));
const sharedPrefixes = ["css/", "js/", "font/", "fonts/", "picture/brand/"];
const referenced = new Set();

for (const project of Object.values(projects)) {
  const html = await readFile(path.join(root, "Website Pages", project.source), "utf8");
  for (const match of html.matchAll(/["']\/?static\/([^"'?#]+)(?:[?#][^"']*)?["']/gi)) {
    const relative = decodeURIComponent(match[1]);
    if (!relative.endsWith("/") && !sharedPrefixes.some((prefix) => relative.startsWith(prefix))) {
      referenced.add(relative);
    }
  }
}

let uploaded = 0;
for (const relative of [...referenced].sort()) {
  const filename = path.join(root, "Assets", relative);
  const info = await stat(filename);
  if (!info.isFile()) continue;
  await put(`library/static/${relative}`, createReadStream(filename), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    multipart: info.size > 4 * 1024 * 1024,
  });
  uploaded += 1;
  process.stdout.write(`Uploaded ${uploaded}/${referenced.size}: ${relative}\n`);
}

process.stdout.write(`Uploaded ${uploaded} unique project assets to the private library.\n`);
