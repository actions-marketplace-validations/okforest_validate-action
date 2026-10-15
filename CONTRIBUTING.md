# Contributing

Thanks for helping grow OKForest. The organization-wide guide
([okforest/.github](https://github.com/okforest/.github/blob/main/CONTRIBUTING.md))
covers licensing (Apache 2.0, inbound = outbound), Conventional Commits, and
example-data rules. This file covers this repository.

## Setup

    pnpm install
    pnpm build && pnpm test && pnpm typecheck && pnpm check

All four gates must pass before a PR; CI runs the same commands. `pnpm
install` fetches the pinned pnpm and Node versions automatically
(`packageManager` and `devEngines` in `package.json`).

**Commit `dist/` with every source change.** GitHub runs an action straight
from the repository at the tag a workflow names, with no install or build
step, so `dist/` is the code users run. `pnpm build` regenerates it (plus
`dist/licenses.txt`); CI fails when the committed `dist/` differs from a fresh
build, and attaches the expected `dist/` to the failed run.

## Layout

| Path | What it is |
|---|---|
| `action.yml` | The action's inputs, outputs, and runtime (`node24`, `dist/index.js`). |
| `src/main.ts` | The run: read the tree, validate, then outputs, annotations, the job summary, and pass or fail. |
| `src/d2.ts`, `src/d2-pin.ts` | D2 downloaded on demand and checked against the checksum `pnpm build` pins from the lockfile. |
| `src/summary.ts`, `src/locations.ts` | The job summary, and workspace paths and links for findings. |
| `dist/` | The generated bundle GitHub runs. Never edit by hand. |
| `fixtures/clean`, `fixtures/broken` | Trees the CI self-test runs the action on, on Linux, macOS, and Windows. |

## Updating dependencies

- **`@okforest/validate`** (the rules): bump it in `pnpm-workspace.yaml`,
  `pnpm install`, `pnpm build`, and update test expectations if the rules'
  findings changed.
- **D2** is not bundled; the action downloads it at run time. `pnpm build`
  writes the `@d2lang/d2` version and its checksum from `pnpm-lock.yaml` into
  `src/d2-pin.ts`, so upgrading it is the same as any other dependency: bump,
  `pnpm install`, `pnpm build`, commit.
- **Dependabot PRs** update `package.json` and the lockfile but not `dist/`,
  so CI's `dist/` check fails on them. Check out the branch, run `pnpm
  install && pnpm build`, and push.

## Releasing

Releases go through Changesets: add a changeset (`pnpm changeset`) with your
change, and merging it to `main` opens a "Version Packages" PR. Merging that
PR tags the release (`v1.2.3`), creates its GitHub Release from
`CHANGELOG.md`, and moves the major tag (`v1`) to it. Nothing is published to
npm.

**Marketplace.** The Action is listed on the
[GitHub Marketplace](https://github.com/marketplace/actions/okforest-validate),
and each new release appears there on its own (v1.0.1 did). Only the first
listing was manual, since GitHub has no API for it: open the release, choose
**Edit**, tick **Publish this Action to the GitHub Marketplace**, accept the
Marketplace Developer Agreement, and update the release.

**Major versions.** A breaking change to inputs, outputs, or what fails the
step needs a major version (`v2`): users pinned to `v1` keep getting 1.x.
