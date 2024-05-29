import test from "ava"
import { getTestFixture } from "../fixtures"
import type { AnySoupElement } from "@tscircuit/soup"

export const SLOP_LIST = ["dip3"]

test("slop1", async (t) => {
  const { fp, logSoup } = await getTestFixture(t)

  const soups: AnySoupElement[][] = []

  for (const slop of SLOP_LIST) {
    const soup = fp.string(slop).soup()
    soups.push(soup)
  }

  await logSoup(soups[0]!)
})
