import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("electrolytic_d10mm_p7.5mm", () => {
  const circuitJson = fp.string("electrolytic_d10mm_p7.5mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "electrolytic_d10mm_p7.5mm",
  )
})
