import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"
import { led } from "src/fn"

test("led_rect", async (t) => {
  const { fp, snapshotSoup } = await getTestFixture(t)
  const soup = led({
    tht: false,
    p: 2.5,
    pw: 0.5,
    ph: 0.5,
  }).circuitJson

  snapshotSoup(soup)
  t.pass()
})
test("led_hole", async (t) => {
  const { fp, snapshotSoup } = await getTestFixture(t)
  const soup = led({
    tht: true,
    p: 2,
    pw: 0.5,
    ph: 0.5,
    metric: "mm",
    w: 5,
    h: 2,
  }).circuitJson

  snapshotSoup(soup)
  t.pass()
})
