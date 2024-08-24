import test from "ava"
import { fp } from "../src/footprinter"
import type { AnySoupElement } from "@tscircuit/soup"
import { getTestFixture, toPinPositionString } from "./fixtures"

test("dip params", async (t) => {
  t.deepEqual(fp().dip(4).w(7.62).params(), {
    dip: true,
    fn: "dip",
    num_pins: 4,
    w: 7.62,
  })
})

test("dip footprint", async (t) => {
  const soup = fp().dip(4).w(4).p(2).soup()
  const ps = toPinPositionString(soup)
  const { snapshotSoup } = await getTestFixture(t)

  t.is(
    ps,
    `
1 : -2.00  1.00
2 : -2.00 -1.00
3 :  2.00 -1.00
4 :  2.00  1.00
  `.trim(),
  )

  snapshotSoup(soup)
})

test("dip16", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("dip16").soup()
  await logSoup(soup)
  snapshotSoup(soup)
  t.pass()
})

test("dip4_w3.00mm", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("dip4_w3.00mm").soup()
  const ps = toPinPositionString(soup)

  t.is(
    ps,
    `
1 : -1.50  1.27
2 : -1.50 -1.27
3 :  1.50 -1.27
4 :  1.50  1.27
  `.trim(),
  )

  await logSoup(soup)
  snapshotSoup(soup)
})
