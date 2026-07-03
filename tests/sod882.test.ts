import { test, expect } from "bun:test"
import type { PcbFabricationNotePath } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sod882", () => {
  const circuitJson = fp.string("sod882").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod882")
})

test("sod882 fabrication outline height is reduced to about two-thirds", () => {
  const circuitJson = fp.string("sod882").circuitJson()
  const outlinePath = circuitJson.find(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path" &&
      element.pcb_fabrication_note_path_id === "diode_symbol_outline",
  )!
  const ys = outlinePath.route.map((point) => point.y)
  const outlineHeight = Math.max(...ys) - Math.min(...ys)

  expect(outlineHeight).toBeCloseTo(0.6827, 3)
})
