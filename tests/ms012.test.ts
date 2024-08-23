import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"

test("ms012", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("ms012").soup()

  await snapshotSoup(soup)
  t.pass()
})
