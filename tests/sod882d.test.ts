import { test, expect } from "bun:test"
import type { PcbFabricationNotePath } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sod882d", () => {
  const circuitJson = fp.string("sod882d").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod882d")
})

test("sod882d fabrication outline height is reduced to about two-thirds", () => {
  const circuitJson = fp.string("sod882d").circuitJson()
  const outlinePath = circuitJson.find(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path" &&
      element.pcb_fabrication_note_path_id === "diode_symbol_outline",
  )!
  const ys = outlinePath.route.map((point) => point.y)
  const outlineHeight = Math.max(...ys) - Math.min(...ys)

  expect(outlineHeight).toBeCloseTo(0.7093, 3)
})

test("sod882d fabrication uses a slightly narrower symbol", () => {
  const circuitJson = fp.string("sod882d").circuitJson()
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
    (Math.max(...outlineXs) - Math.min(...outlineXs)) * 0.52,
  )
})
