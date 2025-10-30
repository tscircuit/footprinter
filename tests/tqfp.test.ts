import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("tqfp64_w10_p0.5mm_pw0.3_pl1.475mm", () => {
  const soup = fp.string("tqfp64_w10_p0.5mm_pw0.3_pl1.475mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tqfp64_w10_p0.5mm_pw0.3_pl1.475mm",
  )
})
