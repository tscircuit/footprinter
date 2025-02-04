import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("to92", () => {
  const soup = fp.string("to92").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  expect(soup).toBeDefined()
  expect(soup.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to92")
})
