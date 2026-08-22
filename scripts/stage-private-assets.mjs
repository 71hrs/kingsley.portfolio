import { copyFile, mkdir, mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const slug = process.argv[2];
if (!slug) throw new Error("Usage: node scripts/stage-private-assets.mjs <project-slug>");

const root = process.cwd();
const projects = JSON.parse(await readFile(path.join(root, "config", "projects.data.json"), "utf8"));
const project = projects[slug];
if (!project?.protected) throw new Error(`Unknown or public project: ${slug}`);

const html = await readFile(path.join(root, "legacy-pages", project.source), "utf8");
const references = new Set(
  [...html.matchAll(/["']\/?static\/([^"'?#]+)(?:[?#][^"']*)?["']/gi)].map((match) => decodeURIComponent(match[1])),
);
const stagingRoot = await mkdtemp(path.join(os.tmpdir(), "portfolio-private-assets-"));
const projectRoot = path.join(stagingRoot, slug);

for (const relative of references) {
  const source = path.join(root, "source-assets", relative);
  const destination = path.join(projectRoot, "static", relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

process.stdout.write(`${projectRoot}\n${references.size}\n`);
