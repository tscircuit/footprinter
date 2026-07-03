import { test, expect } from "bun:test"
import type { PcbFabricationNotePath } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("micromelf", () => {
  const circuitJson = fp.string("micromelf").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "micromelf")
})

test("micromelf fabrication uses a slightly taller symbol with longer leads", () => {
  const circuitJson = fp.string("micromelf").circuitJson()
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
  const outlineYs = outlinePath.route.map((point) => point.y)
  const arrowXs = arrowPath.route.map((point) => point.x)
  const arrowYs = arrowPath.route.map((point) => point.y)

  expect(Math.max(...arrowXs) - Math.min(...arrowXs)).toBeLessThan(
    (Math.max(...outlineXs) - Math.min(...outlineXs)) * 0.34,
  )
  expect(Math.max(...arrowYs) - Math.min(...arrowYs)).toBeGreaterThan(
    (Math.max(...outlineYs) - Math.min(...outlineYs)) * 0.3,
  )
  expect(
    Math.abs(leadInPath.route[1]!.x - leadInPath.route[0]!.x),
  ).toBeGreaterThan(0.14)
  expect(
    Math.abs(leadOutPath.route[1]!.x - leadOutPath.route[0]!.x),
  ).toBeGreaterThan(0.08)
})
