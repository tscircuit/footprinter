import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"

test("tssop", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup  = fp.string("tssop8_w5.3mm_p1.27mm").soup()

  await snapshotSoup(soup)
  t.pass()
})
