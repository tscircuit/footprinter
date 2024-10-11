import { describe, expect, it } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { getTestFixture } from "../fixtures"

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

    if (failures.length > 0) {
      throw new Error(
        `Failures:\n${failures.map((f) => f.slop_string).join("\n")}`,
      )
    } else {
      expect(failures.length).toBe(0)
    }
  })
})
