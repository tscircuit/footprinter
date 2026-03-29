import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

// Regression test for issue #562:
// fp.string("led0805") should work the same way as fp.string("res0805").

test("led0805 via string parser", () => {
  expect(() => fp.string("led0805").circuitJson()).not.toThrow()
})
