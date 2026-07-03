import { test, expect } from "bun:test"
import type { PcbFabricationNotePath } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sod723", () => {
  const circuitJson = fp.string("sod723").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod723")
})

test("sod723 does not include fabrication notes", () => {
  const circuitJson = fp.string("sod723").circuitJson()
  const fabricationNotePaths = circuitJson.filter(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path",
  )

  expect(fabricationNotePaths).toHaveLength(0)
})
