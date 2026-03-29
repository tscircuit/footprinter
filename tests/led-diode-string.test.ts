import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

// Regression tests for issue #562:
// fp.string("led0402") and fp.string("diode0603") should work the same way
// as fp.string("res0402") / fp.string("cap0603").

test("led0402 via string parser", () => {
  expect(() => fp.string("led0402").circuitJson()).not.toThrow()
  const soup = fp.string("led0402").circuitJson()
  expect(soup.length).toBeGreaterThan(0)
})

test("led0603 via string parser", () => {
  expect(() => fp.string("led0603").circuitJson()).not.toThrow()
})

test("led0805 via string parser", () => {
  expect(() => fp.string("led0805").circuitJson()).not.toThrow()
})

test("diode0402 via string parser", () => {
  expect(() => fp.string("diode0402").circuitJson()).not.toThrow()
  const soup = fp.string("diode0402").circuitJson()
  expect(soup.length).toBeGreaterThan(0)
})

test("diode0603 via string parser", () => {
  expect(() => fp.string("diode0603").circuitJson()).not.toThrow()
})

test("diode1206 via string parser", () => {
  expect(() => fp.string("diode1206").circuitJson()).not.toThrow()
})

test("led0402 matches res0402 dimensions", () => {
  const ledSoup = fp.string("led0402").circuitJson()
  const resSoup = fp.string("res0402").circuitJson()
  // Both should produce the same number of elements (pads + silkscreen)
  expect(ledSoup.length).toBe(resSoup.length)
})

test("diode0603 matches cap0603 dimensions", () => {
  const diodeSoup = fp.string("diode0603").circuitJson()
  const capSoup = fp.string("cap0603").circuitJson()
  expect(diodeSoup.length).toBe(capSoup.length)
})
