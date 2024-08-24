import test from "ava"
import { getTestFixture, toPinPositionString } from "./fixtures"

test("mlp16_w4_h4_p0.5mm", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("mlp16_w4_h4_p0.5mm").soup()

  await logSoup(soup)
  snapshotSoup(soup)
  t.pass()
})
