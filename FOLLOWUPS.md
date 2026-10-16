# Follow-ups

The planning doc for this repository; move items to GitHub Issues as the
project matures. SARIF output, for both the CLI and this action, is deferred
in [okforest/cli#9](https://github.com/okforest/cli/issues/9).

## Features

- **Changed files only:** an input to annotate only findings in files the
  pull request changes, for large trees with existing findings.
- **Rule configuration** inputs (severity overrides, `max-warnings`) once the
  CLI has them, so the action and CLI agree.

## Size

- `dist/` is about 11 MB unminified, almost all Mermaid's diagram parsers
  (lazy-loaded chunks), and GitHub downloads it with each release tag a
  workflow uses. Minifying would roughly halve it but makes the release
  commit hard to read and stack traces harder to follow; revisit if download
  time becomes a problem.
