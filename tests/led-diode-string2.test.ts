import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

// Regression test for issue #562:
// fp.string("led0603") should work the same way as fp.string("res0603").

test("led0603 via string parser", () => {
  expect(() => fp.string("led0603").circuitJson()).not.toThrow()
})
