import test from "ava"
import { getTestFixture, toPinPositionString } from "./fixtures"

test("qfn16_w4_h4_p0.65mm", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("qfn16_w4_h4_p0.65mm").soup()

  await logSoup(soup)
  snapshotSoup(soup)
  t.pass()
})
