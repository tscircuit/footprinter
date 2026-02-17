import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("qfn32_w5_h5_p0.5_thermalpad", () => {
  const soup = fp.string("qfn32_w5_h5_p0.5_thermalpad").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfn32_w5_h5_p0.5_thermalpad",
  )
})
