import test from "ava"
import { getTestFixture, toPinPositionString } from "./fixtures"

test("mlp16_w4_l4_p0.65mm", async (t) => {
  const { fp, logSoup } = await getTestFixture(t)
  const soup = fp.string("mlp16_w4_l4_p0.65mm").soup()

  await logSoup(soup)
  t.pass()
})

test("mlp16_w4_l4_p0.65mm_startingpin(topside,leftpin)", async (t) => {
  const { fp, logSoup } = await getTestFixture(t)
  const soup = fp.string("mlp16_w4_l4_p0.65mm_startingpin(topside,leftpin)").soup()

  await logSoup(soup)
  t.pass()
})
