import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("0603 custom pad size", () => {
  const circuitJson = fp.string("0603_pw1.0_ph1.1").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_pw1.0_ph1.1")
})
