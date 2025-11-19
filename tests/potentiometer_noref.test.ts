import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("potentiometer with ca14_h5 configuration noref", () => {
  const circuitJson = fp.string("potentiometer_ca14_h5_noref").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "potentiometer_ca14_h5_noref",
  )
})
