import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"

test("soic8_w5.3mm_p1.27mm", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("soic8_w5.3mm_p1.27mm").soup()

  t.is(su(soup).pcb_smtpad.list().length, 8)
  await logSoup(soup)

  snapshotSoup(soup)
})
