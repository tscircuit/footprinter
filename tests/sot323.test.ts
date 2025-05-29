import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot323", () => {
  const circuitJson = fp.string("sot323").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot323")
})

test("sot323_pl1.2_pw0.9_p2_w5.2_h5", () => {
  const circuitJson = fp.string("sot323_pl1.2_pw0.9_p2_w5.2_h5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot323_pl1.2_pw0.9_p2_w5.2_h5",
  )
})
