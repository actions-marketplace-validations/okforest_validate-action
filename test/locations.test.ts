import { resolve } from "node:path"
import type { Finding } from "@okforest/validate"
import { findingUrl, linksFromEnvironment, workspacePath } from "../src/locations.js"

const finding = (line?: number): Finding => ({
  ruleId: "okf/type",
  severity: "error",
  message: "Missing `type`, the one required key.",
  file: "a.md",
  ...(line === undefined ? {} : { line }),
})

describe("workspacePath", () => {
  const workspace = resolve("/work/repo")

  it.each([
    [".", "concepts/a.md"],
    ["", "concepts/a.md"],
    ["docs", "docs/concepts/a.md"],
    ["./docs/knowledge/", "docs/knowledge/concepts/a.md"],
    [resolve(workspace, "docs"), "docs/concepts/a.md"],
  ])("maps a file in tree %j to %s", (root, expected) => {
    expect(workspacePath(workspace, root)("concepts/a.md")).toBe(expected)
  })
})

describe("findingUrl", () => {
  const links = { server: "https://github.com", repository: "acme/knowledge", sha: "abc123" }

  it("links to the line on the commit", () => {
    expect(findingUrl(links, "docs/a b#1.md", finding(12))).toBe(
      "https://github.com/acme/knowledge/blob/abc123/docs/a%20b%231.md#L12",
    )
  })

  it("links to the file when the finding has no line", () => {
    expect(findingUrl(links, "a.md", finding())).toBe(
      "https://github.com/acme/knowledge/blob/abc123/a.md",
    )
  })

  it("does not link without a repository, or outside the workspace", () => {
    expect(findingUrl(undefined, "a.md", finding(1))).toBeUndefined()
    expect(findingUrl(links, "../elsewhere/a.md", finding(1))).toBeUndefined()
  })
})

describe("linksFromEnvironment", () => {
  const env = {
    GITHUB_SERVER_URL: "https://github.com",
    GITHUB_REPOSITORY: "acme/knowledge",
    GITHUB_SHA: "merge123",
  }

  it("uses the pull request's head commit", () => {
    expect(linksFromEnvironment(env, { pull_request: { head: { sha: "head456" } } })).toEqual({
      server: "https://github.com",
      repository: "acme/knowledge",
      sha: "head456",
    })
  })

  it("falls back to the commit being built", () => {
    expect(linksFromEnvironment(env, undefined)?.sha).toBe("merge123")
  })

  it("has no links outside GitHub Actions", () => {
    expect(linksFromEnvironment({}, undefined)).toBeUndefined()
  })
})
