import { describe, expect, it } from "bun:test"
import { getFootprintNames } from "../src/footprinter"
import fs from "fs"
import path from "path"

describe("footprint completeness", () => {
  it("should expose all footprint functions from src/fn/", () => {
    const fnDir = path.join(process.cwd(), "src", "fn")
    const footprintFiles = fs
      .readdirSync(fnDir)
      .filter((file) => file.endsWith(".ts") && file !== "index.ts")
      .map((file) => path.basename(file, ".ts"))

    const exposedFootprints = getFootprintNames()

    for (const file of footprintFiles) {
      expect(exposedFootprints.includes(file)).toBe(true)
    }

    for (const footprint of exposedFootprints) {
      expect(footprintFiles.includes(footprint)).toBe(true)
    }

    expect(footprintFiles.length).toBe(exposedFootprints.length)
  })
})
