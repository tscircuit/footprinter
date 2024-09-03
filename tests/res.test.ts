import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"
import { res } from "src/fn/res"

test("res_imperial0402", async (t) => {
  const { fp, snapshotSoup } = await getTestFixture(t)
  const soup = fp.string("res_imperial0402").soup()

  t.is(su(soup).pcb_smtpad.list().length, 2)
  t.is(su(soup).pcb_plated_hole.list().length, 0)

  snapshotSoup(soup)
})
