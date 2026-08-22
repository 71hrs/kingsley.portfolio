import { cp, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
// `static/` at the repository root is implicitly public in Next.js. Keep the
// source library under a neutral name and selectively publish from it.
const source = path.join(root, "source-assets");
const destination = path.join(root, "public", "static");
const projectData = JSON.parse(await readFile(path.join(root, "config", "projects.data.json"), "utf8"));

async function referencedAssets(source) {
  const html = await readFile(path.join(root, "legacy-pages", source), "utf8");
  return new Set([...html.matchAll(/["']\/?static\/([^"'?#]+)(?:[?#][^"']*)?["']/gi)]
    .map((match) => decodeURIComponent(match[1])));
}

const publicReferences = new Set();
const protectedReferences = new Set();
for (const project of Object.values(projectData)) {
  const target = project.protected ? protectedReferences : publicReferences;
  for (const asset of await referencedAssets(project.source)) target.add(asset);
}
for (const source of ["index.html", "works.html", "highlights.html", "about.html"]) {
  for (const asset of await referencedAssets(source)) publicReferences.add(asset);
}

const privateOnly = new Set([...protectedReferences].filter((asset) => !publicReferences.has(asset)));

// public/static is generated, never committed. Private project assets must live
// in private-assets locally or Private Blob in production, not in this tree.
await mkdir(path.dirname(destination), { recursive: true });
await rm(destination, { recursive: true, force: true });
await cp(source, destination, {
  recursive: true,
  preserveTimestamps: true,
  filter: (entry) => {
    const relative = path.relative(source, entry);
    return !privateOnly.has(relative);
  },
});

process.stdout.write(`Prepared public assets; excluded ${privateOnly.size} protected-only files.\n`);
