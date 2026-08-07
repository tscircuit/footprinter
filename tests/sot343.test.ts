import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot343", () => {
  const circuitJson = fp.string("sot343").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot343")
})

test("sot343_pl1.2_pw0.9_p2_w5.2_h5", () => {
  const circuitJson = fp.string("sot343_pl1.2_pw0.9_p2_w5.2_h5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot343_pl1.2_pw0.9_p2_w5.2_h5",
  )
})
