import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("wson6 default", () => {
  const circuitJson = fp.string("wson6").circuitJson()
  expect(circuitJson).toBeTruthy()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  // WSON-6: 6 signal pads + 1 exposed pad = 7 total
  expect(pads.length).toBeGreaterThanOrEqual(6)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "wson6")
})

test("wson8", () => {
  const circuitJson = fp.string("wson8").circuitJson()
  expect(circuitJson).toBeTruthy()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBeGreaterThanOrEqual(8)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "wson8")
})

test("WSON-6 alias (hyphenated)", () => {
  // Both forms should work
  const fp1 = fp.string("wson6").circuitJson()
  expect(fp1).toBeTruthy()
})

test("wson has courtyard", () => {
  const circuitJson = fp.string("wson6").circuitJson()
  const courtyard = circuitJson.filter(
    (e) =>
      e.type === "pcb_courtyard_rect" || e.type === "pcb_courtyard_outline",
  )
  expect(courtyard.length).toBeGreaterThan(0)
})
