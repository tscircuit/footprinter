import test from "ava"
import { getTestFixture, toPinPositionString } from "./fixtures"

test("qfp48_w14_p1mm", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("qfp48_w14_p1mm").soup()

  await logSoup(soup)
  snapshotSoup(soup)
  t.pass()
})

test("qfp48_w14_p1mm_startingpin(topside,leftpin)", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("qfp48_w14_p1mm_startingpin(topside,leftpin)").soup()

  await logSoup(soup)
  snapshotSoup(soup)
  t.pass()
})
