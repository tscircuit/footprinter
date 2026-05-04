import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

// Regression test for issue #562:
// fp.string("diode0402") should work the same way as fp.string("res0402").

test("diode0402 via string parser", () => {
  expect(() => fp.string("diode0402").circuitJson()).not.toThrow()
  const soup = fp.string("diode0402").circuitJson()
  expect(soup.length).toBeGreaterThan(0)
})
