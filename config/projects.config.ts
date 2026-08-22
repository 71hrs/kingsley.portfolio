import "server-only";
import projectData from "./projects.data.json";

export type ProjectConfig = {
  title: string;
  source: string;
  protected: boolean;
};

/**
 * The single source of truth for project access.
 *
 * Existing projects deliberately remain public. To protect a project later,
 * change only `protected` to true, connect Private Blob, and deploy from a
 * private repository. Authentication and route logic require no changes.
 */
export const projects = projectData satisfies Record<string, ProjectConfig>;

export type ProjectSlug = keyof typeof projects;

export function getProject(slug: string): ProjectConfig | undefined {
  return (projects as Record<string, ProjectConfig>)[slug];
}
