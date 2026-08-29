import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
// `static/` at the repository root is implicitly public in Next.js. Keep the
// source library under a neutral name and selectively publish from it.
const source = path.join(root, "Assets");
const destination = path.join(root, "public", "static");
const projectData = JSON.parse(await readFile(path.join(root, "Password System", "config", "projects.data.json"), "utf8"));

async function referencedAssets(source) {
  let html;
  try {
    html = await readFile(path.join(root, "Website Pages", source), "utf8");
  } catch (error) {
    // During the approved from-zero rebuild, a project can be intentionally
    // absent while its Backup version remains untouched.
    if (error?.code === "ENOENT") return new Set();
    throw error;
  }
  return new Set([...html.matchAll(/["'](?:\/|(?:\.\.\/)*)static\/([^"'?#]+)(?:[?#][^"']*)?["']/gi)]
    .map((match) => decodeURIComponent(match[1]))
    .filter((relative) => !relative.endsWith("/")));
}

const publicReferences = new Set();
const protectedReferences = new Set();
for (const project of Object.values(projectData)) {
  for (const asset of await referencedAssets(project.source)) {
    if (project.protected) protectedReferences.add(asset);
  }
}
for (const source of ["index.html", "works.html", "about.html"]) {
  for (const asset of await referencedAssets(source)) publicReferences.add(asset);
}

// Case-study media is served through /project-assets for every project. Keep
// only assets also needed by the public home/gallery/about pages in public/.
const privateOnly = new Set([...protectedReferences].filter((asset) => !publicReferences.has(asset)));
const sharedPrefixes = ["css/", "js/", "font/", "fonts/", "picture/home/brand/"];
const isSharedInfrastructure = (relative) => sharedPrefixes.some((prefix) => relative.split(path.sep).join("/").startsWith(prefix));
const isOptimizedSource = (relative) => {
  if (!/\.(?:png|jpe?g)$/i.test(relative)) return false;
  const webp = relative.replace(/\.(?:png|jpe?g)$/i, ".webp");
  return existsSync(path.join(source, webp));
};

// public/static is generated, never committed. Private project assets must live
// in private-assets locally or Private Blob in production, not in this tree.
await mkdir(path.dirname(destination), { recursive: true });
await rm(destination, { recursive: true, force: true });
await cp(source, destination, {
  recursive: true,
  preserveTimestamps: true,
  filter: (entry) => {
    const relative = path.relative(source, entry);
    // Keep editable originals in Assets, but publish only the optimized copy
    // when a matching WebP exists.
    return !isOptimizedSource(relative) && (isSharedInfrastructure(relative) || !privateOnly.has(relative));
  },
});

// The original portfolio background uses Three.js. It is vendored locally so
// the visual effect never depends on a third-party URL at runtime.
await mkdir(path.join(destination, "js", "vendor"), { recursive: true });
await cp(
  path.join(root, "node_modules", "three", "build", "three.module.js"),
  path.join(destination, "js", "vendor", "three.module.js"),
);

process.stdout.write(`Prepared public assets; excluded ${privateOnly.size} project-only files.\n`);
