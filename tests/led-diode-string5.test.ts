import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

// Regression test for issue #562:
// fp.string("diode0603") should work the same way as fp.string("cap0603").

test("diode0603 via string parser", () => {
  expect(() => fp.string("diode0603").circuitJson()).not.toThrow()
})
