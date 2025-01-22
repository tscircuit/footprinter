import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"
import { getTestFixture } from "./fixtures/get-test-fixture"

test("pad footprint", async () => {
  const { snapshotSoup } = await getTestFixture("pad")
  const soup = fp().pad().w(2).h(1).circuitJson()
  expect(soup).toMatchSnapshot()
  snapshotSoup(soup)
})

test("pad footprint with different dimensions", async () => {
  const { snapshotSoup } = await getTestFixture("pad_3x2")
  const soup = fp().pad().w(3).h(2).circuitJson()
  expect(soup).toMatchSnapshot()
  snapshotSoup(soup)
})
