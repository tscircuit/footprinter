import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("wson6", () => {
  const circuitJson = fp.string("wson6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "wson6")
})

test("wson6_ep", () => {
  const circuitJson = fp.string("wson6_ep").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "wson6_ep")
})

test("wson8_ep1_3x3mm_p0.5mm_ep1.2x2mm", () => {
  const circuitJson = fp.string("wson8_ep1_3x3mm_p0.5mm_ep1.2x2mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
"wson8_ep1_3x3mm_p0.5mm_ep1.2x2mm"
  )
})
