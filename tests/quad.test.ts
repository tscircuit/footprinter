import test from "ava"
import { fp } from "../src/footprinter"
import type { AnySoupElement } from "@tscircuit/soup"
import { getTestFixture, toPinPositionString } from "./fixtures"

test("quad16_w4_l4_p0.4_pw0.25_pl0.4", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("quad16_w4_l4_p0.4_pw0.25_pl0.4").soup()

  await logSoup(soup)
  snapshotSoup(soup)
  t.pass()
})

test("quad16_w4_l4_p0.4_pw0.25_pl0.4_thermalpad_startingpin(bottomside,leftpin)", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup = fp
    .string(
      "quad16_w4_l4_p0.4_pw0.25_pl0.4_thermalpad_startingpin(bottomside,leftpin)",
    )
    .soup()

  await logSoup(soup)
  snapshotSoup(soup)
  t.pass()
})
