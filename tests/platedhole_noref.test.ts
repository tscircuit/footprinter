import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

// Ensure platedhole with diameter specification works

test("platedhole_d1.2 noref", () => {
  const soup = fp.string("platedhole_d1.2_noref").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "platedhole_d1.2_noref",
  )
})
