import { test, expect } from "bun:test"
import type { PcbFabricationNotePath } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("smb", () => {
  const circuitJson = fp.string("smb").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "smb")
})

test("smb fabrication uses a narrower, slightly taller symbol", () => {
  const circuitJson = fp.string("smb").circuitJson()
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
  const outlineYs = outlinePath.route.map((point) => point.y)
  const arrowXs = arrowPath.route.map((point) => point.x)
  const arrowYs = arrowPath.route.map((point) => point.y)

  expect(Math.max(...arrowXs) - Math.min(...arrowXs)).toBeLessThan(
    (Math.max(...outlineXs) - Math.min(...outlineXs)) * 0.25,
  )
  expect(Math.max(...arrowYs) - Math.min(...arrowYs)).toBeGreaterThan(
    (Math.max(...outlineYs) - Math.min(...outlineYs)) * 0.38,
  )
})

test("smb fabrication uses a thicker stroke", () => {
  const circuitJson = fp.string("smb").circuitJson()
  const fabricationPaths = circuitJson.filter(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path",
  )

  expect(fabricationPaths[0]?.stroke_width).toBeGreaterThan(0.07)
})
