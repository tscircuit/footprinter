import { test, expect } from "bun:test"
import type { PcbFabricationNotePath } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sod523", () => {
  const soup = fp.string("sod523").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup, { showCourtyards: true })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod523")
})

test("sod523 fabrication keeps the outline width but uses a narrower symbol", () => {
  const circuitJson = fp.string("sod523").circuitJson()
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
  const outlineWidth = Math.max(...outlineXs) - Math.min(...outlineXs)
  const arrowWidth = Math.max(...arrowXs) - Math.min(...arrowXs)

  expect(arrowWidth).toBeLessThan(outlineWidth * 0.3)
})
