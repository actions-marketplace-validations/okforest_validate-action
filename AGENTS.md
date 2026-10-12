# AGENTS.md

`okforest/validate-action`: the GitHub Action that runs `@okforest/validate`
(from [okforest/cli](https://github.com/okforest/cli)) on an OKF tree. The
rules live there; this repository only adapts them to GitHub: inputs,
outputs, annotations, the job summary, and the D2 download.

- Gates before any push: `pnpm build && pnpm test && pnpm typecheck && pnpm check`.
- `dist/` is committed and is what GitHub runs: rebuild (`pnpm build`) and
  commit it with every source or dependency change. CI fails on a stale
  `dist/`. Never edit `dist/` by hand.
- Mermaid is bundled. D2 is never bundled or imported from `node_modules` at
  run time: `src/d2.ts` downloads the version pinned in `src/d2-pin.ts` and
  verifies its checksum. Regenerate the pin with `pnpm d2:pin` after a bump.
- The JSON report comes from `toReport()` in `@okforest/validate`, so it is
  the same document as `okforest validate --format json`. Don't add fields
  here; change the shared report in okforest/cli.
- Inputs and outputs in `action.yml` are a public interface: removing or
  renaming one, or failing in new cases, needs a major version.
- Examples use reserved domains (`acme.example`) and placeholder names.
- Releases go through Changesets (`pnpm changeset`); tags are `v1.2.3` plus
  a moving `v1`.
