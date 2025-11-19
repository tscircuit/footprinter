import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("tssop noref", () => {
  const soup = fp.string("tssop8_w5.3mm_p1.27mm_noref").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tssop8_w5.3mm_p1.27mm_noref",
  )
})
