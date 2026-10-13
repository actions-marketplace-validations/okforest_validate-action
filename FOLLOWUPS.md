# Follow-ups

The planning doc for this repository; move items to GitHub Issues as the
project matures.

## Next

- **Immutable releases.** GitHub can make releases immutable (tags and assets
  locked once published), which protects users who pin `@v1.2.3`. Turn it on
  in the repository settings once the release flow has run once; the moving
  `v1` tag is not a release, so it can still move. Check first that an
  immutable release can still be ticked for the Marketplace.

## Features

- **Changed files only:** an input to annotate only findings in files the
  pull request changes, for large trees with existing findings.
- **SARIF upload** to GitHub code scanning, once `@okforest/validate` has a
  SARIF output (tracked in okforest/cli).
- **Rule configuration** inputs (severity overrides, `max-warnings`) once the
  CLI has them, so the action and CLI agree.

## Size

- `dist/` is about 11 MB unminified, almost all Mermaid's diagram parsers
  (lazy-loaded chunks). Minifying would roughly halve it but makes the
  committed code hard to review; revisit if clone time becomes a problem.
