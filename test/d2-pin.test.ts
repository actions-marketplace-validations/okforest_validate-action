import { readFileSync } from "node:fs"
// @ts-expect-error: a plain .mjs script with no type declarations.
import { lockfilePin } from "../scripts/pin-d2.mjs"
import { D2_PIN } from "../src/d2-pin.js"

describe("the D2 pin", () => {
  it("matches @d2lang/d2 in pnpm-lock.yaml (run `pnpm build` after a bump)", () => {
    const lockfile = readFileSync(new URL("../pnpm-lock.yaml", import.meta.url), "utf8")
    expect(D2_PIN).toEqual(lockfilePin(lockfile))
  })
})
