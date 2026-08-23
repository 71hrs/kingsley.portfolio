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
 * Every project uses the same private media library. To protect a project,
 * change only `protected` to true. No content or asset files need to move.
 */
export const projects = projectData satisfies Record<string, ProjectConfig>;

export type ProjectSlug = keyof typeof projects;

export function getProject(slug: string): ProjectConfig | undefined {
  return (projects as Record<string, ProjectConfig>)[slug];
}
