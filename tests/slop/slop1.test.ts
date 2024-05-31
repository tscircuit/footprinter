import test from "ava"
import { getTestFixture } from "../fixtures"
import type { AnySoupElement } from "@tscircuit/soup"

/**
 * Slop is an underdefined definition.
 */
export const SLOP_LIST = [
  "dip3",
  "bga64",
  "bga48",
  "bga48_grid8x8",
  "bga48_p2_pad0.2",
  "qfn32_p0.5mm",
]

test("slop1", async (t) => {
  const { fp, logSoupWithPrefix } = await getTestFixture(t)

  const soups: AnySoupElement[][] = []
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
      throw e
    }
  }

  if (failures.length > 0) {
    t.fail(`Failures:\n${failures.map((f) => f.slop_string).join("\n")}`)
  } else {
    t.pass()
  }
})
