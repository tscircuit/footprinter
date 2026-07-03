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

test("sod123 fabrication outline reaches pad centers and slightly exceeds pad height", () => {
  const circuitJson = fp.string("sod123").circuitJson()
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

  const xs = outlinePath.route.map((point) => point.x)
  const ys = outlinePath.route.map((point) => point.y)

  expect(Math.min(...xs)).toBeCloseTo(pad1.x)
  expect(Math.max(...xs)).toBeCloseTo(pad2.x)
  expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(pad1.height)
  expect(Math.max(...ys) - Math.min(...ys)).toBeLessThanOrEqual(
    pad1.height + 0.4,
  )
})

test("sod123 fabrication uses a narrower symbol", () => {
  const circuitJson = fp.string("sod123").circuitJson()
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
