import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("pad footprint", () => {
  const soup = fp().pad().w(2).h(1).circuitJson()
  expect(soup).toMatchSnapshot()
})

test("pad footprint with different dimensions", () => {
  const soup = fp().pad().w(3).h(2).circuitJson()
  expect(soup).toMatchSnapshot()
})
