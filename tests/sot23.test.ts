import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot23", () => {
  const soup = fp.string("sot23").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot23")
})
test("sot23_w3_h1.5_p0.95mm", () => {
  const soup = fp.string("sot23_w3_h1.5_p0.95mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot23_w3_h1.5_p0.95mm",
  )
})
