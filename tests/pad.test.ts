import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("pad footprint", () => {
  const soup = fp().pad().w(2).h(1).soup()
  expect(soup).toMatchSnapshot()
})
