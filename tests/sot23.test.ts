import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"

test("sot23", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("sot23").soup()

  snapshotSoup(soup)
  t.pass()
})
test("sot23_w3_h1.5_p0.95mm", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("sot23_w3_h1.5_p0.95mm").soup()

  snapshotSoup(soup)
  t.pass()
})
