import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"

test("pinrow5", async (t) => {
  const { fp, logSoup } = await getTestFixture(t)
  const soup = fp.string("pinrow5").soup()

  t.is(su(soup).pcb_plated_hole.list().length, 5)
  await logSoup(soup)
})
