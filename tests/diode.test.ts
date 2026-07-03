import { test, expect } from "bun:test"
import type { PcbFabricationNotePath } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("diode", () => {
  const soup = fp().diode().imperial("0402").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode")
})

test("diode0402", () => {
  const soup = fp.string("0402").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode0402")
})

test("diode1210", () => {
  const soup = fp().diode().imperial("1210").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup, { showCourtyards: true })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode1210")
})

test("diode0603", () => {
  const soup = fp().diode().imperial("0603").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode0603")
})

test("diode01005", () => {
  const soup = fp().diode().imperial("01005").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode01005")
})

test("diode0201", () => {
  const soup = fp().diode().imperial("0201").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode0201")
})

test("diode2512", () => {
  const soup = fp().diode().imperial("2512").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode2512")
})

test("diode fabrication notes include polarity guidance and cathode direction", () => {
  const circuitJson = fp().diode().imperial("0603").circuitJson()
  const pad1 = circuitJson.find(
    (element) =>
      element.type === "pcb_smtpad" && element.port_hints?.[0] === "1",
  )!
  const pad2 = circuitJson.find(
    (element) =>
      element.type === "pcb_smtpad" && element.port_hints?.[0] === "2",
  )!

  const fabricationNotePaths = circuitJson.filter(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path",
  )
  const arrowPath = fabricationNotePaths.find(
    (path) => path.pcb_fabrication_note_path_id === "diode_symbol_arrow",
  )
  const cathodeBar = fabricationNotePaths.find(
    (path) => path.pcb_fabrication_note_path_id === "diode_symbol_cathode_bar",
  )
  const outlinePath = fabricationNotePaths.find(
    (path) => path.pcb_fabrication_note_path_id === "diode_symbol_outline",
  )
  const leadInPath = fabricationNotePaths.find(
    (path) => path.pcb_fabrication_note_path_id === "diode_symbol_lead_in",
  )
  expect(fabricationNotePaths).toHaveLength(5)
  expect(outlinePath?.route).toHaveLength(5)
  expect(leadInPath?.route[0]?.x).toBeGreaterThan(pad1.x + pad1.width / 2)
  expect(cathodeBar?.route[0]?.x).toBeLessThan(pad2.x - pad2.width / 2)
  expect(arrowPath?.route[1]?.x).toBeGreaterThan(arrowPath?.route[0]?.x ?? 0)
  expect(cathodeBar?.route[0]?.x).toBeGreaterThan(0)
})

test("diode01005 does not include fabrication notes", () => {
  const circuitJson = fp().diode().imperial("01005").circuitJson()
  const fabricationNotePaths = circuitJson.filter(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path",
  )

  expect(fabricationNotePaths).toHaveLength(0)
})
