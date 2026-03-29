import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

// Regression test for issue #562:
// diode0603 should produce the same footprint structure as cap0603.

test("diode0603 matches cap0603 dimensions", () => {
  const diodeSoup = fp.string("diode0603").circuitJson()
  const capSoup = fp.string("cap0603").circuitJson()
  expect(diodeSoup.length).toBe(capSoup.length)
})
