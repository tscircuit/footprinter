import test from "ava"
import { fp } from "../src/footprinter"
import { toPinPositionString } from "./fixtures"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
test("cap footprint", async (t) => {
  const soup = fp().cap().imperial("0402").soup()
  const ps = toPinPositionString(soup)
  const { snapshotSoup } = await getTestFixture(t)

  t.is(
    ps,
    `
1 : -0.50  0.00
2 :  0.50  0.00
  `.trim(),
  )
  snapshotSoup(soup)
})

test("cap_imperial0402", async (t) => {
  const soup = fp.string("cap_imperial0402").soup()
  const ps = toPinPositionString(soup)
  const { snapshotSoup } = await getTestFixture(t)

  t.is(
    ps,
    `
1 : -0.50  0.00
2 :  0.50  0.00
  `.trim(),
  )
  snapshotSoup(soup)
})
