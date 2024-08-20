import { su } from "@tscircuit/soup-util"
import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("dfn8_w5.3mm_p1.27mm", async (t) => {
  const { fp, logSoup, pcbToSvg } = await getTestFixture(t)
  const soup = fp.string("dfn8_w5.3mm_p1.27mm").soup()

  t.is(su(soup).pcb_smtpad.list().length, 8)

  const svg = pcbToSvg(soup)
  t.snapshot(svg)

  await logSoup(soup)
})
