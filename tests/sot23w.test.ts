import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot23w", () => {
  const circuitJson = fp.string("sot23w").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot23w")
})

test("sot23w", () => {
  const circuitJson = fp.string("sot23w_pl1.2_pw0.9_p2_w5.2_h5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot23w_pl1.2_pw0.9_p2_w5.2_h5",
  )
})
test("sot23w", () => {
  const circuitJson = fp.string("sot23w_p2_w5.1_h5.2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot23w_p2_w5.1_h5.2")
})
