import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

// Regression test for issue #562:
// fp.string("diode1206") should work the same way as fp.string("res1206").

test("diode1206 via string parser", () => {
  expect(() => fp.string("diode1206").circuitJson()).not.toThrow()
})
