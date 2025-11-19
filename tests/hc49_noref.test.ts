import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("hc49 noref", () => {
  const soup = fp.string("hc49_noref").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  // Ensure soup is not empty or undefined
  expect(soup).toBeDefined()
  expect(soup.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "hc49_noref")
})
