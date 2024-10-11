import { describe, expect, it } from "bun:test"
import { getTestFixture } from "./fixtures" // Adjust path based on your structure

describe("FP String Error Tests", () => {
  it("should throw an error for invalid footprint function", async () => {
    const { fp } = await getTestFixture("slop1")

    const invalidFootprint = "trianglularsmt4"

    try {
      fp.string(invalidFootprint).soup()
      expect.fail("Expected an exrror to be thrown, but no error was thrown")
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})
