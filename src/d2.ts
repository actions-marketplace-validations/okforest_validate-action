import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import * as toolCache from "@actions/tool-cache"
import type { D2Module, Unavailable } from "@okforest/validate"
import { D2_PIN } from "./d2-pin.js"

export interface D2Pin {
  version: string
  tarball: string
  /** Subresource-integrity string from the lockfile: `sha512-<base64>`. */
  integrity: string
}

export interface D2LoaderOptions {
  pin?: D2Pin
  toolCache?: Pick<typeof toolCache, "find" | "downloadTool" | "extractTar" | "cacheDir">
  importModule?: (url: string) => Promise<unknown>
  warn?: (message: string) => void
}

/** The tool-cache name; self-hosted runners keep it between jobs. */
const TOOL = "okforest-d2"

/**
 * A `diagrams.d2` loader for `@okforest/validate` that downloads D2.js (about
 * 32 MB, mostly WebAssembly) from the npm registry the first time a tree has
 * a `d2` block, checks it against the pinned checksum, and imports it. When
 * any step fails, D2 diagrams are reported as not checked, with the reason.
 */
export function d2Loader(options: D2LoaderOptions = {}): () => Promise<D2Module | Unavailable> {
  const pin = options.pin ?? D2_PIN
  const tc = options.toolCache ?? toolCache
  const importModule = options.importModule ?? ((url: string) => import(url))
  const warn = options.warn ?? (() => {})

  return async () => {
    let dir = tc.find(TOOL, pin.version)
    if (!dir) {
      let archive: string
      try {
        archive = await tc.downloadTool(pin.tarball)
      } catch (error) {
        return { unavailable: `D2 ${pin.version} could not be downloaded: ${message(error)}` }
      }
      const actual = `sha512-${createHash("sha512")
        .update(await readFile(archive))
        .digest("base64")}`
      if (actual !== pin.integrity) {
        warn(`D2 download from ${pin.tarball} did not match its pinned checksum; not using it.`)
        return { unavailable: `D2 ${pin.version} failed its checksum check after download.` }
      }
      const extracted = await tc.extractTar(archive)
      dir = await tc.cacheDir(join(extracted, "package"), TOOL, pin.version)
    }
    const entry = pathToFileURL(join(dir, "dist", "node-esm", "index.js")).href
    try {
      return (await importModule(entry)) as D2Module
    } catch (error) {
      return { unavailable: `D2 ${pin.version} could not be loaded: ${message(error)}` }
    }
  }
}

const message = (error: unknown) => (error instanceof Error ? error.message : String(error))
