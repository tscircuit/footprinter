import { test, expect } from "bun:test"
import type { PcbFabricationNotePath } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sod323", () => {
  const circuitJson = fp.string("sod323").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod323")
})

test("sod323 fabrication keeps the outline width but halves the symbol width", () => {
  const circuitJson = fp.string("sod323").circuitJson()
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
  const leadInPath = circuitJson.find(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path" &&
      element.pcb_fabrication_note_path_id === "diode_symbol_lead_in",
  )!
  const leadOutPath = circuitJson.find(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path" &&
      element.pcb_fabrication_note_path_id === "diode_symbol_lead_out",
  )!

  const outlineXs = outlinePath.route.map((point) => point.x)
  const arrowXs = arrowPath.route.map((point) => point.x)
  const outlineWidth = Math.max(...outlineXs) - Math.min(...outlineXs)
  const arrowWidth = Math.max(...arrowXs) - Math.min(...arrowXs)
  const leadInWidth = Math.abs(leadInPath.route[1]!.x - leadInPath.route[0]!.x)
  const leadOutWidth = Math.abs(
    leadOutPath.route[1]!.x - leadOutPath.route[0]!.x,
  )

  expect(arrowWidth).toBeLessThan(outlineWidth * 0.18)
  expect(leadInWidth).toBeLessThan(outlineWidth * 0.18)
  expect(leadOutWidth).toBeLessThan(outlineWidth * 0.16)
})
