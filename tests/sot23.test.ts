import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"

test("sot23", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup  = fp.string("sot23").soup()

  await snapshotSoup(soup)
  t.pass()
})
