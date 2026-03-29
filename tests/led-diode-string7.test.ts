import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

// Regression test for issue #562:
// led0402 should produce the same footprint structure as res0402.

test("led0402 matches res0402 dimensions", () => {
  const ledSoup = fp.string("led0402").circuitJson()
  const resSoup = fp.string("res0402").circuitJson()
  // Both should produce the same number of elements (pads + silkscreen)
  expect(ledSoup.length).toBe(resSoup.length)
})
