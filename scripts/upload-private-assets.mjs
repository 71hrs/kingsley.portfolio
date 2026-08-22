import { put } from "@vercel/blob";
import { createReadStream } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: pnpm assets:upload -- <project-slug>");
  process.exit(1);
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN is required.");
  process.exit(1);
}

const root = process.cwd();
const projects = JSON.parse(await readFile(path.join(root, "config", "projects.data.json"), "utf8"));
const project = projects[slug];
if (!project) throw new Error(`Unknown project: ${slug}`);

const html = await readFile(path.join(root, "legacy-pages", project.source), "utf8");
const referenced = new Set([...html.matchAll(/["']\/?static\/([^"'?#]+)(?:[?#][^"']*)?["']/gi)]
  .map((match) => decodeURIComponent(match[1])));

const uploads = [];
for (const relative of referenced) {
  uploads.push({
    filename: path.join(root, "source-assets", relative),
    pathname: `${slug}/static/${relative}`,
  });
}

async function addPrivateDirectory(directory, prefix = "") {
  try {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      const relative = path.posix.join(prefix, entry.name);
      if (entry.isDirectory()) await addPrivateDirectory(filename, relative);
      else if (entry.isFile()) uploads.push({ filename, pathname: `${slug}/${relative}` });
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

await addPrivateDirectory(path.join(root, "private-assets", slug));

for (const upload of uploads) {
  const info = await stat(upload.filename);
  if (!info.isFile()) continue;
  await put(upload.pathname, createReadStream(upload.filename), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    multipart: true,
  });
  process.stdout.write(`Uploaded ${upload.pathname}\n`);
}

process.stdout.write(`Uploaded ${uploads.length} private project assets.\n`);
