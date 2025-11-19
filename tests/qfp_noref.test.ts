import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("qfp48_w14_p1mm noref", () => {
  const soup = fp.string("qfp48_w14_p1mm_noref").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfp48_w14_p1mm_noref",
  )
})
