import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("mlp16_w4_h4_p0.5mm", () => {
  const soup = fp.string("mlp16_w4_h4_p0.5mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "mlp16_w4_h4_p0.5mm")
})
