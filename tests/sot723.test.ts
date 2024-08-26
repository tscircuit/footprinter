import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"

test("sot723", async (t) => {
  const { fp, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("sot723").soup()

  snapshotSoup(soup)
  t.pass()
})
