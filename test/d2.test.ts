import { createHash } from "node:crypto"
import { mkdir, mkdtemp, writeFile } from "node:fs/promises"
import { arch, tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { d2Loader } from "../src/d2.js"
import { D2_PIN } from "../src/d2-pin.js"

const ARCHIVE = Buffer.from("not really a tarball")
const integrity = (bytes: Buffer) => `sha512-${createHash("sha512").update(bytes).digest("base64")}`
const pin = {
  version: "0.1.34",
  tarball: "https://registry.npmjs.org/@d2lang/d2/-/d2-0.1.34.tgz",
  integrity: integrity(ARCHIVE),
}
const D2 = { D2: class {} }

/** A tool cache backed by a temporary directory, recording what it was asked to do. */
async function fakeToolCache(options: { cached?: boolean; download?: Buffer | Error } = {}) {
  const dir = await mkdtemp(join(tmpdir(), "d2-test-"))
  const calls: string[] = []
  const cachedDir = join(dir, "cache", "okforest-d2", "0.1.34")
  return {
    calls,
    cachedDir,
    toolCache: {
      find: (tool: string, version: string) => {
        calls.push(`find ${tool} ${version}`)
        return options.cached ? cachedDir : ""
      },
      downloadTool: async (url: string) => {
        calls.push(`download ${url}`)
        if (options.download instanceof Error) throw options.download
        const file = join(dir, "archive.tgz")
        await writeFile(file, options.download ?? ARCHIVE)
        return file
      },
      extractTar: async (file: string) => {
        calls.push(`extract ${file === join(dir, "archive.tgz")}`)
        const out = join(dir, "extracted")
        await mkdir(join(out, "package"), { recursive: true })
        return out
      },
      cacheDir: async (source: string, tool: string, version: string) => {
        calls.push(`cache ${source.endsWith(join("extracted", "package"))} ${tool} ${version}`)
        return cachedDir
      },
    },
  }
}

describe("d2Loader", () => {
  it("downloads, verifies, extracts, caches, and imports D2 on first use", async () => {
    const { toolCache, calls, cachedDir } = await fakeToolCache()
    const imported: string[] = []
    const load = d2Loader({
      pin,
      toolCache,
      importModule: async (url) => {
        imported.push(url)
        return D2
      },
    })
    expect(await load()).toBe(D2)
    expect(calls).toEqual([
      "find okforest-d2 0.1.34",
      `download ${pin.tarball}`,
      "extract true",
      "cache true okforest-d2 0.1.34",
    ])
    expect(imported).toEqual([pathToFileURL(join(cachedDir, "dist", "node-esm", "index.js")).href])
  })

  it("uses a cached copy without downloading", async () => {
    const { toolCache, calls } = await fakeToolCache({ cached: true })
    const load = d2Loader({ pin, toolCache, importModule: async () => D2 })
    expect(await load()).toBe(D2)
    expect(calls).toEqual(["find okforest-d2 0.1.34"])
  })

  it("refuses a download that does not match the pinned checksum", async () => {
    const { toolCache, calls } = await fakeToolCache({ download: Buffer.from("tampered") })
    const warnings: string[] = []
    const load = d2Loader({
      pin,
      toolCache,
      importModule: async () => D2,
      warn: (message) => warnings.push(message),
    })
    expect(await load()).toEqual({
      unavailable: "D2 0.1.34 failed its checksum check after download.",
    })
    expect(warnings).toEqual([
      `D2 download from ${pin.tarball} did not match its pinned checksum; not using it.`,
    ])
    expect(calls).not.toContain("extract true")
  })

  it("reports D2 as unavailable when the download fails", async () => {
    const { toolCache } = await fakeToolCache({
      download: new Error("Unexpected HTTP response: 503"),
    })
    const load = d2Loader({ pin, toolCache, importModule: async () => D2 })
    expect(await load()).toEqual({
      unavailable: "D2 0.1.34 could not be downloaded: Unexpected HTTP response: 503",
    })
  })

  it("reports a download failure that is not an Error", async () => {
    const { toolCache } = await fakeToolCache()
    const load = d2Loader({
      pin,
      toolCache: {
        ...toolCache,
        downloadTool: () => Promise.reject("socket hang up"),
      },
    })
    expect(await load()).toEqual({
      unavailable: "D2 0.1.34 could not be downloaded: socket hang up",
    })
  })

  it("refuses a tampered download without a warning callback", async () => {
    const { toolCache } = await fakeToolCache({ download: Buffer.from("tampered") })
    expect(await d2Loader({ pin, toolCache })()).toEqual({
      unavailable: "D2 0.1.34 failed its checksum check after download.",
    })
  })

  it("imports the pinned version from the runner's tool cache by default", async () => {
    const cache = await mkdtemp(join(tmpdir(), "tool-cache-"))
    const dir = join(cache, "okforest-d2", D2_PIN.version, arch())
    await mkdir(join(dir, "dist", "node-esm"), { recursive: true })
    await writeFile(join(dir, "dist", "node-esm", "index.js"), "export class D2 {}\n")
    await writeFile(`${dir}.complete`, "")
    vi.stubEnv("RUNNER_TOOL_CACHE", cache)
    try {
      const module = (await d2Loader()()) as { D2: unknown }
      expect(typeof module.D2).toBe("function")
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it("reports D2 as unavailable when it cannot be imported", async () => {
    const { toolCache } = await fakeToolCache({ cached: true })
    const load = d2Loader({
      pin,
      toolCache,
      importModule: async () => {
        throw new Error("Cannot find module")
      },
    })
    expect(await load()).toEqual({
      unavailable: "D2 0.1.34 could not be loaded: Cannot find module",
    })
  })
})
