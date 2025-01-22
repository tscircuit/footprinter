import { expect, test } from "bun:test"
import { getTestFixture } from "./fixtures"

test("pad footprint", async () => {
  const fixture = await getTestFixture("pad_w2_h1")
  const soup = fixture.fp().pad().w(2).h(1).circuitJson()
  fixture.logSoup(soup)
  expect(soup).toMatchSnapshot()
})
