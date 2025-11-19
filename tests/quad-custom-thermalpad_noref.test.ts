import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("quad16_w4_l4_p0.4_pw0.25_pl0.4_thermalpad1.5mmx1mm noref", () => {
  const soup = fp
    .string("quad16_w4_l4_p0.4_pw0.25_pl0.4_thermalpad1.5mmx1mm_noref")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "quad16_w4_l4_p0.4_pw0.25_pl0.4_thermalpad1.5mmx1mm_noref",
  )
})
