import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

const template = readFileSync(
  path.join(process.cwd(), "Password System", "auth", "password-page.html"),
  "utf8",
);

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;",
  })[character] as string);
}

export function passwordPage(projectTitle: string, incorrect = false): string {
  const title = escapeHtml(projectTitle);
  return template
    .replaceAll("{{PROJECT_TITLE}}", title)
    .replace("{{INCORRECT_ATTRIBUTES}}", incorrect ? 'aria-invalid="true"' : "")
    .replace("<!--ERROR_MESSAGE-->", incorrect ? "Incorrect password. Please try again." : "");
}
