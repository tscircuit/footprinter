import { describe, expect, it } from "bun:test"
import { isNotNull } from "../src/helpers/is-not-null"
import { getTestFixture } from "./fixtures" // Adjust path based on your structure

describe("FP String Error Tests", () => {
  it("should throw an error for invalid footprint function", async () => {
    const { fp } = await getTestFixture("slop1")

    const invalidFootprint = "trianglularsmt4"
    const invalidFootprintParts = invalidFootprint
      .split("_")
      .map((s) => {
        const m = s.match(/([a-z]+)([\(\d\.\+\?].*)?/)
        const [_, fn, v] = m ?? []
        if (v?.includes("?")) return null
        return { fn: m?.[1]!, v: m?.[2]! }
      })
      .filter(isNotNull)

    try {
      fp.string(invalidFootprint).soup()
      expect.fail("Expected an exrror to be thrown, but no error was thrown")
    } catch (error) {
      expect(error).toBeInstanceOf(Error)

      expect(error.message).toEqual(
        `Function not found for footprinter "${invalidFootprintParts[0]?.fn}". Specify a valid function like .dip, .lr, .p, etc.`,
      )
    }
  })
})
