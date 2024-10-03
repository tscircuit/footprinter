import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("sot25", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("sot25").soup()

  snapshotSoup(soup)
  t.pass()
})