import { test, expect } from "bun:test"
import type { PcbFabricationNotePath } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sod80", () => {
  const circuitJson = fp.string("sod80").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod80")
})

test("sod80 fabrication uses a narrower symbol", () => {
  const circuitJson = fp.string("sod80").circuitJson()
  const outlinePath = circuitJson.find(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path" &&
      element.pcb_fabrication_note_path_id === "diode_symbol_outline",
  )!
  const arrowPath = circuitJson.find(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path" &&
      element.pcb_fabrication_note_path_id === "diode_symbol_arrow",
  )!
  const outlineXs = outlinePath.route.map((point) => point.x)
  const arrowXs = arrowPath.route.map((point) => point.x)

  expect(Math.max(...arrowXs) - Math.min(...arrowXs)).toBeLessThan(
    (Math.max(...outlineXs) - Math.min(...outlineXs)) * 0.34,
  )
})
