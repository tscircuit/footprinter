import { test, expect } from "bun:test"
import type { PcbFabricationNotePath } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sod923", () => {
  const circuitJson = fp.string("sod923").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod923")
})

test("sod923 fabrication keeps full outline width but uses a narrower symbol", () => {
  const circuitJson = fp.string("sod923").circuitJson()
  const pad1 = circuitJson.find(
    (element) =>
      element.type === "pcb_smtpad" && element.port_hints?.[0] === "1",
  )!
  const pad2 = circuitJson.find(
    (element) =>
      element.type === "pcb_smtpad" && element.port_hints?.[0] === "2",
  )!
  const outlinePath = circuitJson.find(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path" &&
      element.pcb_fabrication_note_path_id === "diode_symbol_outline",
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
  const outlineWidth = Math.max(...outlineXs) - Math.min(...outlineXs)
  const padCenterSpan = Math.abs(pad2.x - pad1.x)
  const arrowXs = circuitJson
    .find(
      (element): element is PcbFabricationNotePath =>
        element.type === "pcb_fabrication_note_path" &&
        element.pcb_fabrication_note_path_id === "diode_symbol_arrow",
    )!
    .route.map((point) => point.x)
  const arrowWidth = Math.max(...arrowXs) - Math.min(...arrowXs)

  expect(outlineWidth).toBeCloseTo(padCenterSpan)
  expect(Math.min(...outlineXs)).toBeLessThanOrEqual(leadInPath.route[0]!.x)
  expect(Math.max(...outlineXs)).toBeGreaterThanOrEqual(leadOutPath.route[1]!.x)
  expect(arrowWidth).toBeLessThan(outlineWidth * 0.42)
})
