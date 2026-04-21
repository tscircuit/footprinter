import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sip5_w8.5mm_p2.54mm", () => {
  const circuitJson = fp.string("sip5_w8.5mm_p2.54mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sip5_w8.5mm_p2.54mm")
})
