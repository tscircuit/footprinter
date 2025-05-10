import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("potentiometer with ca14_h5 configuration", () => {
  const circuitJson = fp.string("potentiometer_acp_ca14_h5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "potentiometer_acp_ca14_h5",
  )
})
test("potentiometer with ca14_h2.5 configuration", () => {
  const circuitJson = fp.string("potentiometer_acp_ca14_h2.5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "potentiometer_acp_ca14_h2.5",
  )
})
