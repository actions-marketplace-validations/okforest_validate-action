import { defineConfig } from "tsdown"

// The bundle GitHub runs: dist/index.js plus lazily loaded chunks (Mermaid's
// diagram parsers), committed on main because actions run straight from the
// repository with no install step. D2 is not bundled; it is downloaded at run
// time (src/d2.ts), so @okforest/validate's default `import("@d2lang/d2")`
// stays external and is never reached.
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  platform: "node",
  target: "node24",
  outExtensions: () => ({ js: ".js" }),
  deps: { alwaysBundle: [/.*/], neverBundle: ["@d2lang/d2"] },
  clean: true,
})
