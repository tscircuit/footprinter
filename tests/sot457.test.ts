import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot457", () => {
  const soup = fp.string("sot457").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot457")
})

test("sot457_w1.5_h2.9_p0.95mm", () => {
  const soup = fp.string("sot457_w1.5_h2.9_p0.95mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot457_w1.5_h2.9_p0.95mm",
  )
})
