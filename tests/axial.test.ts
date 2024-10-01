import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"

test("axial_p0.2in", async (t) => {
  const { fp, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("axial_p0.2in").soup()

  t.is(su(soup).pcb_plated_hole.list().length, 2)

  snapshotSoup(soup)
})
