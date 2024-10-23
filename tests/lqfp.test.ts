import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("lqfp64_w10_h10_pl1_pw0.25mm", () => {
  const soup = fp.string("lqfp64_w10_h10_pl1_pw0.25mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "lqfp64_w10_h10_pl1_pw0.25mm",
  )
})
