import { describe, expect, it } from "bun:test"; // Bun's test utilities
import type { AnyCircuitElement } from "circuit-json";
import { getTestFixture } from "../fixtures"; // Adjust path based on your structure

// biome-ignore lint/suspicious/noExportsInTest: <explanation>
export const SLOP_LIST = [
  "dip3",
  "bga64",
  "bga48",
  "bga48_grid8x8",
  "bga48_p2_pad0.2",
  "qfn32_p0.5mm",
]

describe("Slop Tests", () => {
  it("should handle slop elements correctly", async () => {
    const { fp, logSoupWithPrefix } = await getTestFixture("slop1")

    const soups: AnyCircuitElement[][] = []
    const failures: Array<{
      slop_string: string
      error: any
    }> = []

    for (const slop of SLOP_LIST) {
      try {
        const soup = fp.string(slop).soup()
        soups.push(soup)
        if (slop === SLOP_LIST[SLOP_LIST.length - 1]) {
          await logSoupWithPrefix(slop, soup)
        }
      } catch (e: any) {
        failures.push({
          slop_string: slop,
          error: e,
        })
        throw console.error(e)
      }
    }

    // Check if there were any failures and log the message
    if (failures.length > 0) {
      throw new Error(
        `Failures:\n${failures.map((f) => f.slop_string).join("\n")}`,
      )
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      expect(failures.length).toBe(0) // Assert that there are no failures
    }
  }),

  it("should throw an error for invalid footprint function", async () => {
    const { fp } = await getTestFixture("slop1")

    const invalidFootprint = "invalidFunction"

    try {
      fp.string(invalidFootprint).soup()
      expect.fail("Expected an exrror to be thrown, but no error was thrown")
    } catch (error) {
      expect(error).toBeInstanceOf(Error)

      expect(error.message).toContain("Function not found for footprinter")
      expect(error.message).toContain("Specify a valid function like .dip, .lr, .p, etc.")
    }
  })
})
