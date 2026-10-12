import { isAbsolute, relative, resolve, sep } from "node:path"
import type { Finding } from "@okforest/validate"

/**
 * Turns a finding's tree-relative path into a workspace-relative one, which
 * is what annotations and links on GitHub need.
 */
export function workspacePath(workspace: string, treeRoot: string): (file: string) => string {
  const root = relative(workspace, resolve(workspace, treeRoot)).split(sep).join("/")
  return (file) => (root === "" ? file : `${root}/${file}`)
}

export interface Links {
  server: string
  repository: string
  sha: string
}

/** Where a finding is on GitHub, or undefined when the run has no repository. */
export function findingUrl(links: Links | undefined, path: string, finding: Finding) {
  if (!links || path.startsWith("../") || isAbsolute(path)) return undefined
  const encoded = path.split("/").map(encodeURIComponent).join("/")
  const anchor = finding.line === undefined ? "" : `#L${finding.line}`
  return `${links.server}/${links.repository}/blob/${links.sha}/${encoded}${anchor}`
}

/**
 * The repository and commit to link to: the pull request's head commit (the
 * one people review) on pull_request events, else the commit being built.
 */
export function linksFromEnvironment(
  env: NodeJS.ProcessEnv,
  event: { pull_request?: { head?: { sha?: string } } } | undefined,
): Links | undefined {
  const server = env.GITHUB_SERVER_URL
  const repository = env.GITHUB_REPOSITORY
  const sha = event?.pull_request?.head?.sha ?? env.GITHUB_SHA
  return server && repository && sha ? { server, repository, sha } : undefined
}
