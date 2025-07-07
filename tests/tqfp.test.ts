import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("tqfp64_w10_h10_pl1_pw0.25mm", () => {
  const soup = fp.string("tqfp64_w10_h10_pl1_pw0.25mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tqfp64_w10_h10_pl1_pw0.25mm",
  )
})
