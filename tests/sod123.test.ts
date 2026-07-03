import { test, expect } from "bun:test"
import type { PcbFabricationNotePath } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sod123", () => {
  const soup = fp.string("sod123").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod123")
})

test("sod123 fabrication notes include cathode direction symbol", () => {
  const circuitJson = fp.string("sod123").circuitJson()
  const arrowPath = circuitJson.find(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path" &&
      element.pcb_fabrication_note_path_id === "diode_symbol_arrow",
  )
  const outlinePath = circuitJson.find(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path" &&
      element.pcb_fabrication_note_path_id === "diode_symbol_outline",
  )
  const cathodeBar = circuitJson.find(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path" &&
      element.pcb_fabrication_note_path_id === "diode_symbol_cathode_bar",
  )

  expect(outlinePath?.route).toHaveLength(5)
  expect(arrowPath?.route[1]?.x).toBeGreaterThan(arrowPath?.route[0]?.x ?? 0)
  expect(cathodeBar?.route[0]?.x).toBeGreaterThan(0)
})
